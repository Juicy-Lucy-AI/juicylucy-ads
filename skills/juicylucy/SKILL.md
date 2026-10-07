---
name: juicylucy
description: "The conventions this plugin names and files ads by — the export filename token grammar, the ad-set folder grammar and global #0000 sequence, language codes and scripts, allocation policy, and the evidence/QA layout. Load whenever languages are being selected or allocated for a batch, whenever an ad file or ad-set folder is being verified against the conventions, or whenever a skill refers to the workspace conventions. Filenames and sequence numbers are produced by the ad-naming skill's tool, which reads these files: this skill is the data, not the tool. These are defaults; a file of the same name in the local conventions folder (~/.juicylucy/conventions) replaces each. Brand facts live in the brand-* skills, not here."
---

# Workspace conventions

Everything true of how ads are filed, named, allocated, and evidenced — for
any brand — stated exactly once, as data. Engine skills and tooling read these
files rather than restating them. If you are following a skill that points
here and you cannot read these files, **stop and ask** rather than working
from memory: a convention recalled is a convention forked.

These are the **defaults the plugin ships**. They are a complete, working set:
an export named under them traces back to its creative, market and version,
and an ad-set folder carries a number nothing else in the campaign uses. A
team or a user with a grammar of their own keeps it in a conventions folder on
the Mac, which replaces these file by file — see § Which copy to read.

## Which copy to read

**Before reading any of the files below, check whether this Mac has its own.**
A file of the same name in **`~/.juicylucy/conventions/`** replaces the one
here — that folder is how a team keeps the grammar its uploader expects, or
how a user adopts their own. Each file stands alone: a folder holding only
`languages.json` changes the language codes and nothing else. The `ad-naming`
tool's `where` command lists which copy of every file is in effect:

```bash
~/.juicylucy/bin/adsnode <SKILLS_DIR>/ad-naming/scripts/naming.mjs where
```

(`<SKILLS_DIR>` is the directory that holds the installed skills — this
skill's parent.) Read each file from the path it gives under `files`. The tool
names files and folders from the same copies, and while any of them is local
it says so on every call — repeat that to the user once, so nobody mistakes a
local grammar for the plugin's.

## What each file owns

| Read | For |
| --- | --- |
| [`naming.json`](naming.json) | **The** export filename grammar: the token pattern, per-medium constants (author, format, style vocabularies), funnel stages, the localization inheritance rule. |
| [`foldering.json`](foldering.json) | **The** ad-set folder grammar: the hierarchy, the token pattern, and the global `#0000` sequence discipline shared across mediums. |
| [`allocation.json`](allocation.json) | How languages and ad sets are allocated across active campaigns, and how candidates are ranked and excluded. |
| [`languages.json`](languages.json) | The language table: names, codes, scripts, direction, per-language rendering notes. |
| [`evidence.json`](evidence.json) | What counts as a final ad, the asset acceptance gate, the `.qa/` package, `PROJECT_STATE.md` conventions, contact-sheet spec. |

Producing a filename, a folder name or a sequence number from this data is the
`ad-naming` skill's job (`naming.mjs`), for both mediums; nothing here is typed
into a name by hand.

The [`references/`](references/) files carry the prose behind the data — the
procedures, worked examples, and checklists. The JSON is authoritative for
values; the references are authoritative for method.

## The discipline the data assumes

Four rules repeat through every convention here, and every consumer is held to
them:

1. **Reserve before you write.** Names and numbers are resolved collision-free
   against the live filesystem before any output is moved into place — never
   after, and never from memory or a tracker.
2. **Re-scan immediately before creating.** A reservation made earlier in a
   session may have been claimed; the scan that counts is the one just before
   `mkdir` or the final move.
3. **Rename what the change invalidates.** A folder's `N Ads` token states its
   actual count; redistribution that changes the count renames the folder.
4. **The filesystem is authoritative.** Chat updates, trackers, and manifests
   may lag; direct listings, counts, and hashes settle every disagreement.

## Making them your own

To adopt your own grammar: copy the file to change from this directory into
`~/.juicylucy/conventions/`, change the values, and keep the filename and every
key — the tool reads the keys. Nothing needs restarting; the next call reads
it. If an upload automation of yours parses filenames or ad-set names, its
grammar is the one to put in `naming.json` and `foldering.json`. The setup
skill's `references/extending.md` § Changing the conventions is the flow.

A copy of this skill in `~/.claude/skills/` changes nothing: in Claude Code it
loads beside the shipped one rather than in its place, and the tool does not
read it. The conventions folder is the one route.

## What does not belong here

Anything true of one brand only — product scope, compliance rules, brand
assets, competitor sets, account names — lives in that brand's `brand-*`
skill. Anything true of one production batch only — dates, chosen languages,
ledgers — lives with the run, laid out per `evidence.json`.
