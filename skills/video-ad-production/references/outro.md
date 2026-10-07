# The brand outro end-card

An ad **may** end on the canonical brand outro. It is not automatic and it is not a default — you
decide whether this ad warrants one, then place it **inside** the ad's length.

The card is fetched once per project and frozen to `.media/brand/outro-end-card.png` — a still PNG
of the resolved brand's lockup. Source URL, dimensions, and the digest to verify against live with
the brand — `brand-<slug>` § outro-card.md. Because it is a still, it has **no natural length**,
which is what lets it fit whatever budget the ad has.

## Decide whether to place it

Apply in priority order and stop at the first that applies:

1. **An explicit user instruction wins.** Brief says add an outro / end-card / brand card → place
   it. Says not to → add none. Done.
2. **There is a reference ad — mirror its ending.**
   - The reference **ends on an end-card** (a held final frame with logo, URL, "Shop now", a
     solid-colour sign-off, **or an app-UI / product-screen final frame**) → place the canonical
     outro **in that end-card's slot**. It REPLACES that ending; it does not extend the ad.
   - The reference **has no end-card** — it cuts on the last content beat → **add no outro.**
   - **You cannot tell** → **add no outro.** Matching the reference matters more than appending our
     brand card.
3. **No reference at all** — a brand-new ad from a text brief → include the outro.

The principle: **an outro is asked for, or mirrored, or it belongs to a from-scratch ad.** "Unsure"
means no outro. Never add one to a reference-driven ad on a hunch.

## One ending only — never stack two end-cards

**The most common failure when recreating a reference:** you faithfully reproduce the reference's
final scene — its end-card — as a content scene, and then _also_ append the canonical outro. That
ships two endings back to back and is always wrong.

A reference's end-card is the **outro slot**, not a content scene to reproduce.

- **Not built yet** (still planning) → don't build it at all; the canonical outro takes its place.
- **Already built** as a final scene (a generated "app UI screen", logo card, or "Shop now" clip
  sitting last) → **remove that clip** before or after placing the outro.

**Self-check:** is the clip directly before the outro a recreated brand / app-UI / product-screen /
logo / CTA end-card? If yes, that is the duplicate-ending bug — remove it.

## Fit it inside the ad's length

**The end-card is silent media.** Whatever the ad's soundtrack is, it has to still be playing under
the outro — otherwise the ad closes on several seconds of dead air. That is the single most common
outro defect.

Appending the outro after the content is what causes it, and it breaks two things at once: the
soundtrack was sized to where the content ends, so the outro's frames have no audio; and the ad got
longer than the reference it was supposed to match.

So the outro is **not additive**. Work out the ceiling first, then place the outro so it **ends**
there:

1. **`soundtrackEnd`** — where the music actually runs out. Take the **lower** of the ad's target
   length (mirroring a reference: the reference's own length) and **the length of the audio source
   itself**. A reused reference soundtrack is the source ad's own audio — it holds only as much
   music as that ad is long, and frames past its end render **silent** whatever duration you set.
2. **`outroEnd = soundtrackEnd`**, and **`outroStart = outroEnd − outroDuration`**.
3. **Make room:** retime the last content clip(s) so content ends at `outroStart`. When the outro
   replaces a reference end-card, that room already exists — use the end-card's start and length.
4. **Then** size the audio to span `0 … outroEnd`.

If the ad has no soundtrack at all, there is no budget to fit — just place the outro after the
content.

**Length.** Replacing a reference end-card → match that slot. Otherwise ~2s reads as a clean
sign-off. Range roughly 1.5–4s. If the budget is tight, **shorten the outro** — a 1.5s branded close
is fine; 5s of silence after the music stops is not. Never lengthen the ad to fit the outro.

## Place it

Add it as the **final, full-canvas clip on its own track**, referencing the shipped asset. It is a
still image — no Ken Burns, no drift, no scale. A held brand card is the intent.

Rules that make it correct:

- **Last.** Nothing visual plays after it.
- **Inside the soundtrack.** Its frame range sits within the audio's range.
- **Full-canvas.** Positioned at the origin, sized to the composition, aspect-fit disabled so it
  fills the frame. The card is 1080×1920, so it maps to the 9:16 canvas 1:1 — no crop, no scale, no
  letterbox.
- **Own track.** Nothing else occupies its time range.

## Self-check before finishing

- [ ] Does this ad warrant an outro under the decision rule? (Reference with no end-card, or unsure
      → there should be none.)
- [ ] Is the outro the _only_ ending — no recreated end-card immediately before it?
- [ ] Does audio cover the outro's full range, and does that audio's **source** have media that far
      in?
- [ ] Is the ad's total length still what the brief or reference calls for?
- [ ] Is it placed as a still, full-canvas, last?
