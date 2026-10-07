# Working from a reference creative

Most ad production is not invention. It is taking a creative that already works — ours or a
competitor's — and producing the next variant of it. The brief usually arrives as "copy this ad,
change X and Y", and that shape has its own discipline: **everything not named as a change is a
thing to preserve**, including the things nobody thought to mention.

## Get the reference onto disk first

You cannot decompose what you cannot measure, and every step below assumes a local file. When the
reference arrives as a Meta Ads Library link, resolve it before anything else:

```bash
~/.juicylucy/bin/adsnode <SKILL_DIR>/scripts/ad-library.mjs fetch \
  --page-id <id> --video-only --limit 6 \
  --out AD_REFERENCES.json --out-dir .media/references
```

The one rule worth carrying in your head: **browse in the browser, download outside it.** Fetching
the media from inside the page throws a status-less `TypeError: Failed to fetch` as soon as the
browser and the network that minted the URL are not the same — which is not a block, and does not
want a workaround built for one. `ad-library.md` has the diagnosis, the `--from-json` route for
agents whose browser tool has no Node module, and the traps (collated duplicates, URL expiry).

That command also returns the reference's own `title`, `body` and `cta_text`, which is better
decomposition input than transcribing text off a video frame.

Then verify what you have, before anything is generated:

```bash
~/.juicylucy/bin/adsnode <SKILL_DIR>/scripts/reference-manifest.mjs verify --project . --min <concepts>
```

**A video ad is iterated from a video ad.** Every question on this page is a question about time —
pacing, cut rhythm, the ending, the soundtrack — and a still answers none of them. A screenshot of
the ad, a poster frame, a thumbnail off the library grid, or the same advertiser's static ad is not
a reference, and the gate rejects one rather than letting an agent reconstruct five answers from
memory. `reference-manifest.md` owns that rule.

## Watch it before you plan it

**No variant is planned from a reference nobody has read through.** Not the poster frame,
not a couple of representative stills, not the general vibe — the whole thing, on a time
axis. A reference is a sequence, and a sequence read as a snapshot loses the only thing a
still cannot carry: what changes, and in what order.

That is not hypothetical. A run once matched a reference's couch, its parent-and-child
framing, its caption plate and its relaxed final mood, and missed that the ad opened on
frustration, dropped mid-way, and paid off happy. The variant reproduced the surface and
the ending, and threw away the argument — which was the arc.

### Write `REFERENCE.md`, one per reference

Six sections. Keep the headings verbatim so the shape is checkable:

- **Summary** — what this ad is and what it is for, in 2–3 sentences.
- **Timeline** — key events with `[MM:SS]` timestamps. Each entry says what is on screen
  **and what the subject is doing or feeling**. This is the section that gets skipped, and
  it is the one that matters most.
- **Visual style** — palette, typography, transitions, motion, footage style.
- **Audio** — music, any dialogue, effects, and where the track's own accents fall.
- **Ad craft** — hook technique, pacing, **emotional arc**, CTA placement and strength.
- **Copy & text** — every on-screen and spoken line, in order of appearance.

### How to read one

You cannot play an mp4, but you can look at it. Dump frames and read them **as a
sequence**, not as evidence for a description you have already written:

```bash
mkdir -p .media/references/<ref>-frames
~/.juicylucy/bin/ffmpeg -i .media/references/<ref>.mp4 \
  -vf "fps=2,scale=540:-1" -q:v 3 .media/references/<ref>-frames/%03d.jpg
```

Two frames a second gives 12–30 stills for a 6–15s ad — 19 for a 9.6s one. Scaled and
JPEG-encoded on purpose: at full resolution that same strip is 17 MB against 1.4 MB, and
540px is ample for naming a facial state. Keep full resolution for the geometry work in
§ Measure it with ffprobe and pixels, where a resized frame would give you wrong numbers.

**Name what the subject is doing in each one** before you summarise anything. Name motor actions and states —
`eyes down`, `brow furrowed`, `head drops`, `looks up`, `breaks into a grin` — not moods.
"Frustrated" is a conclusion; `jaw set, eyes off-camera` is an observation, and only
observations survive being wrong.

Then ask how many **distinct** states you named:

- **Three or more** → the ad has an arc. Write it into `## Ad craft` as start → change →
  end, and give each turn a timestamp in `## Timeline`. Preserving it is not optional; it
  is the argument the ad makes.
- **One, sustained** → a flat arc is a legitimate shape. A single continuous reaction is
  exactly what `clapping-reaction` is built on, and inventing beats for it would be its own
  failure. Say so explicitly in `## Ad craft` — "single sustained state, no arc" — so the
  next reader knows it was determined rather than missed.

The difference between those two is the whole judgement, and writing the states down first
is what makes it a finding instead of an impression.

**The audio is part of the sequence.** Frames cannot show where the track drops or a lyric
lands, and on these blueprints the cut is usually built to it. Render the waveform and look
at that too — the loud and quiet stretches line up with the beats the edit is hitting:

```bash
~/.juicylucy/bin/ffmpeg -i .media/references/<ref>.mp4 \
  -filter_complex "showwavespic=s=1200x240:colors=white" -frames:v 1 \
  .media/references/<ref>-wave.png
```

Read it against the frame numbers: a visible drop that lands where the subject's state
turns is the ad's pivot, and a variant that moves one without the other breaks both.

## Read the brief as preserve-by-default

A preservation brief has two lists, and only one of them is written down:

- **Changes** — what the user enumerated.
- **Preserves** — _everything else_: **the performance — beat order, emotional arc, eyeline
  route** — plus timing, cut rhythm, caption style and position, soundtrack, scene count,
  aspect, ending. The user will not enumerate these, and "everything else remains the same"
  means exactly that.

The performance leads that list deliberately. It is the hardest to notice missing, because
a variant that drops the arc still looks like the reference in every frame you compare —
it just no longer argues anything. `REFERENCE.md` § Ad craft is where you wrote it down;
the preserve list is where it becomes binding.

Before building, write both lists out explicitly. The preserve list is where reference work goes
wrong: a variant that changes the pacing "because it felt better" has failed the brief even if it
looks good.

## How close is close enough

A variation is **the same ad with one or two details different**. Not a new ad in the same genre,
and not a copy.

That is a rule with a number in it, not a figure of speech. The list above fixes the ad's **time**;
this fixes its **look**. On the seven attributes below, **at most two change and the rest are
preserved** — including the ones the user never thought to mention.

| Visual attribute       | What a change looks like                             |
| ---------------------- | ---------------------------------------------------- |
| **subject**            | woman → man; thirties → fifties; another ethnicity   |
| **wardrobe**           | tank top → work shirt; casual → uniform              |
| **setting**            | car interior → kitchen; desk → shop floor            |
| **role read**          | shopper → salon owner; office worker → tradesperson  |
| **framing**            | medium close-up → waist-up; selfie angle → tripod    |
| **palette and light**  | bright daylight → warm evening interior              |
| **props**              | phone in hand → coffee cup; bare desk → product on it |

Everything else — the beat order, the performance, the expression arc, the eyeline route, where the
hands sit, the overlay's position and treatment — is preserved by the list above and is not one of
your two.

Two failure modes, and they are opposite ends of one axis:

- **Too far.** Same blueprint, unrecognisable ad: new performer, new setting, new framing and new
  palette at once. It tests nothing, because nothing was held. This is what an agent produces when
  it is told to "generate its own creative" and given no distance.
- **Too close.** A frame-for-frame reproduction. That is the legal problem § Build it as your own
  names, and it also teaches us nothing the reference's own results had not already told us.

When the user names the change — "same ad, make him a mechanic" — **that is the one change**, and
everything else on the table is preserved. When the user names none — "make a variation of this" —
pick **one**, name it in your reply, and hold the rest.

### This is not the blueprint's variant axis

Two different questions, and conflating them gets both wrong:

|                              | Governs                                                     | Set by                      |
| ---------------------------- | ------------------------------------------------------------ | --------------------------- |
| **How close is close enough** | how far the round sits from the **reference**               | this page — one or two      |
| **Variant axis**             | what differs **between the variants inside** the round      | the blueprint's § Variant axes |

Six generated faces against one held copy line is one axis varying *within* a round — and all six
are still one change away from the reference. Moving the setting *and* the performer *and* the
framing is not "two axes"; it is a different ad.

### Start from the reference's own frame, not from a description of it

Prompting a fresh frame from a written description of the reference is where 80% quietly becomes
40%: everything you did not think to write down gets re-invented. Pull a real frame and **edit** it
instead: `~/.juicylucy/bin/juicy image edit --image <frame>.png --prompt "…" --variant <v>` takes the frame plus an
instruction (`generation.md` § Which tool makes which asset), recorded, for the price of a frame.

```bash
~/.juicylucy/bin/ffmpeg -ss <t> -i .media/references/<ref>.mp4 -frames:v 1 .media/references/<ref>-frame.png
```

Take `<t>` at the reference's first content beat, not frame 0 — a reference that opens on a title or
a cut gives a useless plate.

Then edit toward the one or two attributes that change, naming the preserves in the instruction:

> Same framing, same lens, same room, same light. Replace the woman with a man in his fifties in a
> mechanic's overall. Keep the hands in front of the chest and the eyeline to camera.

**The pulled frame carries the reference's overlay, and the edit has to take it off.** A
competitor's frame arrives with their caption block — plate and glyphs — burned into the pixels.
Say so in the instruction, and say what replaces it:

> Remove the caption block and its background plate completely, and fill in the wall and the
> shoulder behind it so the scene reads as if nothing was ever there.

An edit that keeps the plate's shape and blanks the words has not removed anything; it has produced
footage with a hole in it. The plate and the copy are composition layers laid over the footage at
Step 4 (`generation.md` § The footage carries no text and no place for text), so a first frame
showing an empty box, banner or sticker outline is a failed edit. Re-run it with the removal
instruction. Do not carry it forward as a placeholder for the approved copy, and do not show it to
the user as one.

**For our own previous ads, skip this**: their frames and seeds are already frozen in that project's
`.media/manifest.jsonl` (§ Build it as your own), so re-derive from the seed rather than from a
screenshot of a render.

**The legal boundary does not move.** With a competitor's frame this is a composition scaffold
inside your generation, never a deliverable — the shipped frame must not carry their performer,
their set, or their brand assets, which is precisely what changing an attribute is for. If an edit
comes back looking like the reference with a filter over it, change one *more* attribute, not fewer.

## Decompose the reference first

Never start by describing what the reference looks like. Separate **what makes it work** from **what
it merely is**:

Every question below but one is answered by a single value — a shape, an order, a number, a
classification. The first is answered by a **sequence**, and it is the one that gets lost:
a table of scalars quietly teaches you to look for scalars.

| Question                                                 | Answer goes into                  |
| -------------------------------------------------------- | --------------------------------- |
| **What does the subject do, beat by beat?**              | `REFERENCE.md` → Timeline, Ad craft |
| What is the hook doing? (which hook shape)               | the copy plan                     |
| What is the written argument, in order?                  | the copy slots                    |
| What is the footage doing, and what does it look like?   | the generation prompt — both      |
| What is the pacing? (time to first beat, dwell per beat) | the shot structure                |
| **How does it end?** (see below)                         | the outro decision                |
| Which blueprint is this?                                 | `AD_BRIEF.md` → `blueprint`       |

What makes a reference **work** is usually its hook shape, its performance arc, its argument order,
and its pacing. Reproducing its surface while missing that structure is a real failure, and it looks
like diligence.

The surface is not therefore free to drift. The performer, the room, the framing and the palette are
what make a variant read as *the same ad* — which is the entire reason to iterate rather than invent
— so they are preserved by default too, and § How close is close enough sets how many may move.
Structure first does not mean look-whatever.

## Classify the final scene before you plan it

This is the one classification that changes the build, so do it deliberately:

- The last scene is an **end-card / brand sign-off** — a logo card, a "Shop now" or URL hold, a
  solid-colour outro, **or an app-UI / product-screen final frame** (these look like content but are
  the ad's sign-off) → **do not plan it as a content scene.** It is the outro slot; read
  `outro.md`.
- The last scene is **genuine content that just cuts** → plan it normally, and the ad stays
  **outro-free**. Match the reference.
- **You can't tell** → plan **no outro**.

Enumerate the _content_ scenes; leave the ending to `outro.md`.

## Reuse the reference's soundtrack

**This is the default, not a special case.** Unless the user says otherwise, a variation keeps the
reference's audio: same track, same in-point, unmodified. Both live blueprints are cut to a track
that is usually a well-known song, and the people who unmute are exactly the ones that track was
doing the work on. "Copy this ad exactly", "everything else stays the same", "same soundtrack", and
a brief that never mentions audio at all all resolve to the same answer here.

The reference video already carries it — its own audio track _is_ the soundtrack, so there is no
separate file to find, license, or generate.

Four rules that keep this correct:

1. **Add the audio last** — after the scenes are built and after any outro is placed, so the
   composition length is genuinely final. Place it afterwards and the outro ends up uncovered, and
   the ad closes on silence.
2. **Span the whole composition**, on its own track, from zero to the final frame **including the
   outro**.
3. **The soundtrack is finite.** It holds only as much music as the source ad is long; frames past
   its end render silent whatever duration you set. If the edit would make the ad outlast its
   soundtrack, **shorten the ad** — stretching the audio item is not a fix.
4. **Do not re-cut, re-pitch, re-time, duck, or re-voice it.** Preserved means the same music, in
   the same order, at the same level — not a version of it you improved.

### Lyrics are not copy, and they are not localised

The only speech in these ads' audio is song lyrics. **They stay in the source language, always** —
including when the ad is localised and the overlay copy is translated into a market that does not
speak it. A Russian text block over an English-language track is a correct localisation of these
blueprints, not a half-finished one.

So on `background-video-text-overlay` and `clapping-reaction`, **do not run a speech system at
all**: no TTS, no voiceover, no dubbing, no transcription of the track, no lyric captions. There is
nothing in that audio that needs saying in another language, and a TTS pass can only produce a
synthetic reading of song lyrics laid over the song itself — a defect in every market.

### When not to reuse it

Only an explicit instruction takes the reference's audio away: "use an upbeat track", "swap the
song", "no music". Then generate one — `generation.md` § `cassetteai/music-generator`, which has no
seed, so the accepted file is the only copy you will ever have of that track.

**"Localise it" is not such an instruction**, and neither is a change to the footage, the copy, the
aspect, or the length. And nothing takes the audio away entirely: an ad with no soundtrack is a
defect, not a preserved choice — `../SKILL.md` § Audio is not optional.

## Build it as your own

Every pixel you ship is generated by us. Do not reproduce a **specific person**, a recognisable set,
a trademarked look, or a competitor's brand assets: a shape is not owned, but a specific performer's
likeness is, and a look-alike of one competitor ad also tends to underperform because it reads as
derivative.

Read that as a rule about **identity**, not about resemblance. "Build it as your own" is not licence
to restage the ad — the variant is still meant to be recognisably the same ad, and § How close is
close enough says by how much. Changing the performer is what keeps you clear of the likeness
problem; changing the performer *and* the room *and* the framing is just a different ad.

If the reference is our own previous ad, its frozen media and seeds are already in that project's
`.media/manifest.jsonl` — reuse them directly rather than regenerating.

## Branding is preserved at the reference's level, not raised to ours

**Read the reference's branding level off the reference and match it.** It is a preserved attribute
like the pacing, and it is the one most likely to be overwritten by good intentions.

The references that work in this format are overwhelmingly **native-looking, unbranded UGC** — a
person in a room, a desk, a hand on a phone, footage that reads as something a viewer scrolled into
rather than something a brand made. That plainness is load-bearing: it is why the ad survives three
seconds of a feed. A logo bug in the corner, a brand palette pushed across the footage, a mascot
inserted into a scene that had no character, brand type on every text block — each one moves the ad
from _content_ toward _ad_, which is the axis the reference was already winning on.

So, in order:

1. **The reference has a branded CTA treatment or end-card** — a logo card, a URL hold, a "Shop now"
   frame, a product-screen sign-off → that slot is where our branding goes, and `outro.md` owns it.
   Brand the ending; leave the body of the ad alone.
2. **The reference has no branding anywhere** — it just cuts on the last content beat → **the
   variant has none either.** No outro, no bug, no palette wash. `outro.md` reaches the same answer
   from the other direction.
3. **You cannot tell** → treat it as unbranded.

This is the opposite of the statics habit, and deliberately so. A static ad is a designed surface
where brand identity is much of the argument, and our static workflow starts by opening the brand
asset folder. Video does not: the argument is the performance and the overlay copy, and the brand
kit's job here is the **end-card and the overlay's type**, not the footage.

`brand-kit.md` is still the authority on _what_ our brand looks like when it appears. This section
governs _whether_ it appears.

## Copy in a preservation brief

When the user supplies the ad text verbatim, `ad-copy.md`'s compliance gate **reports rather than
blocks**: build what was asked, then name the specific risk and the rewrite you would suggest in
your closing reply. Do not silently rewrite the user's words, and do not silently ship a
known-rejected pattern without saying so.

## Close the loop

An iteration round is only iteration if the previous round's result came back. When performance data
arrives:

1. Resolve each reported filename to its record — the `ad-naming` tool's `naming.mjs parse "<filename>"` recovers
   the creative name, funnel, source, style, and date.
2. Join it to the copy plan's rationale column, converting "this one won" into "the reframe hook
   beat the named-tension hook".
3. Record the finding in the campaign's `LEARNINGS.md`, one line per round.
4. Promote anything that has held across **two or more rounds** into the blueprint — as a calibrated
   number replacing a `CALIBRATE` placeholder, or a new entry in § Failure modes.

Step 4 is what makes the blueprints improve instead of staying at their initial guess.

## Calibrating a blueprint

Blueprint values marked `CALIBRATE` are reasoned defaults awaiting evidence. Replace one when
either:

- **From references:** at least three reference creatives we consider winners agree on the value —
  measure it (character counts, beat dwell in seconds, time to first beat), don't eyeball it. Check
  they are three **distinct** creatives: the Ads Library lists one creative once per ad instance, so
  a pull of six files is routinely two ads repeated. `ad-library.mjs download` content-hashes each
  file and flags the duplicates for exactly this reason.
- **From results:** two consecutive rounds where the value was the varied axis and the same
  direction won.

State in the commit message which references or rounds justified the change. A calibrated number
with no traceable basis is just a different guess.

### Measure it with ffprobe and pixels, not with your eyes

Eyeballing a contact sheet gets vertical position wrong by ten percent of the frame, which is the
difference between inside and outside a keep-out. What actually settles a value:

- `ffprobe` for duration, canvas, frame rate, codecs, bitrate, and whether an audio stream exists.
- A frame dump (`~/.juicylucy/bin/ffmpeg -vf fps=2`) tiled into a contact sheet to see whether anything changes
  across the clip at all — that is what showed the house shape is one static block, not a sequence.
- Threshold the plate colour on a raw `rgb24` frame to get the overlay's real bounding box, then
  threshold the glyph colour _inside_ it to get the text extents. The plate is not the text: our
  references' plates overrun the side keep-out while their glyphs sit exactly on it.
- Row-coverage scanning across the block gives line pitch and line count, which is what converts a
  safe-zone percentage into a usable "N lines maximum".
- `select='gt(scene,0.15)'` to confirm a cut count, rather than assuming from a sheet.

**Reference media stays out of git.** The files are tens of megabytes each and there is no Git LFS
here to absorb them — committed, they are in every clone forever. Keep the clips in the campaign's
own storage, name them in the blueprint's calibration note, and commit the measurements rather than
the media. The `background-video-text-overlay-references/` directory at the repo root is
gitignored for exactly this.

### The reference set that calibrated `background-video-text-overlay`

Three creatives from one brand, all `FB-textoverlay`, all 9:16, measured 2026-08-17. The filenames
are placeholders in the `juicylucy` naming grammar; the real basenames name a client's creatives and
stay with the campaign, not here.

| File                            | Duration | Canvas      | Codec | Lines | Block chars |
| ------------------------------- | -------- | ----------- | ----- | ----- | ----------- |
| `ES - Reference A - NO HOOK`    | 8.87s    | 1080 x 1920 | HEVC  | 7     | 167         |
| `ES - Reference B - NO HOOK`    | 7.00s    | 1080 x 1934 | HEVC  | 5     | 218         |
| `RU - Reference C - NO HOOK`    | 10.05s   | 1080 x 1920 | H.264 | 9     | 250         |

They agree on structure and geometry, which is what got promoted. They are **not** three independent
winners — one brand, one `NO HOOK` tag, one creative family — and their copy runs four of the seven
patterns `ad-copy.md` records as Meta-rejected. Calibrating claims off them would promote a rejected
line into house style; the blueprint says so at § What not to take from the references.

### The clapping-reaction observation set

Six generations of one prompt, plus the competitor creative that prompt reproduces, measured
2026-08-18. Kept in the campaign's own storage (`videos/ads/people-clapping/.media/`), which is
gitignored — the measurements are committed, the media is not.

| File                           | Duration | Canvas      | Cuts | Face index | Clap BPM (r)       |
| ------------------------------ | -------- | ----------- | ---- | ---------- | ------------------ |
| `reference.mp4` (competitor)   | 9.81s    | 360 x 640   | —    | —          | —                  |
| `bg-01` … `bg-06` (normalized) | 9.79s    | 1080 x 1920 | 0    | 0.19–0.62  | 40–240 (0.20–0.69) |

This is **one prompt's output, not three winners**, so it calibrates nothing under § Calibrating a
blueprint — `clapping-reaction` marks every number `(observed)` and says so at the top. What six
generations of one prompt _can_ establish is **variance**, and that turned out to be the useful
finding: one clip in six shipped a held, expressionless face (index 0.19 against 0.48–0.62), and
only two of six held a steady clap tempo. Those two rates are what the blueprint's generation gate
exists to catch, and they would not have been visible from a single generation.

The competitor reference also supplied a defect rather than a pattern to copy: its five-line block
runs to 69.7% of frame height, 4.7% inside Meta's bottom keep-out. Measuring it is what produced
the blueprint's four-line limit — see `blueprints/clapping-reaction.md` § The measured overrun.

**A face needs a different measurement than a backdrop.** `ffprobe` and pixel thresholding settle
geometry, but they say nothing about whether a performer performed. `scripts/check-performance.mjs`
adds the three that do: scene-change count, a self-normalising face-band motion index, and clap
tempo by autocorrelation of hand-band motion. Run it on every generation before composing.
