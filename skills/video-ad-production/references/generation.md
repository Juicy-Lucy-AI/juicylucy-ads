# Creative generation — `juicy` for every frame, clip and track

Every visual asset in a video-ad-production run is **generated**. Nothing is captured from a website,
and nothing is downloaded ad hoc.

## Which tool makes which asset

- **Everything goes through `juicy`** — the generation command setup installs: first frames
  (`~/.juicylucy/bin/juicy image generate`), first-frame edits, which take a reference frame as input and are how a
  variation's first frame is made (`~/.juicylucy/bin/juicy image edit`; `reference-iteration.md` § Start from the
  reference's own frame), motion and music. Claude Code has no image or video tool of its own. Each
  call freezes its output under `.media/` and records it in the manifest itself.
- **`juicy` unavailable → say so and stop.** Never compose a stand-in frame with a script, a drawing
  library, or a solid-colour plate. A run that ends at "generation is unavailable here" is a good
  outcome; a fabricated set is not.

A signed-out `juicy` is not an unavailable one: you sign the user in here and carry on (§ When
`juicy` is signed out).

How to call `juicy` follows; its flags live in the `juicy-cli` skill, not here. The prompt shape,
the no-text rule, freezing and provenance apply to every image, whichever tool made it.

## The order is always first frame, then video

Never call a text-to-video model directly. Two reasons, both structural:

1. **The first frame is the ad's thumbnail.** The feed shows it as a still before autoplay begins,
   and on a muted, fast scroll it is often the only frame that gets looked at. It deserves to be
   chosen deliberately, not to be whatever a video model happened to start on.
2. **Cost and control.** Images are fast and cheap; motion is neither. Generating four first frames,
   picking one, and animating only that one costs a fraction of generating four videos — and the
   image-to-video call inherits a composition you have already approved, including the negative
   space the text overlay needs.

So: text-to-image → **approve the frame** → image-to-video → freeze both. Verify every first frame
looks right _before_ any video call.

## Calling `juicy`

One command per role. Every call prints one JSON record on stdout, freezes the file under `.media/`
and appends the manifest record itself; errors are JSON on stderr with an exit code to branch on —
`0` ok, `1` API or network, `2` usage, `3` sign-in needed (sign the user in here — § When `juicy`
is signed out), `4` still running (run the `next` command it prints), `5` out of credits (stop; the
user buys a credit pack — the `juicy-cli` skill's § Out of credits). The `juicy-cli` skill is the
reference: its `SKILL.md` for the rules, its command reference
(`commands.md`) for every flag; `~/.juicylucy/bin/juicy <command> --help` prints the same. Read it before the first
call of a run; do not work from memory.

| Role                                                                  | Call                                                                                                                                           |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **First frame** (text-to-image)                                       | `~/.juicylucy/bin/juicy image generate --role first-frame --aspect 9:16 --variant <v> --prompt "…" --project . --max-cost <credits>`                            |
| **First-frame edit** (image-to-image; a variation's frame)            | `~/.juicylucy/bin/juicy image edit --image <frame>.png --variant <v> --prompt "…" --project . --max-cost <credits>`                                             |
| **Motion** (image-to-video)                                           | `~/.juicylucy/bin/juicy video generate --role motion --image .media/first-frames/<v>.png --duration <s> --variant <v> --prompt "…" --project . --max-cost <credits>`            |
| **Soundtrack** (text-to-music)                                        | `~/.juicylucy/bin/juicy audio music --duration <s> --name <name> --prompt "…" --project . --max-cost <credits>`                                                  |

`--aspect` is required on purpose: a model's default aspect is never what an ad wants. `--max-cost`
goes on every call; it refuses before
anything is submitted (exit `2`, `max_cost_exceeded`) and costs nothing. Which model sits behind a
role, its price and its parameters are the service's to decide and to change: `~/.juicylucy/bin/juicy catalog list`
shows the live roles and prices, and `~/.juicylucy/bin/juicy catalog get <model> --request-schema` is where a model's
own parameters live. Nothing in this skill names a model, so a model swap is not an edit here.

**The ad-safe preset is on by default** (`--preset`). On image calls it appends the no-text and
no-device-chrome bans to the prompt — write the composition, not the bans (§ Prompt shape). On
motion calls it supplies the canonical negative prompt; `--negative-prompt` appends to it.

**Repeating a call is free.** The same input returns the existing record with `"reused": true` and
charges nothing. `--force` is how you ask for a new roll: `juicy` runs the model again on a fresh
seed and records it as a new attempt, never an overwrite. Seeds are `juicy`'s to choose and to
write down; `--seed <n>` exists only to reproduce a take whose record you are reading, never as
something to invent.

### When `juicy` is signed out

Exit `3` (`no_credentials`), or the doctor's `juicy-login` line reading `missing not signed in`,
means this Mac holds no JuicyLucy session. (Any other `missing` wording is not that — setup's
§ Step 4 says how to read it.) Signing in is a step **you** run in this conversation, not a chore
you hand over. `juicy`'s error names a `next` command and marks the user's action as required: that
command is addressed to you, and the user's part is to answer a question here — never to run
anything.

1. Keep everything the run has made; nothing before generation depends on the session.
2. Load the `juicylucy-setup` skill and follow its § Step 4 — the sign-in: run `~/.juicylucy/bin/juicy auth help`
   before asking for anything, say in a line what signing in does, and ask for what it names — in
   your own words, as a question in this conversation ("Want me to sign you in here? Tell me the
   email for your JuicyLucy account").
3. Once the sign-in is confirmed (setup's § Step 4 ends by checking it), carry on from the
   generation call that stopped — the user does not have to ask for the ad again.

If the turn has to end before they answer, end it on that offer. Never print a sign-in command for
the user, never send them to Terminal or a browser, and never say "sign in and ask again" — the
user is never handed commands (SKILL.md § Step 5).

### Edit an approved frame; do not re-roll it

Use `~/.juicylucy/bin/juicy image edit` when revising an approved frame rather than generating from scratch: it keeps
the composition you already signed off. **It is also how a variation's first frame is made.** Given a
frame pulled out of the reference video, an edit that changes one or two named attributes holds
everything else — the framing, the light, the room, where the hands sit — which a text prompt
describing the same scene will not. Re-rolling from a description is how a variation quietly becomes
a different ad; `reference-iteration.md` § Start from the reference's own frame has the command and
the boundary.

### The soundtrack has no seed

`~/.juicylucy/bin/juicy audio music` takes a prompt and a duration; the model behind it has no seed, so the same
prompt does not reproduce the same track. Freeze the file you accept, because you cannot regenerate
it — it is the one asset in this workflow whose manifest record cannot be replayed, so the file is
the source of truth. Only when there is no reference to inherit audio from, or the brief explicitly
calls for new music: **a preservation brief reuses the reference ad's own audio** — see
`reference-iteration.md`; do not generate a track for one, and never leave an ad with no soundtrack
at all.

### Sample assets

`~/.juicylucy/bin/juicy sample list` names a small set of ready-made frames, clips and one track — the same on every
account, free to fetch, recorded like any generated asset with `"source": "juicy-sample"`. Use them
when the brief says so, when the point of a run is the composition rather than the footage, or on an
account with no credits:

```bash
~/.juicylucy/bin/juicy sample get person-clapping-9x16-12s --project . --variant <v>
```

A sample is footage, not a stand-in: a run that was asked for generated creative and reaches for a
sample instead has substituted the deliverable. Say so and stop, as with any other unavailable
generator (§ Which tool makes which asset).

### What a round costs

Credits, shown by every call's `cost` and by `~/.juicylucy/bin/juicy credits balance`; `~/.juicylucy/bin/juicy catalog list` prices
each role. The shape has not changed: frames are cheap and fast, motion is neither, so the
discipline is about **regenerations** — explore composition on frames, and every re-roll of an
approved frame throws away an approval you already paid for.

## Rules for every call

- **Aspect is a generation parameter, never a crop.** Generating 16:9 and cropping to 9:16 throws
  away the composition you prompted for and usually eats the negative space.
- **Never invent a seed.** Every record carries the seed the call ran on; a new roll is `--force`,
  a repeat of a recorded take is `--seed <n>` from that record.
- **One variant, one call.** No grid prompts — the manifest needs a one-to-one asset/prompt/seed map.
- **Compositions reference the frozen file, never anything else.** `juicy` hands you no URL: the
  file is already under `.media/`, at the `path` in the record it printed. Use that.

## Clip length and chaining

**The default motion model accepts 5–15 seconds** (`--duration`), and **15s is a hard cap.** Derive
the duration from the timeline, never guess: it is the clip's frame count divided by the composition
fps, as an integer — and **never below 5**. A shot shorter than 5s is generated at 5s and trimmed in
the composition; a shorter `--duration` exits `2` before anything is charged. (`~/.juicylucy/bin/juicy catalog list
--role motion` shows each model's range, should a brief ever need another model.)

In practice treat **3 seconds as the working floor for a shot** — anything shorter is a cut, not a
shot — and because the model's floor is higher than the shot's, trimming a 5s generation is the
normal route for a 3–4s shot, not a workaround.

If a scene needs more than 15s, that is a **structure** error, not a generation one — split it into
chained clips of 15s or less before generating. Fix the structure; do not ask the model for a longer
clip.

**A speaking shot is sized by its line, not by the timeline.** On `ugc-testimonial` a shot's
duration is its line at no more than 2.7 words a second plus a second for the closed-mouth hold, and
the composition then cuts it on the word, so the generated length never reaches the ad. Shots in one
setting chain: each starts from the hold frame of the one before, taken with
`scripts/speech-cuts.mjs frame` — `blueprints/ugc-testimonial.md` § Chaining a setting.

## Audio: the clip's own sound stays out of the ad

**The ad does not use sound from a generated clip unless it genuinely needs it.** Generated audio is
unrelated ambient noise and music, which fights the ad's intended soundtrack or voiceover and shows
up as a defect.

The default motion model **always generates audio** — it has no switch, `--with-audio` changes
nothing on it, and `--no-with-audio` is refused. So every clip file carries a track nobody asked
for, and what keeps it out of the ad is the composition: **mount every generated clip `muted`**
(HyperFrames needs `muted playsinline` on a `<video>` to play it at all), so the root's soundtrack
is the only audio in the render. The sound-on watch in `defect-gate.md` is where a leak would show.
On a model that does have an audio switch (`~/.juicylucy/bin/juicy catalog get <alias>` says which), the clip is
silent unless `--with-audio` is passed — and the failure mode there is switching it on by reflex
when the shot contains a person. Do not. (`--multi-clip` is off for the same kind of reason: it adds
camera changes, which breaks the one-continuous-move rule.)

Muted is correct for b-roll, stop-motion, background loops, and non-speaking characters — which is
almost everything this workflow generates. The exception is a speaking performer: on
`ugc-testimonial` the shot's own speech **is** the soundtrack, laid in as audio ranges that mirror
the cut (`blueprints/ugc-testimonial.md` § Soundtrack).

Use the clip's sound **only** when: the brief asks for it; the clip is a speaking person whose dialogue
belongs in the ad — and then the exact spoken words must be written **verbatim, in quotes**, into
the generation prompt; or a fitting soundtrack from the clip would genuinely benefit the ad. An
explicit human instruction always outranks the silent default.

**A muted clip is not a silent ad.** This rule governs what is taken from the video model; the ad's
soundtrack is laid into the composition at Step 4 and is never absent — `../SKILL.md` § Audio is not
optional.

**There is no text-to-speech role, and that is deliberate.** No blueprint uses synthetic speech:
`background-video-text-overlay` makes its argument in the text block, `clapping-reaction`'s
performer is doing expression rather than dialogue, and `ugc-testimonial`'s creator speaks in the
shot itself — the line verbatim in the prompt, the voice described verbatim in every shot, lip-sync
from the motion model. Do not reach for a text-to-speech, dubbing, voice-changer or transcription
model on any of them. The only speech in their audio is song
lyrics, which stay in their original language even when the ad is localised —
`reference-iteration.md` § Lyrics are not copy, and they are not localised.

## Prompt shape

**First frame.** Prompt the composition, not only the subject. The overlay needs a quiet region and
the model will fill the frame edge to edge unless told otherwise.

The image models take **no negative prompt**, so every ban is an instruction inside the prompt
itself — `juicy`'s ad-safe preset appends this block for you; you write the composition:

```
<subject and setting>, <lighting and mood>, <lens or format cue>,
composed with clean negative space across the <upper|lower> third: a quiet
area of the scene itself, with nothing drawn on it.
No on-image text, no watermark, no logo. No blank box, empty banner, sign,
label, sticker or caption plate of any kind. No phone status bar, no device UI,
no app interface, no screen-recording overlay.
```

`--aspect` is where framing is decided, not the prompt.

**A product held in the shot keeps its label.** The bans above are about text the model invents and
plates waiting for copy. A real product's printed label is product truth: name its exact words in
the prompt and turn the preset off on those calls, writing the remaining bans yourself —
`blueprints/ugc-testimonial.md` § First frames.

The bans matter more than they look: generated on-image text is almost always misspelled, and a
hallucinated logo in a paid ad is a brand-safety problem, not a cosmetic one.

### The footage carries no text and no place for text

"Negative space" means a quiet region of the scene — a wall, sky, a table, fabric. It is never a
drawn shape waiting for words. The caption plate and the copy are **composition layers** (the
blueprint's layers 2 and 3), rendered by HyperFrames at Step 4 from the `COPY.md` variables; the
footage is layer 1 and knows nothing about them.

A plate baked into the image is a defect, not a placeholder. It is sized to no line of copy, it
cannot grow when a localised row runs longer, it cannot be recoloured, and it pins the footage to
one copy row when the whole point of one composition with variables is that every row shares the
footage. So a first frame that comes back with a blank box, an empty banner, a sticker outline, a
sign with nothing on it, or any on-image text is **not approvable**: regenerate it — an edit
(`~/.juicylucy/bin/juicy image edit`, or the image tool) with an explicit removal instruction, or a re-roll — _before_
the set is shown. Never present such a frame
with a promise that the approved copy will fill it later. Nothing in the footage is a slot for copy.

On a variation this is the usual way it goes wrong: the reference's own frame carries the
reference's caption block, and an edit that changes the performer keeps the block and empties it.
The edit instruction must remove the overlay outright and rebuild what sits behind it —
`reference-iteration.md` § Start from the reference's own frame.

**Ban device and app chrome.** Generated visuals routinely arrive with a baked-in phone status bar,
social-app buttons, or a REC dot — an artefact that reads as a screenshot rather than a creative.
Add an explicit ban on device UI, status bars, and camera-capture overlays to every prompt.

**Motion.** The first frame is the input; the prompt describes only what moves. One continuous move.
Do not describe the subject again — the model has it — and do not ask for cuts, scene changes, or a
camera change of intent inside a single clip.

## Freezing and provenance

`juicy` writes it: every call freezes its output under the project's `.media/` and appends the record
to `.media/manifest.jsonl` in the same call — `kind`, `path`, `variant`, `model`, `prompt`, `seed`,
`params`, `source` (`juicy`, or `juicy-sample`), `sha256`, `cost`, and for a video `from`, naming the
first frame. An asset the image tool made is recorded by hand in the same shape, one JSON record per
line:

```json
{
  "kind": "first-frame",
  "path": ".media/first-frames/v03.png",
  "variant": "v03",
  "model": "<endpoint id>",
  "prompt": "<the exact prompt sent>",
  "seed": 123456,
  "params": { "aspect": "9x16" },
  "source": "image-tool"
}
```

`source` names the tool that made the asset — `image-tool`, `juicy`, or `juicy-sample`. The video
record is the same shape with `"kind": "video"` and an added `"from"` naming the first frame's path.
`/media-use` owns this convention; follow it rather than inventing a parallel ledger.

**`~/.juicylucy/bin/juicy manifest verify --project . --require-video` is the Step 3 gate.** It checks that every
record's file exists with its recorded hash, that every video's `from` names a recorded frame, and
with `--require-video` that every first-frame variant has its clip; it exits `1` naming the first
thing wrong. Run it after the set is frozen and fix what it names before going on.

**An asset with no manifest record does not count as generated.** The next round reads this file to
hold footage constant, and "variant 3 won" is worthless if variant 3's seed was never written down.

## Spend discipline

Generation is the only step that costs money per attempt.

- Copy is approved before the first generation call. Never generate to explore copy.
- First frames are reviewed as a set before any motion call.
- A regeneration is a **new** manifest record, not an overwrite — the discarded attempt is part of
  the round's history and its seed may be worth returning to.
- Every frame is a `juicy` call that costs credits per roll, so explore in few rolls, put
  `--max-cost` on every call and let it refuse.
