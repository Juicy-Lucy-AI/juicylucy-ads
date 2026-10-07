#!/usr/bin/env node
// Pull reference creatives out of the Meta Ads Library — metadata and media.
//
//   node ad-library.mjs discover --page-id <page-id> --out refs.json
//   node ad-library.mjs discover --url "<any ads-library URL>" --out refs.json
//   node ad-library.mjs discover --from-json captured.json --out refs.json
//   node ad-library.mjs download --from refs.json --out-dir .media/references
//   node ad-library.mjs fetch    --page-id <page-id> --out-dir .media/references
//   node ad-library.mjs probe    --url "<one fbcdn URL>"
//
// ## Why this script exists
//
// Agents can already drive the Ads Library with a browser. What fails is the
// download: the browser tool fetches the media from INSIDE the page, and that
// is the one place the fetch cannot be made reliable. The reported failure was
//
//   TypeError: Failed to fetch
//     at fetch (https://static.xx.fbcdn.net/rsrc.php/v4/y1/r/0NgMS-WPRTe.js)
//
// — no HTTP status, thrown from Facebook's own bundled fetch wrapper. A
// status-less TypeError is a network-layer failure, not a refusal, and the
// cause is in the hostname:
//
//   scontent.frtm1-1.fna.fbcdn.net
//                    ^^^
//
// `fna` is a Facebook Network Appliance — a cache box hosted INSIDE an ISP's
// network. Those hostnames resolve to ISP-local addresses, so a URL minted on
// one network names a machine that may be unroutable from another. The moment
// the fetch happens somewhere other than where the page was loaded (a cloud
// browser, a proxied automation layer, a different egress) it fails exactly
// this way. Measured on the reported URL: the FNA host resolved to a Lithuanian
// ISP range, while the same asset was served fine from the global host.
//
// Two rules follow, and this script is built on them:
//
//   1. NEVER download through the page. The media URLs are signed and
//      publicly readable — a plain GET with no cookies, no referer and no
//      user-agent returns them. Verified on the exact URL that failed above.
//      Going out-of-band drops the page's CSP, the automation tool's asset
//      bundler, and the browser sandbox's egress from the dependency list.
//
//   2. When a host misbehaves, rewrite it. Swapping the `.fna.` hostname for
//      the globally-routable `video.xx.fbcdn.net` / `scontent.xx.fbcdn.net`
//      serves the identical bytes — PROVIDED `_nc_ht` is left alone. The `oh`
//      signature covers the `_nc_ht` PARAMETER, not the host you connect to.
//      Rewriting or deleting `_nc_ht` returns 403. That asymmetry is the whole
//      trick, and it is why this is a host swap and not a URL rewrite.
//
// ## Why discovery still needs a browser
//
// The library page itself returns 403 to a plain HTTP client, so finding ads
// genuinely needs a browser. But the grid's `<video>` elements only ever mount
// the SD preview. The HD file, the ad copy, the CTA, the spend and the run
// dates all live in the GraphQL payload the page fetches — so this script reads
// that payload instead of scraping the DOM, and gets a far better record for it.
//
// If no browser module is installed, `--from-json` takes a payload captured by
// whatever browser tool the agent already has. The download half never needs one.
//
// Dependency-free by design: node alone, with ffprobe used only if present.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/** Globally-routable stand-ins for the ISP-local `.fna.` cache hostnames. */
export const GLOBAL_HOSTS = { video: "video.xx.fbcdn.net", scontent: "scontent.xx.fbcdn.net" };

/** Browser modules we can drive, most-preferred first. */
export const DRIVERS = ["puppeteer", "playwright", "puppeteer-core", "playwright-core"];

/** How many times `discover` scrolls the grid to pull another page of ads. */
export const DEFAULT_SCROLLS = 4;

// ---------------------------------------------------------------------------
// URL handling — the part that fixes the reported failure
// ---------------------------------------------------------------------------

/**
 * Point an fbcdn URL at the global CDN host instead of an ISP-local `.fna.` box.
 *
 * `_nc_ht` is deliberately NOT touched: the `oh` HMAC covers that parameter, so
 * rewriting it to match the new host invalidates the signature and earns a 403.
 * The host you connect to is not signed; the host named in `_nc_ht` is.
 */
export function toGlobalHost(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    return raw;
  }
  if (!url.hostname.endsWith(".fbcdn.net")) return raw;
  const family = url.hostname.startsWith("video.") ? "video" : "scontent";
  url.host = GLOBAL_HOSTS[family];
  return url.href;
}

/** Decode the `oe` parameter — the hex unix time after which the URL 403s. */
export function urlExpiry(raw) {
  try {
    const oe = new URL(raw).searchParams.get("oe");
    if (!oe) return null;
    const seconds = Number.parseInt(oe, 16);
    return Number.isFinite(seconds) ? new Date(seconds * 1000) : null;
  } catch {
    return null;
  }
}

/**
 * The URLs to try for one asset, in order.
 *
 * The as-minted URL first — on the network that minted it, the ISP-local cache
 * is the fast path and there is no reason to route around it.
 */
export function downloadCandidates(raw) {
  const swapped = toGlobalHost(raw);
  return swapped === raw ? [raw] : [raw, swapped];
}

// ---------------------------------------------------------------------------
// Payload parsing
// ---------------------------------------------------------------------------

/**
 * Collect every ad node in an arbitrary JSON structure.
 *
 * A deep walk rather than a path lookup on purpose. Meta reshapes the GraphQL
 * response regularly and streams deferred fragments as separate JSON documents;
 * "any object carrying both `ad_archive_id` and `snapshot`" has survived those
 * reshapes where `data.ad_library_main.search_results_connection.edges[]` has not.
 */
export function collectAdNodes(value, found = [], seen = new Set()) {
  if (value === null || typeof value !== "object") return found;
  if (seen.has(value)) return found;
  seen.add(value);
  if (Array.isArray(value)) {
    for (const item of value) collectAdNodes(item, found, seen);
    return found;
  }
  if (value.ad_archive_id && value.snapshot && typeof value.snapshot === "object")
    found.push(value);
  for (const item of Object.values(value)) collectAdNodes(item, found, seen);
  return found;
}

/** Parse a response body that may be one JSON document or several, one per line. */
export function parseLooseJson(text) {
  const documents = [];
  const trimmed = text.trim();
  if (!trimmed) return documents;
  try {
    documents.push(JSON.parse(trimmed));
    return documents;
  } catch {
    // Deferred GraphQL fragments arrive as newline-delimited documents.
  }
  for (const line of trimmed.split("\n")) {
    const candidate = line.trim();
    if (!candidate.startsWith("{") && !candidate.startsWith("[")) continue;
    try {
      documents.push(JSON.parse(candidate));
    } catch {
      // A truncated or non-JSON line is not worth failing the whole payload over.
    }
  }
  return documents;
}

const textOf = (value) => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && typeof value.text === "string") return value.text;
  return null;
};

const slug = (value) =>
  String(value ?? "ad")
    // Fold accents first, or "Zoë" slugs to "zo" and two brands collide.
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "ad";

const asDate = (seconds) =>
  typeof seconds === "number" && seconds > 0
    ? new Date(seconds * 1000).toISOString().slice(0, 10)
    : null;

/** Normalise one raw ad node into the record this script reads and writes. */
export function normaliseAd(node) {
  const snapshot = node.snapshot ?? {};
  const media = [];
  const pushVideo = (video, origin) => {
    if (!video) return;
    const sources = [video.video_hd_url, video.video_sd_url].filter(Boolean);
    if (sources.length)
      media.push({ kind: "video", origin, sources, poster: video.video_preview_image_url ?? null });
  };
  const pushImage = (image, origin) => {
    if (!image) return;
    const source = image.original_image_url ?? image.resized_image_url;
    if (source) media.push({ kind: "image", origin, sources: [source], poster: null });
  };

  for (const video of snapshot.videos ?? []) pushVideo(video, "body");
  for (const video of snapshot.extra_videos ?? []) pushVideo(video, "extra");
  for (const image of snapshot.images ?? []) pushImage(image, "body");
  for (const image of snapshot.extra_images ?? []) pushImage(image, "extra");
  for (const card of snapshot.cards ?? []) {
    if (card.video_hd_url || card.video_sd_url) pushVideo(card, "card");
    else pushImage(card, "card");
  }

  return {
    ad_archive_id: String(node.ad_archive_id),
    permalink: `https://www.facebook.com/ads/library/?id=${node.ad_archive_id}`,
    page_id: node.page_id ?? snapshot.page_id ?? null,
    page_name: node.page_name ?? snapshot.page_name ?? null,
    is_active: node.is_active ?? null,
    start_date: asDate(node.start_date),
    end_date: asDate(node.end_date),
    publisher_platform: node.publisher_platform ?? null,
    display_format: snapshot.display_format ?? null,
    // The copy fields, which are what a preservation brief actually needs.
    title: textOf(snapshot.title),
    body: textOf(snapshot.body),
    caption: textOf(snapshot.caption),
    link_description: textOf(snapshot.link_description),
    cta_text: snapshot.cta_text ?? null,
    link_url: snapshot.link_url ?? null,
    media,
  };
}

/** Every unique ad in one or more captured payloads, newest-first order preserved. */
export function extractAds(texts) {
  const byId = new Map();
  for (const text of [].concat(texts)) {
    for (const document of parseLooseJson(text)) {
      for (const node of collectAdNodes(document)) {
        const ad = normaliseAd(node);
        if (!byId.has(ad.ad_archive_id)) byId.set(ad.ad_archive_id, ad);
      }
    }
  }
  return [...byId.values()];
}

/** Deterministic on-disk name: `<page>-<archive-id>-<kind><n>.<ext>`. */
export function assetFilename(ad, item, index) {
  const ext = item.kind === "video" ? "mp4" : "jpg";
  return `${slug(ad.page_name)}-${ad.ad_archive_id}-${item.kind}${index + 1}.${ext}`;
}

/**
 * A path for the manifest that stays readable wherever `--out-dir` points.
 *
 * `relative()` alone produces a `../../..` chain when the output directory sits
 * outside the working directory, which is worse than an absolute path.
 */
export function manifestPathFor(path, cwd = process.cwd()) {
  const rel = relative(cwd, path);
  return rel && !rel.startsWith("..") && !isAbsolute(rel) ? rel : resolve(path);
}

// ---------------------------------------------------------------------------
// Downloading — out-of-band, never through the page
// ---------------------------------------------------------------------------

const MAGIC = {
  mp4: (buffer) => buffer.length > 12 && buffer.subarray(4, 8).toString("latin1") === "ftyp",
  jpg: (buffer) => buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8,
};

/** Is this actually the media we asked for, or an error page with a 200 on it? */
export function verifyBytes(buffer, kind) {
  if (buffer.length < 1024) return `too small (${buffer.length} bytes)`;
  const check = kind === "video" ? MAGIC.mp4 : MAGIC.jpg;
  return check(buffer) ? null : "bytes are not a valid " + (kind === "video" ? "MP4" : "JPEG");
}

/**
 * Fetch one asset, trying the as-minted URL and then the global-host rewrite.
 *
 * No cookies, no referer, no user-agent: the URL carries its own signature and
 * adding session state only creates ways for the request to be treated
 * differently from the one that was verified to work.
 */
export async function fetchAsset(sources, kind, { attempts = 2, log = () => {} } = {}) {
  const failures = [];
  for (const source of sources) {
    for (const url of downloadCandidates(source)) {
      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          const response = await fetch(url, { redirect: "follow" });
          if (!response.ok) {
            failures.push(`HTTP ${response.status} ${new URL(url).hostname}`);
            break; // A signed-URL rejection will not improve on retry.
          }
          const buffer = Buffer.from(await response.arrayBuffer());
          const problem = verifyBytes(buffer, kind);
          if (problem) {
            failures.push(`${problem} from ${new URL(url).hostname}`);
            break;
          }
          return { buffer, url, host: new URL(url).hostname };
        } catch (error) {
          failures.push(`${error.message} (${new URL(url).hostname}, attempt ${attempt})`);
          log(`      retry: ${error.message}`);
        }
      }
    }
  }
  return { buffer: null, failures };
}

/**
 * Content hash, so identical creatives collated under different ad IDs are visible.
 *
 * The library lists one creative once per ad instance, so "three references"
 * pulled from one page is routinely one file three times. That matters here:
 * `reference-iteration.md` § Calibrating a blueprint will only promote a value
 * that three independent winners agree on, and three copies of one video is a
 * sample of one wearing a disguise.
 */
export const contentHash = (buffer) =>
  createHash("sha256").update(buffer).digest("hex").slice(0, 16);

/** Duration/dimensions if ffprobe is on PATH; silence if it is not. */
export function probeMedia(path) {
  try {
    const raw = execFileSync(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration:stream=codec_name,width,height",
        "-of",
        "json",
        path,
      ],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
    const parsed = JSON.parse(raw);
    const video = (parsed.streams ?? []).find((s) => s.width);
    return {
      duration: parsed.format?.duration ? Number(parsed.format.duration) : null,
      width: video?.width ?? null,
      height: video?.height ?? null,
      has_audio: (parsed.streams ?? []).some((s) => !s.width),
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Discovery — the browser half
// ---------------------------------------------------------------------------

export function libraryUrl({ pageId, adId, url, country = "ALL" }) {
  if (url) return url;
  if (adId) return `https://www.facebook.com/ads/library/?id=${adId}`;
  const params = new URLSearchParams({
    active_status: "active",
    ad_type: "all",
    country,
    is_targeted_country: "false",
    media_type: "all",
    search_type: "page",
    view_all_page_id: String(pageId),
  });
  return `https://www.facebook.com/ads/library/?${params}`;
}

/**
 * Resolve whichever browser module the surrounding project happens to have.
 *
 * `@hyperframes/engine` is searched as well as the obvious roots: it depends on
 * puppeteer to render, so any HyperFrames project already has a browser even
 * when the package manager has not hoisted it somewhere we would otherwise look.
 */
export function driverSearchRoots(
  cwd = process.cwd(),
  self = dirname(fileURLToPath(import.meta.url)),
) {
  const roots = [cwd, self];
  for (const root of [cwd, self]) {
    try {
      const require = createRequire(pathToFileURL(join(root, "package.json")));
      roots.push(dirname(require.resolve("@hyperframes/engine/package.json")));
    } catch {
      // No engine here; the plain roots still stand.
    }
  }
  return [...new Set(roots)];
}

async function loadDriver() {
  const roots = driverSearchRoots();
  for (const name of DRIVERS) {
    for (const root of roots) {
      try {
        const require = createRequire(pathToFileURL(join(root, "package.json")));
        const module = await import(pathToFileURL(require.resolve(name)).href);
        return { name, module: module.default ?? module };
      } catch {
        // Try the next candidate.
      }
    }
  }
  return null;
}

async function launch(driver) {
  // Playwright namespaces its launcher by engine; puppeteer exposes it directly.
  const launcher = driver.module.chromium ?? driver.module;
  return await launcher.launch({ headless: true, args: ["--no-sandbox"] });
}

async function discoverWithBrowser(target, { scrolls, log }) {
  const driver = await loadDriver();
  if (!driver) {
    throw new Error(
      `No browser module found (tried ${DRIVERS.join(", ")}).\n` +
        "\n" +
        "Discovery needs a browser — the library page 403s a plain HTTP client. Either:\n" +
        "  a) run this from a project that has one (any HyperFrames project does, via\n" +
        "     @hyperframes/engine), or add one: bun add -d puppeteer\n" +
        "  b) keep using the browser tool you already have, and hand over what it saw:\n" +
        "     open the library URL, save the response body of any request to\n" +
        "     https://www.facebook.com/api/graphql/ containing `ad_archive_id`, then\n" +
        "       ad-library.mjs discover --from-json <file> --out refs.json\n" +
        "       ad-library.mjs download --from refs.json\n" +
        "\n" +
        "Downloading never needs a browser. See references/ad-library.md.",
    );
  }
  log(`  driver: ${driver.name}`);
  const browser = await launch(driver);
  const payloads = [];
  try {
    const page = await browser.newPage();
    page.on("response", async (response) => {
      const url = response.url();
      if (!/\/api\/graphql|search_ads|ads\/library\/async/.test(url)) return;
      try {
        const body = await response.text();
        if (/ad_archive_id/.test(body)) payloads.push(body);
      } catch {
        // A body we cannot read is one we simply do not have.
      }
    });
    await page.goto(target, { waitUntil: "domcontentloaded", timeout: 90_000 });
    await new Promise((r) => setTimeout(r, 6000));
    // The first grid is server-rendered, so it never appears as a response.
    const inline = await page.evaluate(() =>
      [...document.querySelectorAll('script[type="application/json"]')]
        .map((s) => s.textContent)
        .filter((t) => t && t.includes("ad_archive_id")),
    );
    payloads.push(...inline);
    for (let i = 0; i < scrolls; i++) {
      await page.evaluate(() => window.scrollBy(0, 2500));
      await new Promise((r) => setTimeout(r, 2500));
    }
  } finally {
    await browser.close();
  }
  return payloads;
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

const parseArgs = (argv) => {
  const args = {};
  for (const [index, token] of argv.entries()) {
    if (!token.startsWith("--")) continue;
    const next = argv[index + 1];
    args[token.slice(2)] = next === undefined || next.startsWith("--") ? true : next;
  }
  return args;
};

const log = (line) => process.stdout.write(`${line}\n`);

async function commandDiscover(args) {
  const payloads = args["from-json"]
    ? [].concat(args["from-json"]).map((path) => readFileSync(path, "utf8"))
    : await discoverWithBrowser(
        libraryUrl({
          pageId: args["page-id"],
          adId: args["ad-id"],
          url: typeof args.url === "string" ? args.url : null,
          country: args.country,
        }),
        { scrolls: Number(args.scrolls ?? DEFAULT_SCROLLS), log },
      );

  let ads = extractAds(payloads);
  if (args["active-only"]) ads = ads.filter((ad) => ad.is_active !== false);
  if (args["video-only"]) ads = ads.filter((ad) => ad.media.some((m) => m.kind === "video"));
  if (args.limit) ads = ads.slice(0, Number(args.limit));

  log(`  payloads: ${payloads.length}   ads: ${ads.length}`);
  for (const ad of ads.slice(0, 10)) {
    const kinds = ad.media.map((m) => m.kind).join("+") || "none";
    log(
      `    ${ad.ad_archive_id}  ${ad.display_format ?? "?"}  ${kinds}  ${(ad.title ?? "").slice(0, 48)}`,
    );
  }
  if (ads.length > 10) log(`    … and ${ads.length - 10} more`);

  const out = typeof args.out === "string" ? args.out : null;
  const json = `${JSON.stringify({ fetched_at: new Date().toISOString(), ads }, null, 2)}\n`;
  if (out) {
    mkdirSync(dirname(resolve(out)), { recursive: true });
    writeFileSync(out, json);
    log(`  wrote ${out}`);
  } else process.stdout.write(json);
  return ads;
}

async function commandDownload(args, preloaded) {
  const ads =
    preloaded ??
    JSON.parse(readFileSync(typeof args.from === "string" ? args.from : "references.json", "utf8"))
      .ads;
  const outDir = typeof args["out-dir"] === "string" ? args["out-dir"] : ".media/references";
  mkdirSync(outDir, { recursive: true });
  const manifestPath =
    typeof args.manifest === "string" ? args.manifest : join(outDir, "manifest.jsonl");

  let ok = 0;
  let failed = 0;
  const seenHashes = new Map();
  for (const ad of ads) {
    log(`  ${ad.ad_archive_id}  ${ad.page_name ?? ""}`);
    const wanted = args["video-only"] ? ad.media.filter((m) => m.kind === "video") : ad.media;
    for (const [index, item] of wanted.entries()) {
      const name = assetFilename(ad, item, index);
      const path = join(outDir, name);
      if (existsSync(path) && !args.force) {
        log(`    = ${name} (already present)`);
        continue;
      }
      const expiry = urlExpiry(item.sources[0]);
      if (expiry && expiry < new Date()) {
        log(`    ! ${name} — URL signature expired ${expiry.toISOString()}; re-run discover`);
        failed++;
        continue;
      }
      const result = await fetchAsset(item.sources, item.kind, { log });
      if (!result.buffer) {
        log(`    ! ${name} — ${result.failures.join(" | ")}`);
        failed++;
        continue;
      }
      writeFileSync(path, result.buffer);
      const probe = item.kind === "video" ? probeMedia(path) : null;
      const shape = probe?.width
        ? ` ${probe.width}x${probe.height} ${probe.duration?.toFixed(2)}s`
        : "";
      const hash = contentHash(result.buffer);
      const duplicateOf = seenHashes.get(hash) ?? null;
      if (duplicateOf)
        log(`    + ${name}  IDENTICAL to ${duplicateOf} — same creative, different ad id`);
      else {
        seenHashes.set(hash, name);
        log(
          `    + ${name}  ${(result.buffer.length / 1024).toFixed(0)}KB${shape}  via ${result.host}`,
        );
      }
      appendFileSync(
        manifestPath,
        `${JSON.stringify({
          kind: "reference",
          path: manifestPathFor(path),
          content_hash: hash,
          duplicate_of: duplicateOf,
          source: "meta-ad-library",
          ad_archive_id: ad.ad_archive_id,
          permalink: ad.permalink,
          page_name: ad.page_name,
          media_kind: item.kind,
          title: ad.title,
          body: ad.body,
          cta_text: ad.cta_text,
          link_url: ad.link_url,
          start_date: ad.start_date,
          display_format: ad.display_format,
          downloaded_from: result.host,
          bytes: result.buffer.length,
          probe,
          fetched_at: new Date().toISOString(),
        })}\n`,
      );
      ok++;
    }
  }
  const distinct = seenHashes.size;
  log(`  downloaded ${ok}, failed ${failed}  →  ${outDir}`);
  if (ok > distinct) {
    log(
      `  NOTE: ${ok} files but only ${distinct} distinct creatives — the rest are collated duplicates.`,
    );
    log("        Three copies of one ad do not calibrate a blueprint; see reference-iteration.md.");
  }
  log(`  manifest: ${manifestPath}`);
  if (failed) process.exitCode = 1;
}

async function commandProbe(args) {
  const url = typeof args.url === "string" ? args.url : null;
  if (!url) throw new Error("probe needs --url");
  const expiry = urlExpiry(url);
  log(`  host      ${new URL(url).hostname}`);
  log(
    `  fna       ${new URL(url).hostname.includes(".fna.") ? "yes — ISP-local, may be unroutable elsewhere" : "no"}`,
  );
  log(`  global    ${new URL(toGlobalHost(url)).hostname}`);
  log(
    `  expires   ${expiry ? `${expiry.toISOString()} (${((expiry - Date.now()) / 3600_000).toFixed(1)}h)` : "unknown"}`,
  );
  for (const candidate of downloadCandidates(url)) {
    try {
      const response = await fetch(candidate, {
        method: "GET",
        headers: { range: "bytes=0-1023" },
      });
      log(`  GET ${new URL(candidate).hostname.padEnd(32)} ${response.status}`);
    } catch (error) {
      log(`  GET ${new URL(candidate).hostname.padEnd(32)} FAILED ${error.message}`);
    }
  }
}

const USAGE = `ad-library.mjs — pull reference creatives from the Meta Ads Library

  discover  --page-id <id> | --url <library-url> | --ad-id <archive-id> | --from-json <file>
            [--out refs.json] [--scrolls N] [--limit N] [--active-only] [--video-only]
  download  --from refs.json [--out-dir .media/references] [--video-only] [--force]
  fetch     discover + download in one pass; takes both sets of flags
  probe     --url <fbcdn-url>   diagnose one asset URL without downloading it
`;

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);
  if (!command || args.help) {
    process.stdout.write(USAGE);
    return;
  }
  if (command === "discover") await commandDiscover(args);
  else if (command === "download") await commandDownload(args);
  else if (command === "fetch") await commandDownload(args, await commandDiscover(args));
  else if (command === "probe") await commandProbe(args);
  else {
    process.stderr.write(`unknown command: ${command}\n${USAGE}`);
    process.exitCode = 2;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
