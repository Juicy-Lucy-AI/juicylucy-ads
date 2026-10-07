---
name: ad-naming
description: Names every ad file and ad-set folder for both mediums, video and statics — authors and expands the export naming record into one delivery filename per market and ratio, derives a localized filename from its source, reserves the next global ad-set sequence numbers against the live filesystem, and composes ad-set folder names from the workspace grammar. Load whenever a render or an image is about to be saved or exported, whenever an ad-set folder is about to be created, or whenever a reference creative's filename needs decoding. The grammar itself is the workspace conventions skill's data; this skill is the one tool that applies it, and nobody hand-writes a filename or a sequence number beside it.
---

# Ad naming

One tool produces every delivery filename and every ad-set folder name, for a
video ad and a static ad alike. Exported files enter a flat delivery folder
where an automation reads the filename, and after launch the filename is the
attribution key back to the creative. A wrong filename is a lost measurement,
not a cosmetic defect. Ad-set folders carry a global sequence number that must
never collide across dates, languages or mediums.

**The grammar has one home and it is not here.** The token pattern, the
per-medium constants, the funnel stages, the localization inheritance rule and
the folder pattern with its sequence discipline are the workspace conventions
skill's `naming.json` and `foldering.json`. The script reads them at run time
and fails loud if it cannot; a filename authored from remembered constants is
exactly the fork this skill exists to end. If the script cannot find the
workspace skill, install it or stop and ask.

**A conventions folder on the Mac comes first.** Each file of the five placed
in `~/.juicylucy/conventions/` replaces the shipped one — that is how a team
keeps the grammar its uploader reads, and how a user adopts their own (the
setup skill's `references/extending.md` § Changing the conventions). The
script resolves each file on its own: a folder holding only `foldering.json`
changes the folder names and nothing else. While any file is local it prints a
note on every call; repeat it to the user once, because their filenames follow
a local grammar rather than the plugin's defaults. `where` lists which copy of
every file is in effect — the languages, allocation and evidence files
included, which the agent reads from the same place.

After the folder it reads the plugin's own `juicylucy` skill. In Claude Code a
skill of the same name in `~/.claude/skills` loads beside the plugin's rather
than in its place, so a copy someone made there is not what the tool names
from.

## The rule

**Never hand-write a filename or a sequence number.** Not to save a call, not
because the pattern looks obvious, not to fill a date. The ratio, the market
token, the date and the sequence number are the system's; you author creative
name, funnel stage, source and style, and the tool does the rest.

## The tool

`<SKILLS_DIR>` below is the directory that holds the installed skills — the
parent of this skill's own directory.

```bash
~/.juicylucy/bin/adsnode <SKILLS_DIR>/ad-naming/scripts/naming.mjs <command> [flags]
```

| Command   | Medium | What it does                                                                                                                   |
| --------- | ------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `get`     | video  | Read the project's record (`export-naming.json`) and report which authored fields are still missing.                            |
| `set`     | video  | Merge authored fields into the record, validating first; the date is stamped on the first write and never moved.               |
| `expand`  | video  | One delivery filename per market for a ratio: `--ratio 9x16 --markets en,de,pt-br`.                                            |
| `name`    | static | Name an image directly from its fields: `--medium static --creative-name … --funnel … --source … --style … --ratio … --markets …`. |
| `inherit` | both   | The localized copy's filename from its source: only the leading market token changes (`--filename "<source>" --market de`).     |
| `parse`   | both   | Decode a filename that already follows the grammar — a reference creative's, usually — into its fields.                        |
| `reserve` | both   | The next global sequence numbers: scans `--root <campaign parent>` recursively at call time and returns a block of `--count N`. |
| `folder`  | both   | Compose an ad-set folder name: `--seq 13 --language de --batch GEN --ads 8 --icp "Mixed ICP" --format "Static Format"`.        |
| `where`   | both   | Which copy of every conventions file is in effect — the conventions folder's or the shipped one — and the places looked in; the check when a filename looks unfamiliar. |

Every command validates against the grammar and refuses an invalid value with
the field named. A style outside the medium's vocabulary is accepted but
reported, so a rephrasing does not quietly become a second name for the same
treatment.

## Who calls it, and when

**A video run** (`video-ad-production`, Step 6) authors one record per ad and
expands it once per ratio:

```bash
~/.juicylucy/bin/adsnode <SKILLS_DIR>/ad-naming/scripts/naming.mjs get --project .
~/.juicylucy/bin/adsnode <SKILLS_DIR>/ad-naming/scripts/naming.mjs set --project . \
  --creative-name "<name>" --funnel <TOF|MOF|BOF> --source <source> --style <fb-style>
~/.juicylucy/bin/adsnode <SKILLS_DIR>/ad-naming/scripts/naming.mjs expand --project . --ratio <ratio> --markets <codes>
```

Resolve funnel, source and style from the reference creative's filename first
(`parse`), then the brief, then ask — the video engine's `references/naming.md`
carries that order and the video treatment vocabulary. The record lives in the
project as `export-naming.json`; a project still carrying the older
`naming.json` is told so by `get` and `set`, and that file is not read.

**A statics run** (`static-ad-production`, `static-localization`) reserves its
folder numbers before creating folders and names each image before saving it:

```bash
~/.juicylucy/bin/adsnode <SKILLS_DIR>/ad-naming/scripts/naming.mjs reserve --root <campaign parent> --count <batches x languages>
~/.juicylucy/bin/adsnode <SKILLS_DIR>/ad-naming/scripts/naming.mjs folder --seq <n> --language <code> --batch <descriptor> \
  --ads <count> --icp "<Mix ICP|Mixed ICP|Unique ICP>" --format "<Static Format|Video Format|Mix Formats>"
~/.juicylucy/bin/adsnode <SKILLS_DIR>/ad-naming/scripts/naming.mjs name --medium static --creative-name "<name>" \
  --funnel <stage> --source <source> --style <style> --ratio <ratio> --markets <codes> [--date <YYYY.MM.DD>]
~/.juicylucy/bin/adsnode <SKILLS_DIR>/ad-naming/scripts/naming.mjs inherit --filename "<source filename>" --market <code>
```

`reserve` is run **immediately before `mkdir`**, not earlier in the session: a
number reserved earlier may have been claimed, and the scan that counts is the
one just before the folder is created. When a localization set inherits its
source's date, pass `--date`; otherwise the date is today's.

## What the tool will not decide

- **Which values to author.** Creative name, funnel stage, source and style
  come from the reference's filename, the brief, or the user, in that order.
  The tool validates them; it does not guess them.
- **Whether a batch already exists.** Inspect the destination and the newest
  neighbouring folders first (the workspace skill's `foldering.json` §
  `grammar_not_template`); `reserve` reports the highest number it finds and
  the next block, nothing about what those folders mean.
- **Anything about one client.** Brand facts stay in the resolved `brand-*`
  skill; batch facts stay with the run.

## Checklist before saving or exporting

- [ ] The workspace conventions resolved (the script did not fail loud), and if it noted local conventions, the user was told
- [ ] Video: `get` read first; `set` reported `complete: true`; `expand` produced every filename
- [ ] Statics: `reserve` run just before `mkdir`; every folder from `folder`; every file from `name` or `inherit`
- [ ] No ratio, market token, date or sequence number typed by hand
- [ ] Every delivered filename listed from the destination folder and checked against the tool's output
