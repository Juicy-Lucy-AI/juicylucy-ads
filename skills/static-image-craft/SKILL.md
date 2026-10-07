---
name: static-image-craft
description: Faithful recreation and text replacement for static image ads — the single-image fidelity techniques under a localization or variation. Owns the fresh-source contract (Track B: regenerate the whole image from the original source, never edit a failed output in place), the Track A text-only fallback (glyph masks, inpainting, matched typography on the source pixels), attempt limits and the rule for moderation blocks (faithful minimal retries of the same visual, capped at two or three attempts, never evading the safety system), the people/photorealism quality gate, typography on people and shaped surfaces, canvas-drift normalization, and per-script rendering craft (Devanagari shaping, Cyrillic, RTL, CJK). Use when recreating an image in another language, when a generation is moderation-blocked or quality-defective, or when text must be replaced without degrading the source. Batch orchestration is static-localization; video is /video-ad-production.
---

# Static Image Craft

Recreate or re-text a static ad without losing what made the source work. Two tracks,
one gate: **Track B** regenerates the whole image fresh from the original source;
**Track A** keeps the source pixels and replaces only the text. Track B first, always.

Workspace conventions come from the `juicylucy` skill (asset gate in `evidence.json`,
filename inheritance in `naming.json`, per-language scripts and codes in
`languages.json`); brand facts — protected Latin tokens, exact brand spelling — from
the resolved `brand-<slug>` skill. If either cannot be read, stop and ask.

## Track B is a production contract

When the run says fresh generation, from zero, or source-only, that is an explicit
no-overlay, no-in-place-edit contract:

- generate every localized image as a completely fresh render from the approved
  source;
- use the source as the concept, subject-role, composition, hierarchy, and quality
  reference — when cultural adaptation is requested, fresh generation may change
  architecture, people, vehicles, clothing, weather, or street detail while
  preserving the winning visual role and message structure;
- never paste translated text onto source pixels;
- never use a failed localized candidate as the next reference;
- do not silently switch to Track A, compositing, or another shortcut;
- checkpoint each accepted output directly into its collision-free final destination.

### Required order

1. Inspect the original source image at full resolution.
2. Transcribe and adapt every text element into natural target-language copy.
3. Generate a fresh image with `~/.juicylucy/bin/juicy image edit --no-preset --image <source>`, using the
   source as the strict visual reference.
4. Preserve the same concept, subject identity, pose, wardrobe, objects, composition,
   crop, perspective, background, colors, lighting, typography style, hierarchy,
   icons, and aspect ratio. Change only the language unless a redesign was explicitly
   requested.
5. Inspect the result at full resolution before saving it as final.

### Strict fresh-source mode

Active whenever the campaign contract says source-only, redo from scratch, do not
edit failed outputs, or sets a two-attempt limit. Its rules override the general
retry policy below:

1. Only the corresponding original source image as reference, for every attempt.
2. Every retry is a complete new generation — a "targeted change" means a more
   precise prompt on a fresh generation, never an edit of the failed candidate.
3. At most **two** image-producing attempts per asset. A call that produces no
   candidate consumes nothing but is recorded separately.
4. After a second rejected image, record a terminal failure — no silent Track A, no
   compromised delivery.
5. Record the rejected candidate, reason, fresh-source retry, and final disposition
   in the retry ledger.
6. Validate each accepted candidate visually and mechanically before filing it under
   the exact inherited filename — from the `ad-naming` tool's `naming.mjs inherit`
   (`naming.json` § localization inheritance).

For multi-language runs, pair with `static-localization`: one owner per language, its
concurrency and campaign-wide QA rules.

## Retry policy — defects and blocks are different problems

For a successful generation with fixable defects, retry with one targeted change at a
time, checking: spelling, accents, punctuation, natural localization; missing,
duplicated, or invented text; clipping, overflow, alignment, hierarchy, contrast;
identity, anatomy, pose, wardrobe, landmark, object fidelity; background, lighting,
color, crop, aspect drift; no sign, poster, card, or text panel overlapping any
face or important expression; synthetic, painterly, waxy, embossed, noisy, or
low-resolution texture. Keep the best valid attempt — never accept an image merely
because generation succeeded.

For **moderation blocks**, make only legitimate minimal retries:

1. Use the approved source as the direct reference.
2. Ask for the same visual and a language change only, explicitly preserving person,
   pose, wardrobe, framing, background, lighting, crop, and colors.
3. Remove unnecessary sensitive descriptions; use neutral terms such as "same adult
   subject, wardrobe, pose, framing, and lighting".
4. Retry the individual image, not the whole batch.
5. Stop at the limit: **three** total attempts per source in general mode, **two** in
   strict fresh-source mode.

Never evade, bypass, or repeatedly probe a safety system. "Try your best" means
exhaust the allowed faithful attempts — not change the concept secretly or disguise
the request.

### When Track B cannot pass

Tell the user plainly: Track B regenerates the whole image and the safety system
blocked the output; more rewording cannot be used to bypass moderation; the faithful
alternative is Track A, which keeps the approved source pixels and replaces only the
text. Obtain agreement before switching unless fallback was pre-authorized — and
never use Track A when the contract explicitly requires fresh generation only.

## Track A — text replacement on the source pixels

Build Track A from the original source, never from a degraded Track B output:

1. Keep the original native pixel dimensions and color mode.
2. Create tight glyph-only masks inside known text regions — exclude faces, clothing
   edges, emoji, bullets, decorative elements.
3. Dilate masks only enough to cover antialiasing.
4. Inpaint or reconstruct only the masked letter pixels; inspect for halos, ghost
   letters, smears, repeated texture, damaged edges.
5. Draw the localized text with high-quality fonts matching the reference class,
   weight, condensation, alignment, line spacing, and color — shaped correctly for
   the target script per [references/script-rendering.md](references/script-rendering.md).
6. Fit copy without clipping; shorten the localization before shrinking type
   excessively.
7. Save losslessly as PNG at the source dimensions — no resize, screenshot, or JPEG
   recompression.
8. Compare source and output side by side at 100% zoom: everything outside the text
   regions must be unchanged.

Track A normally looks sharper than Track B because it keeps the source photograph;
its risk is local inpainting around old glyphs — keep masks tight and reject visible
cleanup artifacts.

## The people gate

A correctly named, correctly worded file is still unfinished if the humans in it look
synthetic. For any image containing people:

- Prefer a fresh, premium photorealistic generation when repeated edits soften or
  distort — do not keep iterating on a degraded image.
- Require natural facial asymmetry, realistic pores and skin texture, individual hair
  detail, lifelike eyes and teeth, anatomically correct hands and fingers.
- Reject plastic skin, beauty-filter smoothing, uncanny or warped features, malformed
  fingers, excessive blur, generic low-detail backgrounds.
- Preserve or create sharp fabric, sign, prop, lighting, and environmental detail —
  not just a readable overlay.
- Faces and expressions are protected focal content — the layout rules are in
  [references/typography.md](references/typography.md).
- If a person-focused output fails, regenerate from scratch with a new high-quality
  subject and scene rather than delivering a low-quality face with correct copy.
- Inspect at full resolution before replacing any production file; counts,
  dimensions, and filenames do not substitute for looking.

## Production quality gate

Do not deliver until every applicable check passes:

- final dimensions and ratio match the source or campaign contract;
- localized copy is correct and native-sounding; accents and brand names exact;
- text readable, balanced, unclipped; every visible face unobstructed;
- Track B: no full-image quality loss or unrequested redesign;
- Track A: no visible old text, halos, or damaged source detail;
- the filename follows the inherited convention; the file is present in the requested
  campaign folder.

If no method produces a ship-ready result, report the limitation rather than
presenting a poor render as complete.

**Canvas drift**: a generator canvas one or two pixels off the contract is an export
defect, not a pass. After visual review, normalize only the delivery canvas to the
exact required dimensions with a lossless PNG export, reopen it, and re-verify. Never
describe a nearby size as passing an exact-dimension contract.

## Not for video

Track A and Track B are **image** techniques. A video ad's localized overlay text is
re-composed over unchanged footage — there is no image to regenerate and no glyph to
mask, and the soundtrack stays in its source language. Video runs through
`/video-ad-production`.
