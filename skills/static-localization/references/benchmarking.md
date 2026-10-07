# Blind benchmark — measuring the workflow against a human baseline

Use when validating this workflow on a new script, market, or generation model, with
an existing human localization as the benchmark. The output is a verdict per
technique, not ads: a clear negative is valuable.

## Integrity: three layers

The benchmark is blind — the agent must not see the human work before scoring:

1. **Instruction**: the run brief states the human folder is off-limits until the
   comparison phase.
2. **Deny rule**: a permissions deny entry on the human folder for the generating
   session. A guardrail, not a guarantee — file-tool denies do not stop every access
   path.
3. **Hash lock — the real check**: at the end of generation, write a manifest with
   the SHA-256 of every generated file. Re-verify the hashes at comparison time; any
   mismatch invalidates the run.

Only after the manifest is written is the human folder opened.

## The comparison document

One document (PDF or image grid), one row per source creative:

| Column 1 | Column 2… | Last column |
|---|---|---|
| Source original | One column per technique under test | Human localization |

Label each row with the source filename and folder.

## Scoring

Score each machine output 1–4 against the human on: background fidelity, layout
fidelity, text accuracy (correct rendering for the target script — see
`static-image-craft`'s script-rendering reference), typography match, brand elements
preserved, and ship-readiness.

**Quality Index = (total ÷ maximum) × 100.** Verdict bands: **≥ 75 SHIP · 60–74
TWEAK · < 60 KILL.**

## The run report

Record per technique: verdict, failure modes, copy risks, wall-clock time and
generation cost, and the projected cost and time to localize one full campaign folder
into one language. File it as dated evidence per the retention rule in the
`juicylucy` skill's `evidence.json`.
