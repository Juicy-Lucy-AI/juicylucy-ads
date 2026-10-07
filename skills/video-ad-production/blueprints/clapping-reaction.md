---
id: clapping-reaction
name: Clapping Reaction
status: live
style: videoreaction
duration: 6-15s (sweet spot 8-10s)
aspects: 9x16, 4x5, 1x1
---

# Clapping Reaction

A performer claps, nods and reacts to camera for the whole clip while a short text block
carries the claim. The clap is the metronome. **The face is the ad.**

> **Read `background-video-text-overlay.md` first.** This blueprint inherits its overlay contract,
> its frame-0 rule, its one-static-block shape and its plate discipline. It changes three things:
> the footage is a **performance** rather than a backdrop, the face imposes a **much smaller copy
> budget**, and the generation prompt is an **expression score** rather than a description of a
> scene. Everything not restated below is the parent's, unchanged.

> **Observed 2026-08-18, not calibrated.** The numbers marked _(observed)_ come from one prompt's
> six generations plus the competitor reference that prompt was built to reproduce — see
> `references/reference-iteration.md` § The clapping-reaction observation set. That is **one
> creative family, not three independent winners**, so nothing here has met the bar in
> § Calibrating a blueprint. Treat every number as a starting point that the first round's results
> should replace, and say so in the closing reply when you ship against it.

## When to reach for it

- The claim is one a person would visibly **react** to — a flex, a relief, a "wait, that's it?".
- The emotional payoff should land on a **face**, not in a sentence. A smug smirk sells "I did
  less than you and got more" faster than any line of copy can.
- You are testing the **performance** — the expression arc, the eyeline, the tempo — rather than
  testing hooks. Hold the copy and vary the face.
- The scroll-stop has to work on a thumbnail with no reading: a person mid-expression is legible
  at 180px wide; a paragraph is not.

Do not reach for it when:

- **The message needs more than four lines.** The face eats the text band — see § Copy slots. If
  the argument cannot be made in ~120 characters, use `background-video-text-overlay`, where the
  block gets nine lines because nothing is competing for the middle of the frame.
- The performer needs to **speak**. This blueprint's clip is silent and the mouth is doing
  expression, not dialogue. A talking pitch is `car-testimonial` (planned).
- The product's appearance is the argument.

## Anatomy

The parent's five layers, with the first two renegotiated: the footage is no longer something the
text sits on top of, it is something the text has to sit **around**.

| Layer          | Contents                                             | Duration      |
| -------------- | ---------------------------------------------------- | ------------- |
| 1 · performer  | the generated clip, full-bleed, cover-fit            | full          |
| 2 · plate      | the sticker plate behind the block, per the parent   | full          |
| 3 · message    | one static block, **below the chin**                 | full          |
| 4 · furniture  | logo bug or badge — usually omitted                  | full          |
| 5 · soundtrack | the reference's own audio, unmodified — § Soundtrack | full, + outro |

### The band map

This is the load-bearing part of the blueprint. In a medium close-up the performer occupies the
frame in three horizontal bands, and only one of them can hold text _(observed, 6 of 6, confirmed
against a drawn safe-zone overlay)_:

| Band of frame height | What is there                   | Rule                                             |
| -------------------- | ------------------------------- | ------------------------------------------------ |
| 0 – 14%              | car roof / ceiling              | Meta's top keep-out. Platform UI.                |
| 14 – 20%             | background above the head       | quiet, but only 6% of height — 1 line, at most   |
| **20 – 50%**         | **the face**                    | **never cover it. This is what you are buying.** |
| **50 – 65%**         | chest, forearms, hands entering | **the text band.** 15% of height ≈ 3–4 lines     |
| 65 – 100%            | hands, arms, lower body         | Meta's bottom keep-out. Footage only.            |

Mean temporal motion by decile across the six clips, busiest decile = 1.00 _(observed)_:

```
   0-10 %  0.03  #
  10-20 %  0.16  ######
  20-30 %  0.55  ######################          <- the face, performing
  30-40 %  0.53  #####################
  40-50 %  0.64  ##########################
  50-60 %  0.95  ######################################
  60-70 %  1.00  ########################################  <- the hands, peak motion
  70-80 %  0.96  ######################################
  80-90 %  0.90  ####################################
  90-100%  0.56  ######################
```

Two things follow, and they are in tension:

1. **The text band is also the busiest band.** Motion peaks at 60–70%, which is inside the only
   place text is both below the chin and above Meta's 65% wall. The plate is therefore not
   optional here in a stronger sense than in the parent — it is what stops the block from
   flickering against moving hands. Use the opaque sticker plate, not a gradient scrim.
2. **The face and the safe zone leave you 15% of frame height.** Not 50%, as a centred block on a
   quiet backdrop would get. That is the whole reason this blueprint has its own copy limits.

## Shot structure

One continuous take, one static text block, zero cuts _(observed, 6 of 6 — scene detection at
threshold 0.15 finds nothing in any of them)_. The parent's frame-0 rule and tail-hold logic apply
verbatim: the complete block is at full opacity and final position on frame 0, and nothing ever
leaves.

What is new is that the **footage has an internal structure** — an expression arc — and it is the
thing you are directing:

```
0.0 – 1.0s   THE OPENING STATE, and its break.
  The clip starts on a defined face, not a neutral one: eyes closed, or looking away, or
  mid-eye-roll. Then it breaks into the reaction. Frame 0 is the feed thumbnail, so the
  opening state has to be legible as an expression on its own — see § Failure modes,
  "neutral first frame".

1.0s – end   THE METRONOME, continuous and unbroken.
  Hands clapping in front of the chest, head nodding to the same beat. This never stops
  and never changes character. It is what makes the clip read as one performance rather
  than a sequence of poses, and it is why the clip does not need a camera move.

throughout   THE BEATS, 4-6 of them across 8-10s.
  Distinct, nameable expression changes riding on top of the metronome: an eyebrow raise,
  a side-glance, a smirk landing, a slow blink, a chin lift, a turn of the head away and
  back. Roughly one every 1.5-2s. Fewer than four and the clip reads as a loop.

last frame   A GOOD FACE.
  The last frame is the still the platform may reuse and the frame a screenshot lands on.
  It must be a face you would have chosen. Check it on its own, per the parent's QA gates.
```

**Duration** _(observed)_: 9.79s across the six. Ship 8–10s. Shorter than ~7s does not leave room
for four expression beats on top of a clap tempo; longer than ~10s and the arc starts repeating,
which reads as a loop.

## Copy slots

The face costs you the block. The parent gets 5–9 lines and 250 characters because its references
put the subject low and left the middle of the frame quiet. Here the middle of the frame is a face
you are paying for, so the block starts below the chin and has 15% of frame height to live in.

| Slot      | Limit     | Job                                                                              |
| --------- | --------- | -------------------------------------------------------------------------------- |
| `hook`    | ≤ 70      | The setup. Names the tension the performer is reacting to. `POV:` opener works.  |
| `payoff`  | ≤ 60      | What changed. The performer's face is already selling this — do not re-state it. |
| **block** | **≤ 120** | The whole run. **The binding limit**, and it is half the parent's.               |
| lines     | **≤ 4**   | At the parent's ~6%-of-width line pitch, four lines is 15% of frame height.      |

Everything the parent says about the block's internal shape still holds: open on `POV:`, name the
brand exactly once, one concrete number, one or two emoji at the end, no offer slot and no CTA slot.

**The copy carries less here, and that is the point.** In a text-overlay ad the words do the whole
job. In a reaction ad the words set up a feeling and the face delivers it — so a block that tries
to make the full argument is both over the character limit and redundant with the performance.

### The measured overrun — read this before setting the block

The competitor reference this blueprint was reverse-engineered from ships **five lines running from
53% to 69.7% of frame height** _(observed)_. Its last glyph row sits **4.7% of frame height inside
Meta's bottom keep-out**, so on Reels the final line renders under the platform's own UI. Our own
first six ads reproduced the geometry faithfully and inherited the defect with it.

That is what the four-line limit is protecting against. A fifth line does not overflow the frame or
look wrong in review — it disappears behind the app. If the copy will not fit in four lines, cut a
sentence; do not shrink the type, which is already at the thumbnail-legibility floor, and do not
raise the block into the face.

## Soundtrack

**The parent's § Soundtrack applies unchanged: copy the reference's audio, unmodified**, spanning
frame 0 to the final frame including any outro, unless the user explicitly asked for something else.
Two things this blueprint adds on top of it.

**The clap is cut to the track, so the track is not casually swappable.** The whole premise is a
performer keeping time to music — usually a song the viewer already knows — so replacing it leaves
the metronome matching nothing. If a brief genuinely calls for different music, expect to regenerate
the performance against the new tempo rather than drop a new track under the existing clip, and
verify the beat per generation (§ Failure modes, "no beat"; § Variant axes, `clap tempo`).

**The performer does not speak, so there is nothing here for a speech system to do.** The clip is
generated silent (§ Generation spec — `generate_audio_switch` stays `false`), the mouth is doing
expression rather than dialogue, and the only speech in the finished ad's audio is song lyrics.
**Lyrics stay in their original language** when the block is localised: a Russian or Spanish text
block over an English-language track is the correct output. **No TTS, no voiceover, no dubbing, no
transcription of the track, no lyric captions** — see `references/reference-iteration.md` § Lyrics
are not copy, and they are not localised.

## Generation spec

Two calls per variant, first frame then video, per `references/generation.md`. What differs from
the parent is that both prompts are **expression instructions**, not scene descriptions.

### The prompt that produced the observation set

Quoted in full because its structure is the recipe, and each clause is doing a specific job:

> A medium close-up selfie-style video of a blonde woman in a white baseball cap and black tank top
> inside a car. **She begins with her eyes closed, then opens them into a playful, smug smirk.**
> **Throughout the entire video**, she rhythmically nods her head to the beat while **continuously**
> clapping her hands softly together in front of her chest. Her facial expressions shift dynamically
> with **subtle eyebrow raises, side-glances**, and a confident, cheeky vibe as she **looks at the
> camera before turning her head to the side**. Bright natural daylighting, realistic skin texture,
> and smooth motion.

### The six rules it encodes

1. **Prompt a transition, never an adjective.** "Happy" and "confident" are not renderable
   instructions; a model averages them into a held half-smile. `begins with her eyes closed, then
opens them into a playful, smug smirk` is a start state, a change, and an end state, and that is
   what the model can actually execute. Every expression in the prompt should have a before and an
   after.
2. **Name micro-expressions, not moods.** `eyebrow raise`, `side-glance`, `smirk`, `slow blink`,
   `chin lift`, `eye roll`, `head turn away and back` are motor actions. `cheeky vibe` is a
   summary — keep one as flavour, but never let it carry the work.
3. **Say "throughout the entire video" and "continuously".** Without them the model performs the
   action once, in the first second, and then holds. These two phrases are the difference between a
   clip that claps and a clip that claps _for ten seconds_.
4. **Give the eyeline a route.** `looks at the camera before turning her head to the side` is a
   choreographed path. Eye contact is the reaction landing on the viewer; the turn away is what
   stops it reading as a stare. Without a route, the model picks one eyeline and keeps it.
5. **Put the hands where the text is not.** `in front of her chest` places the clap at 55–80% of
   frame height. That is deliberate: it keeps the hands out of the face band and leaves 50–65%
   readable enough for a plate to sit on. Prompting hands raised near the face destroys the ad.
6. **Ask for the render qualities that stop it reading synthetic.** `realistic skin texture`,
   `smooth motion`, `bright natural daylighting`. Skin and motion smoothness are where generated
   faces give themselves away, and they are cheap to request.

### First frame (text→image)

The first frame is the thumbnail, so **it must already carry an expression**. Prompting a neutral
portrait and hoping the video call finds the performance wastes the one frame most viewers see.

```
Medium close-up selfie-style portrait of <subject>, <wardrobe>, <confined everyday setting>,
caught mid-<named expression: smirk / raised eyebrow / suppressed laugh>, looking <eyeline>,
hands raised in front of the chest as if about to clap,
bright natural daylight, realistic skin texture, shallow depth of field,
9:16 vertical framing, no on-image text, no watermark, no logo, no phone UI, no status bar,
no blank box, banner, sign or caption plate of any kind
```

The image model takes **no negative prompt** — the device-chrome and on-image-text bans go in the
positive prompt, as above; `juicy`'s ad-safe preset appends them for you. Generate three or four and pick the face; this is the cheap step.

### Video (image→video)

The first frame is the input, so the prompt describes **only the performance**. Do not describe the
subject again.

```
Throughout the entire video she continuously claps her hands softly together in front of her chest
and nods her head to the same steady beat. She begins <opening state>, then <the break into the
reaction>. Her expression shifts through <2-3 named micro-expressions>. She <eyeline route>.
Camera locked, no camera movement. Smooth realistic motion.
```

**The clapping is the entire motion budget.** The parent allows a slow push-in or drift; here you
have already spent that allowance on the performer. `Camera locked, no camera movement` is a
required clause — a drifting camera on top of a clapping subject is two motions competing with the
text, and the text loses.

Keep `generate_audio_switch` at its `false` default: the clip is silent and the soundtrack is laid
in the composition. Pin `generate_multi_clip_switch` off — a multi-clip generation breaks the
one-take rule. Record both seeds in `.media/manifest.jsonl`; on this blueprint the seed is what lets
you go back to a face that worked.

### Verify the generation before composing

Generation quality varies more here than on ambient footage, because a face has more ways to be
wrong. Run the gate on every clip before it goes near a composition:

```bash
~/.juicylucy/bin/adsnode <SKILL_DIR>/scripts/check-performance.mjs .media/footage/*.mp4
```

It reports, per clip, the scene-change count, a **face motion index** (face-band motion relative to
the clip's own busiest decile — self-normalising, so grade and shot scale do not skew it), and the
clap tempo with an autocorrelation confidence. `reroll` means regenerate; `review` means put your
eyes on the frames before shipping. Thresholds and their rationale are in the script's header.

## Variant axes

Vary **one axis per round**. The first axis here is not the hook — it is the face.

These govern what differs **between the variants inside a round** — not how far the round sits from
a reference creative. Two separate rules, and conflating them is how a variation drifts into a
different ad: `../references/reference-iteration.md` § How close is close enough owns the other one.
`performer` in particular is one of that page's seven attributes, so varying it here spends the
variation's change budget — hold the setting, framing and palette while you do.

| Axis             | Vary when                                                   | Typical spread                           |
| ---------------- | ----------------------------------------------------------- | ---------------------------------------- |
| `expression arc` | Always. This is the default first round on this blueprint.  | 4–6 generations, copy held               |
| `opening state`  | Testing the thumbnail specifically.                         | 2–3 (eyes closed / mid-smirk / eye roll) |
| `clap tempo`     | The ad is cut to music and the beat should match it.        | 2 (≈90 vs ≈120 BPM)                      |
| `eyeline`        | Suspected the performance reads as a stare, or as evasive.  | 2 (sustained contact vs turn-away)       |
| `performer`      | The face has been won and you want a demographic read.      | 2–3, everything else held                |
| `hook`           | Only after a performance has won. Copy is the second lever. | 3–4 hooks, footage held                  |
| `aspect`         | Never as a test — placement decides it. Ship both.          | —                                        |

`expression arc` displacing `hook` as the default first axis is the substantive difference from the
parent. On a text-overlay ad the words are the variable; here they are the constant, because a
120-character block has far less room to differ than a face does.

**Six generations of one prompt are a variant set, not a seed sweep.** Every clip in the observation
set came from the same prompt and differed only by generation — and they differed a lot, including
one that failed the gate outright. Expect to throw away roughly one in six.

## Failure modes

- **The held face.** The performer claps on schedule with one frozen expression. This is the
  expensive one: it passes lint, check, contrast and every geometry gate, looks acceptable in a
  contact sheet unless you are looking for it, and ships an ad whose entire premise is missing.
  **1 of 6 observed** — face index 0.19 against 0.48–0.62 for the rest. Catch it with
  `check-performance.mjs`, not by eye.
- **No beat.** The prompt asks for rhythm and the generation does not deliver one. **Only 2 of 6
  held a confident steady tempo** (r ≈ 0.68 at 120 BPM); two showed no stable period at all
  (r ≤ 0.29). If the ad is cut to music, verify tempo per generation — never assume the prompt got
  it. If none of the batch keeps time, cut the music to the ad instead of the ad to the music.
- **Text over the face.** Kills the blueprint's entire reason to exist. The block starts below the
  chin, always.
- **A fifth line.** It crosses Meta's 65% wall and renders under the platform's UI. The reference
  and our own first six do this. See § The measured overrun.
- **A neutral first frame.** The video call may find the performance at second three, but the feed
  shows frame 0. Prompt the expression into the first-frame call.
- **Hands.** Generated hands in continuous contact are a known weak spot — count fingers on a
  mid-clap frame before shipping, and re-roll rather than crop.
- **A camera move on top of the clap.** Two competing motions, and the text is the third. Lock it.
- **A silent ad.** The clip is generated silent by design, so the ad ships silent by simply
  forgetting the soundtrack — and a clapping performer over no audio is the most obviously broken
  version of this blueprint there is. § Soundtrack.
- **Mood adjectives instead of transitions.** The prompt reads well and the clip does nothing. See
  § The six rules, rule 1.
- **Reading the arc as a loop.** Fewer than four distinct beats across 8–10s and the viewer sees a
  GIF, not a person.
- Everything in the parent's § Failure modes still applies — animated hook, plate tuned to one
  seed, a plate in the footage, non-standard canvas, looped short clip, claims drifting.

## QA gates

Per variant, before it ships. Gates 1–4 are this blueprint's; 5–10 are the parent's, unchanged.

1. `check-performance.mjs` returns no `reroll` for the clip. Any `review` is looked at and
   consciously accepted.
2. **The expression check.** Pull eight evenly spaced frames and name the expression on each. You
   should be able to name **at least five distinct ones**; four or fewer means the arc collapsed,
   whatever the index said.

   ```bash
   ~/.juicylucy/bin/ffmpeg -i clip.mp4 -vf "select='not(mod(n,29))',scale=240:-1" -fps_mode passthrough -frames:v 8 f%d.png
   ```

3. **The face is uncovered.** Overlay the block and confirm no glyph and no plate edge crosses
   above the chin.
4. **The block is ≤ 4 lines and ≤ 120 characters**, its last glyph row above 65% of frame height,
   glyphs inside 6%–94% of frame width.
5. Frame 0 exported and viewed at thumbnail scale — block legible, no clipped words, and the
   performer is mid-expression rather than neutral.
6. Watched once with **sound off**; the argument lands without audio.
7. **Audio preserved.** Watched once with **sound on**: there is audio, it runs from frame 0 to the
   final frame including any outro, it is the reference's own track unmodified (or the track the
   user asked for), there is no silent tail, and no synthetic voice sits on top of it — the clap
   still lands on the beat it was generated against.

   ```bash
   ~/.juicylucy/bin/ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,duration -of default=nw=1 out.mp4
   ~/.juicylucy/bin/ffmpeg -v error -i out.mp4 -af volumedetect -f null -   # mean_volume near -91 dB = silent track
   ```

8. Last frame is pixel-identical to frame 0 in the text plate, and is a face you would have chosen.
9. Rendered file is exactly the target canvas, H.264, with a **non-silent** AAC audio stream covering
   the video's full duration, duration inside the placement band.
10. Every claim traced to `AD_BRIEF.md` § claims, the compliance gate run per `ad-copy.md`, and
    `.media/manifest.jsonl` records both model ids, both prompts, and both seeds.
