---
id: ugc-testimonial
name: UGC Testimonial
status: live
style: videotestimonial
duration: 15-45s (sweet spot 20-30s)
aspects: 9x16, 4x5
---

# UGC Testimonial

One creator talks to camera on their phone, holding the product, and tells it in their own words:
the problem, the find, the result, the nudge. **The voice and the face are the ad.** Captions carry
the words for the muted scroll; the cut is a human editor's, on the word.

> **The craft travels; this recipe is one tested shape of it.** What makes footage feel like a
> phone video — the camera, the light, the performance, the room tone, the cut — is in
> `../references/ugc-craft.md`, written for any subject and any length: a three-second UGC insert
> inside a long ad, a pet or a pair of hands as the "creator", a three-minute story. Use it whenever
> a piece needs that feel, with or without this blueprint. The limits below say what was **tested**,
> never what is allowed.

> **Measured once, not calibrated.** The recipe below comes from one blind, judged bake-off
> (2026-10-07): seven image-to-video models with native speech, one synthetic creator, one product,
> 68 generations, one judge, and a re-cut of its chains on 2026-10-08. The plugin repository keeps
> the write-up under `docs/long-form-ugc/`. It decides **how** to make the ad. It says nothing yet
> about which ads **win**, so treat the numbers here as starting points and say so in the closing
> reply when you ship against them.

## When to reach for it

- The argument is a **personal story** — "I was skeptical, then…" — and lands better said by a
  person than written in a block.
- The product is a **physical thing, held and shown**: a bottle, a book, a box. Software on a
  screen is a different shape (§ Outside the tested shape).
- The brief names a reference that is a creator talking to camera, single person, single setting
  or a few settings.
- You want to test the **spoken hook** — the first sentence decides the scroll.

### Outside the tested shape

Build these from the same craft (`../references/ugc-craft.md`). Say in the brief and in the closing
reply that the piece goes beyond what was tested, and check every shot (§ Verify every shot).

- **Two or more people talking.** Tested once: a two-line exchange on the role's default model
  worked. Give each speaker their own line and voice line, and check who says what. A recipe for it,
  `multi-creator`, is planned.
- **A long piece (over 45 s, up to minutes).** Chain within settings for as long as the start frames
  still match the cast, re-anchoring only when one drifts. Use the voice anchor when the catalog
  offers it, and let B-roll carry the changes of setting (craft § Continuity across many shots). The natural-pace edit usually suits it better than a jump cut held for three
  minutes.
- **A UGC insert inside another ad.** One or two shots made exactly as here, cut in the jump-cut
  style, inside whatever blueprint carries the rest.
- **A creator who is not a speaking person:** a pet, a pair of hands, a product "filmed" on a phone.
  See craft § Subjects that are not a speaking person.
- **A creator over the user's own footage** (an app, a dashboard). Never generate the screen; the
  user records it. A creator cut out and placed over it is the planned `greenscreen` recipe.

When a different blueprint fits better, use it instead:

- The message fits in a text block: `background-video-text-overlay` makes a verbal argument for
  less money and time.
- The ad is a song with a performer: `clapping-reaction`.

## Anatomy

| Layer          | Contents                                                                 | Duration      |
| -------------- | ------------------------------------------------------------------------ | ------------- |
| 1 · creator    | the speaking shots, cut on the word: muted `<video>` ranges              | full          |
| 2 · speech     | the same shots' own sound: one `<audio>` range per video range           | full          |
| 3 · captions   | the spoken words, phrase by phrase, below the chin                       | while speaking |
| 4 · title      | optional: a short frame-0 line above the head for the muted scroll        | first 2–3 s   |
| 5 · end card   | the brand's outro, over the last shot's own sound — inside the ad, never after it | last ~2 s |

The **band map** is `clapping-reaction`'s, and for the same reason — a medium close-up selfie puts
the face in the middle of the frame:

| Band of frame height | What is there                     | Rule                                                 |
| -------------------- | --------------------------------- | ---------------------------------------------------- |
| 0 – 14%              | ceiling, car roof                 | the platform's top keep-out                          |
| 14 – 20%             | above the head                    | the optional `title`, one line                       |
| **20 – 50%**         | **the face**                      | **never cover it**                                   |
| **50 – 65%**         | chest, the product in hand        | **captions, at most two lines** — never over the label |
| 65 – 100%            | hands, lower body                 | the platform's bottom keep-out                       |

The product sits at chest height, which is also the caption band. Place captions so they **do not
cross the label**: shift them up to the top of the band, or keep them to one line, while the
bottle is raised. The label is the product's proof; a caption across it wastes the shot.

## Shot structure

A sequence of **speaking shots, 5–10 s each**, cut together as jump cuts. Jump cuts are the
native grammar of this format; nobody expects a phone testimonial to be one continuous take.

```
0.0 – 0.3s   THE HOOK STARTS TALKING.
  Speech begins within 0.3 s of frame 0, with the hook's first caption already on screen.
  A silent opening second is a scroll past.

shot 1       THE HOOK — one or two short sentences, the tension or the claim.
               "If your skin looks tired by 3 pm, stop buying concealer."
shot 2–3     THE STORY — what was wrong, what they tried, what changed.
shot 3–4     THE FIND — the product named and raised to the lens, label to camera.
shot 4–5     THE PROOF — one concrete, true result ("three weeks", "two drops").
last shot    THE NUDGE — a short, plain call to action.
last ~2 s    THE END CARD — over the last shot's closed-mouth hold, on its own sound,
               inside the ad's length (`../references/outro.md`).
```

**Duration:** 15–45 s is the range this recipe is written for; the tested ads ran 18–30 s once cut.
Longer works with the continuity craft (§ Outside the tested shape). Of the generated length, the jump-cut edit takes out a quarter to
a third, the natural-pace edit about a sixth: one bake-off chain went from 30 s generated to 21 s
jump-cut and 25 s natural, with no word lost in either.

**One setting, or a few.** Shots in the same setting are **chained**: each one starts from the hold
frame of the one before (§ Generation spec). A new setting — car, then kitchen — starts from a new
first frame of the same creator. Keep it to one or two settings unless the story needs a third.

## Copy slots

The copy is **what the creator says**, one line per shot, verbatim. It goes through the compliance
gate exactly like overlay copy (`../references/ad-copy.md`): **a spoken claim is a claim.**

| Slot      | Limit                                 | Job                                                                 |
| --------- | ------------------------------------- | ------------------------------------------------------------------- |
| `line_1`  | ≤ 2.7 words per second of its shot    | The hook. Speakable in one breath; no brand name yet.                |
| `line_2…` | ≤ 2.7 words per second of its shot    | The story, the find, the proof — one thought per shot.               |
| `line_n`  | ≤ 12 words                            | The nudge. Plain words: "Try it for a month. You'll see."           |
| `title`   | ≤ 40 characters, optional             | A frame-0 line for the muted scroll: `POV:`, a number, a question.   |
| `cta`     | the end card's own slot               | Per `../references/outro.md`.                                        |

**Write for the mouth.** Short sentences. Contractions. No lists, no parentheses, no stage
directions inside the quotes — a model reads "(laughs)" as a word or as scene content. The brand
name once or twice, said the way a person would say it. One concrete number.

**Pacing is a budget, not a target.** 2.7 words per second is the ceiling a shot can hold and still
end on a pause. The bake-off ran at 1.7 words per second and the judge's verdict on the result was
that it felt slow and "not as though something edited by humans"; the cut fixes most of that, and
a line written at 2.3–2.7 words per second fixes the rest.

`COPY.md` has one row per **variant**, with a column per line, a `voice` column pointing at the
brief's `## Voice`, and the usual `rationale` column naming what the row tests.

## Soundtrack

**The soundtrack is the creator's own speech, from the shots themselves.** This blueprint is the
exception to the default that every generated clip is mounted muted: the clip's sound is the
performance, and the bake-off judge scored nothing higher than speech that "really sounds as though
taken inside of a car". It goes into the composition as `<audio>` ranges that mirror the `<video>`
ranges exactly (§ The edit), from a demuxed audio file per shot.

- **Never process the voice.** No denoising, no voice changer, no EQ "clean-up". The room tone is
  what makes it a phone recording; the bake-off judge marked the cleaned voice "clearly AI
  identifiable and a bad sign for ads". Level matching between shots is fine; changing the sound is
  not.
- **No synthetic voice.** No TTS, no voiceover, no dubbing. The words come out of the creator's own
  mouth in the shot, in sync, or the shot is regenerated.
- **Music only when asked.** A UGC testimonial is a person talking; most run with no bed at all.
  When the brief or the user asks for music, generate a bed (`../references/generation.md`) and
  keep it well under the voice — fades, gain and ducking are `/hyperframes-audio`'s.
- **A reference's audio is never reused here.** The default of copying a reference's soundtrack is
  about songs. A reference testimonial's soundtrack is somebody's voice: preserve the reference's
  pacing, structure and energy, never its recording (`../references/reference-iteration.md`
  § Build it as your own).
- **Language:** the creator speaks the market's language. Localising this ad means new lines and
  new shots, not subtitles over the old ones.

## Generation spec

First frame, then video, per `../references/generation.md` — through the motion role's **default
model**, unchanged. Three things are made once per ad and reused by every shot: the creator, the
product and the voice.

### The cast

1. **The creator** — one portrait, head and shoulders, plain background, mouth closed, the wardrobe
   they will wear in every shot. This is the identity reference for every first frame.
2. **The product** — the brand's own packshot when the brand has one; otherwise a generated packshot
   that matches the brand's product truth (shape, colour, the exact label words).
3. **The voice** — a voice description written once into `AD_BRIEF.md` under `## Voice`, and pasted
   **verbatim** into every motion prompt. Order: age, gender, timbre, tone, pace, accent, mic and
   room. It never changes between shots; "same voice as before" means nothing to a model.

   ```
   Voice: a woman in her early thirties; warm, slightly husky, mid-low voice; friendly, candid
   and upbeat; relaxed conversational pace; General American accent; close, dry phone-mic sound.
   ```

### First frames — one per setting

An **edit** with the creator portrait and the product packshot as references, one frame per
setting. A selfie at arm's length, the product at chest height with the **label to camera and
legible**, five natural fingers, **mouth closed**, about to speak.

**The product's own printed label is the product, not on-image text.** The first-frame rule against
text, logos and labels (`../SKILL.md` § Step 3) is about text the model invents and plates waiting
for copy; it does not cover the label on a real product. So: write the label's exact words into the
prompt, and turn off the ad-safe preset on these calls (`--no-preset`), whose ban on text and logos
otherwise fights the label. Every other ban stays in the prompt in your own words — no captions, no
stickers, no device UI, no other text in the scene:

```
Use the person from the first reference image (keep the face, hair and outfit exactly) and the
product from the second (keep its shape, colour and label words exactly: "<label words>").
Vertical 9:16 selfie photo taken on a phone held at arm's length: <name>, <setting>, holding the
product at chest height with the label facing the camera and legible, five natural fingers,
looking into the lens, mouth closed, relaxed, about to speak. Realistic smartphone photo,
natural light, unretouched skin texture.
No on-image text other than the product's own label, no watermark, no other logo. No blank box,
banner, sign, sticker or caption plate of any kind. No phone status bar, no device UI.
```

Make two of each and pick against a checklist before showing the set: label legible and spelled
right, five fingers, mouth closed, the face is the portrait's.

### Each shot

`~/.juicylucy/bin/juicy video generate`, the shot's first frame as `--image`, `--duration` the line's length plus a
second for the hold (at least the model's floor) — and on the **last** shot, plus the end card's
length too, because the card sits over that shot's own sound (§ The edit), and the preset off for the same reason as above,
with the bans the clip still needs as `--negative-prompt "subtitles, captions, watermark, background
music"`. One skeleton for every shot; only the scene, the action and the line change:

```
<hand-off, on a chained shot only:> Continue from the provided first frame; keep her identity,
outfit, lighting direction and camera height.
Vertical selfie video, handheld phone camera, <setting>. <Name>, <one-line description>, holds
<the product> at chest height, label towards the camera, and talks straight to camera with small
natural gestures.
She says: "<the line, verbatim>"
Voice: <the brief's voice description, verbatim>
Sound: only her voice and the quiet room tone of <setting>. No music. No other voices.
No subtitles or captions.
After the last word she stops talking and holds a relaxed, closed-mouth smile.
```

The last line is load-bearing: it puts a clean, closed-mouth frame after the last word, which is
where the next shot starts. It never reaches the ad — the cut ends just after the word.

### Chaining a setting

```bash
~/.juicylucy/bin/adsnode <SKILL_DIR>/scripts/speech-cuts.mjs frame .media/video/<shot>.mp4 .media/first-frames/<next-shot>.png
```

It writes the frame 0.35 s after the last spoken word and prints where it took it. **Exit 3 means
the speech ran to the end of the clip** — there is no clean frame, and chaining from a mid-word face
makes the next shot start mid-word. Regenerate that shot with fewer words or a longer duration;
do not chain past it. Record the extracted frame in the manifest like any other first frame
(`from` naming the shot it came from).

### The same creator in another setting

Between shots of one setting the voice holds (bake-off: speaker similarity 0.85–0.90 along a
four-shot chain). Across settings, a prompt alone lets it drift (0.64–0.83, against 0.90 for one
voice saying two lines and 0.70 for two different voices). A careful listener comparing two clips
back to back could not tell — but it is drift.

The fix is a **voice anchor**, and it is used only when the motion catalog offers a model that takes
a first frame **and** reference audio: `~/.juicylucy/bin/juicy catalog list --role motion` and the model's guidance
say so, and the `juicy-cli` skill names the flags. Then:

1. Generate one **casting shot** from the first setting's frame: the creator saying a line that is
   **not in the script** ("Hi, I'm <name>. I test a lot of <category>, and I'm honest about it."),
   about 10 s. A line from the script would be copied rather than used as a timbre.
2. Take its speech as the anchor, and give it, with the creator portrait, to **every** shot, in
   every setting, on that model:

   ```bash
   ~/.juicylucy/bin/adsnode <SKILL_DIR>/scripts/speech-cuts.mjs anchor .media/video/<casting-shot>.mp4 .media/audio/voice-anchor.wav
   ```
3. Refer to the two in the prompt the way the model's guidance says (for example "<Name> is the
   woman in Image 1." and "Her voice is Audio 1.").

In the bake-off this held one voice across settings (0.93) with lip-sync, face and product intact.

No such model in the catalog → keep the ad to one setting, or accept the drift between settings and
say so in the closing reply. **Do not** fix a voice after the fact with a voice changer: it strips
the room and reads as synthetic (§ Soundtrack).

### Verify every shot before it goes near the edit

Watch each shot with sound, against its line:

- **Every word, in order** — models were verbatim in the bake-off, with one exception in 68 clips,
  and that one opened a chained shot with a stray word and dropped its last sentence.
- **Lip-sync** — the mouth on the syllables, not near them.
- **The product** — same shape, same label, in every frame. A product that turns into a different
  bottle mid-shot is a regeneration, not a cut.
- **Hands and face** — five fingers; the face is still the creator's.
- **No music, no second voice, no burned-in captions.**

A shot that fails any of these is regenerated with `--force`; never cut around a defect inside a
line.

### Choosing the pace

Two edits, both a human editor's, and both judged good on the same chains (2026-10-08). They have
different flavours. Pick one per piece and record it in `AD_BRIEF.md`.

| | **Jump-cut edit** (`--pace jumpcut`) | **Natural-pace edit** (`--pace natural`) |
| --- | --- | --- |
| What it does | Every real pause cut (over 0.45 s); the speech runs on | The take as spoken; only pauses over 1 s shortened |
| How it reads | Snappy, energetic, the edited-creator look | A person talking, one breath at a time; calmer, more confessional |
| Reach for it | Hook tests, short ads (15–30 s), energetic products, younger audiences, TikTok and Reels by default | Trust-heavy categories (health, money, skincare stories), long pieces, a single confession-style take, older audiences |
| The judge's words | "snappier… the pacing is perfect and human-editor like" | "a bit slower, but pacing is great for what it is" |
| Watch for | Cutting so often it feels nervous: on the 0.3 s setting the judge found it "maybe even slightly too frequent", hence 0.45 s | A long pause surviving: an uncut 1.5–2 s pause was the one thing the judge called unnatural |

With a reference, match the reference's pace. Without one, use the jump cut for a hook-led ad and
the natural pace for a story.

### The edit

```bash
~/.juicylucy/bin/adsnode <SKILL_DIR>/scripts/speech-cuts.mjs plan --project . --out cuts.json --pace <jumpcut|natural> \
  --lines lines.json .media/video/<shot-1>.mp4 .media/video/<shot-2>.mp4 …
```

`lines.json` is a JSON array of the verbatim lines, one per shot, in the same order. The instrument
reads each shot's audio, keeps a little before the first word and after the last, removes pauses
longer than the pace allows, and writes:

- `cuts.json` — per shot, the ranges to keep (`mediaStart`, `duration`) already placed edge to edge
  on the timeline (`start`); phrase captions timed to the kept speech; the total `duration`; and
  `maxPause`, the longest pause left in.

On a jump-cut edit, a **punch-in** on every other range — the video scaled 8–12% and centred on the
face — makes consecutive jump cuts read as deliberate. Creator editors use it; it was not tested
here, so check that the product stays in frame at the punched scale.
- `.media/audio/<shot>-speech.m4a` — each shot's own sound, demuxed, for the `<audio>` ranges.

Author **one muted `<video>` and one matching `<audio>` per range**, both carrying the range's
`data-start`, `data-duration` and `data-media-start` — `/hyperframes-core` § Cut one source into
multiple ranges. Put each `<audio>` on the track its piece names (`audioTrack` 0 or 1, as two audio
track indices): ranges laid edge to edge on one track trip `~/.juicylucy/bin/hyperframes lint`'s
`duplicate_audio_track` once their times are rounded. Captions are one clip per phrase from `cuts.json`, set in the caption band, in the
captions-overlay rail style: verbatim, readable at thumbnail size, never over the face or the label.
**The end card goes inside the ad, on the last shot's sound.** A card is silent media, and
`../references/outro.md` forbids an outro appended after the soundtrack ends. Plan with
`--outro <card seconds>`: the last range runs on into the shot's closed-mouth hold for that long,
`cuts.json`'s `outro` says where the card goes (`start`, `end`), and the composition's duration is
`cuts.json`'s `duration` with the card already inside it. **Exit 3 means the last shot ended before
the card did:** regenerate that shot with the card's length added to its `--duration`, or shorten the
card, never below 1.5 s. A music bed, when the brief asks for one, can carry the card instead.

This is ffmpeg as an instrument — it measures and demuxes; HyperFrames still renders the ad
(`../SKILL.md` § Never leave the framework).

## Variant axes

**Text-only variants are variables,** as on every blueprint: the `title`, the end card, caption
style. They share one timeline and render in one batch.

**A spoken variant changes the timeline,** which composition variables cannot carry: a different
hook line or a different creator is a different cut plan. Build each spoken variant as its own
project (`<campaign>-<variant>`), generating its own shots into it; shots it shares with another
variant are copied in with their manifest records. Name and render each project per Step 6.

| Axis       | Vary when                                                       | Typical spread                          |
| ---------- | --------------------------------------------------------------- | --------------------------------------- |
| `hook`     | Always the first round. Same body, a different first shot.      | 2–3 spoken hooks, everything else held  |
| `title`    | Testing the muted scroll on a winning performance.              | 2–3, as variables                       |
| `creator`  | A hook has won and you want a demographic read.                 | 2, script and setting held              |
| `setting`  | The story fits more than one place (car, kitchen, bathroom).    | 2, script held                          |
| `length`   | A long version has a winning hook; test a 15 s cut of it.       | the same shots, a shorter line set      |
| `aspect`   | Never as a test — placement decides it. Ship both.               | —                                       |

`creator` and `setting` each spend a reference variation's change budget when there is a reference —
`../references/reference-iteration.md` § How close is close enough.

## Failure modes

- **Dead air.** A pause of a second or more, a beat of silence at every cut, a smile held at the end.
  It passes every other gate and reads as amateur: the bake-off judge called it jarring, "not as
  though something edited by humans". Cut with `speech-cuts.mjs` at the chosen pace.
- **Nervous cutting.** A jump cut on every breath reads as a glitch reel. Keep the jump cut's
  0.45 s gap, and do not tighten it below the judge's "slightly too frequent" 0.3 s.
- **A slow opening.** The first word arrives after half a second. Frame 0 to first word is the
  scroll-stop; it must be under 0.3 s on the cut.
- **The voice drifts between settings.** Prompt-only shots in two settings sound like two similar
  people. Use the anchor where the catalog allows it; otherwise one setting.
- **The product morphs.** Mid-shot or at a seam, the bottle becomes a different bottle. Seen in the
  bake-off on a model given an identity reference without the product; regenerate, and never ship a
  product that changes.
- **Speech runs to the end of the clip.** No hold frame, so the next shot starts mid-word. Fewer
  words or a longer duration.
- **The line is rewritten.** A word added, dropped or swapped is a claim nobody approved. Listen
  against the line, every shot.
- **The model refuses the creator.** Some models reject photorealistic faces as "likenesses of real
  people", even synthetic ones. A refusal costs nothing and is the model's answer; use the role's
  default model rather than working around a filter.
- **A cleaned voice.** Denoised, re-voiced or levelled into a studio sound, it reads as AI. Leave
  the room in.
- **Music or captions in the clip.** Generated clips will add a bed or burn subtitles unless told
  not to; the skeleton tells them, and the check catches what slips through.
- **A silent end card.** The card added after the speech ends, so its frames have no sound. Plan
  with `--outro` so the card sits over the last shot's own sound.
- **Captions over the face or the label.** The face is what you paid for; the label is the proof.
- **The reference's voice.** Reusing a reference testimonial's audio is using someone else's
  recording.
- Everything in `background-video-text-overlay`'s § Failure modes about non-standard canvases and
  claims drifting from the brief still applies.

## QA gates

Per variant, before it ships:

1. **Every shot was checked against its line** — all words, in order, in sync — and the product,
   hands and face held (§ Verify every shot).
2. **The cut matches its pace:** `cuts.json` `maxPause` ≤ 0.5 s on a jump-cut edit and ≤ 1 s on a
   natural-pace edit, and the first word within 0.3 s of frame 0 on either.
3. **Captions match the speech** word for word and sit in the caption band, never over the face or
   the label.
4. **One voice:** within a setting always; across settings either the anchor was used or the
   closing reply says the voice may drift.
5. Frame 0 viewed at thumbnail scale: a face mid-word or about to speak, the first caption legible,
   the `title` (if any) inside the safe zone.
6. Watched once with **sound off**: the captions carry the argument.
7. Watched once with **sound on**: the creator's voice from frame 0, its room still audible under the
   end card, no music unless
   asked for, no synthetic voice, no processing, the room tone present and even across cuts.
8. Rendered file is exactly the target canvas, H.264, with a non-silent AAC stream for the full
   duration, duration inside the placement band.
9. Every spoken claim traced to `AD_BRIEF.md` § claims, the compliance gate run on the lines per
   `../references/ad-copy.md`, and `.media/manifest.jsonl` records every frame, shot and the anchor,
   each with its prompt and seed.
