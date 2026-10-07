---
name: static-localization
description: Recreate static image ads from original source creatives into one or many target languages — the multilingual batch workflow. Covers the campaign contract, one-language-per-lane parallelism with adaptive concurrency, fresh-source (Approach B) recreation with strict attempt accounting, resume-after-interruption from filesystem checkpoints, three-level QA (asset, batch, language/project), contact-sheet and OCR review, and final reconciliation including uploader counts. Use for any multilingual static-ad batch, especially replicating an existing campaign folder structure and source set across languages. Single-image fidelity technique (Track A/B) lives in static-image-craft; the production pipeline that feeds this is static-ad-production.
---

# Static Localization

Produce complete, auditable language campaigns while protecting copy accuracy, source
fidelity, throughput, and conversion intent.

## Resolve the layers first

This skill carries no brand facts and restates no workspace values.

- **Brand** — resolve the `brand-<slug>` skill before locking any copy: exactly one
  `brand-*` skill installed → that is the brand; several → ask which; none → say
  plainly that no brand is installed and create one first (the `juicylucy-setup`
  skill's `extending.md` § Creating the first brand). The brand's
  `product-truth.md` owns every capability claim, and its `copy-patterns.md` lists the
  Latin tokens that stay untranslated in every language.
- **Workspace** — the `juicylucy` skill owns the conventions this workflow applies:
  the asset gate and `.qa/` evidence layout (`evidence.json`), filename inheritance
  (`naming.json`), folder grammar and the global sequence (`foldering.json`), and
  language codes, scripts, and RTL flags (`languages.json`).

If either skill cannot be read, **stop and ask** rather than working from memory.

## Medium scope

This skill recreates **static image ads** across languages. Its asset gate, contact
sheets, OCR sweep, and fresh-source regeneration are image mechanics with no video
equivalent. The campaign contract, source-to-ad-set mapping, lane parallelism,
filesystem-authoritative checkpoints, and reconciliation rules do generalize — but a
video batch runs through `/video-ad-production`, where the footage is the same file in every
language, only overlay copy is localized, and the soundtrack stays in its source
language.

## Establish the campaign contract

1. Inventory the original source folders and sorted image basenames.
2. Inspect sibling campaigns and the parent directory before assigning numbers —
   reserve with the `ad-naming` tool (`naming.mjs reserve`, then `naming.mjs folder`),
   per `foldering.json`'s global-sequence rules; never guess from the prompt.
3. Map each source batch to one target folder, preserving description, ad count, date
   suffix, and basename; replace only the leading language token — the `ad-naming`
   tool's `naming.mjs inherit --filename "<source>" --market <code>` does exactly that
   (`naming.json` § localization inheritance).
4. Choose each target's language variant from `languages.json` — its codes and notes
   (default scripts, variant defaults) are authoritative.
5. Define the customer problem and desired action. Localize for the source promise and
   the target market; do not translate mechanically when natural acquisition copy is
   stronger and semantically faithful.
6. Write `PROJECT_STATE.md` from [templates/PROJECT_STATE.md](templates/PROJECT_STATE.md)
   before long production: absolute paths, mapping, numbering, checkpoint, attempts,
   limits, QA state, and the exact next asset.
7. Lock the ad-set distribution as well as the language total: map every source
   basename to its ad-set position and reproduce that mapping in every target language.
8. Decide whether the run is strict visual preservation or cultural creative
   adaptation. For cultural adaptation, preserve the winning role of the scene while
   replacing country-specific architecture, transit, people, styling, and hero
   landmarks — see `static-image-craft` for the fidelity contract either way.

## Allocate one language per lane

For multiple languages run in parallel:

- Give each agent exactly one non-overlapping language directory and its complete
  numbering range; keep one language on the root lane; reuse freed slots for the next
  untouched language.
- Give every lane the same recreation, attempt, QA, timing, and progress rules.
- Never let two agents write the same language, folder, tracker, or final report.
- The root coordinator reconciles progress from live filesystem counts; agent messages
  and trackers can lag. An optional read-only auditor lane may rerun verification
  after production but never edits language-owned records.
- **Adaptive concurrency**: start with two image-generation lanes when the account
  ceiling is unknown; add only one lane at a time, only after a stable batch
  checkpoint; on concurrency errors, preserve the newest lane's checkpoint, pause it,
  and return to the last stable count — report the rollback live. Distinguish a lane
  limit from a global model limit and keep healthy lanes working.
- Do not parallelize assets within one language unless the filesystem and copy ledger
  are explicitly partitioned without collisions.

Kickoff prompts for both roles are in [templates/](templates/):
[coordinator-kickoff.md](templates/coordinator-kickoff.md) and
[language-worker-kickoff.md](templates/language-worker-kickoff.md). The role split,
state machines, and ownership rules they encode: the coordinator owns numbering,
manifests, `PROJECT_STATE.md`, reconciliation, user updates, and final cross-language
QA; a language worker owns exactly one language root and all its evidence; an auditor
owns nothing and verifies everything.

## Recreate every asset fresh from its source

For each source image, in sorted filename order:

1. View the original at full resolution.
2. Extract the scene, subject/object count, crop, palette, hierarchy, CTA, any
   checkbox or UI state, brand treatment, and exact message.
3. Lock concise, natural target-language copy before generating, preserving the
   brand's protected Latin tokens; record it in the translation-provenance ledger.
4. Generate one completely fresh image using only the corresponding original source as
   the image reference — the fresh-source contract in `static-image-craft` § Track B.
5. Require the original concept and hierarchy, the exact locked copy, mobile-safe
   margins, the campaign's geometry, and no source-language residue, extra words,
   watermark, or production instructions.
6. Inspect the result visually before filing: every glyph, line, brand name, CTA,
   crop, object count, face, and hand.
7. Validate against the asset gate in the `juicylucy` skill's `evidence.json`.
8. Copy the accepted image to the exact final filename (leave the generated original
   in place) and record the file, hash, attempt count, and any platform event.

A defective output is discarded and recreated fresh from the original source — never
repaired in place, never used as a reference. Attempt limits and their accounting are
in [references/qa-and-records.md](references/qa-and-records.md); under a strict
campaign contract the limit is two image-producing attempts, then a recorded terminal
failure.

Save each accepted result immediately: a long orchestration stream may close while the
filesystem checkpoint is healthy.

## Resume after interruption

1. Audit the live filesystem by language and destination basename.
2. Reconstruct the expected source-to-target mapping.
3. Queue only missing destinations; skip every existing accepted final.
4. Keep the same prompt contract, source reference, language, market, and filename.
5. Report recovered and missing totals before restarting generation.

Filesystem checkpoints are authoritative. Never restart a batch because a host stream,
cell, or progress display ended, and never resume from chat memory alone.

## Run QA at three levels

**Asset gate** — every accepted file passes the gate in `evidence.json` plus:
correct target-language prefix with unchanged basename and date suffix, exact copy and
brand spelling by full-resolution review, and no unintended source-language copy,
extra text, clipping, malformed glyphs, or material scene drift.

**Batch gate** — after each batch: compare complete source and target basename sets;
verify the expected count; verify unique SHA-256 hashes; regenerate the contact sheet
(`~/.juicylucy/bin/adspython <SKILL_DIR>/scripts/make_contact_sheets.py <language root> --output <language root>/.qa/contact-sheets`)
and review every tile; write the batch QA record before advancing.

**Language and project gates** — after a language completes, run the manifest-based
verifier; before handoff, independently reconcile every language, folder, image,
mapping, and hash across the project. Never declare completion from agent reports
alone. Manifest formats and verifier invocations:
[references/manifests.md](references/manifests.md), with fill-in templates at
[templates/LANGUAGE_MANIFEST.json](templates/LANGUAGE_MANIFEST.json) and
[templates/CAMPAIGN_MANIFEST.json](templates/CAMPAIGN_MANIFEST.json). Evidence package and accounting:
[references/qa-and-records.md](references/qa-and-records.md).

For exact-dimension campaigns, verify the literal width and height, not only the ratio
range — generators return canvases a pixel or two short; normalize only accepted
images at export per `static-image-craft` § canvas drift, then re-verify.

Mechanical QA covers every file. Visual QA is described accurately: either every final
image and contact sheet was inspected, or the review is explicitly called
representative sampling. Never imply a sample covered all assets.

When any lane, OCR, sync, tracker, uploader, transport, or capacity incident occurs,
act per [references/incident-response.md](references/incident-response.md).

## Maintain live recovery state

- Update the user at material checkpoints: saved ads, completed ad sets, remaining
  work, active QA, capacity state.
- Update `PROJECT_STATE.md` after each batch, retry, lane change, limit event, and QA
  milestone.
- Record exact token usage only when the runtime exposes it; otherwise write
  `Unavailable from runtime` — never estimate.
- Count idle per the accounting rules in
  [references/qa-and-records.md](references/qa-and-records.md).
- If the user requests uninterrupted local work, keep the machine awake with the
  platform-appropriate mechanism until told to stop, and never restart a production
  app mid-run when the user has deferred restart.

## Reconcile production and uploader counts

What counts as a final ad, and the two-totals rule, are `evidence.json` §
`counting_rule`. Before announcing or importing a campaign:

1. Report localized totals separately from source-original totals.
2. Compare filesystem counts to the locked campaign manifest.
3. Open and decode every final file so cloud placeholders or incomplete sync cannot
   pass as available assets.
4. Compare uploader-created ad sets and ads to the same manifest **after the uploader
   finishes** — a mid-flight count is progress, not a total.
5. On disagreement, identify the exact missing language, ad-set numbers, and basenames
   rather than quoting one recursive count.

## Optimize for business performance

Preserve the source offer while making target copy sound native, specific, and
action-oriented; keep problem, mechanism, user control, proof, and CTA scannable on
mobile; prefer short copy that fits cleanly over literal wording that cramps layouts.
Benefit emphasis comes from the brand's `copy-patterns.md`, capability claims from its
`product-truth.md` — never invent claims, guarantees, or platform affiliations.

After launch, connect results back to stable creative filenames per
[references/performance-feedback.md](references/performance-feedback.md). The
objective is profitable acquisition, not asset volume.

To measure this workflow itself against a human baseline — a new script, a new
market, a new generation model — run the blind benchmark in
[references/benchmarking.md](references/benchmarking.md).
