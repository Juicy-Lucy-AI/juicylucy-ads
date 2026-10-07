#!/usr/bin/env node
// Structural gate for the ad blueprint layer.
//
// A blueprint is prose, so nothing here checks whether it is GOOD. What it does
// check is the part that silently rots: that every blueprint carries the
// sections a builder is told to rely on, that the index and the files agree on
// which blueprints exist, and that every live blueprint has a filename token in
// name-render.mjs. Drift in any of those makes the skill lie to the agent.
//
//   node lint-blueprints.mjs [--skill <dir>]

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { BLUEPRINT_STYLES } from "./blueprint-styles.mjs";

const SKILL_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");

// The FB- vocabulary comes from the shared `ad-naming` skill's tool, which
// reads the workspace grammar. Two layouts: installed (sibling skill) and the
// repo checkout. Anything else fails loud, like the tool itself does.
const NAMING_CANDIDATES = [
  new URL("../../ad-naming/scripts/naming.mjs", import.meta.url),
  new URL("../../../shared/ad-naming/scripts/naming.mjs", import.meta.url),
];
const namingUrl = NAMING_CANDIDATES.find((url) => existsSync(fileURLToPath(url)));
if (namingUrl === undefined) {
  throw new Error("the ad-naming skill is not installed beside this skill and this is not a repo checkout");
}
const { KNOWN_STYLES } = await import(namingUrl.href);

export const REQUIRED_FRONTMATTER = ["id", "name", "status", "duration", "aspects", "style"];

export const REQUIRED_SECTIONS = [
  "## When to reach for it",
  "## Anatomy",
  "## Shot structure",
  "## Copy slots",
  "## Soundtrack",
  "## Generation spec",
  "## Variant axes",
  "## Failure modes",
  "## QA gates",
];

export const VALID_STATUS = ["live", "planned", "retired"];

/** Flat `key: value` frontmatter reader — no nesting, no lists. */
export function readFrontmatter(markdown) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(markdown);
  if (m === null) return null;
  const fields = {};
  for (const line of m[1].split(/\r?\n/)) {
    const pair = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line);
    if (pair === null) continue;
    fields[pair[1]] = pair[2].trim().replace(/^["']|["']$/g, "");
  }
  return fields;
}

/** Blueprint ids declared by the index's `<blueprint id="...">` entries. */
export function indexedIds(indexMarkdown) {
  return [...indexMarkdown.matchAll(/<blueprint\s+id="([^"]+)"/g)].map((m) => m[1]);
}

/** Lint one blueprint file's content. Returns an array of problem strings. */
export function lintBlueprint(fileName, content) {
  const problems = [];
  const label = `blueprints/${fileName}`;
  const front = readFrontmatter(content);

  if (front === null) {
    return [`${label}: missing YAML frontmatter`];
  }

  for (const key of REQUIRED_FRONTMATTER) {
    if (front[key] === undefined || front[key] === "") {
      problems.push(`${label}: missing frontmatter key "${key}"`);
    }
  }

  const expectedId = fileName.replace(/\.md$/, "");
  if (front.id !== undefined && front.id !== expectedId) {
    problems.push(`${label}: frontmatter id "${front.id}" does not match filename "${expectedId}"`);
  }

  if (front.status !== undefined && !VALID_STATUS.includes(front.status)) {
    problems.push(`${label}: status "${front.status}" is not one of ${VALID_STATUS.join(", ")}`);
  }

  // The blueprint's FB- treatment must be a real filename token, or the ad
  // gets exported under a style the Drive automation doesn't know.
  if (front.style !== undefined && !KNOWN_STYLES.includes(front.style)) {
    problems.push(
      `${label}: style "${front.style}" is not in the FB- vocabulary (${KNOWN_STYLES.join(", ")})`,
    );
  }
  if (front.id !== undefined && front.style !== undefined && front.status === "live") {
    const expected = BLUEPRINT_STYLES[front.id];
    if (expected !== undefined && expected !== front.style) {
      problems.push(
        `${label}: style "${front.style}" disagrees with BLUEPRINT_STYLES ("${expected}")`,
      );
    }
  }

  for (const heading of REQUIRED_SECTIONS) {
    if (!content.includes(`\n${heading}\n`)) {
      problems.push(`${label}: missing required section "${heading}"`);
    }
  }

  return problems;
}

/** Cross-file checks: index parity and filename-token coverage. */
export function lintSet(fileIds, indexIds, statuses, tokens = BLUEPRINT_STYLES) {
  const problems = [];

  for (const id of fileIds) {
    if (!indexIds.includes(id)) {
      problems.push(`blueprints-index.md: no <blueprint> entry for "${id}"`);
    }
  }
  for (const id of indexIds) {
    if (!fileIds.includes(id)) {
      problems.push(`blueprints-index.md: entry "${id}" has no blueprints/${id}.md`);
    }
  }
  for (const id of indexIds) {
    if (indexIds.filter((other) => other === id).length > 1) {
      problems.push(`blueprints-index.md: duplicate entry for "${id}"`);
    }
  }
  for (const [id, status] of Object.entries(statuses)) {
    if (status === "live" && !Object.hasOwn(tokens, id)) {
      problems.push(
        `scripts/blueprint-styles.mjs: live blueprint "${id}" has no BLUEPRINT_STYLES entry`,
      );
    }
  }

  return [...new Set(problems)];
}

function run(skillDir) {
  const blueprintsDir = join(skillDir, "blueprints");
  if (!statSync(blueprintsDir, { throwIfNoEntry: false })?.isDirectory()) {
    console.error(`no blueprints directory at ${relative(process.cwd(), blueprintsDir)}`);
    return 1;
  }

  const files = readdirSync(blueprintsDir)
    .filter((name) => name.endsWith(".md"))
    .sort();

  const problems = [];
  const statuses = {};

  for (const file of files) {
    const content = readFileSync(join(blueprintsDir, file), "utf8");
    problems.push(...lintBlueprint(file, content));
    const front = readFrontmatter(content);
    if (front?.id !== undefined) statuses[front.id] = front.status;
  }

  const index = readFileSync(join(skillDir, "blueprints-index.md"), "utf8");
  problems.push(
    ...lintSet(
      files.map((f) => f.replace(/\.md$/, "")),
      indexedIds(index),
      statuses,
    ),
  );

  if (problems.length > 0) {
    console.error(`video-ad-production blueprint lint: ${problems.length} problem(s)\n`);
    for (const problem of problems) console.error(`  ${problem}`);
    return 1;
  }

  console.log(`video-ad-production blueprint lint: ${files.length} blueprint(s) OK`);
  return 0;
}

const invokedDirectly =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  const flagIndex = process.argv.indexOf("--skill");
  const skillDir = flagIndex === -1 ? SKILL_DIR : process.argv[flagIndex + 1];
  process.exitCode = run(skillDir);
}
