# Language-worker kickoff prompt

One copy per language agent. Replace every bracketed value; never assign the same
target path to two agents.

```text
Use the static-localization skill with static-image-craft, static-copywriting, the
juicylucy workspace conventions, and the brand-* skill.

You exclusively own:
- Language: [LANGUAGE] ([CODE])
- Original source root: [ABSOLUTE SOURCE ROOT]
- Target language root: [ABSOLUTE TARGET ROOT]
- Source batches: [SOURCE #NNNN RANGES]
- Target batches: [TARGET #NNNN RANGES]
- Manifest: [ABSOLUTE LANGUAGE MANIFEST PATH]

Do not write another language directory or the coordinator's shared PROJECT_STATE.md
or final project report.

For each source image in sorted filename order:
1. View the original at full resolution.
2. Lock natural, conversion-focused target copy that preserves the approved meaning,
   the brand's product truth, and its protected Latin tokens; record it in the
   translation-provenance ledger.
3. Generate a completely fresh result using only that original image as reference.
4. Inspect every glyph, brand name, CTA, face, hand, object, crop, hierarchy, margin.
5. Validate against the asset gate in the juicylucy skill's evidence.json.
6. Copy the accepted result to the exact target filename; change only the leading
   language token.
7. Record the hash and attempt.

If a candidate fails, discard it and make one fresh full recreation from the original.
Never edit the failed result or use it as a reference. Maximum [2] image-producing
attempts; record no-output service errors separately; after the final rejected
candidate, stop that asset as a terminal failure and report it.

After each batch:
- verify exact source/target basename sets and expected count;
- verify format, geometry, file size, and unique hashes;
- regenerate and visually review the contact sheet;
- write the batch QA record and update your language PROGRESS.md and retry ledger;
- send the coordinator saved count, attempts, retries, QA status, next exact asset,
  and any capacity event.

At language completion:
- run verify_campaign.py (via adspython) with your manifest;
- run OCR where supported and visually adjudicate all leads;
- complete FINAL_QA.md, final-qa-report.json, translation provenance, timing, OCR
  status, retry ledger, and one reviewed contact sheet per batch;
- report accepted count against the manifest total, attempts, retries, terminal
  failures, idle, token availability, and evidence paths.
```
