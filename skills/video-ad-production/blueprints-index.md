# Ad blueprints (the recipes)

Entry point to the blueprint layer. Read this to pick the ad type; read `blueprints/<id>.md` to
build it. One blueprint = one **ad type** — a repeatable recipe with a fixed shot structure, a
fixed overlay contract, named copy slots, its own generation prompts, and the axes you are allowed
to vary between test variants.

A blueprint is not a template to fill in blindly. It is the shape that has been observed to work,
plus the failure modes that kill it. Instantiate it with this brief's product and offer.

## Picking

Match on what the **footage** is doing, not on the product category.

| The ad is…                                                                         | Blueprint                       | Status  |
| ---------------------------------------------------------------------------------- | ------------------------------- | ------- |
| A person reacting to camera — clapping, nodding, expressions carrying the payoff   | `clapping-reaction`             | live    |
| One creator talking to camera, product in hand, telling it in their own words      | `ugc-testimonial`               | live    |
| Generated ambient/lifestyle footage under a text message that carries the argument | `background-video-text-overlay` | live    |
| A state change shown as two footage states, cut or wiped against each other        | `before-after`                  | planned |
| Two or more people talking to each other on camera about the product             | `multi-creator`                 | planned |
| A creator cut out and placed over the user's own footage (an app, a dashboard)     | `greenscreen`                   | planned |

`clapping-reaction` sits **above** `background-video-text-overlay` deliberately: both put a static
text block over generated footage, so a reaction ad matches the second row too, and first match
wins. The question that separates them is whether the footage is **performing** or merely playing.
A face doing the emotional work is a reaction ad; a face that happens to be in the shot is not.

Each blueprint carries the `FB-` treatment token it exports under; `background-video-text-overlay`
is `FB-videotextoverlay`, whose upstream definition — "a background video that is unrelated to the
text overlay running on top of it" — is exactly this shape. `clapping-reaction` is `FB-videoreaction`
rather than `FB-videotextoverlay` for that same reason read the other way: its footage is _related_
to the overlay — the performer is reacting to the claim — so the older token describes it wrongly.

`background-video-text-overlay`, `clapping-reaction` and `ugc-testimonial` are built. The others are
named here so the routing surface is stable while they are added. A `planned` row has no recipe:
never present it as built. When a brief still needs that shape, say it is not a tested recipe and
build it as a custom piece from the craft that exists — for anything UGC-feeling (a talking
creator, two people, hands, a pet, a long story, a UGC insert inside another ad) that craft is
`references/ugc-craft.md`.

`ugc-testimonial` is the one blueprint where the performer **speaks**: the clip's own sound is the
soundtrack, the ad runs 15–45 s, and it is cut on the word. A person who claps or reacts without
speaking is still `clapping-reaction`; a talking person is never forced into it.

<blueprints>
<blueprint id="background-video-text-overlay" aspects="9x16, 4x5, 1x1" duration="6-15s" status="live">
Full-bleed generated footage runs continuously underneath while the argument is made entirely in
**text overlay** — a hook that is already legible on frame 0, two or three body beats that swap in
place, and an offer/CTA that lands and holds to the last frame. The footage sets mood and stops the
scroll; it never has to explain anything. The workhorse: reach for it whenever the message is
verbal, the product is hard to film, or you are testing hooks rather than testing visuals.
</blueprint>
<blueprint id="clapping-reaction" aspects="9x16, 4x5, 1x1" duration="6-15s" status="live">
A performer claps, nods and reacts to camera for the whole clip while a short text block carries the
claim — the clap is the metronome and the **face** is what sells. Inherits the text-overlay
contract but the face owns the middle of the frame, so the block drops to four lines below the chin
and the varied axis becomes the expression arc rather than the hook. Reach for it when the claim is
one a person would visibly react to and the payoff should land on a face rather than in a sentence.
</blueprint>
<blueprint id="ugc-testimonial" aspects="9x16, 4x5" duration="15-45s" status="live">
One creator talks to camera on their phone, product in hand, and tells it in their own words — hook,
story, find, proof, nudge — across speaking shots of 5–10 s, chained within a setting and cut on
the word, as a fast jump-cut edit or a calmer natural-pace edit. The clip's own speech is the soundtrack, captions carry it for the muted scroll, and
one voice description holds the voice from shot to shot. Reach for it when the argument is a
personal story said by a person rather than a sentence in a block.
</blueprint>
</blueprints>

## Adding a blueprint

A new blueprint is a new file in `blueprints/` plus a row in the table and a `<blueprint>` entry
above. `scripts/lint-blueprints.mjs` enforces that the three stay in sync and that the file carries
every required section — run it before committing:

```bash
~/.juicylucy/bin/adsnode scripts/lint-blueprints.mjs   # from this skill's directory; `npm run lint:blueprints` in the repo
```

Required frontmatter keys: `id`, `name`, `status`, `duration`, `aspects`, `style`.
`style` is the blueprint's `FB-` treatment token for the export filename — it must be in the
vocabulary in `references/naming.md` and must agree with `BLUEPRINT_STYLES` in
`scripts/blueprint-styles.mjs`. The linter enforces both.
Required sections: `## When to reach for it`, `## Anatomy`, `## Shot structure`, `## Copy slots`,
`## Soundtrack`, `## Generation spec`, `## Variant axes`, `## Failure modes`, `## QA gates`.

`## Soundtrack` is required because an ad with no audio is a defect and the failure is silent in
every other gate — see `../SKILL.md` § Audio is not optional.
