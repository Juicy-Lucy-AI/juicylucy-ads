# The reference manifest

**No ad enters production without a reference manifest.** Before a first frame is generated, before
copy is drafted, before a composition exists, there is a file on disk that answers one question for
every variant this batch will ship: _what did this iterate from, and can I play it?_

```bash
~/.juicylucy/bin/adsnode <SKILL_DIR>/scripts/reference-manifest.mjs verify --project . --min <concepts>
```

Exit 0 and production may start. Exit 1 and it may not.

This applies to the **variation path** — the common one. A genuinely new ad from a text brief has no
reference and no manifest to verify; say so in `AD_BRIEF.md` (`reference: none`) and move on.

## Why the gate is executable

The 2026.08.19 batch shipped 27 video ads built from three Meta Ads Library IDs. Its
`References/Sources/` directory holds three PNGs. The IDs are in the batch manifest's prose; the
reference videos are nowhere.

Nothing about that run looked wrong while it was happening. Every static reference was downloaded,
inspected, and filed — the discipline was real, it was just the _statics_ discipline, and it has no
step that produces a video file. So the video half inherited three citations and a folder of stills,
and the questions `reference-iteration.md` asks of a reference — what is the pacing, how does it
end, what is the soundtrack — had nothing left to ask them of.

An honest agent under batch pressure reconstructs those answers from memory of a video it watched in
a browser tab. That is the failure this gate exists to make impossible, and it is why the check runs
as a command rather than living in a checklist.

## What a record must carry

One record per reference, appended as JSONL. `ad-library.mjs download` writes this shape already, so
a reference pulled from the Ads Library needs nothing added by hand.

| Field                                    | Required  | Why                                                                   |
| ---------------------------------------- | --------- | --------------------------------------------------------------------- |
| `path`                                   | **yes**   | A local, playable file. Relative to the manifest, so a move survives. |
| `media_kind` / `media_type`              | **yes**   | `video` for a video ad. See § The medium is not negotiable.           |
| `ad_archive_id` / `source_id`            | **yes**   | The ad this iterates from. An anonymous mp4 has no provenance.        |
| `permalink` / `source_url`               | warn      | Reopens the original. Without it the id is a number in a file.        |
| `content_hash`                           | warn      | How collated duplicates are caught.                                   |
| `probe` (duration, canvas, audio)        | **yes\*** | Playability. \*Re-probed at verify time when ffprobe is on `PATH`.    |
| `page_name`, `title`, `body`, `cta_text` | no        | Free from the Ads Library payload, and Step 2's input.                |

Failures block. Warnings print and do not block — with one that is worth reading twice: **a
reference with no audio stream cannot supply a soundtrack**, and reusing the reference's soundtrack
is the default for a variation (`../SKILL.md` § Audio is not optional). A silent reference means the
brief needs an explicit audio decision before Step 4, not a discovery at render time.

## The medium is not negotiable

**A video ad is iterated from a video ad.** A still — a screenshot of the ad, a poster frame, a
thumbnail off the library grid, the competitor's static ad from the same page — cannot fill a video
reference slot, and the gate rejects one both ways: by the declared `media_kind`, and by the file
extension when a record claims `video` over a `.png`.

This is not pedantry about file types. Everything the variation path measures lives in time:

| The reference decides                                    | A still shows             |
| -------------------------------------------------------- | ------------------------- |
| **the emotional arc — what changes, and when**           | **one state of three**    |
| time to first beat, dwell per beat                       | nothing                   |
| cut rhythm and cut count                                 | nothing                   |
| how the ad ends — content cut vs. end-card (`outro.md`)  | one frame, unclassifiable |
| the soundtrack the variant inherits                      | nothing                   |
| whether the performer performs (`check-performance.mjs`) | nothing                   |

Fed a still, an agent does not fail loudly — it fills those five in from imagination and ships an ad
that matches nothing. The same applies in reverse: a static batch is not calibrated from video.

Statics and video also do not share a source pool. A page running both will hand you image ads under
a `media_type=image` filter; a video reference pull is `--video-only` and a
`media_type=video` library filter, and the two lists are different ads.

## Getting the records

**From the Ads Library** — the usual case, and it writes the manifest itself:

```bash
~/.juicylucy/bin/adsnode <SKILL_DIR>/scripts/ad-library.mjs fetch \
  --page-id <id> --video-only --limit 6 \
  --out AD_REFERENCES.json --out-dir .media/references
```

**From anywhere else** — our own winner pulled through the Meta API, a file a colleague sent, a
reference already frozen in a previous campaign:

```bash
~/.juicylucy/bin/adsnode <SKILL_DIR>/scripts/reference-manifest.mjs add --project . \
  --file .media/references/clap.mp4 \
  --source-id 798099273357065 \
  --permalink "https://www.facebook.com/ads/library/?id=798099273357065" \
  --page-name "<page name>" --source meta-ad-library
```

For one of our own ads, `--source-id` is the Meta ad id and `--source meta-api`. The point is the
same either way: a number that resolves back to the ad, not a description of it.

## `--min` counts ads, not files

Pass the number of **distinct concepts** this batch iterates from — three concepts, `--min 3`.

The gate counts distinct content hashes, not records, because the Ads Library lists one creative
once per ad _instance_. A pull of six files is routinely two ads repeated, and three copies of one ad
is a sample of one wearing a disguise. `download` already flags them; the gate refuses to let them
fill concept slots. Same rule as `reference-iteration.md` § Calibrating a blueprint, enforced here
because this is where it is cheap to enforce.

## What the manifest does not do

It proves a reference exists, plays, and is traceable. It says nothing about whether the reference is
any good.

**The Ads Library carries no performance data.** One page is one advertiser's active ads; longevity
is the only available signal and it is weak. Never call a reference a winner because it was in the
library — `ad-library.md` § Traps. A real winner comes from our own account's read-only insights,
and its record's `source` says `meta-api`.

**Reference media stays out of git.** Keep it in the campaign's own gitignored `.media/`; commit the
manifest and the measurements, not the files. There is no Git LFS here — a committed clip is a
committed clip, in every clone, forever.

## Command reference

```
verify  [--project .] [--manifest <path>] [--min N] [--medium video]
add     --file <path> --source-id <id> [--permalink <url>] [--page-name <name>]
        [--source <origin>] [--media-type video] [--note <text>]
list    [--project .] [--manifest <path>]
```
