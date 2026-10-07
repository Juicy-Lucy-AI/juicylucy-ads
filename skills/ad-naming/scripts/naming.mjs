#!/usr/bin/env node
// The naming tool — export filenames and ad-set folders, for both mediums.
//
// Exported files leave the production tree and enter a human pipeline: a
// designer reviews them, drops the survivors into a flat delivery folder, and
// an automation uploads them to the ad platform. That automation READS THE
// FILENAME, and the folder is a flat namespace, so the filename is the only
// thing distinguishing one creative, market, or version from another. Ad-set
// folders carry a global sequence number that must never collide across
// dates, languages, or mediums.
//
// Nobody hand-writes a filename or a sequence number beside this tool.
//
//   node naming.mjs get     --project .
//   node naming.mjs set     --project . --creative-name "Boxes Stop Motion" --funnel MOF --source winner --style videotextoverlay [--medium video|static]
//   node naming.mjs expand  --project . --ratio 9x16 --markets en,de,pt-br
//   node naming.mjs name    --medium static --creative-name "Sticky Note" --funnel TOF --source winner --style imagestatic --ratio 4x5 --markets en,de [--date YYYY.MM.DD]
//   node naming.mjs inherit --filename "<source filename>" --market de
//   node naming.mjs parse   "<filename>"
//   node naming.mjs reserve --root <campaign parent> --count N
//   node naming.mjs folder  --seq 13 --language de --batch GEN --ads 8 --icp "Mixed ICP" --format "Static Format"
//   node naming.mjs where   # which copy of the conventions every command above is reading
//
// A video run authors ONE record per ad (`set`) and expands it into one
// filename per market (`expand`); the record lives in the project as
// export-naming.json. A statics run names each image directly (`name`),
// derives a localized name from a source file (`inherit`), and reserves its
// folder numbers against the live filesystem (`reserve`, `folder`).
//
// Grammar and rationale: ../SKILL.md. Dependency-free: it must run from an
// installed skill dir with no node_modules.

import { readdirSync, readFileSync, realpathSync, writeFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const RECORD_FILE = "export-naming.json";

/** The name the record carried before it was renamed; it collides with the grammar file. */
export const LEGACY_RECORD_FILE = "naming.json";

/** The four fields the agent authors. Ratio, market and date are the system's. */
export const AUTHORED_FIELDS = ["creativeName", "funnelStage", "source", "style"];

export const DEFAULT_MEDIUM = "video";

// ── The grammar's single home ───────────────────────────────────────────────
//
// The token grammar and the folder grammar are workspace convention, shared by
// both mediums, and live in the workspace conventions' naming.json and
// foldering.json — this script reads the constants from there rather than
// restating them. Anything it cannot find fails loud: a filename authored
// from remembered constants is exactly the fork this file exists to prevent.
//
// Each file is resolved on its own, first match wins:
//
//   1. The conventions folder, `~/.juicylucy/conventions/` (or
//      `$JUICYLUCY_HOME/conventions/`), on both hosts. A plain data folder,
//      not a skill: whoever needs their own grammar — a team whose uploader
//      reads filenames, say — puts their `naming.json`, `foldering.json`,
//      `languages.json`, `allocation.json` or `evidence.json` there, and each
//      file present replaces the shipped one. It comes first because it is
//      the one route that works on both hosts (on Claude Code a local skill
//      loads beside the plugin's instead of replacing it) and because nothing
//      writes it by accident. The installer replaces only the toolchain's own
//      folders under ~/.juicylucy, so it survives every update.
//   2. On Codex only, a `juicylucy` skill in Codex's own skill roots — a
//      project's `.agents/skills` (walked up from the working directory),
//      `~/.agents/skills`, `/etc/codex/skills`. Codex lets such a copy SHADOW
//      the plugin's, so the agent is reading that copy and this tool has to
//      name files from the same one. Honoured; no longer the documented route.
//   3. The plugin's own `juicylucy` skill — a sibling skill directory.
//   4. A repo checkout's `workspace-default/juicylucy`, which every edition
//      ships, so a checkout names files the way an install does.
//
// Per file, so a folder holding only `foldering.json` changes the folder
// grammar and nothing else. `where` reports which copy of every file is in
// effect, and every command says so on stderr when any is not the shipped one.

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));

/**
 * The agent this copy was emitted for. build-plugin.mjs stamps it per edition
 * (HOST_STAMPS); the source, and so a repo checkout, is Codex's. On Claude
 * Code a local skill loads beside the plugin's rather than in place of it, so
 * no skill root is consulted there: the conventions folder is the one local
 * source.
 */
export const HOST = "claude";

/** The catalogue name of the workspace conventions skill. */
export const WORKSPACE_SKILL = "juicylucy";

/** Every file of the conventions, in the order the conventions skill lists them. */
export const CONVENTION_FILES = ["naming.json", "foldering.json", "allocation.json", "languages.json", "evidence.json"];

/** The origin of a file read from the conventions folder. */
export const CONVENTIONS_ORIGIN = "conventions";

/**
 * The conventions folder: `$JUICYLUCY_HOME/conventions`, which is
 * `~/.juicylucy/conventions` unless the toolchain lives elsewhere. `env` and
 * `home` are parameters so tests never read the developer's own folder.
 */
export function conventionsDir({ env = process.env, home = homedir() } = {}) {
  const toolchain = typeof env.JUICYLUCY_HOME === "string" && env.JUICYLUCY_HOME !== ""
    ? env.JUICYLUCY_HOME
    : join(home, ".juicylucy");
  return join(toolchain, "conventions");
}

/** The local skill roots whose `juicylucy` copy shadows the plugin's on this host. */
export function localSkillRoots(options = {}) {
  return HOST === "codex" ? codexSkillRoots(options) : [];
}

/**
 * Every local source of a conventions file on this host, in order: the
 * conventions folder, then (on Codex) the skill roots. Entries are
 * `{ dir, origin }`; the folder holds the files directly, a skill root under
 * `<dir>/juicylucy/`. An empty list means "the shipped copy only".
 */
export function localSources(options = {}) {
  return [{ dir: conventionsDir(options), origin: CONVENTIONS_ORIGIN }, ...localSkillRoots(options)];
}

/**
 * Codex's skill roots, in the order Codex ranks them: every `.agents/skills`
 * from the working directory up to (not including) the home directory, then
 * the user root, then the system root. A skill in any of these shadows the
 * plugin's. `cwd` and `home` are parameters so the order is testable without
 * touching the developer's own roots.
 */
export function codexSkillRoots({ cwd = process.cwd(), home = homedir() } = {}) {
  // Physical paths on both sides: a home reached through a symlink (/var →
  // /private/var on a Mac) would otherwise never equal the working directory's
  // ancestor and the walk would run past it.
  const physical = (path) => {
    try {
      return realpathSync(path);
    } catch {
      return resolve(path);
    }
  };
  const roots = [];
  const stop = physical(home);
  let dir = physical(cwd);
  while (dir !== stop) {
    roots.push({ dir: join(dir, ".agents", "skills"), origin: "project" });
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  roots.push({ dir: join(stop, ".agents", "skills"), origin: "user" });
  roots.push({ dir: "/etc/codex/skills", origin: "system" });
  return roots;
}

/** Where `file` of the conventions may be, first match wins. */
export function conventionCandidates(file, sources = localSources()) {
  return [
    ...sources.map(({ dir, origin }) => ({
      path: origin === CONVENTIONS_ORIGIN ? join(dir, file) : join(dir, WORKSPACE_SKILL, file),
      origin,
    })),
    { path: join(SCRIPT_DIR, "..", "..", WORKSPACE_SKILL, file), origin: "plugin" },
    { path: join(SCRIPT_DIR, "..", "..", "..", "..", "workspace-default", WORKSPACE_SKILL, file), origin: "checkout" },
  ];
}

/** Origins that are the shipped conventions; anything else is a local copy. */
export const SHIPPED_ORIGINS = ["plugin", "checkout"];

/** The first candidate that exists — `{ path, origin }` — or a loud failure. */
export function resolveConventions(file, sources = localSources()) {
  for (const candidate of conventionCandidates(file, sources)) {
    if (statSync(candidate.path, { throwIfNoEntry: false })?.isFile()) return candidate;
  }
  throw new Error(
    `workspace conventions not found: the workspace skill's ${file} is not installed ` +
      "beside this skill, not in the conventions folder or a local skill root, and this is not " +
      "a repo checkout. Install the workspace conventions skill, or stop and ask — never " +
      "hand-write a filename or a folder from memory.",
  );
}

/** A resolved file's JSON, or a failure that names the file — a broken local copy must not read as a broken tool. */
function readConventions(source) {
  try {
    return JSON.parse(readFileSync(source.path, "utf8"));
  } catch (error) {
    throw new Error(
      `workspace conventions unreadable: ${source.path} (${source.origin}) is not valid JSON — ` +
        `${error.message}. Fix or remove that file, or stop and ask — never hand-write a filename ` +
        "or a folder from memory.",
    );
  }
}

function loadConventions(file, sources) {
  return readConventions(resolveConventions(file, sources));
}

export function loadGrammar(sources = localSources()) {
  return loadConventions("naming.json", sources);
}

export function loadFoldering(sources = localSources()) {
  return loadConventions("foldering.json", sources);
}

/**
 * Which copy of every conventions file is in effect: `{ "<file>": { path, origin } }`,
 * or `null` for a file found nowhere — reported, not thrown, because this
 * tool itself needs only naming.json and foldering.json.
 */
export function conventionSources(sources = localSources()) {
  return Object.fromEntries(
    CONVENTION_FILES.map((file) => {
      try {
        return [file, resolveConventions(file, sources)];
      } catch {
        return [file, null];
      }
    }),
  );
}

export const GRAMMAR_SOURCE = resolveConventions("naming.json");
export const FOLDERING_SOURCE = resolveConventions("foldering.json");

const GRAMMAR = readConventions(GRAMMAR_SOURCE);
const FOLDERING = readConventions(FOLDERING_SOURCE);

/**
 * Local conventions are in effect when any file resolved outside the plugin.
 * They are honoured — that is what the resolution order is for — and said,
 * because the person reading the filenames may not know their machine names
 * them differently from the plugin's defaults. `sources` is a list of
 * resolved files (`{ path, origin }`), every one by default: a local
 * `languages.json` changes the codes the agent picks even though this tool
 * never reads it.
 */
export function localConventionsNote(sources = Object.values(conventionSources())) {
  const local = sources.filter((source) => source !== null && !SHIPPED_ORIGINS.includes(source.origin));
  if (local.length === 0) return null;
  const parts = [];
  const folder = local.filter((source) => source.origin === CONVENTIONS_ORIGIN);
  if (folder.length > 0) {
    parts.push(
      `the local conventions folder ${dirname(folder[0].path)} (${folder.map((source) => basename(source.path)).join(", ")})`,
    );
  }
  const copies = [...new Set(local.filter((source) => source.origin !== CONVENTIONS_ORIGIN).map((source) => dirname(source.path)))];
  if (copies.length > 0) parts.push(`a local copy of the ${WORKSPACE_SKILL} skill (${copies.join(", ")})`);
  return (
    `note: conventions read from ${parts.join(" and ")}, not the plugin's defaults. ` +
    "Filenames and folders follow the local conventions; say so to the user."
  );
}

export const MEDIUMS = Object.keys(GRAMMAR.mediums);
export const FUNNEL_STAGES = GRAMMAR.funnel_stages;

/** The medium's constants: author, format, extensions, styles. */
export function mediumConstants(medium = DEFAULT_MEDIUM) {
  const constants = GRAMMAR.mediums[medium];
  if (constants === undefined) throw new Error(`unknown medium "${medium}" (${MEDIUMS.join(", ")})`);
  return constants;
}

/**
 * The FB- treatment vocabulary of a medium — never shared across mediums.
 * Each set is OPEN: new values are added as treatments come into use. Unknown
 * values validate (shape-checked) but are reported so a rephrasing of an
 * existing treatment doesn't quietly become a second name for it.
 */
export function stylesFor(medium = DEFAULT_MEDIUM) {
  return mediumConstants(medium).styles;
}

/** The video vocabulary, kept under its historical name for the blueprint lint. */
export const KNOWN_STYLES = stylesFor("video");

const CREATIVE_NAME_RE = /^[^_]+$/;
const SOURCE_RE = /^[a-z0-9-]+$/;
const STYLE_RE = /^[a-z]+$/;
const DATE_RE = /^\d{4}\.\d{2}\.\d{2}$/;
const RATIO_RE = /^\d+x\d+$/;

/** Validate a record. Returns the offending field names — empty means valid. */
export function invalidFields(record) {
  const bad = [];
  const { creativeName, funnelStage, source, style, date, medium } = record;

  if (creativeName !== undefined) {
    // An underscore would split into a phantom segment: the pattern is
    // underscore-delimited after the creative name.
    if (typeof creativeName !== "string" || creativeName.trim() === "") bad.push("creativeName");
    else if (!CREATIVE_NAME_RE.test(creativeName)) bad.push("creativeName");
  }
  if (funnelStage !== undefined && !FUNNEL_STAGES.includes(funnelStage)) bad.push("funnelStage");
  if (source !== undefined && !SOURCE_RE.test(String(source))) bad.push("source");
  // A style with a capital letter or a space is the usual culprit.
  if (style !== undefined && !STYLE_RE.test(String(style))) bad.push("style");
  if (date !== undefined && !DATE_RE.test(String(date))) bad.push("date");
  if (medium !== undefined && !MEDIUMS.includes(medium)) bad.push("medium");

  return bad;
}

/** Fields still missing before the record can produce a filename. */
export function missingFields(record) {
  return AUTHORED_FIELDS.filter((key) => record[key] === undefined || record[key] === "");
}

/**
 * Merge a patch into a record: fill one field at a time, validate before
 * writing, and NEVER move an existing date stamp.
 *
 * The date is stamped once, on the first write, and preserved on every rewrite —
 * that is what makes a re-download or a single-language re-export weeks later
 * reproduce the original filename. `today` is passed in rather than read from
 * the clock so the merge stays deterministic and testable.
 */
export function mergeRecord(current, patch, today) {
  const incoming = { ...patch };
  // A caller may only restamp the date by passing one explicitly — that is the
  // deliberate "correct a wrong stamp" path.
  const bad = invalidFields(incoming);
  if (bad.length > 0) {
    return { record: current, written: false, invalidFields: bad, complete: false, missing: [] };
  }

  const record = { ...current, ...incoming };
  if (record.medium === undefined) record.medium = DEFAULT_MEDIUM;
  if (record.date === undefined) {
    if (today === undefined) throw new Error("mergeRecord needs `today` to stamp a new record");
    record.date = today;
  }

  const missing = missingFields(record);
  return {
    record,
    written: true,
    invalidFields: [],
    complete: missing.length === 0,
    missing,
  };
}

/** `de` → `DE`, `pt-br` → `PT-BR`. The only segment that varies across a set. */
export function marketToken(language) {
  return String(language).trim().toUpperCase();
}

/** Reduce composition dimensions to the `R-` segment, e.g. 1080x1920 → `9x16`. */
export function ratioFromDimensions(width, height) {
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  if (divisor === 0) throw new Error("invalid dimensions");
  return `${width / divisor}x${height / divisor}`;
}

/** Build one filename. Throws when the record is incomplete or a field is bad. */
export function buildFilename({ record, ratio, market }) {
  const bad = invalidFields(record);
  if (bad.length > 0) throw new Error(`invalid field(s): ${bad.join(", ")}`);

  const missing = missingFields(record);
  if (missing.length > 0) throw new Error(`incomplete record, missing: ${missing.join(", ")}`);
  if (record.date === undefined) throw new Error("record has no date stamp");
  if (!RATIO_RE.test(String(ratio))) throw new Error(`invalid ratio: "${ratio}"`);

  const constants = mediumConstants(record.medium ?? DEFAULT_MEDIUM);
  const segments = [
    constants.author,
    constants.format,
    `R-${ratio}`,
    `AL-${record.funnelStage}`,
    `TB-${record.source}`,
    "TH-na",
    `FB-${record.style}`,
    record.date,
  ].join("_");

  return `${marketToken(market)} - ${record.creativeName} - ${segments}.${constants.extensions[0]}`;
}

/**
 * Expand the record into one filename per market. Only the leading market token
 * differs across a localization set — everything after it is identical, which is
 * why the record is authored once rather than per file.
 */
export function expand({ record, ratio, markets }) {
  return markets.map((market) => buildFilename({ record, ratio, market }));
}

/** Which medium a filename's author/format pair belongs to, or null. */
function mediumOfSegments(author, format) {
  for (const [medium, constants] of Object.entries(GRAMMAR.mediums)) {
    if (constants.format !== format) continue;
    if (constants.author === author) return medium;
    // Pre-2026.07 archives carry a legacy author constant where AUTO now stands.
    if ((GRAMMAR.legacy_authors ?? []).includes(author)) return medium;
  }
  return null;
}

/** Reverse a filename back into its fields. Returns null when off-pattern. */
export function parseFilename(filename) {
  const m = /^(.+?) - (.+?) - (.+)\.([a-z0-9]+)$/.exec(filename);
  if (m === null) return null;
  const [, market, creativeName, tail, ext] = m;
  const seg = tail.split("_");
  if (seg.length !== 8) return null;
  const [author, format, ratio, funnel, source, thna, style, date] = seg;
  const medium = mediumOfSegments(author, format);
  if (medium === null || thna !== "TH-na") return null;
  if (!mediumConstants(medium).extensions.includes(ext)) return null;
  if (!ratio.startsWith("R-") || !funnel.startsWith("AL-")) return null;
  if (!source.startsWith("TB-") || !style.startsWith("FB-")) return null;
  if (!DATE_RE.test(date)) return null;

  return {
    medium,
    market,
    creativeName,
    ratio: ratio.slice(2),
    funnelStage: funnel.slice(3),
    source: source.slice(3),
    style: style.slice(3),
    date,
    extension: ext,
  };
}

/**
 * A localized copy's filename: only the leading market token changes. The
 * remaining basename — version number, metadata block, date, extension — is
 * inherited byte-for-byte from the source (naming.json § market.localization_rule).
 */
export function inheritFilename(sourceFilename, market) {
  if (parseFilename(sourceFilename) === null) throw new Error(`off-pattern source filename: ${sourceFilename}`);
  const rest = sourceFilename.slice(sourceFilename.indexOf(" - "));
  return `${marketToken(market)}${rest}`;
}

/** Report a style that is shape-valid but not in the medium's known vocabulary. */
export function unknownStyle(style, medium = DEFAULT_MEDIUM) {
  return typeof style === "string" && STYLE_RE.test(style) && !stylesFor(medium).includes(style);
}

// ── Ad-set folders and the global sequence ──────────────────────────────────

export const SEQUENCE_DIGITS = FOLDERING.sequence.digits;

/** `13` → `#0013`. */
export function sequenceToken(number) {
  return `#${String(number).padStart(SEQUENCE_DIGITS, "0")}`;
}

/**
 * The highest sequence number among a set of names (folders or files, any
 * depth). Pure over the list so the scan is testable; `reserve` feeds it the
 * live tree. Zero when nothing carries a number yet.
 */
export function highestSequence(names) {
  const re = new RegExp(`#(\\d{${SEQUENCE_DIGITS}})(?!\\d)`, "g");
  let max = 0;
  for (const name of names) {
    for (const hit of String(name).matchAll(re)) max = Math.max(max, Number(hit[1]));
  }
  return max;
}

/** One contiguous block of `count` numbers after `max`. */
export function nextBlock(max, count) {
  if (!Number.isInteger(count) || count < 1) throw new Error(`count must be a positive integer, got ${count}`);
  return Array.from({ length: count }, (_, i) => max + 1 + i);
}

/** Every name under `root`, recursively — folders and files alike. */
export function walkNames(root) {
  const names = [];
  const visit = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      names.push(entry.name);
      if (entry.isDirectory()) visit(join(dir, entry.name));
    }
  };
  if (!statSync(root, { throwIfNoEntry: false })?.isDirectory()) throw new Error(`not a directory: ${root}`);
  visit(root);
  return names;
}

/** The allowed values of a `|`-separated token description, e.g. "Mix ICP | Mixed ICP". */
function allowedValues(description) {
  return String(description)
    .split("|")
    .map((value) => value.trim().replace(/\.$/, ""))
    .filter((value) => value !== "");
}

/**
 * Compose an ad-set folder name from the workspace pattern. Fixed tokens stay
 * as the pattern spells them; the sequence, language, batch, count, ICP and
 * format are filled in. Unknown ICP or format values are refused — the
 * vocabulary is the pattern's, not the caller's.
 */
export function folderName({ seq, language, batch, ads, icp, format }) {
  const tokens = FOLDERING.tokens;
  const problems = [];
  if (!Number.isInteger(seq) || seq < 1) problems.push("seq");
  if (typeof language !== "string" || language.trim() === "") problems.push("language");
  if (typeof batch !== "string" || batch.trim() === "") problems.push("batch");
  if (!Number.isInteger(ads) || ads < 1) problems.push("ads");
  if (!allowedValues(tokens.ICP).includes(icp)) problems.push("icp");
  if (!allowedValues(tokens.FORMAT).includes(format)) problems.push("format");
  if (problems.length > 0) throw new Error(`invalid field(s): ${problems.join(", ")}`);

  return FOLDERING.ad_set_pattern
    .replace("#NNNN", sequenceToken(seq))
    .replace("LL", marketToken(language))
    .replace("BATCH", batch.trim())
    .replace("N Ads", `${ads} Ads`)
    .replace("ICP", icp)
    .replace("FORMAT", format);
}

// ── Persistence ─────────────────────────────────────────────────────────────

export function readRecord(projectDir) {
  const path = join(projectDir, RECORD_FILE);
  if (!statSync(path, { throwIfNoEntry: false })?.isFile()) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}

export function writeRecord(projectDir, record) {
  writeFileSync(join(projectDir, RECORD_FILE), `${JSON.stringify(record, null, 2)}\n`);
}

/** A project still carrying the record under its old name. */
export function hasLegacyRecord(projectDir) {
  return statSync(join(projectDir, LEGACY_RECORD_FILE), { throwIfNoEntry: false })?.isFile() === true;
}

/** YYYY.MM.DD in UTC — the stamp format the delivery automation expects. */
export function todayStamp(now) {
  const iso = now.toISOString().slice(0, 10);
  return iso.replace(/-/g, ".");
}

// ── CLI ─────────────────────────────────────────────────────────────────────

function parseArgv(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      out._.push(arg);
      continue;
    }
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

function patchFromArgs(args) {
  const patch = {};
  if (typeof args["creative-name"] === "string") patch.creativeName = args["creative-name"];
  if (typeof args.funnel === "string") patch.funnelStage = args.funnel;
  if (typeof args.source === "string") patch.source = args.source;
  if (typeof args.style === "string") patch.style = args.style;
  if (typeof args.date === "string") patch.date = args.date;
  if (typeof args.medium === "string") patch.medium = args.medium;
  return patch;
}

function reportStatus(record) {
  const missing = missingFields(record);
  console.log(JSON.stringify({ record, complete: missing.length === 0, missing }, null, 2));
  const medium = record.medium ?? DEFAULT_MEDIUM;
  if (unknownStyle(record.style, medium)) {
    console.error(
      `note: style "${record.style}" is not in the ${medium} vocabulary (${stylesFor(medium).join(", ")}). ` +
        "Use an existing value if this is a rephrasing of one; otherwise the medium's catch-all value.",
    );
  }
}

function warnLegacy(projectDir) {
  if (hasLegacyRecord(projectDir)) {
    console.error(
      `note: ${projectDir} carries a ${LEGACY_RECORD_FILE} — the record is now ${RECORD_FILE}. ` +
        "Rename it if it is this project's naming record; it is not read under the old name.",
    );
  }
}

function printNames(names) {
  for (const name of names) console.log(name);
}

function main(argv) {
  const args = parseArgv(argv);
  const command = args._[0];
  const projectDir = typeof args.project === "string" ? args.project : ".";

  // On every command, not only `where`: the agent that runs `name` never runs
  // `where` first, and the one thing it must not do is present a locally
  // conventioned filename as the shipped one.
  const files = conventionSources();
  const note = localConventionsNote(Object.values(files));
  if (note !== null) console.error(note);

  if (command === "where") {
    console.log(
      JSON.stringify(
        {
          naming: GRAMMAR_SOURCE,
          foldering: FOLDERING_SOURCE,
          files,
          shipped: note === null,
          conventions: conventionsDir(),
          roots: localSources(),
        },
        null,
        2,
      ),
    );
    return 0;
  }

  if (command === "get") {
    warnLegacy(projectDir);
    const record = readRecord(projectDir);
    if (record === null) {
      console.log(
        JSON.stringify({ record: null, complete: false, missing: AUTHORED_FIELDS }, null, 2),
      );
      return 0;
    }
    reportStatus(record);
    return 0;
  }

  if (command === "set") {
    warnLegacy(projectDir);
    const current = readRecord(projectDir) ?? {};
    const result = mergeRecord(current, patchFromArgs(args), todayStamp(new Date()));
    if (!result.written) {
      console.error(`invalid field(s): ${result.invalidFields.join(", ")} — nothing written`);
      return 1;
    }
    writeRecord(projectDir, result.record);
    reportStatus(result.record);
    return 0;
  }

  if (command === "expand") {
    const record = readRecord(projectDir);
    if (record === null) {
      console.error(`no ${RECORD_FILE} in ${projectDir} — run \`set\` first`);
      return 1;
    }
    const markets = typeof args.markets === "string" ? args.markets.split(",") : ["en"];
    try {
      printNames(expand({ record, ratio: args.ratio, markets }));
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      return 1;
    }
    return 0;
  }

  if (command === "name") {
    const patch = patchFromArgs(args);
    if (patch.medium === undefined) {
      console.error(`name needs --medium <${MEDIUMS.join("|")}>`);
      return 1;
    }
    const result = mergeRecord({}, patch, todayStamp(new Date()));
    if (!result.written) {
      console.error(`invalid field(s): ${result.invalidFields.join(", ")}`);
      return 1;
    }
    if (!result.complete) {
      console.error(`missing field(s): ${result.missing.join(", ")}`);
      return 1;
    }
    const markets = typeof args.markets === "string" ? args.markets.split(",") : ["en"];
    try {
      printNames(expand({ record: result.record, ratio: args.ratio, markets }));
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      return 1;
    }
    if (unknownStyle(result.record.style, result.record.medium)) {
      console.error(`note: style "${result.record.style}" is not in the ${result.record.medium} vocabulary`);
    }
    return 0;
  }

  if (command === "inherit") {
    if (typeof args.filename !== "string" || typeof args.market !== "string") {
      console.error("inherit needs --filename <source filename> --market <code>");
      return 1;
    }
    try {
      console.log(inheritFilename(args.filename, args.market));
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      return 1;
    }
    return 0;
  }

  if (command === "parse") {
    const parsed = parseFilename(args._[1] ?? "");
    if (parsed === null) {
      console.error("off-pattern filename");
      return 1;
    }
    console.log(JSON.stringify(parsed, null, 2));
    return 0;
  }

  if (command === "reserve") {
    if (typeof args.root !== "string") {
      console.error("reserve needs --root <campaign parent> [--count N]");
      return 1;
    }
    const count = args.count === undefined ? 1 : Number(args.count);
    try {
      // Scanned at call time, never from memory: the number that counts is the
      // one on disk the moment before mkdir.
      const max = highestSequence(walkNames(args.root));
      const next = nextBlock(max, count);
      console.log(
        JSON.stringify(
          { root: args.root, digits: SEQUENCE_DIGITS, max, next, tokens: next.map(sequenceToken) },
          null,
          2,
        ),
      );
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      return 1;
    }
    return 0;
  }

  if (command === "folder") {
    try {
      console.log(
        folderName({
          seq: Number(args.seq),
          language: args.language,
          batch: args.batch,
          ads: Number(args.ads),
          icp: args.icp,
          format: args.format,
        }),
      );
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      return 1;
    }
    return 0;
  }

  console.error(
    "usage: naming.mjs <get|set|expand|name|inherit|parse|reserve|folder|where> [--project .] [flags]",
  );
  return 1;
}

const invokedDirectly =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
