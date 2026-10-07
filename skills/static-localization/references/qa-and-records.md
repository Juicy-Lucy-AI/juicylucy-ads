# QA and production records

The evidence package layout — which files, where — is the `juicylucy` skill's
`evidence.json` § `qa_package`. This file is the accounting and interpretation
discipline behind it.

## Final language checks

1. Exact campaign folder set.
2. Expected counts per folder.
3. One-to-one source/target basename mapping after the language-prefix substitution.
4. The full asset gate (`evidence.json` § `asset_gate`), mechanically verified.
5. Unique SHA-256 hashes with zero duplicate final outputs.
6. OCR/residual-language leads, visually adjudicated at full resolution.
7. Every individual final image visually reviewed.
8. Every batch contact sheet reviewed.
9. Natural target-language copy, correct script and diacritics, exact brand spelling,
   safe margins, source fidelity, and CTA clarity.

## Attempt accounting

- A call counts as an image-producing attempt only if it produces a candidate image.
- A fresh retry is a rejected candidate followed by a new generation from the original
  source.
- No-output failures (429/503/transport) are recorded separately and consume nothing.
- Record why each rejected candidate failed and that it was discarded.
- Under a strict campaign contract: at most two image-producing attempts per asset,
  then a recorded terminal failure. The general limit outside strict mode is three —
  `static-image-craft` § retry policy owns the distinction.

## Time and idle accounting

- Start: first persistent production action or first accepted campaign artifact.
- End: final language QA completion.
- Elapsed: wall time — generation, visual review, OCR, retries, QA included.
- Confirmed model/service idle: only an interval where that lane could not make useful
  progress because of a model or service block. Coordinator pauses, active long
  renders, and QA time are not idle; report them separately when material.
- Tokens: an exact runtime value or `Unavailable from runtime`.

## OCR interpretation

OCR is an inspection aid — a lead, not truth. Do not auto-reject low-confidence
output, especially for unsupported scripts, stylized text, accents, or environmental
signage; inspect the full-resolution image against the locked copy. For Cyrillic
targets, Cyrillic presence is not evidence of source-language residue; distinguish
languages semantically.

On macOS, run the bundled Apple Vision tool with a writable module cache rather than
forcing an SDK:

```bash
env CLANG_MODULE_CACHE_PATH="$(mktemp -d)" \
  swift <SKILL_DIR>/scripts/ocr.swift TARGET_ROOT \
  --recognition-language en-US \
  --recognition-language TARGET-LOCALE \
  --output TARGET_ROOT/.qa/ocr.json
```

If the engine returns `nilError` or no lines, preserve the raw JSON and complete
semantic review at full resolution plus contact sheets — an OCR-engine limitation,
not an asset failure.

## Final project report

Report total languages, ad sets, accepted images, image-producing attempts, fresh
retries, terminal failures, capacity incidents, confirmed idle, token availability,
and outstanding external metadata work — reconciled from files and evidence, not
memory. Report the two totals per `evidence.json` § `counting_rule`, state whether an
uploader count is final or in progress, and after upload completes compare its
language/ad-set/ad totals and exact basenames against the same locked manifest.
