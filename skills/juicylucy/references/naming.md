# The export filename grammar — method

Values live in [`../naming.json`](../naming.json). This file is the method and
the mistakes.

## Why the filename matters

Exported files leave the production tree and enter a flat delivery namespace —
an upload folder, an ads manager, a report. There the filename is the only
thing distinguishing one creative, market, or version from another, and after
launch it is the attribution key connecting performance back to the creative.
A wrong filename is a lost measurement, not a cosmetic defect.

## Authoring rules

- Naming the file correctly **is part of finishing the ad**, the same as
  writing the copy. Never save or hand off a tool-default name
  (`image1.png`, `output.png`, `untitled.mp4`) intending to rename later.
- If a field's correct value is genuinely unknown at creation time, ask —
  do not guess, and do not skip the convention.
- Reserve the collision-free final name **before** moving the output into the
  campaign folder; list the destination folder and validate every delivered
  filename before reporting completion.
- The `ad-naming` skill's tool (`naming.mjs`) authors every filename for both
  mediums; never hand-write a filename beside it.

## The common mistake — no third name segment

The mistake that recurs is an ALL-CAPS angle or hook segment slipped in
between the Creative Name and the author constant, as if the filename should
say what the variation tests:

```
ES - Sign Post - AUTHOR STORY - AUTO_F-IMG_..._2026.07.21.png   ✗ wrong
ES - Sign Post - AUTO_F-IMG_..._2026.07.21.png                  ✓ correct
```

The angle a variation tests is not recorded in the filename at all. Exactly
two name segments exist: Market, then Creative Name (with its version number).

## Localization inheritance

When recreating a campaign in another language, exact source-to-target mapping
takes precedence over inventing better names:

1. Replace only the leading market token (`RU - ` → `MN - `).
2. Preserve the complete remaining basename byte-for-byte — version number,
   metadata block, date, extension.
3. Build the expected basename set per **ad set**, not only per language, and
   require every target ad set to match its source set exactly; a correct
   language-wide total can still conceal misplaced files.
4. Do not rename a localized creative to sound more natural, bump its version,
   or re-date it when the campaign contract requires the inherited date.
5. Historical names may not match today's grammar — an older author token, a
   segment the grammar has since dropped. Faithful mapping beats silent
   normalization: the localized copy carries the source's name as it is.

## Naming checklist

Before saving or uploading a creative:

- [ ] Market code matches the actual target language (`languages.json`)
- [ ] Creative Name is unique — checked against existing files
- [ ] Version number appended for second and later versions of a concept
- [ ] No third name segment
- [ ] Author constant matches the medium (`naming.json` → `mediums`)
- [ ] `F-` matches the actual asset type; extension matches the actual file
- [ ] `R-` is the artifact's actual ratio
- [ ] `AL-` reflects the funnel stage; `TB-` records the source; `TH-na` as-is
- [ ] `FB-` is a value from the medium's style vocabulary
- [ ] Date is `YYYY.MM.DD` (inherited for a contract-bound localization)
- [ ] For a localization, only the leading token differs from the source
