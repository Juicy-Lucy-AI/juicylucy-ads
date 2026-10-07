---
name: video-ad-production
description: "Produce paid-media ad creative (Meta / Instagram / TikTok feed, Reels, Stories) — either a new ad from a brief or, more often, a variation of a reference creative that already works ('copy this ad, change X'). Use when the deliverable is an AD that will be uploaded to an ads manager and measured: performance creative, hook tests, before/after, offer ads, UGC-style spots. Creative is generated — the first frame and the motion through the `juicy` command — never captured from a website; copy runs through a Meta-compliance gate; exports carry the Drive-to-Meta filename convention. For a brand launch film or product promo from a website URL use /product-launch-video instead. Formerly /ad-production."
---

> **JuicyLucy's own skill**, not upstream HyperFrames'. `README.md` § How upstream gets in covers
> how this skill stays wired into the router across upstream syncs.

# Video Ad Production

> **This plugin ships the ad path only.** `/product-launch-video` is named below as where
> non-ad work belongs; it is not installed here. Point the user at the HyperFrames plugin
> rather than trying to load it.

> **This runs in Claude Code on a Mac.** If this is not Claude Code on the user's own Mac — the
> request came from claude.ai chat, Cowork or the mobile app, whose code sandbox is not the user's
> Mac — say that ad production renders on the user's own Mac inside Claude Code, point them there,
> and stop. Do not plan, write copy, or generate anything from a surface that cannot render the
> result.

Turn a product and an offer — or a reference creative and a list of changes — into paid-media ad
variants, cut to a platform spec and named so an ads-manager report can be traced back to the exact
hook, blueprint, and generation seed that produced it.

## What makes this different from a launch video

`/product-launch-video` produces **one film**. This produces **measurable creative**.

| Launch film                    | Paid-media ad                                     |
| ------------------------------ | ------------------------------------------------- |
| One deliverable, approved once | Variants shipped together, judged by the platform |
| Story arc across 30–90s        | Hook on frame 0, payoff by 3s, 6–15s total        |
| Assets captured from the site  | Assets **generated** — first frame, then video    |
| Sound design carries emotion   | Read sound-off, **never shipped silent**          |
| Copy is brand voice            | Copy passes a **Meta compliance gate**            |
| Filename is `video.mp4`        | Filename is the ad's primary key                  |
| Success = the user approves    | Success = the next round beats the last           |

If the ask is a brand film, a site tour, or a promo not going into paid distribution, stop and use
`/product-launch-video`.

## Before Step 0: is this machine set up?

Everything this skill does runs through tools the `juicylucy-setup` skill installs — the renderer
that `~/.juicylucy/bin/hyperframes init` already needs at Step 0, the encoder, the `juicy` generation command — and
a machine that has never run setup has none of them. So **the first command of every run**, before
a reference is opened or a brief is asked about, is the setup skill's doctor in preflight mode:

```bash
sh "${CLAUDE_SKILL_DIR}/../juicylucy-setup/scripts/doctor.sh" --preflight
```

Claude Code fills in this skill's own directory; the setup skill sits beside it in the plugin's
`skills/` folder.
The doctor is read-only, takes a few seconds, reaches no network, and prints one line per
requirement, ending in a `preflight` line that is the verdict:

- **`preflight ok`** (exit 0) — the toolchain is installed and reachable. Go on to § Pick the
  path first. If another line reads `missing` — `juicy-login`, a `juicy` other than the
  pinned version — note it and continue; none of it blocks the brief. Not being signed in is
  something you fix here when Step 3 needs it, by signing the user in in this conversation
  (`references/generation.md` § When `juicy` is signed out) — never a command they run.
- **`preflight missing`** (a non-zero exit) — setup has not been run on this machine, or was not
  run to the end. **Do not start the ad.** Load the `juicylucy-setup` skill and run it from its
  Step 1 through to the sign-in: it diagnoses, explains what is missing in plain words, asks before
  installing, and needs no restart. Tell the user the ad starts when they ask for it again after
  setup — nothing from this run needs carrying over, because nothing has been written yet.

Running the doctor is not a question and not a stop (§ One gate, and nothing else asks). Do not
substitute a check of your own — `which hyperframes`, whether `~/.juicylucy` exists — for it: the
doctor knows where setup puts things and which renderer version these skills were written against.

## Pick the path first

Two shapes arrive, and they run differently:

- **Variation from a reference** — "copy this ad and change X", a reference video plus edits. This
  is the common case. **Read `references/reference-iteration.md` before anything else**: read the
  reference through on a time axis and write `REFERENCE.md` before planning anything (§ Watch it
  before you plan it), everything the user did not name as a change is a thing to preserve —
  **the performance arc first** — the variant changes **one or two visual attributes and no more**
  (§ How close is close enough), and the reference's ending decides the outro. If the reference is a Meta Ads Library link rather than a file, get it onto disk first —
  `references/ad-library.md` — and register it in the reference manifest, which is Step 0's hard
  gate (`references/reference-manifest.md`). **A video ad is iterated from a video ad**: a
  screenshot, a poster frame, or the same advertiser's static ad is not a reference, and the gate
  rejects one.
- **New ad from a brief** — no reference. Runs the full path below, and is the only case that gets a
  brand outro by default.

## Audio is not optional

**Every ad this skill ships carries a real soundtrack.** "Works with sound off" is a claim about the
**overlay copy** — the argument has to land for a muted viewer — and it is never permission to
deliver a silent file. A muxed silent AAC track satisfies the container and fails the ad.

Where the audio comes from, in this order:

1. **There is a reference → copy its audio, unmodified.** Both live blueprints are cut to a track,
   usually a recognisable song, and that track is part of why the reference works. Same track, same
   in-point, full duration — see `references/reference-iteration.md` § Reuse the reference's
   soundtrack.
2. **The user asked for something else → do that.** "Swap the song", "use an upbeat track", "no
   music at all" all outrank the default. An explicit instruction is the only thing that changes an
   ad's audio.
3. **No reference and no instruction → generate a music bed** for the full duration —
   `references/generation.md` § `cassetteai/music-generator`.

A fade-out or a gain change on a **generated** bed is `/hyperframes-audio`'s job: it owns fades,
track gain and ducking on audio already placed in the composition. A **preserved reference track is
never** ducked, re-timed or processed — `references/reference-iteration.md` § Reuse the reference's
soundtrack forbids it, and the audio skill's tools do not change that.

**No TTS, no voiceover, no dubbing on either live blueprint.** Their audio is a song; the only
speech in it is song lyrics, and **lyrics stay in their original language** even when the ad is
localised into a market that does not speak it. A Spanish text block over an English-language track
is a correct localisation, not a half-finished one.

## Workflow

Step 3 is the one user gate. Nothing else is.

```
first   preflight  → doctor.sh --preflight; the setup skill first when it fails
Step 0  brief      → hyperframes init <campaign>, then AD_BRIEF.md
Step 1  blueprint  → the ad type is chosen and its file is read
Step 2  copy       → COPY.md, through the compliance gate
Step 3  generate   → .media/ + .media/manifest.jsonl
Step 4  compose    → index.html, one composition, variants as variables
Step 5  validate   → the defect gate, then the Studio preview handed to the user
Step 6  name+render→ export-naming.json + variants.json + renders/
```

### One gate, and nothing else asks

A stop is required only when the next step spends significant money (paid generation: motion, or a
provider image batch), significant time (a batch of many generations or localizations), or writes
outside the workspace irreversibly. Everything else: decide, do, report what you did.

That one gate is the **whole** of what the user decides during a run. Everything else is you
executing a plan they can see in the brief, the copy matrix and the editor, and it runs without
checking back. A gate is a review, never a permission prompt:

| Gate       | What they are looking at     | The decision                                                        |
| ---------- | ---------------------------- | ------------------------------------------------------------------- |
| **Step 3** | The first frames, as one set | Whether the look is right — before any of it is paid for as motion. |

**Do not stop anywhere else.** Specifically, none of these is a question:

- **Running the setup doctor before Step 0.** Read-only, a few seconds, and its verdict alone
  decides whether the setup skill runs first (§ Before Step 0).
- **Choosing the blueprint (Step 1).** Name it in one line and go on; the choice is visible in the
  brief and the copy matrix, and the user redirects at Step 2 if it is wrong.
- **The copy matrix (Step 2).** Write it, run the compliance gate, record the verdict, and go on.
  Clean copy needs no approval; risky copy gets named in the closing reply with a compliant
  alternative; and the user changes any line in the editor after the ad is built, before it is
  localised. Copy is never what a run waits on.
- **Sending a prompt or an image to the image tool, or running `juicy`.** The plan is the brief's and
  the review is Step 3's batch; a per-call confirmation re-asks a settled question and teaches the user to approve without
  reading. Generate the whole set, then show the whole set — that batch *is* the Step 3 gate.
- **Moving to the next step with nothing to show.** A step that produced nothing for the user to
  look at has nothing to review. Go on and say what you did.
- **Reading, listing, or probing anything inside the project** — a reference with `ffprobe`, the
  manifest, a snapshot, `.media/`. All reversible, all invisible in the output.
- **Re-running a gate after a fix.** The fix loop is capped at 2 rounds precisely so it does not
  need supervising.
- **Handing over the editor (Step 5) and rendering (Step 6).** The preview URL is the final
  presentation, not an approval: give it, render, and put both in the closing reply. Rendering costs
  minutes, not money, and what the user changes in the editor afterwards is a new render.

If the runtime raises its own approval prompt for one of these — a project folder that happens to
live inside Google Drive or iCloud, a command it wants confirmed — that is the sandbox asking, and
the answer is to approve it and continue. Do not forward it to the user as though it were a creative
decision, and do not stop the run on it.

A signed-out `juicy` is the one thing outside the gate that waits on the user, because only they
can answer it: ask for what `~/.juicylucy/bin/juicy auth help` names, in the conversation, and carry on once they
are signed in (`generation.md` § When `juicy` is signed out). It is an account question, never a
command handed over.

The failure this prevents is the one that actually happened: a user asked to approve things they had
no basis to judge, until the real gates were indistinguishable from the noise around them.

**Offers ride inside the gate.** What the plugin can add beyond the blueprint's own recipe — a beat
grid, a sound mark under the offer, a draft on a shareable link — is listed in
`references/capabilities.md`, one row per capability with the signal that earns it a mention and
where it is offered. Every applicable offer is one or two lines folded into the Step 3 gate's ask,
made once and answered with the gate's reply; it is never a stop of its own. A capability that only
matters after the gate — a shareable link for someone who is not at this Mac — is named in the
closing reply, not asked. Write accepted ones to `AD_BRIEF.md` under `## Extras` as they are
accepted.

### The campaign directory IS the HyperFrames project

Create it with `~/.juicylucy/bin/hyperframes init` and put everything inside it:

```
videos/ads/<campaign>/         ← hyperframes project root
├── index.html                 the composition
├── hyperframes.json
├── .media/                    frozen assets — INSIDE the root, deliberately
├── AD_BRIEF.md · COPY.md
├── variants.json              one row per variant
└── renders/
```

**Media must live under the project root.** Compositions are served with the
project root as their base URL, so every asset path is root-relative
(`.media/video/hook-a.mp4`) and a path that climbs out with `../` fails
`invalid_parent_traversal_in_asset_path` — plus `missing_local_asset` and
`audio_src_not_found`, because the file genuinely is not in the project.

A nested project (`<campaign>/hf/` beside `<campaign>/.media/`) puts the media
one level out of reach and is unfixable without moving one of them. `init`
refuses a directory that already has files in it, so **create the project first
and write the brief into it** — not the other way round.

## Never leave the framework

**Every ad this skill ships is rendered by HyperFrames.** It is the only route,
not the preferred one, and there is no fallback path to a hand-assembled file.

If the render path is blocked — a composition that will not validate, a tool
that will not run, an asset the compiler rejects — **stop and report the
blocker.** A run that ends at "Step 4 is blocked because X, here is what I
tried" is a good outcome. Assembling the deliverable another way is not, even
when the result looks right.

An ffmpeg pipeline that burns text and muxes audio can produce four plausible
mp4s in a minute. What it cannot produce is anything the rest of this skill
operates on: no composition to lint, nothing for `check` to open, no snapshots,
no seeds joined to a copy row, no export naming. The gates do not fail — they
have nothing to inspect, so the ad ships untraceable and silently outside
every rule the blueprints encode. This has happened; it is why the rule is here.

Run ffmpeg and ffprobe freely as **instruments** — probing a reference, dumping
a contact sheet, pulling a frame to edit, checking a render is not silent. Never
as the renderer.

---

## Step 0: Brief

Create the project, then write the brief into it:

```bash
cd videos/ads && ~/.juicylucy/bin/hyperframes init <campaign> \
  --non-interactive --example blank --resolution portrait --skill video-ad-production
```

Use `--resolution portrait` for `9x16`, `square` for `1x1`; a `4x5` feed ad starts from
`portrait` and sets its own `data-width` / `data-height`. Everything from here happens
inside that directory.

### Resolve the brand

**This skill knows no brands.** It carries no product facts, no palette, no claims —
those belong to whichever brand the ad is for, and each one ships as its own skill,
named `brand-<slug>`. Resolve it before writing the brief, because almost every field
below depends on it:

- **Exactly one `brand-*` skill available** → that is the brand. Load it and proceed,
  naming it in your reply so the choice is visible rather than assumed.
- **Several** → list them and ask which.
- **None** → say plainly that no brand is installed, then create one before going on:
  the `juicylucy-setup` skill's `extending.md` § Creating the first brand — ask for the
  product facts, write them into a `brand-<slug>` skill in the user's own skill folder
  from the template there, and read that skill for the rest of this run. Do not
  build from facts that live only in the conversation: the next ad would start from
  nothing again.

**Never adopt the branding visible in a reference ad.** A reference is usually a
competitor's, and its name, logo, offer and landing page belong to whoever made it —
using them is a legal problem, not a fallback (`references/reference-iteration.md`
§ Build it as your own). "I could not find a brand" is a reason to ask, never a reason
to become the reference.

The resolved brand owns product truth, the claims that may not be made, the palette and
type, and the end card. Read it before Step 2, not during.

Get to a written `AD_BRIEF.md` before anything is generated. Generation costs money per attempt, so
the brief is the cheapest place to be wrong. Ask only what is missing.

| Field                    | Meaning                                                                   |
| ------------------------ | ------------------------------------------------------------------------- |
| `campaign`               | kebab-case campaign id — the directory name                               |
| `brand` / `product`      | the resolved brand skill and what it sells — see § Resolve the brand      |
| `offer`                  | the commercial ask (discount, trial, bundle, none)                        |
| `audience`               | specific enough to change the copy                                        |
| `platform` / `placement` | `meta` / `tiktok`; `reels` / `feed` / `stories`                           |
| `aspect`                 | derived from placement — Reels & Stories `9x16`, feed `4x5`, square `1x1` |
| `duration`               | seconds; 6–15 unless the brief argues otherwise                           |
| `blueprint`              | the ad type, or blank and decided at Step 1                               |
| `variants`               | how many ship this round                                                  |
| `reference`              | path or URL of the reference creative, or `none`                          |
| `claims`                 | what may and may not be said, verbatim                                    |
| `sound`                  | `reference` (default with a reference), `music`, or `vo` — never silent   |

For a preservation brief, add two explicit lists under `## Changes` and `## Preserves`, and name
which **one or two visual attributes** move — subject, wardrobe, setting, role read, framing,
palette, props. Everything else on that list is preserved, whether or not the user mentioned it.
See `references/reference-iteration.md` § How close is close enough.

**Gate:** every field filled or marked `n/a`; the claims constraint read back verbatim; for a
preservation brief, both lists written down with **at most two visual attributes** in the change
list; a `REFERENCE.md` written for each reference, its `## Timeline` carrying timestamps and its
`## Ad craft` naming the emotional arc or stating there is none (`references/reference-iteration.md`
§ Watch it before you plan it); and every reference **registered and verified** — a library link is
not a reference until it is a playable local video with its source id recorded:

```bash
~/.juicylucy/bin/adsnode <SKILL_DIR>/scripts/reference-manifest.mjs verify --project . --min <concepts>
```

That command must exit 0 before anything is generated. It fails on a citation with no file, a still
standing in for a video, a missing source id, an unplayable file, and on collated duplicates filling
concept slots. `references/reference-manifest.md` owns the rule; `references/ad-library.md` is how
the files arrive. A brief with `reference: none` skips it.

---

## Step 1: Choose the ad type

Read `blueprints-index.md`, then read `blueprints/<id>.md` in full. The blueprint owns the shot
structure, the overlay contract, the generation prompts, and the variant axes — do not improvise
those here. With a reference, the reference selects the blueprint and usually pins several axes as
held constant.

**Gate:** one blueprint id recorded in `AD_BRIEF.md`, and its file read. State the choice in one
line and continue — this is not a stop.

---

## Step 2: Copy

Read `references/ad-copy.md`, then write `COPY.md` — one row per variant filling the blueprint's
copy slots, plus a `rationale` column naming which hook shape each row tests. That column is what
makes the next round's results readable.

**The compliance gate never stops the run** (`ad-copy.md` § When this gate blocks a line, and when
it only reports one). When you are authoring the copy, a line that breaks a rule is fixed before it
ships and the fix recorded. When the user supplied the copy verbatim, it is built as given: that
branch outranks every rule, the brand's compliance overlay and its hard rules included. In both
cases the closing reply names every remaining risk — the platform pattern, the brand rule, the
product-truth conflict — with a compliant alternative for each. Never silently rewrite the user's
words; never silently ship a known-rejected pattern.

This is the last free step — after it, attempts cost money — but it is not a stop. Copy that is
clean, already approved, or the user's own needs no sign-off, and any line can be changed in the
editor after the ad is built and before it is localised.

**Gate:** one complete row per variant, every slot within its character limit, compliance gate run
and its verdict recorded — then continue.

---

## Step 3: Generate the creative

Read `references/generation.md`. **First frame, then video** — never text-to-video directly. The
first frames and the motion both come from `juicy` (`generation.md` § Which tool makes which asset,
and § Calling `juicy` for the commands).

**Signed out?** A `juicy` call that exits `3` means you sign the user in here, in the conversation —
ask for what `~/.juicylucy/bin/juicy auth help` names, then carry on — and never a command for them to run
(`generation.md` § When `juicy` is signed out).

Generate every variant's first frame without pausing, then **show the user the whole set at once and
wait** — this is the Step 3 gate. Motion is the expensive half, so a look that is wrong is far
cheaper to catch here than after it moves. One batch, one review: never a frame at a time, and never
a permission prompt per generation call.

**On a variation, the first frame is an edit of the reference's own frame**, not a fresh render from
a description of it — `references/reference-iteration.md` § Start from the reference's own frame.
That is what holds the five attributes you are not changing.

**A first frame has no text and no place for text.** Negative space is a quiet region of the scene,
never a drawn box waiting for copy: the plate and the copy are composition layers, laid over the
footage at Step 4 from the `COPY.md` variables. A frame that comes back carrying a blank plate, an
empty banner or sign, a sticker outline, or any on-image text fails this gate before the user sees
it — regenerate, and never show it with a promise that the approved copy will fill it later.
`references/generation.md` § The footage carries no text and no place for text.

`juicy` freezes every asset it makes under `.media/` and writes its `.media/manifest.jsonl` record
— model, prompt, seed, hash — in the same call; an asset from the image tool is recorded by hand in
the same shape. Then run the gate, `~/.juicylucy/bin/juicy manifest verify --project . --require-video`, and fix what
it names before going on. Generated clips are **mounted muted** — the default video model bakes
ambient sound into every clip, and it fights the ad's soundtrack. That is a rule about the **clip**, not
about the **ad**: the soundtrack goes in at Step 4, and it is never absent (§ Audio is not optional).

**Demux the soundtrack to an audio file.** An `<audio>` element must point at an audio
asset — hand it an `.mp4` and the render fails at compile with *"composition asset(s) do
not match their authored media element type (expected: audio)"*. The reference's track
lives inside its video, so extract it once:

```bash
~/.juicylucy/bin/ffmpeg -i .media/references/<ref>.mp4 -vn -c:a aac -b:a 160k .media/audio/reference.m4a
```

Copying the stream, not re-recording it: this is still the reference's own audio,
unmodified, which is what § Reuse the reference's soundtrack requires.

**Gate:** the first-frame set shown as a batch and approved by the user; every variant then has a
frozen first frame and video, each with a manifest record; nothing references a remote URL.

---

## Step 4: Compose

**One composition — `index.html` — with the variants as variables.** Not one HTML file
per variant: `check` and `snapshot` take a project directory and always open its
`index.html`, so variants sitting in `compositions/` cannot be validated at all, and a
blank root beside them fails lint as `blank_root_with_standalone_composition`.
`compositions/` is for the *scenes* of one ad, mounted from `index.html` — not for
sibling deliverables.

**Replace the scaffold, do not build around it.** `init --example blank` writes a placeholder
`<h1 id="title" class="clip">Title</h1>` spanning the root's first 10 seconds, and centres
`#root` with flexbox. Delete the placeholder clip and restyle `#root` for the blueprint's layout.
Left in, "Title" renders over the ad in every variant, and `lint` does not flag it.

Declare the copy slots the blueprint names as variables on `<html>`, and bind them
declaratively — no script needed:

```html
<html data-composition-variables='[
  {"id":"hook","type":"string","label":"Hook","default":"..."}
]'>
  ...
  <div class="clip" data-var-text="hook" ...>fallback text</div>
```

`data-var-text` substitutes an element's text, `data-var-src` its `src`, and every scalar
also lands as a `--{id}` CSS custom property. Keep a real fallback in the markup so
preview works with no overrides. Details in `/hyperframes-core`
§ Variables and Media.

This is why `COPY.md` is a table with one row per variant: that table becomes
`variants.json` at Step 6 with no restructuring.

Background video plays as framework-owned media; the overlay is a separate track. Load
`/hyperframes-core` for the composition contract and `/motion-doctrine` before authoring
motion. Ad text motion is deliberately restrained — read the blueprint's overlay section
before reaching for the animation catalog.

If the ad ends on a brand card, read `references/outro.md` **now**, not after — the outro comes out
of the ad's length, not on top of it.

**Lay the soundtrack in last**, on its own track, spanning frame 0 to the final frame including any
outro — the reference's own audio unless the user asked for something else (§ Audio is not
optional).

**Gate:** `~/.juicylucy/bin/hyperframes lint` is clean; the composition names its frozen media by
**root-relative** paths (`.media/...`, never `../`); every copy slot the blueprint names is
a declared variable with a fallback; a full-duration audio track is present, pointing at an
audio file; nothing of the scaffold's placeholder is left (no clip still reading `Title`).

---

## Step 5: Validate, then hand over the editor

Read `references/defect-gate.md` and run it. It covers `lint`, `check`, snapshots, the ad-specific
defects those tools cannot name, and the four manual checks (frame 0 at thumbnail scale, one watch
with sound off, one watch with sound **on**, the final frame alone). The fix loop is **capped at 2
rounds**.

### Then open the editor — every time

When the gate is clear, **open the Studio preview and give the user the URL**:

```bash
~/.juicylucy/bin/adsnode <SKILL_DIR>/../juicylucy-setup/scripts/studio-brand.mjs
~/.juicylucy/bin/hyperframes preview --background
```

The first line gives the editor JuicyLucy's logo and colour. It prints nothing, always succeeds and
changes nothing a second time, so there is nothing to check or report about it. `--background` keeps the server alive after the command returns, which
a plain `preview` does not do from an agent shell. Fetch the URL once and make sure it answers before handing it over.
Hand over the project URL (`#project/<name>`) and say in one line what they are looking at and what
they can change directly in it. This is the final presentation, not an approval: go on to Step 6 in
the same run, and put the URL beside the filenames in the closing reply. What they change in the
editor afterwards is a new render, not a blocked one.

This is not optional and it is not conditional on the ad looking difficult. The user reviews ads in
the editor, where they can drag a caption off a face and see the result — not by reading a
description of the composition, and never by being handed commands to run themselves. A run that
ends with "here's how to preview it" has moved our work onto the person least equipped to do it.
`/hyperframes-cli` § Two different preview surfaces covers the surface itself; the rule that it is
always reached is here.

If `preview` will not start, that is a blocker to report in plain words — not a reason to fall back
to instructions. Say what failed, offer the snapshots you already have from the defect gate, and ask
whether to render anyway.

**Gate:** nothing `detected`; manual checks done per variant; any `unknown` checks noted as caveats;
the preview URL handed over.

---

## Step 6: Name and render

Read `references/naming.md`. Author the export naming record with the `ad-naming` skill's tool —
never a filename by hand. `<SKILLS_DIR>` is the directory holding the installed skills, the parent
of this one:

```bash
~/.juicylucy/bin/adsnode <SKILLS_DIR>/ad-naming/scripts/naming.mjs get --project .
~/.juicylucy/bin/adsnode <SKILLS_DIR>/ad-naming/scripts/naming.mjs set --project . \
  --creative-name "<name>" --funnel <TOF|MOF|BOF> --source <source> --style <fb-style>
~/.juicylucy/bin/adsnode <SKILLS_DIR>/ad-naming/scripts/naming.mjs expand --project . --ratio <ratio> --markets <codes>
```

You author four fields; ratio, market token, and date are the system's. Resolve funnel / source /
style from the reference's filename first, then the brief, then ask. The record is the project's
`export-naming.json`.

**Render every variant in one batch.** Write `variants.json` — a JSON array with one row
per row of `COPY.md`, each key a declared variable — and hand it to the renderer:

```bash
~/.juicylucy/bin/hyperframes render --batch variants.json --strict-variables
```

One output per row. `--strict-variables` is not optional: without it an undeclared or
misspelled key is a warning, so a variant renders carrying the composition's fallback copy
instead of its own and looks fine until someone reads it.

Batch output names are the project's, not ours, so rename each file to its export name
from the naming record afterwards — that mapping is what `renders/manifest.jsonl` records.

Then append to `renders/manifest.jsonl` linking each file to its copy row, blueprint, and
generation seeds.

**Gate:** the record is `complete: true`; every variant rendered and recorded. The final reply lists
the filenames, states what varies between them, and names every compliance risk the copy gate
recorded, each with its compliant alternative.

---

## Reference map

| Read                                                                     | When                                                             |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| the `juicylucy-setup` skill's `scripts/doctor.sh --preflight`            | **First**, every run: whether this machine can make an ad at all; the setup skill runs first when it cannot. |

| `[references/reference-iteration.md](references/reference-iteration.md)` | **First**, whenever there is a reference creative.               |
| `[references/reference-manifest.md](references/reference-manifest.md)`   | Step 0: the gate — every reference on disk, playable, traceable. |
| `[references/ad-library.md](references/ad-library.md)`                   | Step 0: the reference is an Ads Library link, not a file.        |
| `[blueprints-index.md](blueprints-index.md)`                             | Step 1: pick the ad type.                                        |
| `[references/ad-copy.md](references/ad-copy.md)`                         | Step 2: write copy; the compliance gate.                         |
| `[references/generation.md](references/generation.md)`                   | Step 3: the image tool, the provider's models, prompts, freezing, seeds. |
| the resolved `brand-<slug>` skill                                        | **Step 0**: product truth, claims, palette, type, end card.       |
| `[references/outro.md](references/outro.md)`                             | Step 4: whether and how the ad ends on the brand card.           |
| `brand-<slug>` § `outro-card.md`                                         | Step 4: fetch and verify the end-card.                            |
| the `ad-platform` skill's `platform-specs.md`                             | Step 0 and 5: aspect, safe zones, duration caps. Shared platform truth, installed as a sibling skill. |
| `[references/defect-gate.md](references/defect-gate.md)`                 | Step 5: the gate and the fix playbook.                           |
| `/hyperframes-cli`                                                       | Step 5: `preview` — the Studio surface the user reviews in.       |
| `/hyperframes-audio`                                                     | Steps 4–6: fades and gain on a generated bed, never on a reference track.|
| `[references/naming.md](references/naming.md)`                           | Step 6: the export naming record.                                |
| `/hyperframes-core` · `/motion-doctrine` · `/media-use`                  | Step 4: composition, motion, media.                              |
| `[references/capabilities.md](references/capabilities.md)`               | Any gate: what may be offered there, and what must not be.       |
