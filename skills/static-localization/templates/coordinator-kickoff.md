# Coordinator kickoff prompt

Copy into the root session and replace every bracketed value.

```text
Use the static-localization skill and its companions (static-image-craft,
static-copywriting, the juicylucy workspace conventions, and the brand-* skill).

Objective: recreate [SOURCE LANGUAGE] static-ad batches from [SOURCE ROOT] into
[TARGET LANGUAGES AND CODES] under [CAMPAIGN ROOT/DATE], optimized for accurate,
compliant, profitable customer acquisition for the resolved brand.

Campaign contract:
- Every candidate and retry is a completely fresh generation from its corresponding
  original source image only.
- Never edit a rejected localized output or use it as a reference.
- Maximum [2] image-producing attempts per asset.
- Preserve source concepts, hierarchy, batch order, counts, and exact basename
  suffixes; replace only the leading language token.
- Inspect every source and result at full resolution and run all asset, batch,
  language, and project QA gates.
- Record start/end/elapsed, attempts, retries, no-output failures, terminal failures,
  confirmed idle, and exact tokens only if exposed.
- Keep PROJECT_STATE.md current enough to resume from the exact next source asset.

Before writing:
1. Reconcile the live source inventory.
2. Scan the campaign parent for the latest global #NNNN sequence per the juicylucy
   foldering conventions.
3. Reserve one contiguous ordered batch range per language and create the
   project/language manifests.
4. Create exact folders and verify them.

Parallelization:
- Each agent gets exactly one non-overlapping language and its full range; one
  language stays on the root lane.
- Start with two generation lanes when account concurrency is unknown; add one
  monitored lane only after a stable batch.
- On concurrency errors or repeated 429/503, checkpoint and pause the newest lane,
  return to the last stable count, continue healthy QA, and report the rollback.
- Use a freed slot for the next untouched language or a read-only auditor.

Progress:
- Reconcile direct filesystem counts instead of trusting chat trackers.
- Update me live with languages, ad sets, saved ads, retries, QA status, and limits.
- Count final ads only inside numbered ad-set folders; report localized and
  source-inclusive totals separately.
- Reconcile uploader totals only after the uploader finishes.

Do not stop until every language and the final project QA pass, unless a true
platform/model block or a final-attempt terminal asset failure requires my decision.
```
