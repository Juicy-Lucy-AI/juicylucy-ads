# Naming an ad for delivery

Exported files leave this repo and enter a human pipeline: a designer reviews them, drops the
survivors into a Google Drive folder, and an automation uploads them to Meta Ads. **That automation
reads the filename.** The Drive folder is a flat namespace, so the filename is the only thing
distinguishing one creative, market, or version from another.

Your job is to author one **export naming record** per ad. The record expands into one filename per
language. You never write filenames by hand.

**The grammar's authority is the `juicylucy` workspace skill's `naming.json`** — one grammar shared
with the statics engine, with per-medium constants (`mediums.video` here). The `ad-naming` skill's
tool (`naming.mjs`, shared with the statics engine) reads its constants from that file — or from
the Mac's conventions folder, `~/.juicylucy/conventions`, when it holds one, and then says so — and the
pattern below is a worked illustration of it, not a second definition. In the commands below,
`<SKILLS_DIR>` is the directory holding the installed skills, the parent of this one. If the workspace skill cannot be resolved, stop and ask rather than writing a
filename from memory.

## The pattern

```
[Market] - [Creative Name] - PRO_F-VID_R-[Ratio]_AL-[Funnel]_TB-[Source]_TH-na_FB-[Style]_[YYYY.MM.DD].mp4
```

A real example:

```
DE - Computers On Fire 2 - PRO_F-VID_R-9x16_AL-MOF_TB-winner_TH-na_FB-videotextoverlay_2026.07.29.mp4
```

| Segment           | Who supplies it | Notes                                                                 |
| ----------------- | --------------- | --------------------------------------------------------------------- |
| `[Market]`        | **System**      | The language code uppercased (`de` to `DE`, `pt-br` to `PT-BR`).      |
| `[Creative Name]` | **You**         | The human name of the creative. Spaces are fine; underscores are not. |
| `PRO`             | fixed           | Video adaptation of the statics guideline's `AUTO`. Never changes.    |
| `F-VID`           | fixed           | Replaces the statics `F-IMG`. Never changes.                          |
| `R-[Ratio]`       | **System**      | Read from the composition dimensions, e.g. `9x16`.                    |
| `AL-[Funnel]`     | **You**         | Funnel stage: `TOF`, `MOF`, `BOF`.                                    |
| `TB-[Source]`     | **You**         | Where the creative came from, e.g. `winner`.                          |
| `TH-na`           | fixed           | Always literally `TH-na`. Never changes.                              |
| `FB-[Style]`      | **You**         | The video treatment. See the vocabulary below.                        |
| `[YYYY.MM.DD]`    | **System**      | Stamped on the first write and preserved afterwards.                  |

**Only the leading market token differs across a localization set.** Everything after it is
identical for every language of the same ad — that is why the record is authored once rather than
per file, and why you must not try to vary it.

You author exactly four fields: **creative name, funnel stage, source, style.** The ratio, the
market token and the date are the system's. Do not attempt to supply a ratio or a date.

## The `FB-` treatment vocabulary — video only

These are **not** the statics values. The opening set:

- `FB-videotextoverlay` — a background video that is unrelated to the text overlay running on top
  of it. This is the `background-video-text-overlay` blueprint.
- `FB-videoreaction` — a person performing a reaction to camera (clapping, nodding, expressions)
  under a short text block. This is the `clapping-reaction` blueprint. Distinct from
  `FB-videotextoverlay` because the footage is _related_ to the overlay rather than independent of
  it, which is what makes the two worth reporting separately.
- `FB-beforeandafter` — a persona unsatisfied before the product, satisfied after.
- `FB-videoother` — anything not yet named.

The set is **open**: new values are added as treatments come into use, and they are always a
lowercase single word (no spaces, no capitals, no hyphens). If the ad's treatment genuinely matches
none of the named ones, use `FB-videoother`. Never invent a value that is really a rephrasing of an
existing one, and never reuse a statics value.

Each live blueprint declares its style token, and `scripts/blueprint-styles.mjs` holds the mapping
(`BLUEPRINT_STYLES`) so a blueprint and its filename treatment cannot drift apart.

## Resolving the campaign fields

Funnel stage, source and style are the only fields you have to work for. Resolve them in this order
and stop at the first that yields an answer:

**1. Parse the reference creative's filename.** The reference was usually supplied with its original
filename, and that filename often already follows this guideline. If it conforms, lift the values
straight out of it:

```bash
~/.juicylucy/bin/adsnode <SKILLS_DIR>/ad-naming/scripts/naming.mjs parse "<the reference's filename>"
```

A **statics** reference gives you `AL-` and `TB-` directly, but its `FB-` value is a statics value:
translate the treatment into the video vocabulary above rather than copying it.

**2. Read the brief.** `AD_BRIEF.md` routinely states the funnel stage ("retargeting warm
audiences" → `MOF`) and the source ("scaling last quarter's winner" → `winner`). Style you can
almost always determine yourself from the blueprint you built.

**3. Ask the user.** Only if neither source yields a value: ask, naming the specific field and
offering the likely options. Do not ask for a field you already resolved, and do not ask for all
four when only one is missing. In autonomous mode, do not stall and do not leave the field blank —
pick the most plausible value from the brief and what you built, and proceed.

Creative-name collisions are outside your reach: you cannot see the Drive folder. Derive the
creative name from the brief or the reference creative and make it descriptive enough to stand on
its own.

## Writing the record

Read before writing — the record is the project's `export-naming.json`, and an existing record with
some fields missing means resolution is still in progress, so fill the gaps rather than starting
over:

```bash
~/.juicylucy/bin/adsnode <SKILLS_DIR>/ad-naming/scripts/naming.mjs get --project .
```

Then write. It **merges**, so you can fill one field at a time as each resolves:

```bash
~/.juicylucy/bin/adsnode <SKILLS_DIR>/ad-naming/scripts/naming.mjs set --project . \
  --creative-name "Boxes Stop Motion" --funnel MOF --source winner --style videotextoverlay
```

- It **validates before writing** — an invalid value writes nothing and returns the offending field
  names. A style with a capital letter or a space is the usual culprit.
- It reports `complete` and `missing`. Keep going until `complete` is true.
- **Do not pass `--date`.** It is stamped once, on the first write, and preserved on every rewrite —
  that is what makes a re-export weeks later reproduce the original filename. Pass a date only if
  you are deliberately correcting a wrong stamp.

Expand to the delivery filenames once the record is complete:

```bash
~/.juicylucy/bin/adsnode <SKILLS_DIR>/ad-naming/scripts/naming.mjs expand --project . --ratio 9x16 --markets en,de,pt-br
```

A variation created by branching starts with **no record** — deliberately, since a variation is a
different creative with its own name and style. Author a fresh one; do not assume the parent's
carried over.

## When to do this

Write the record when the ad is finished and always before export — in practice, right after
localizing. If you localize an ad and no record exists, author one without being asked.

## Checklist

- [ ] `get` read first; existing fields respected
- [ ] Reference creative's filename checked before anything was asked
- [ ] Brief consulted for any field the filename did not yield
- [ ] `FB-` value from the video vocabulary (or `videoother`), lowercase single word
- [ ] No ratio, market token or date authored by you
- [ ] `set` reported `complete: true`
