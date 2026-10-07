---
id: background-video-text-overlay
name: Background Video + Text Overlay
status: live
style: videotextoverlay
duration: 6-15s (sweet spot 7-10s)
aspects: 9x16, 4x5, 1x1
---

# Background Video + Text Overlay

Full-bleed generated footage runs continuously underneath; the argument is made entirely in text
overlay. The footage buys attention, the text does the selling.

> **Calibrated 2026-08-17** against three JuicyLucy reference creatives — placeholder basenames
> ES/Reference-A, ES/Reference-B, RU/Reference-C, all `FB-textoverlay`, all 9:16, 7.0s / 8.87s /
> 10.05s (the real filenames stay with the campaign, per `references/reference-iteration.md`). Every
> number below marked _(measured)_ came off those three files; anything not so marked is still a
> reasoned default. Two cautions on the evidence: the three share one brand and one `NO HOOK` tag,
> so they are closer to one creative family measured three times than to three independent winners;
> and **their copy is not compliant** — see § What not to take from the references.

## When to reach for it

- The message is **verbal** — a claim, an offer, a reframe — and no footage could state it as fast.
- The product is hard, slow, or expensive to film: a service, software, a before-state, a promise.
- You are **testing hooks**, not testing visuals. Holding the footage constant across variants
  isolates the copy as the only variable, which is the cheapest useful experiment in paid media.
- The offer is the point and the visual only needs to not get in the way.

Do not reach for it when the product's appearance _is_ the argument (use footage-led blueprints),
or when a person's delivery carries the trust (use a testimonial blueprint).

## Anatomy

Five layers — four visual, bottom to top, plus the soundtrack. Each is a separate track in the
composition.

| Layer          | Contents                                              | Duration      |
| -------------- | ----------------------------------------------------- | ------------- |
| 1 · footage    | the generated background video, full-bleed, cover-fit | full          |
| 2 · plate      | an opaque or near-opaque plate behind the text block  | full          |
| 3 · message    | the text block — one static block, centred            | full          |
| 4 · furniture  | logo bug or offer badge                               | full or tail  |
| 5 · soundtrack | the reference's own audio, unmodified — § Soundtrack  | full, + outro |

Layer 2 is not optional and is not a design flourish. Generated footage has unpredictable luminance,
and the same overlay that reads on one seed is illegible on the next. The plate is what makes the
blueprint reproducible across seeds.

**All three references use a hard plate, not a gradient scrim** _(measured)_ — a rounded, notched
sticker box in the native Instagram / TikTok caption idiom, sized to the text and drawn either solid
white with black text (1 of 3) or solid near-black with white text (2 of 3). A gradient scrim still
works and is the safer choice over busy footage, but the sticker plate is the house look, and it is
what the eval briefs ask for by name ("a solid partially transparent background block behind
captions text"). Whichever you use, it must survive a seed change without retuning.

## Shot structure

**The measured house shape is one static block held for the whole ad** _(measured, 3 of 3)_.

```
Frame 0 → last frame: the complete text block, at full opacity, at final position and size.
  No fade-in, no rise-in, no stagger, no typewriter, no beat swaps, no exit. The feed shows
  frame 0 as a static thumbnail before autoplay begins, and a hook that animates in is a hook
  that is blank in the thumbnail. Verified across all three references: the pixels inside the
  text plate are identical from frame 0 to the final frame.

The FOOTAGE provides one hundred percent of the motion.
  One continuous shot, no cuts — confirmed on all three references (scene-change detection
  finds zero cuts above threshold in any of them). The camera moves slowly and never changes
  its mind. See § Generation spec for the motion budget.

The whole ad is the tail hold.
  Because nothing ever leaves, every frame is a frame that stands alone — including the last
  one, the screenshot people take and the still the platform may reuse.
```

**The multi-beat alternative is untested here.** An earlier draft of this blueprint specified a
hook → body-beats → offer → tail sequence with beats swapping in place, and carried a 1.6s minimum
dwell per beat. No reference exercises it: none of the three swaps a beat, so the 1.6s floor has
never been validated and is not quoted as a number any more. If a brief genuinely needs sequenced
beats, build them — but you are off the measured path, so say so in the closing reply and treat the
round as a pacing test whose result is worth recording in `LEARNINGS.md`.

**Duration** _(measured)_: 7.0s, 8.87s, 10.05s. Ship 7–10s unless the brief argues otherwise; the
6–15s frontmatter range is the outer envelope, not the target. Note that a single static block does
not scale with duration the way sequenced beats do — a longer ad buys the reader more time on the
same words, and past ~10s it buys nothing.

## Overlay geometry

All _(measured)_, on a 9:16 1080 x 1920 canvas, and all three references agree closely. These are
the numbers to build against; the `ad-platform` skill's `platform-specs.md` is where the platform
limits they sit inside are recorded.

| Property                   | Measured across the three references             | Build to                    |
| -------------------------- | ------------------------------------------------ | --------------------------- |
| Block vertical centre      | 50.8% / 48.7% / 50.0% of frame height            | **centred — 50%**           |
| Block top edge             | 39.7% / 39.6% / 34.2%                            | falls out of centring       |
| Block bottom edge          | 61.9% / 57.8% / 65.8%                            | **never past 65%**          |
| Text column width          | 87% / ~87% / 79% of frame width                  | **~87%, centred**           |
| Side margin to first glyph | 6.5% / ~5.7% / 10.2%                             | **6% each side**            |
| Line pitch                 | 66px / 61px / 69px = 6.1% / 5.7% / 6.4% of width | **~6% of frame width**      |
| Lines in the block         | 7 / 5 / 9                                        | **5–9, 9 is the ceiling**   |
| Block height               | 22% / 18% / 32% of frame height                  | falls out of the line count |
| Text alignment             | centred, all three                               | **centred**                 |

Two consequences worth stating outright:

- **Centred is not a style choice, it is what the safe zone allows.** Meta's 9:16 safe band runs
  14%–65% of frame height, so a centred block has only 15% of frame height below the midpoint before
  it crosses into the bottom keep-out. That is what caps the block at nine lines.
- **The references sit exactly on the side keep-out, and one sits over the bottom one.** Glyphs run
  to 6.5% and 93.6% of frame width against Meta's 6%/94% limit — no margin for a longer word. And
  the nine-line reference's last glyph row lands at 65.05%, 15px inside the bottom keep-out. Build
  to 6% and 65% as walls, not targets.

## Copy slots

The block is one paragraph run, not timed slots — but it has a consistent internal shape, and the
limits below are what the geometry above physically allows _(measured)_. They are hard: a block that
overruns them either drops below thumbnail legibility or crosses the safe zone.

| Slot        | Limit | Measured (3 refs) | Job                                                          |
| ----------- | ----- | ----------------- | ------------------------------------------------------------ |
| `hook`      | ≤ 75  | 73 / 50 / 63      | First sentence. Names the tension in the reader's own words. |
| `mechanism` | ≤ 90  | 86 / 81 / —       | What the product does, in one sentence. Named, concrete.     |
| `proof`     | ≤ 105 | 93 / 80 / 104     | The result or the reframe that closes it.                    |
| **block**   | ≤ 250 | 167 / 218 / 250   | The whole run, hook through proof. **The binding limit.**    |

Character counts include spaces and emoji. Latin and Cyrillic measured alike; a script with wider
glyphs (or a bolder weight) buys fewer characters per line, so re-measure rather than assuming the
budget transfers — v2 fits 43 chars/line in a bold condensed setting where v1 fits 24.

Five more things all three references do, which are cheap to copy and worth copying _(measured)_:

- **Open on `POV:`.** Literally all three. It is a format the reader recognises in the first word.
- **Name the brand exactly once, mid-block, underlined.** The one piece of emphasis in the whole
  overlay; nothing else is bolded, coloured, or sized up.
- **One concrete number**, in the proof sentence.
- **End on one or two emoji**, and nowhere else in the block except one after the hook sentence.
  Two to three emoji total.
- **No offer slot and no CTA slot.** None of the three puts an offer or a CTA in the overlay — the
  ad unit's own button carries it. If the brief has an offer, ask whether it belongs on-screen at
  all before spending three lines of a nine-line ceiling on it.

Write them per `references/ad-copy.md`. The hook is the variant axis that matters most — expect to
ship four to six hooks against one footage set before varying anything else.

### What not to take from the references

The three reference creatives are structurally exemplary and **their copy would fail the compliance
gate in `references/ad-copy.md`**. Between them they run an extreme low price as the hook (a
localized "for $1 a day"), granular unverifiable stats (a "N orders before lunch", a "N new
customers in five days"), the POV-with-implausible-speed meme, and — worst — localized paid-ads
language ("manages my ads") for a product the brand overlay says is organic-only. That is four of
the seven flagged patterns plus a hard product-rule breach, in three files.

Calibrate the **geometry, the pacing, and the block shape** off these. Do not calibrate the claims,
and never lift a line. If a user supplies one of these creatives as a preservation reference, the
gate reports rather than blocks (`ad-copy.md` § blocks vs reports) — build it, then name the
specific patterns in your closing reply.

## Soundtrack

**Copy the reference's audio.** That is the default, it needs no instruction to trigger, and it is
almost always the right answer. These ads are cut to a track — usually a recognisable song — and all
three references carry a full-duration music bed with no voiceover _(measured)_. The track is not
decoration: it is the half of the creative the unmuting viewer came for, and a variation has no
reason to touch it. Reuse the reference video's own audio, same in-point, unmodified, spanning frame
0 to the final frame including any outro. Mechanics and the finite-audio trap:
`references/reference-iteration.md` § Reuse the reference's soundtrack.

- **No reference?** Generate a music bed for the full duration —
  `references/generation.md` § `cassetteai/music-generator`.
- **The user asked for different music?** Do that. An explicit instruction is the only thing that
  changes the audio, and "localise it" is not one.
- **Never ship silent.** Sound-off is how the overlay is _read_ (§ QA gates); it is not how the ad
  is _delivered_. No audio stream, or a muxed silent track standing in for a soundtrack, is a defect
  — `references/defect-gate.md` § missing or substituted audio.

**No TTS and no voiceover on this blueprint.** The argument is in the text block and the audio is
music. The only speech in the track is song lyrics, and **lyrics are kept in their original
language** — including when the overlay copy is localised into a market that does not speak it. Do
not transcribe them, do not caption them, do not re-voice them.

## Generation spec

Two calls per variant, in this order, per `references/generation.md`.

**First frame (text→image).** Prompt for the _composition_, not just the subject: the overlay needs
a quiet region where its text will sit, and the model will not leave one unless asked. State the
aspect, the subject, the light, and — explicitly — the negative space and which third of the frame
it occupies.

Because the measured block is **vertically centred**, the negative space you ask for is the middle
band, not the upper or lower third. That is a harder ask of an image model — the middle of a frame
is where the subject wants to be — so it is worth naming twice in the prompt: once as negative space
and once as subject placement. All three references put their subject low or to one side and left
the mid-band quiet.

```
<subject and setting>, <lighting and mood>, <lens/format cue>,
subject placed low in frame, composed with clean negative space across the middle band —
a quiet area of the scene itself, with nothing drawn on it —
<aspect> vertical framing, no on-image text, no watermark, no logo,
no blank box, banner, sign or caption plate of any kind
```

The quiet band is footage, not a plate: layers 2 and 3 are drawn by the composition, and a frame
that arrives with an empty box where the block will sit is rejected before review —
`references/generation.md` § The footage carries no text and no place for text.

**Video (image→video).** The first frame is the input; the prompt describes only _the motion_.
Motion budget for this blueprint is deliberately small — one continuous move, no cuts, no camera
change of intent:

- a slow push-in or pull-back (a few percent of frame across the whole clip), or
- a slow lateral drift, or
- subject-internal motion only (steam, hair, fabric, water, traffic) with a locked camera.

Anything faster competes with the text for attention and the text loses. Generate at or above the
delivery duration and trim in the composition — never loop a short clip to reach length, since the
loop point is visible and reads as cheap.

**Model selection and exact parameters: `references/generation.md`.** That file is the single place
model ids live, so a model swap is one edit and not a hunt through every blueprint.

**Seeds.** Record the seed for both calls in `.media/manifest.jsonl`. Holding the footage seed
constant while the copy varies is what makes a hook test a hook test.

## Variant axes

Vary **one axis per round**. A round that changes two axes cannot attribute its own result.

These govern what differs **between the variants inside a round** — not how far the round sits from
a reference creative. Two separate rules, and conflating them is how a variation drifts into a
different ad: `../references/reference-iteration.md` § How close is close enough owns the other one.

| Axis            | Vary when                                               | Typical spread          |
| --------------- | ------------------------------------------------------- | ----------------------- |
| `hook`          | Always. This is the default first round.                | 4–6 hooks, footage held |
| `footage`       | The winning hook is known and you want a visual lift.   | 2–3 seeds, hook held    |
| `block length`  | Suspected the block is too dense to read at feed speed. | 2 (≈170 vs ≈250 chars)  |
| `plate`         | Light sticker vs dark sticker on the same footage.      | 2, everything else held |
| `offer framing` | Two commercially acceptable phrasings of the same ask.  | 2, everything else held |
| `aspect`        | Never as a test — placement decides it. Ship both.      | —                       |

`block length` replaces the old `pacing` axis: with a single static block there is no dwell to tune,
and density is the thing that actually varies. The three references span 167–250 characters, which
is the natural spread to test between.

## Failure modes

- **Animated hook.** Frame 0 is blank in the thumbnail. The single most expensive mistake here.
- **No plate, or a plate tuned to one seed.** Legible in review, illegible on the next generation.
- **A plate in the footage.** The first frame carries a blank box or sticker outline where the
  block will go — usually a reference's caption block emptied rather than removed. It cannot follow
  the copy across rows or languages. Regenerate; the plate is layer 2, never layer 1.
- **Footage that competes.** Fast motion, hard cuts, or a face in the background pulls the eye off
  the text; the ad then has neither a visual argument nor a read message.
- **A tenth line.** The block is centred, so line ten crosses the bottom keep-out. Cut a sentence,
  do not shrink the type — the type is already at the thumbnail-legibility floor.
- **Text run to the frame edge.** Two references sit within half a percent of Meta's 6% side
  keep-out and one plate overflows the frame entirely. Set 6% as a wall.
- **A non-standard canvas.** One reference ships 1080 x 1934 — not 9:16, so the platform rescales it
  and every measured percentage above shifts. Check the rendered dimensions, not the declared ones.
- **A looped short clip.** The loop point reads as a stutter and cheapens the whole ad.
- **A silent ad, or a swapped soundtrack.** The generated footage is silent by design, so an ad
  ships silent by simply forgetting the audio track — and nothing in `lint` or `check` says so.
  Replacing the reference's song because a generated bed "fit better" is the same failure with more
  effort. § Soundtrack.
- **Claims drifting during copy iteration.** Every claim traces to the brief's `claims` field, on
  every variant, including the ones written late.
- **Calibrating the copy off the references.** See § What not to take from the references.

## QA gates

Per variant, before it ships:

1. Frame 0 exported and viewed at thumbnail scale — the complete block legible, no clipped words.
2. Watched once with **sound off**; the argument lands without audio.
3. **Audio preserved.** Watched once with **sound on**: there is audio, it runs from frame 0 to the
   final frame including any outro, it is the reference's own track unmodified (or the track the
   user asked for), there is no silent tail, and no synthetic voice sits on top of it. Confirm the
   stream exists and is not silence:

   ```bash
   ~/.juicylucy/bin/ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,duration -of default=nw=1 out.mp4
   ~/.juicylucy/bin/ffmpeg -v error -i out.mp4 -af volumedetect -f null -   # mean_volume near -91 dB = silent track
   ```

4. Safe-zone overlay checked for the target placement: block centred, last glyph row above 65% of
   frame height, glyphs inside 6%–94% of frame width.
5. Block is ≤ 9 lines and ≤ 250 characters.
6. Last frame is pixel-identical to frame 0 in the text plate — nothing animated in or out.
7. Rendered file is exactly the target canvas (1080 x 1920 for 9:16), H.264, 30fps fixed, with a
   **non-silent** AAC audio stream covering the video's full duration.
8. Duration within the placement band (7–10s house, 4s Reels floor).
9. Every claim traced to `AD_BRIEF.md` § claims, and the compliance gate run per `ad-copy.md`.
10. `.media/manifest.jsonl` records both model ids, both prompts, and both seeds.
