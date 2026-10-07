# Project state — [campaign]

Last checkpoint: [timestamp and timezone]

## Objective

[Business objective, audience, source campaign, target languages, and expected totals]

## Paths

- Campaign root: `[absolute path]`
- Source root: `[absolute path]`
- Project manifest: `[absolute path]`
- QA/report root: `[absolute path]`

## Non-negotiable contract

- Fresh generation from the corresponding original source only
- No in-place edit or localized reference for failed candidates
- Maximum [2] image-producing attempts per asset
- Exact numbering, batch order, basename suffixes, and brand/compliance rules
- Full asset, batch, language, and project QA

## Numbering and batch mapping

| Source batch | Ads | Target language | Target batch | Owner | State |
|---|---:|---|---|---|---|
| [#NNNN] | [N] | [Language/code] | [#NNNN] | [agent] | [pending/active/pass] |

## Live totals

- Languages complete: [x/y]
- Ad sets complete: [x/y]
- Final ads saved: [x/y]
- Attempts: [n]
- Fresh retries: [n]
- Terminal failures: [n]
- Confirmed global idle: [duration]
- Tokens: [exact value or Unavailable from runtime]

## Lane state

| Lane | Owner/language | Last accepted asset | Next exact source asset | Attempts/retries | Capacity state |
|---|---|---|---|---|---|
| Root | [language] | [file] | [file] | [n/n] | [healthy/paused] |

## Incidents

| Time | Lane | Event | Artifact produced? | Attempt consumed? | Recovery |
|---|---|---|---|---|---|

## QA state

| Language | Batches passed | Individual review | Contact sheets | OCR | Mechanical | Final QA |
|---|---:|---|---|---|---|---|

## Resume here

1. Reconcile manifests against direct numbered-folder files.
2. Confirm no other agent owns the next path.
3. Resume `[language]`, batch `[number]`, source `[exact absolute path]`.
4. Use attempt `[1/2]` from the original source only.

## Post-production

- Run the cross-language verifier.
- Report localized totals separately from source-inclusive totals.
- Reconcile the uploader after it finishes.
- Connect stable filenames to performance results.
