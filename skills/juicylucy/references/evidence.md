# Evidence — method

Values live in [`../evidence.json`](../evidence.json).

## What counts

A final ad is a final creative **directly inside a numbered ad-set folder**.
Nothing else counts: not `.qa/` contents, contact sheets, rejected drafts,
generation caches, or source originals. Localized totals and source-inclusive
totals are reported separately, always.

## The `.qa/` package

Each language root carries `PROGRESS.md` and a `.qa/` directory holding the
retry ledger, translation provenance (the exact locked copy per language,
recorded **before** generation), production timing, OCR status plus raw
output, one QA file and one reviewed contact sheet per batch, and the final
QA report pair. Scoped variants (`.qa-<purpose>/`) are legitimate when a
project's equivalent evidence already exists under established names.

Attempt accounting is two ledgers, not one: content attempts (an image was
produced and judged) are counted against the campaign's attempt limit;
no-output failures (429/503/transport) are recorded separately and consume
nothing.

## `PROJECT_STATE.md`

The coordinator-owned checkpoint at the campaign root: absolute paths,
source-to-target mapping, numbering, the current checkpoint, attempts
consumed, limits, QA state, and **the exact next asset**. Updated after every
batch, retry, lane change, limit event, incident, and final-QA milestone. A
resumed session reconciles the filesystem first and never restarts from chat
memory.

## Retention

Anything dated — rejection logs, ledgers, performance tables, post-mortems —
is evidence, not instruction. Date-stamp it, file it with the run (or the
brand's `history/` when it is brand evidence), and read it later as a record
of what was true then. A dated caveat never overrides a current convention or
a brand's product truth.
