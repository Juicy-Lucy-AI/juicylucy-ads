# Capabilities — what HyperFrames can bring to an ad

The shipped list of what this plugin can add to an ad beyond the blueprint's own recipe, written
for offering: each row says when the signal is present, how to say it to the user, and where the
capability lives. It is the ad-path counterpart of upstream's capability menu, cut down to what
ships in this plugin and rewritten under this skill's rules — several of upstream's rows are
things an ad must **not** do, and those are listed at the end so nobody reaches for them.

## Offers ride inside the gate

`../SKILL.md` § One gate, and nothing else asks: the user decides once, at the Step 3 first-frame
batch, and nowhere else. **A capability offer is never a stop of its own.** It is one or two lines
carried into that gate's ask and answered with the gate's own reply. A capability that only becomes
relevant after the gate has passed is named in the closing reply as something the user can take up,
never as a question the run waits on. Outside those two places, nothing is offered and nothing is
silently added.

The rules that keep this a help rather than nagware, borrowed from `/media-use` § Be proactive:

- **Grounded, not generic.** Offer a row only when its signal column is true for *this* ad. No
  signal, no mention — the full table is never read out.
- **Concrete, defaults chosen.** State the specific thing and what it would do here ("the clap
  tempo can be checked against the reference track's grid before we generate"), not the category.
- **Once per run, all / some / none.** Fold every applicable offer into the single consolidated ask
  at the Step 3 gate, and take the answer as final. "Leave it" is a complete answer. The gate comes
  before Step 4's composition, so a plan-shaping offer is still in time when it is answered there.
- **Surface, never mutate.** An accepted offer produces its artifact and is recorded; a declined
  one leaves no trace in the ad. Nothing here changes the reference's soundtrack, the blueprint's
  overlay contract, or the copy — those have their own rules.

**Accepted offers land in `AD_BRIEF.md` under `## Extras`**, one line each with enough detail to
act on, written the moment the user says yes. That section is what makes the next round readable:
a variant that carried a beat-timed text swap and one that did not are two different tests.

## The rows

Each row's last column reads **home → entry → what you get**: the installed skill, the doc or
command to start from, and the artifact that comes back. Every home named here ships in this
plugin; nothing needs installing, and `~/.juicylucy/bin/hyperframes skills update` is never run.

| Capability | Signal — offer when… | Say it to the user as… | Home → entry → what you get | Where it is offered |
| --- | --- | --- | --- | --- |
| **Beat grid** — a measured map of the soundtrack's beats, read by Studio and by you | The ad is cut to a track (every live blueprint is); a text swap should land on an accent; the `clap tempo` axis is in play and the clap must match the reference's BPM | "I can measure the track's beat so the text lands on it — and check the clap sits on the beat before we generate" | `/hyperframes-cli` → `beats.md` → `~/.juicylucy/bin/hyperframes beats --json` → `beats/<audio>.json`. Mark the soundtrack `<audio>` with `data-timeline-role="music"` at Step 4 so the command finds it. The track itself is untouched — the grid times the **overlay** and verifies the **footage**, it never re-cuts the audio | The gate (plan); verified at Step 5 without asking |
| **Motion treatments and transitions** — a proven scene shape or handoff, cited by name | The blueprint's overlay section does not cover a reveal the plan needs; a reference has two or more scenes and the seam between them is doing work | "each reveal gets a named motion treatment rather than improvised movement" | `/hyperframes-animation` → `blueprints-index.md` (treatments), `transitions/catalog.md` (handoffs); `/motion-doctrine` first, always. Ad text motion is deliberately restrained — read the blueprint's overlay section before the catalog, and take the smallest treatment that does the job | The gate |
| **Catalog search before hand-authored motion** — a primitive that already does the move | You are about to write motion by hand | (not an offer — a habit) | `/hyperframes-cli` § Agent conventions → `~/.juicylucy/bin/hyperframes catalog --query "<the beat, in plain language>"`. Local, no account, nothing leaves the machine. Install a hit with `~/.juicylucy/bin/hyperframes add <name>` only if it is self-contained; the registry wiring skill is not installed here | Not an offer — a habit at Step 4 |
| **Loudness on a generated bed** — the music bed normalised to the social target | `sound: music` — there is no reference and the bed was generated (§ Audio is not optional, rule 3). Never on a reference track, which ships **unmodified** by rule | "the generated music comes out at a random level; I'll normalise it to where the platforms expect it before laying it in" | `/media-use` → `operations.md` § Publish loudness → two-pass `loudnorm`, social target `I=-14`, `TP=-1.5` → the normalised bed under `.media/audio/`, with a manifest record naming the measured and target values. That is the file before it is laid in; fades and gain on it once it is in the composition are `/hyperframes-audio`'s | The gate |
| **Sound marks on a generated bed** — a stinger under the offer, a hit on a hard cut | `sound: music`, and the offer or a cut lands with nothing marking it. Never over a reference track | "one sound mark under the offer line, so the payoff has a hit" | `/media-use` → `resolve --type sfx "<intent>"` → a frozen SFX under `.media/audio/` on its own track. Placement and level only. Fades and gain on what is placed are `/hyperframes-audio`'s (`../SKILL.md` § Audio is not optional), on a generated bed and never on a reference track | The gate |
| **Share a draft by link** — the composition on a stable public URL | The person who has to approve is not at this Mac — the client, the brand owner, someone on a phone | "I can put this on a link you can send; re-publishing keeps the same URL" | `/hyperframes-cli` → `preview-render.md` § publish → `~/.juicylucy/bin/hyperframes publish` → a public URL. It **uploads the project's source and assets** to a public address, so it is an offer, never a default, and it never replaces the Step 5 editor hand-over, which stays local | The closing reply, after the ad is handed over |
| **User-supplied footage** — the user's own clips placed in the ad | The user hands over footage for a UGC-style spot, or a clip to cut the ad around | "your own footage can carry the ad — I'll cut and frame it to the placement" | `/media-use` → `operations.md` § Cut / trim and § Reframe / crop → the clip trimmed and framed to the placement's aspect (`ad-platform` → `platform-specs.md`), frozen under `.media/video/` with a `.media/manifest.jsonl` record like every other asset. This skill's manifest is the provenance; do not also run `/media-use`'s ledger | The gate |
| **Keyframe motion** — a punch-in, a reframe, a Ken Burns move on a still or a held shot | A first frame has to carry time the footage does not fill, or a scene sits static where the reference had movement | "the held shot can carry a slow push-in instead of sitting still" | `/hyperframes-keyframes` → `keyframe-patterns.md` → seek-safe 2D/3D keyframes on the clip. Read `/motion-doctrine` and the blueprint's overlay section first: ad motion is deliberately restrained, and the smallest move that does the job wins. Keyframes own visual motion only — clip assembly stays `/hyperframes-core`'s | The gate |
| **Fades and gain on a generated bed** — the bed eased in and out rather than cut | `sound: music` with a generated bed that starts or ends abruptly against the first or last frame | "the generated music can fade in and out instead of cutting dead" | `/hyperframes-audio` → fade-in / fade-out and track gain on audio already placed in the composition. **A preserved reference track is never** ducked, re-timed or processed (`../SKILL.md` § Audio is not optional; `reference-iteration.md` § Reuse the reference's soundtrack) — the audio skill's tools do not change that | The gate |
| **Speech in the ad** — a creator tells it to camera, product in hand; the spoken lines get captions | The brief or the reference is a person **talking** to camera, a personal story, a testimonial | "this can be a creator telling it in their own words, with the product in hand, captioned for the muted scroll" | The `ugc-testimonial` blueprint — it is a blueprint, not an add-on: speech from the motion model itself (the line verbatim in the prompt, one voice description in every shot), cut on the word with `scripts/speech-cuts.mjs` (a jump-cut or a natural-pace edit), captions timed from the verbatim lines. For a UGC feel in a shape the blueprint does not cover, `references/ugc-craft.md`. **Never** an avatar service, text-to-speech or a voice changer. **A transcript is for speech, never for a song**: lyrics stay in their original language and are never captioned (`reference-iteration.md` § Lyrics are not copy) | Step 1, as the blueprint choice |

## Not offered, and why

Reviewed against upstream's menu; each of these is either forbidden here, already owned by
something else, or not installed. Listed so the agent does not reach for one when the user asks
"what else could we do".

- **Website capture.** An ad is generated, never captured from a site (`../SKILL.md` § What makes
  this different). The brand's landing page is a URL in the outro, not a source of footage.
- **A design spec (`frame.md`).** The resolved `brand-<slug>` skill *is* the design spec — palette,
  type, end card, claims. Writing a second one beside it recreates the six-places-one-fact problem.
- **Voiceover, TTS, dubbing, transcription of the track, lyric captions on the live blueprints.**
  Forbidden outright (§ Audio is not optional; `reference-iteration.md` § Lyrics are not copy).
  The speech row above is dormant until a speech blueprint is live.
- **Ducking, re-timing, re-cutting, or normalising a reference track.** Preserved means
  unmodified (`reference-iteration.md` § Reuse the reference's soundtrack). The loudness and sound
  marks rows apply to a generated bed only.
- **Mixing a reference track.** `/hyperframes-audio` ships and owns fades, gain and ducking,
  but only on a generated bed. A preserved reference track is never processed, and the audio
  skill's tools do not change that (`reference-iteration.md` § Reuse the reference's soundtrack).
- **A second media ledger.** `/media-use --adopt` keeps its own manifest; this skill freezes
  everything under `.media/manifest.jsonl` with model, prompt and seed. One ledger.
- **Registry block wiring, Figma import, real map scenes, genre lenses.** Their homes
  (`/hyperframes-registry`, `/figma`, `/motion-graphics`, `/product-launch-video`,
  `/faceless-explainer`) are not installed in this plugin, and an ad does not need them. If one
  ever does, that is a blueprint decision, not a per-run offer.

## Where each offer is made

| Where | Rows |
| --- | --- |
| **The gate** — Step 3, the first frames as one set, the run's only stop | beat grid (plan), motion treatments and transitions, keyframe motion, loudness on a generated bed, fades and gain on a generated bed, sound marks on a generated bed, user-supplied footage, speech (planned blueprints) |
| **The closing reply** — stated, never asked | share a draft by link |
| **Neither** — a habit, not an offer | catalog search before hand-authored motion |

Everything that shapes the ad is answered at the one gate, which sits before Step 4's composition,
so a plan-shaping answer still arrives in time. Step 5's beat-grid check is run as part of the
defect gate and is never put to the user. Step 2 carries no offers: the copy matrix does not stop
the run, and the compliance gate has the floor.
