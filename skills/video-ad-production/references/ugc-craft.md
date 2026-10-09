# UGC craft — making generated footage feel like a phone video

What makes footage read as **user-generated**: shot on a phone by a person, not produced by a crew.
This is the knowledge behind `blueprints/ugc-testimonial.md`, written so it transfers to anything
that needs the same feel, including shapes no blueprint covers yet:

- a 3-second UGC insert inside a long ad;
- a dog "reviewing" a chew toy;
- hands unboxing a parcel;
- a 3-minute story told across ten settings.

**How to use it.** Take what fits, check each shot as you go (§ Check every shot), and say in the
closing reply which parts of the piece lie outside what was tested (§ What was tested). Untested is
not forbidden. It means look harder and say so.

## What makes it read as UGC

Each line below is something a produced ad gets "right" and a phone video does not. Keep enough of
them and the footage reads as real; lose them all and it reads as an ad pretending.

| Layer | UGC | Produced (avoid unless asked) |
| ----- | --- | ----------------------------- |
| **Camera** | phone held at arm's length or propped on a shelf; slight wide angle; small handheld drift; framing a little off-centre | gimbal moves, dollies, perfect symmetry, shallow cinematic depth of field |
| **Light** | whatever the place has — a car window, a kitchen in the morning, a desk lamp | key-and-fill lighting, rim lights, colour-graded skin |
| **Place** | a real, slightly lived-in room: a car seat, a kitchen counter, a bathroom shelf | a set, a seamless backdrop, a showroom |
| **Subject** | unretouched skin, everyday clothes, small imperfections | flawless skin, styled hair, wardrobe |
| **Performance** | talks *to* the viewer, eye contact with the lens, small natural gestures, contractions, one thought at a time | a script being presented, big gestures, brand language |
| **Sound** | the phone mic and the room: a car's hush, a kitchen's echo | a studio voice, silence underneath, a music bed doing the emotion |
| **Edit** | jump cuts, captions, a punch-in or two | dissolves, motion graphics, lower-thirds |
| **Text** | captions of what is said; maybe one line on frame 0 | headlines, slogans, logos everywhere |

## Prompting for it

The prompt cues that carried the bake-off's footage. They work for any subject.

- **Camera:** "Vertical selfie video, handheld phone camera" or "filmed on a phone propped on a
  shelf". Add "slight wide angle" for a selfie and "small natural handheld movement" when the
  model holds the frame too still.
- **Light and place:** name the real place and the time of day — "in the driver's seat of a parked
  car on a sunny afternoon", "a bright home kitchen in the morning". The light follows the place.
- **Subject:** "unretouched skin texture", "realistic smartphone photo" on the first frame. Make
  the identity reference a plain portrait, so the scene comes from the prompt and not from the
  reference.
- **Performance:** describe actions, not moods. "Talks straight to camera with small natural
  gestures", "holds the bottle up to the lens", "glances down, then back at the camera". A mood
  word ("excited") gets averaged into a held smile; `blueprints/clapping-reaction.md` § The six
  rules it encodes has the full argument.
- **Sound:** "Sound: only her voice and the quiet room tone of <place>. No music. No other voices."
  Leave out "No music" and the model fills the silence with a bed.
- **No burned-in text:** "No subtitles or captions." Models add them, especially to speech.

### Subjects that are not a speaking person

These were **not tested** in the bake-off. The craft above still applies; what changes is where the
performance lives.

- **Hands only** (unboxing, applying, pouring): film from the person's own eye line, "POV, hands
  in frame". The hands are the performance: name each action in order ("peels the tape, lifts the
  lid, tips the box towards the camera"). Count fingers on every frame you keep.
- **A pet or an object as the "creator":** the camera stays a person's phone, so the voice
  becomes the owner's, off camera, or there is none. A pet does not lip-sync convincingly; do not
  ask it to speak. React-to-camera beats (a head tilt, a sniff, a paw) carry it, with captions or
  an off-camera line on top.
- **A product alone** (on a counter, in a bag): "phone on the counter, slight angle, someone's hand
  enters and picks it up". A human hand makes a static product read as UGC.
- **A screen** (an app, a dashboard): never generate it. A generated screen is invented UI. The user
  records it; a creator is cut out and placed over it in the edit.

## Speech

When someone speaks, the motion model generates the speech itself, in sync. There is no
text-to-speech and no voice changer (`../SKILL.md` § Audio is not optional).

- **The line, verbatim, in double quotes:** `She says: "…"`. No stage directions inside the quotes.
- **The voice, described once and pasted verbatim into every shot:** age, gender, timbre, tone,
  pace, accent, mic and room. "Same voice as before" means nothing to a model.
- **Pace:** at most about 2.7 words a second of shot, so the line ends with time to spare. Short
  sentences. A second of closed-mouth hold after the last word gives the next shot a clean start
  frame. The edit cuts the hold away.
- **Two people in one shot** — tested **once**. The motion role's default played a two-line
  exchange correctly (5/5/5); another model gave both lines one voice. Name the speakers and give
  each their own line ("<A> turns to <B> and says: … Then <B> says: …") and their own voice line.
  Check every shot for who speaks which line.
- **Languages other than English:** **not tested.** Expect weaker lip-sync and pronunciation;
  listen to every line.

## Continuity across many shots

A long piece is many short shots, each with a cap on its length. What keeps them one piece:

- **A cast made once.** The person (a plain portrait), the product (its packshot, label exact) and
  the voice (its description). Every first frame is an edit from the portrait and the packshot.
- **Chaining within a setting.** Each shot starts from the previous shot's hold frame
  (`scripts/speech-cuts.mjs frame`, which also works on a shot with no speech; it then takes a frame
  near the end). Held face, product and voice over four links in the bake-off (5/5/5).
- **Chain as long as the piece needs.** Nothing accumulated in the four-link chains that were tested.
  - **The start frame held.** Each link started on its previous frame just as faithfully at link 4 as
    at link 2: frame match 0.87–0.97, with no downward trend on any model.
  - **Face and product held.** They were judged unchanged across all four links.
  - **There is no length limit to respect.** Longer chains are untested, not forbidden: keep going,
    and watch.
- **Watch the start frames, and reset only on evidence.** Before each chained shot, put its start
  frame beside the cast portrait, the packshot and the first shot's frame: is it the same face, the
  same label, the same light? When one has moved, start that shot from a **fresh** first frame,
  edited from the cast references in the same place. The viewer sees an ordinary jump cut, and the
  drift is gone. Practitioners report drift after 2–8 extensions on other models; it was not seen
  here.
- **The voice slips slowly on a prompt alone, and not at all with an anchor.** Similarity to the first
  shot fell from 0.91 to 0.85 over four links on one model and from 0.93 to 0.90 on another, still
  one voice by ear (judged 5/5). With a voice anchor it stayed flat (0.93 → 0.92), because every link
  hears the same reference. For a very long piece, the anchor is what keeps the voice; use it
  whenever the catalog offers it.
- **The voice across settings.** A prompt holds the voice within a setting and lets it drift across
  settings. When the catalog offers a model that takes reference audio, a voice anchor fixes it
  (`blueprints/ugc-testimonial.md` § The same creator in another setting).
- **B-roll between talking shots** — the product on the counter, hands using it — lets a long piece
  breathe, and lets a new setting arrive without a hard identity jump.

## The edit

- **Cut on the audio, not on a transcript.** Transcribers' word times are too loose to cut on.
  `scripts/speech-cuts.mjs plan` measures the speech and gives the ranges to keep. Choose a pace,
  as in the next item.
- **Pace — choose one per piece:**
  - **Jump-cut edit** (`--pace jumpcut`): the fast-paced creator style. Every real pause is cut, so
    the speech runs on. It is energetic, hook-led and native to TikTok and Reels.
  - **Natural-pace edit** (`--pace natural`): the take as it was spoken, with only pauses over a
    second shortened. Calmer and more confessional, and it suits trust-heavy categories and long
    stories.

  `blueprints/ugc-testimonial.md` § Choosing the pace says when to use which.
- **Punch-ins.** On a jump-cut edit, scale every other range by 8–12% (`transform: scale(1.1)`,
  centred on the face) so consecutive jump cuts read as intentional rather than as glitches. Creator
  editors use this. **Not tested** in the bake-off; check that the product and the face stay in
  frame at the punched scale.
- **Captions** carry the words for the muted scroll: verbatim, a phrase at a time, below the chin,
  never over the face or a product label.
- **Room tone stays.** Never denoise or "clean up" a voice. The bake-off judge marked a cleaned
  voice "clearly AI identifiable". When shots come from different rooms, the change of room tone at a
  cut is correct; that is what a real phone recording sounds like.

## Check every shot

Before a shot goes near the edit:

- the words (if any) all there, in order, in sync;
- the subject still the cast's;
- the product's shape and label unchanged;
- hands with five fingers;
- no music, no second voice, no burned-in captions.

A shot that fails is regenerated, never cut around.

## What was tested

| Tested (2026-10-07/08 bake-off and re-cut) | Not tested — use the craft, look harder, say so |
| ------------------------------------------ | ---------------------------------------------- |
| One synthetic woman, early thirties, speaking English | Men, children, other ages; other languages |
| One held product: a small dropper bottle with a printed label | Large, soft, transparent or moving products; software on screens |
| Two settings: a parked car, a kitchen | Outdoors, crowds, night, moving vehicles |
| 8 s shots; chains of four links (no accumulating drift seen); ads of 18–30 s once cut | Longer chains — expected to hold, unmeasured; pieces over 45 s; 3-minute stories |
| Two people in one shot, once | Three or more people; overlapping speech |
| Jump-cut and natural-pace edits of the same chains | Punch-ins; mixed paces within one piece |
| Photorealistic synthetic people | Real people's likenesses (some models refuse them); animals; animation |
