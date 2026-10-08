#!/usr/bin/env node
// JuicyLucy: put JuicyLucy's logo and accent colour on the hyperframes Studio,
// the editor `hyperframes preview` opens and the ad workflow hands the user.
//
// The Studio is a prebuilt web app inside the installed npm package
// (`<hyperframes>/dist/studio/`) with no theming hook: the logo is inline SVG in
// its JavaScript and the green accent is compiled into its CSS and JS. So this
// rewrites the installed copy — never the repo's vendored tree, which holds
// upstream's skills, not its CLI.
//
// TWO MODES, and the difference is the point:
//
//   node studio-brand.mjs [hyperframes-dir]            on a user's machine
//   node studio-brand.mjs --strict [hyperframes-dir]   in development and CI
//
// On a user's machine branding is cosmetic, so it must never cost them
// anything: every failure is swallowed, nothing is printed, and the exit code
// is always 0. What happened goes to ~/.juicylucy/studio-brand.log, for us, not
// them. Whatever cannot be applied is left as upstream shipped it, and
// upstream's Studio keeps working.
//
// --strict is how we find out that upstream moved something we anchor on. Any
// anchor that matches nothing is a problem, every problem is printed, and the
// exit code is 1. `build/check-studio-brand.mjs` runs it against the pinned
// hyperframes in CI, so a re-pin that breaks branding fails its PR instead of
// quietly shipping a half-green editor. JUICYLUCY_BRANDING_STRICT=1 does the
// same through install.sh.
//
// Why the patched assets are NEW files: the Studio serves /assets/* with a
// one-year immutable cache header, so a browser that has opened the Studio
// once never asks for those names again. Editing them in place would leave
// that user green. Each asset is written again under a new name (`-jl` before
// the extension) with every cross-reference rewritten, and index.html, which is
// served no-cache and read on every request, is swapped last and atomically.
// Until that swap nothing upstream serves has changed; a failure anywhere
// before it leaves the original Studio exactly as it was.
//
// Idempotent: the stylesheet link carries a marker, and a Studio that has it
// is left alone. A hyperframes reinstall replaces the whole package, marker
// included, so the next run brands the new one.

import { existsSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

/** JuicyLucy's brand colour; the same value as the plugin manifest's brandColor (a test holds them together). */
export const ACCENT = { hex: "#E09038", rgb: [224, 144, 56] };

/**
 * What upstream's Studio uses for its accent, in every spelling its build
 * emits. Tailwind arbitrary classes carry the colour in their NAME
 * (`shadow-[0_0_0_2px_rgba(60,230,172,0.35)]` in the JS, the selector
 * `.shadow-\[…rgba\(60\,230\,172\,…` in the CSS), so the separator admits the
 * selector's escaped comma: both halves must change together, or the class
 * stops matching its rule.
 */
const UPSTREAM_ACCENT = [
  { re: /#3ce6ac/gi, to: (m) => (m === m.toLowerCase() ? ACCENT.hex.toLowerCase() : ACCENT.hex) },
  { re: /\b60(\s*\\?,\s*|\s+)230\1(?:172)\b/g, to: (_m, sep) => ACCENT.rgb.join(sep) },
];

/** Any trace of upstream's green, however spelled. */
const LEFTOVER = /3ce6ac|\b60\D{1,4}230\D{1,4}172\b/i;

/** On the stylesheet link: a Studio carrying it is already branded. */
export const MARKER = "data-juicylucy-brand";
/** What a patched asset's name gets before its extension. */
export const SUFFIX = "-jl";

const TITLE = "<title>HyperFrames Studio</title>";
const OUR_TITLE = "<title>JuicyLucy Studio</title>";
/** The header's logo is an inline <svg> with this label; the stylesheet hides its paths and draws ours. */
const HEADER_LOGO = '"aria-label":"Hyperframes"';
/** The loading screen's mark. */
const LOADER_MARK = "hf-loader-mark";
/** The preview server only serves files under /assets/ statically; anything else falls through to index.html. */
const SERVES_ASSETS = 'app.get("/assets/*"';

const TEXT = /\.(js|mjs|css|json|svg|map|html)$/;
// An SVG, so it ships as text: Anthropic's directory holds a plugin whose script
// reads an image file it cannot inspect (2026-10-07).
const DEFAULT_LOGO = fileURLToPath(new URL("../assets/juicylucy-mark.svg", import.meta.url));

/** `index-Ab12.js` → `index-Ab12-jl.js`; `x.js.map` → `x-jl.js.map`. */
export function renamed(name) {
  const dot = name.indexOf(".");
  return dot <= 0 ? `${name}${SUFFIX}` : `${name.slice(0, dot)}${SUFFIX}${name.slice(dot)}`;
}

function escapeRe(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Pure: replace every spelling of upstream's accent. Returns the text and how many it replaced. */
export function recolour(text) {
  let count = 0;
  let out = text;
  for (const { re, to } of UPSTREAM_ACCENT) {
    out = out.replace(re, (...args) => {
      count++;
      return to(...args);
    });
  }
  return { text: out, count };
}

/**
 * Whether the bytes are an SVG document the Studio can show as the mark: one
 * <svg> root, nothing scripted. A PNG handed over by mistake (the strict check
 * once passed the old logo.png) would otherwise be written into favicon.svg
 * as garbage and pass for branding.
 */
export function isSvgMark(bytes) {
  const text = bytes.toString("utf8").trim().replace(/^<\?xml[^>]*\?>\s*/, "");
  return text.startsWith("<svg") && text.endsWith("</svg>") && !/<script\b|\son[a-z]+\s*=/i.test(text);
}

/** The mark itself: the brandbook's SVG, as it ships. */
function mark(svg) {
  const text = svg.toString("utf8").trim();
  return `${text}\n`;
}

function wordmark(svg) {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 28">' +
    `<image href="data:image/svg+xml;base64,${Buffer.from(mark(svg)).toString("base64")}" width="28" height="28"/>` +
    '<text x="34" y="19.5" fill="#FAFAFA" font-family="Inter, -apple-system, system-ui, sans-serif" ' +
    'font-size="16" font-weight="700" letter-spacing="-0.2">JuicyLucy</text></svg>\n'
  );
}

// Relative urls resolve against the stylesheet, which is served from /assets/.
// CSS width beats the SVG's width attribute, so the header box grows to fit
// the wordmark rather than squeezing it.
const STYLESHEET = `/* Written by the JuicyLucy setup's studio-brand.mjs. Upstream's marks, replaced by ours. */
svg[aria-label="Hyperframes"] {
  width: 120px;
  height: 28px;
  background: url(juicylucy-logo.svg) no-repeat left center / contain;
}
svg[aria-label="Hyperframes"] > * { display: none; }
.${LOADER_MARK} { background: url(juicylucy-mark.svg) no-repeat center / contain; }
.${LOADER_MARK} > * { display: none; }
`;

/** Read what the plan needs from an installed hyperframes package. Throws only when there is no Studio at all. */
export function readStudio(pkgDir) {
  const studioDir = join(pkgDir, "dist", "studio");
  const indexPath = join(studioDir, "index.html");
  if (!existsSync(indexPath)) throw new Error(`no Studio at ${studioDir} (index.html missing)`);
  const assetsDir = join(studioDir, "assets");
  const assets = existsSync(assetsDir)
    ? readdirSync(assetsDir)
        .filter((name) => statSync(join(assetsDir, name)).isFile())
        .map((name) => ({ name, bytes: readFileSync(join(assetsDir, name)) }))
    : [];
  const cliPath = join(pkgDir, "dist", "cli.js");
  return {
    studioDir,
    index: readFileSync(indexPath, "utf8"),
    assets,
    hasFavicon: existsSync(join(studioDir, "favicon.svg")),
    cli: existsSync(cliPath) ? readFileSync(cliPath, "utf8") : null,
  };
}

/**
 * Pure: what to write, and every anchor that matched nothing.
 *
 * Each part — accent, logo, title — is planned on its own, so a missing anchor
 * costs only its own part: strict mode reports it, the default mode applies
 * the rest. `files` are written before `index`, which is the one change that
 * makes any of them visible.
 */
export function plan(studio, logoSvg) {
  const problems = [];
  if (studio.index.includes(MARKER)) return { already: true, problems, files: [], index: null };

  const files = [];
  let index = studio.index;
  const ours = new Set(studio.assets.map((a) => a.name).filter((n) => n.startsWith("juicylucy-")));
  const upstream = studio.assets.filter((a) => !ours.has(a.name) && !a.name.includes(`${SUFFIX}.`));

  if (studio.cli !== null && !studio.cli.includes(SERVES_ASSETS)) {
    problems.push("the preview server no longer serves /assets/* as files: nothing written under assets/ would load");
  }

  // ── accent ──
  const referenced = [...index.matchAll(/\/assets\/([^"'?#\s>]+)/g)].map((m) => m[1]);
  const missingRefs = referenced.filter((name) => !upstream.some((a) => a.name === name));
  if (referenced.length === 0) problems.push("index.html references no /assets/ file to rename");
  if (missingRefs.length > 0) problems.push(`index.html references assets that are not there: ${missingRefs.join(", ")}`);

  let accentHits = 0;
  const recoloured = upstream.map((asset) => {
    if (!TEXT.test(asset.name)) return { ...asset, bytes: asset.bytes };
    const { text, count } = recolour(asset.bytes.toString("utf8"));
    accentHits += count;
    return { ...asset, text };
  });
  if (accentHits === 0) problems.push("no #3CE6AC accent in the Studio's assets: upstream changed its palette");
  // Looser than the recolour on purpose: a spelling it does not know yet
  // (`60 ,230`, a new escape) is still green on screen.
  const leftovers = recoloured.filter((a) => a.text !== undefined && LEFTOVER.test(a.text)).map((a) => a.name);
  if (leftovers.length > 0) problems.push(`the green survives, in a spelling the recolour does not know, in ${leftovers.join(", ")}`);

  if (accentHits > 0 && referenced.length > 0 && missingRefs.length === 0) {
    const names = upstream.map((a) => a.name).sort((a, b) => b.length - a.length);
    const nameRe = new RegExp(names.map(escapeRe).join("|"), "g");
    for (const asset of recoloured) {
      const content = asset.text === undefined ? asset.bytes : asset.text.replace(nameRe, renamed);
      files.push({ path: join("assets", renamed(asset.name)), content });
    }
    index = index.replace(/\/assets\/([^"'?#\s>]+)/g, (whole, name) =>
      names.includes(name) ? `/assets/${renamed(name)}` : whole,
    );
  }

  // ── logo ──
  const js = upstream.filter((a) => /\.m?js$/.test(a.name)).map((a) => a.bytes.toString("utf8"));
  const css = upstream.filter((a) => a.name.endsWith(".css")).map((a) => a.bytes.toString("utf8"));
  if (!js.some((t) => t.includes(HEADER_LOGO))) problems.push('the header logo is no longer an <svg aria-label="Hyperframes">');
  if (![...js, ...css].some((t) => t.includes(LOADER_MARK))) problems.push(`the loading screen has no .${LOADER_MARK}`);
  if (!studio.hasFavicon) problems.push("the Studio has no favicon.svg");

  let stylesheet = false;
  if (logoSvg === null) {
    problems.push("the JuicyLucy mark is not beside this script (assets/juicylucy-mark.svg)");
  } else if (!isSvgMark(logoSvg)) {
    problems.push("the JuicyLucy mark is not an SVG (assets/juicylucy-mark.svg)");
  } else if (!index.includes("</head>")) {
    problems.push("index.html has no </head> to put the stylesheet before");
  } else {
    files.push({ path: join("assets", "juicylucy-mark.svg"), content: mark(logoSvg) });
    files.push({ path: join("assets", "juicylucy-logo.svg"), content: wordmark(logoSvg) });
    files.push({ path: join("assets", "juicylucy-studio.css"), content: STYLESHEET });
    if (studio.hasFavicon) files.push({ path: "favicon.svg", content: mark(logoSvg), replace: true });
    index = index.replace("</head>", `  <link rel="stylesheet" href="/assets/juicylucy-studio.css" ${MARKER} />\n  </head>`);
    stylesheet = true;
  }

  // ── title ──
  if (index.includes(TITLE)) index = index.replace(TITLE, OUR_TITLE);
  else problems.push(`index.html no longer says ${TITLE}`);

  // The accent went in but the stylesheet (and its marker) could not: mark the
  // page anyway, so a later run does not try to rename the renamed assets.
  if (!stylesheet && index !== studio.index) {
    index = index.replace(/<head>/, `<head><meta ${MARKER} />`);
  }
  return { already: false, problems, files, index: index === studio.index ? null : index };
}

/** Write a file whole or not at all: to a sibling, then renamed over the target. */
function writeAtomic(path, content) {
  const tmp = `${path}.jl-tmp-${process.pid}`;
  writeFileSync(tmp, content);
  renameSync(tmp, path);
}

/** Write the plan: new files first, index.html last. */
export function apply(studioDir, planned) {
  for (const file of planned.files) {
    const path = join(studioDir, file.path);
    if (file.replace) writeAtomic(path, file.content);
    else writeFileSync(path, file.content);
  }
  if (planned.index !== null) writeAtomic(join(studioDir, "index.html"), planned.index);
}

function juicylucyHome() {
  return process.env.JUICYLUCY_HOME || join(homedir(), ".juicylucy");
}

function parseArgs(argv) {
  const args = { strict: process.env.JUICYLUCY_BRANDING_STRICT === "1", pkgDir: null, logo: DEFAULT_LOGO };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--strict") args.strict = true;
    else if (argv[i] === "--logo") args.logo = argv[++i];
    else args.pkgDir = argv[i];
  }
  args.pkgDir ??= join(juicylucyHome(), "node_modules", "hyperframes");
  return args;
}

/** The whole run. Returns the exit code and the lines to print. */
export function run(argv) {
  const args = parseArgs(argv);
  const lines = [];
  try {
    const studio = readStudio(args.pkgDir);
    const logoSvg = existsSync(args.logo) ? readFileSync(args.logo) : null;
    const planned = plan(studio, logoSvg);
    if (planned.already) return { code: 0, lines: [`studio-brand: already branded (${studio.studioDir})`] };
    if (args.strict && planned.problems.length > 0) {
      return {
        code: 1,
        lines: [
          `studio-brand: ${planned.problems.length} anchor(s) in ${basename(args.pkgDir)} matched nothing:`,
          ...planned.problems.map((p) => `  - ${p}`),
          "Upstream moved something the branding points at. Fix the anchor in",
          "engine/shared/juicylucy-setup/scripts/studio-brand.mjs; never make it pass by skipping the part.",
        ],
      };
    }
    apply(studio.studioDir, planned);
    lines.push(`studio-brand: branded ${studio.studioDir} (${planned.files.length} files written)`);
    for (const p of planned.problems) lines.push(`studio-brand: skipped: ${p}`);
    return { code: 0, lines };
  } catch (error) {
    const message = `studio-brand: ${error instanceof Error ? error.message : String(error)}`;
    return { code: args.strict ? 1 : 0, lines: [message] };
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const strict = process.argv.includes("--strict") || process.env.JUICYLUCY_BRANDING_STRICT === "1";
  let result;
  try {
    result = run(process.argv.slice(2));
  } catch (error) {
    result = { code: strict ? 1 : 0, lines: [`studio-brand: ${error}`] };
  }
  if (strict) {
    for (const line of result.lines) console.log(line);
    process.exitCode = result.code;
  } else {
    // Nothing reaches the user. The log is for whoever debugs this machine.
    try {
      if (!result.lines.some((line) => line.includes("already branded"))) {
        writeFileSync(join(juicylucyHome(), "studio-brand.log"), `${new Date().toISOString()}\n${result.lines.join("\n")}\n`);
      }
    } catch {}
    process.exitCode = 0;
  }
}
