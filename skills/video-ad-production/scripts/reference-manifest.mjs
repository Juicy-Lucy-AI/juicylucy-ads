#!/usr/bin/env node
// The reference-manifest gate: no ad enters production without a playable
// reference on disk, of the right MEDIUM, traceable back to the ad it came from.
//
//   node reference-manifest.mjs verify --project .
//   node reference-manifest.mjs verify --project . --min 3
//   node reference-manifest.mjs add --project . --file .media/references/clap.mp4 \
//        --source-id 798099273357065 --permalink "https://www.facebook.com/ads/library/?id=798099273357065"
//   node reference-manifest.mjs list --project .
//
// ## Why this exists
//
// The 2026.08.19 batch shipped 27 video ads built from three Meta Ads Library
// IDs. Its `References/Sources/` directory holds three PNGs. The IDs are in the
// manifest prose, the reference videos are nowhere, and there is now no way to
// answer "what did this ad iterate from?" — not for a QA pass, not for the
// soundtrack it was supposed to preserve, not for the next round.
//
// Three separate failures hide inside that, and each one is a check below:
//
//   1. NO FILE. An Ads Library ID is a citation, not a reference. You cannot
//      measure pacing, dwell, or overlay geometry from an ID, and you cannot
//      reuse the reference's soundtrack from one either (SKILL.md § Audio is
//      not optional). Discipline that depends on remembering to download is
//      discipline that lapses under batch pressure.
//
//   2. WRONG MEDIUM. A still frame or a page screenshot cannot fill a video
//      reference slot. A static ad has no pacing, no cut rhythm, no ending to
//      classify, and no audio — every question `reference-iteration.md` asks
//      of a reference is unanswerable, so an agent invents the answers. Video
//      ads are iterated from video ads.
//
//   3. NO SOURCE ID. Without the archive id and permalink, the reference is an
//      anonymous mp4 in a folder six weeks later. Provenance is the whole point
//      of keeping it.
//
// Dependency-free: node alone, plus ffprobe when it happens to be on PATH.
// `probeMedia` is imported rather than reimplemented so the two scripts cannot
// drift on what "playable" means.

import { appendFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, isAbsolute, relative, resolve } from "node:path";
import { contentHash, probeMedia } from "./ad-library.mjs";

/** Where `ad-library.mjs download` puts its manifest, relative to the project. */
export const DEFAULT_MANIFEST = ".media/references/manifest.jsonl";

/** Extensions that settle the medium question on their own, whatever a record claims. */
export const STILL_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".bmp",
  ".heic",
]);

const log = (...args) => console.log(...args);

// ---------------------------------------------------------------------------
// Reading
// ---------------------------------------------------------------------------

/**
 * JSONL in, records out. A malformed line is fatal and names its line number —
 * a manifest that half-parses is worse than one that fails, because the missing
 * half is exactly the reference nobody notices is missing.
 */
export function parseManifest(text) {
  const records = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
      records.push(JSON.parse(line));
    } catch {
      throw new Error(`manifest line ${i + 1} is not valid JSON`);
    }
  }
  return records;
}

/** Reference records only — a manifest may also carry generated-media records. */
export const referenceRecords = (records) => records.filter((r) => r?.kind === "reference");

/** Manifest paths are stored relative to the manifest, so they survive a move. */
export function resolveRecordPath(record, manifestDir) {
  const p = record?.path;
  if (typeof p !== "string" || !p.trim()) return null;
  return isAbsolute(p) ? p : resolve(manifestDir, p);
}

/** `media_kind` is what `ad-library.mjs` writes; `media_type` is what a human adds by hand. */
export const declaredMedium = (record) =>
  typeof record?.media_kind === "string"
    ? record.media_kind
    : typeof record?.media_type === "string"
      ? record.media_type
      : null;

/** Any of the three spellings a source id arrives under. */
export const sourceId = (record) =>
  record?.ad_archive_id ?? record?.source_id ?? record?.ad_id ?? null;

/** A link that reopens the original ad. */
export const sourceLocator = (record) => record?.permalink ?? record?.source_url ?? null;

// ---------------------------------------------------------------------------
// The checks
// ---------------------------------------------------------------------------

/**
 * One record against the gate.
 *
 * Failures block production. Warnings do not — but a silent reference is a
 * warning that becomes a failure the moment the ad is supposed to inherit its
 * soundtrack, so it is printed, not swallowed.
 *
 * `medium` is what this run needs the reference to BE, not what the record
 * claims to be. Passing "video" is how a video batch refuses a screenshot.
 */
export function verifyRecord(
  record,
  { manifestDir = ".", medium = "video", probe = probeMedia } = {},
) {
  const failures = [];
  const warnings = [];

  // --- the file itself
  const path = resolveRecordPath(record, manifestDir);
  if (!path) {
    failures.push("no `path` — the record cites a reference it did not keep");
  } else if (!existsSync(path)) {
    failures.push(`file missing: ${record.path}`);
  } else if (statSync(path).size === 0) {
    failures.push(`file is empty: ${record.path}`);
  }

  // --- the medium
  const declared = declaredMedium(record);
  const ext = path ? extname(path).toLowerCase() : "";
  if (medium === "video") {
    if (declared && declared !== "video") {
      failures.push(`media is \`${declared}\`, not video — a video ad is iterated from a video ad`);
    } else if (!declared) {
      warnings.push("no `media_kind` / `media_type` recorded; medium inferred from the file");
    }
    if (STILL_EXTENSIONS.has(ext)) {
      failures.push(
        `\`${ext}\` is a still — a frame is not a reference, it has no pacing or audio`,
      );
    }
  }

  // --- provenance
  if (!sourceId(record)) {
    failures.push("no `ad_archive_id` / `source_id` — the reference is untraceable");
  }
  if (!sourceLocator(record)) {
    warnings.push("no `permalink` / `source_url` — nothing reopens the original ad");
  }
  if (!record?.content_hash) {
    warnings.push("no `content_hash` — duplicate references cannot be detected");
  }

  // --- playability
  //
  // Re-probe rather than trusting the record: the record was written when the
  // file was downloaded, and the question here is whether it is playable NOW.
  // With no ffprobe on PATH the recorded probe stands in, and the caller is
  // told the check was not run rather than being handed a false pass.
  if (path && existsSync(path) && statSync(path).size > 0) {
    const fresh = probe(path);
    const reading = fresh ?? record?.probe ?? null;
    if (!fresh && !reading) {
      failures.push("not playable: ffprobe unavailable and no probe recorded");
    } else {
      if (!fresh) warnings.push("ffprobe unavailable — trusting the recorded probe");
      if (medium === "video") {
        if (!reading.width || !reading.height) {
          failures.push("no video stream — the file will not play as a video reference");
        }
        if (!(Number(reading.duration) > 0)) {
          failures.push("duration is zero or unknown — the file is not a playable video");
        }
        if (reading.has_audio === false) {
          warnings.push("no audio stream — this reference cannot supply a soundtrack");
        }
      }
    }
  }

  return { record, path, failures, warnings, ok: failures.length === 0 };
}

/**
 * The whole manifest.
 *
 * `min` is the batch's own requirement — one reference per concept being
 * iterated. Distinctness is counted by content hash because the Ads Library
 * lists one creative once per ad INSTANCE: six downloaded files are routinely
 * two ads repeated, and three copies of one ad is a sample of one.
 */
export function verifyManifest(
  records,
  { manifestDir = ".", medium = "video", min = 1, probe = probeMedia } = {},
) {
  const refs = referenceRecords(records);
  const results = refs.map((r) => verifyRecord(r, { manifestDir, medium, probe }));
  const passing = results.filter((r) => r.ok);

  const hashes = new Set();
  const duplicates = [];
  for (const result of passing) {
    const hash = result.record.content_hash;
    if (!hash) continue;
    if (hashes.has(hash)) duplicates.push(result);
    else hashes.add(hash);
  }

  const distinct = passing.filter((r) => !duplicates.includes(r)).length;
  const problems = [];
  if (refs.length === 0) problems.push("the manifest carries no reference records");
  if (distinct < min) {
    problems.push(`${distinct} distinct usable reference(s), ${min} required`);
  }

  return {
    results,
    duplicates,
    distinct,
    total: refs.length,
    problems,
    ok: problems.length === 0 && results.every((r) => r.ok),
  };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

export function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) args[key] = true;
    else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

function manifestPath(args) {
  const project = typeof args.project === "string" ? args.project : ".";
  const rel = typeof args.manifest === "string" ? args.manifest : DEFAULT_MANIFEST;
  return isAbsolute(rel) ? rel : resolve(project, rel);
}

function commandVerify(args) {
  const file = manifestPath(args);
  if (!existsSync(file)) {
    log(`  MISSING  ${file}`);
    log("");
    log("  There is no reference manifest, so production has nothing to iterate from.");
    log("  Pull the references first:");
    log("");
    log("    node <SKILL_DIR>/scripts/ad-library.mjs fetch --page-id <id> --video-only \\");
    log("      --out AD_REFERENCES.json --out-dir .media/references");
    log("");
    log("  For a reference that did not come from the Ads Library, record it by hand:");
    log("");
    log("    node <SKILL_DIR>/scripts/reference-manifest.mjs add --file <path> --source-id <id>");
    process.exitCode = 1;
    return;
  }

  const min = Number(args.min ?? 1) || 1;
  const medium = typeof args.medium === "string" ? args.medium : "video";
  const summary = verifyManifest(parseManifest(readFileSync(file, "utf8")), {
    manifestDir: dirname(file),
    medium,
    min,
  });

  for (const result of summary.results) {
    const name = result.record.path ?? "(no path)";
    const id = sourceId(result.record) ?? "?";
    log(`  ${result.ok ? "ok  " : "FAIL"}  ${name}  [${id}]`);
    for (const failure of result.failures) log(`          ✗ ${failure}`);
    for (const warning of result.warnings) log(`          ! ${warning}`);
  }
  for (const duplicate of summary.duplicates) {
    log(`          ! ${duplicate.record.path} duplicates an earlier reference (same bytes)`);
  }
  log("");
  log(`  ${summary.distinct} distinct usable reference(s) of ${summary.total} record(s)`);
  for (const problem of summary.problems) log(`  ✗ ${problem}`);

  if (!summary.ok) {
    log("");
    log("  Gate not passed — do not start generating. See references/reference-manifest.md.");
    process.exitCode = 1;
  }
}

function commandAdd(args) {
  const project = typeof args.project === "string" ? args.project : ".";
  const file = typeof args.file === "string" ? args.file : null;
  const id = args["source-id"];
  if (!file) throw new Error("add needs --file");
  if (typeof id !== "string" || !id.trim()) throw new Error("add needs --source-id");

  const absolute = isAbsolute(file) ? file : resolve(project, file);
  if (!existsSync(absolute)) throw new Error(`no such file: ${file}`);

  const out = manifestPath(args);
  mkdirSync(dirname(out), { recursive: true });

  const record = {
    kind: "reference",
    path: relative(dirname(out), absolute) || absolute,
    content_hash: contentHash(readFileSync(absolute)),
    source: typeof args.source === "string" ? args.source : "manual",
    source_id: id,
    permalink: typeof args.permalink === "string" ? args.permalink : null,
    page_name: typeof args["page-name"] === "string" ? args["page-name"] : null,
    media_kind: typeof args["media-type"] === "string" ? args["media-type"] : "video",
    note: typeof args.note === "string" ? args.note : null,
    probe: probeMedia(absolute),
    fetched_at: new Date().toISOString(),
  };
  appendFileSync(out, `${JSON.stringify(record)}\n`);
  log(`  recorded  ${record.path}  [${id}]  →  ${out}`);
  if (!record.probe) log("  ! ffprobe unavailable — the record carries no playability reading");
  else if (record.probe.has_audio === false) log("  ! no audio stream in this reference");
}

function commandList(args) {
  const file = manifestPath(args);
  if (!existsSync(file)) {
    log(`  MISSING  ${file}`);
    process.exitCode = 1;
    return;
  }
  for (const record of referenceRecords(parseManifest(readFileSync(file, "utf8")))) {
    const probe = record.probe ?? {};
    const shape = probe.duration
      ? `${probe.width}x${probe.height} ${probe.duration.toFixed(2)}s`
      : "";
    log(`  ${sourceId(record) ?? "?"}  ${declaredMedium(record) ?? "?"}  ${record.path}  ${shape}`);
  }
}

const USAGE = `
reference-manifest — the gate between a reference and production

  verify  [--project .] [--manifest <path>] [--min N] [--medium video]
  add     --file <path> --source-id <id> [--permalink <url>] [--page-name <name>]
          [--source <origin>] [--media-type video] [--note <text>]
  list    [--project .] [--manifest <path>]
`;

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);
  switch (command) {
    case "verify":
      return commandVerify(args);
    case "add":
      return commandAdd(args);
    case "list":
      return commandList(args);
    default:
      log(USAGE.trim());
      process.exitCode = command ? 1 : 0;
  }
}

const invoked =
  process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname);
if (invoked) {
  main().catch((error) => {
    console.error(`  ${error.message}`);
    process.exitCode = 1;
  });
}
