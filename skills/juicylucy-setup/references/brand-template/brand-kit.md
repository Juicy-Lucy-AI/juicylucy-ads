# Brand kit — <Brand>

Captured from `<the product's site or design system>` on **<date>** via
`~/.juicylucy/bin/hyperframes capture`, which reads the live CSS custom properties. These are
extracted values, not eyeballed ones. Re-capture when the site is restyled:

```bash
~/.juicylucy/bin/hyperframes capture "<https://the-product-site/>" -o ./capture --json
```

## Colour

| Role                  | Value       | Source                  |
| --------------------- | ----------- | ----------------------- |
| **Primary / accent**  | `#<hex>`    | `<css variable>`        |
| **Ground**            | `#<hex>`    | `<css variable>`        |
| Accent, deep          | `#<hex>`    | palette                 |
| Accent, light         | `#<hex>`    | palette                 |
| Text, primary         | `#<hex>`    | `<css variable>`        |
| Text, secondary       | `#<hex>`    | `<css variable>`        |

**<Which palette the ads use.>** <If the site carries more than one theme,
say which one every ad asset uses and when the other is allowed.>

## Type

| Family        | Weights          | Use                             |
| ------------- | ---------------- | ------------------------------- |
| **<Display>** | <weights>        | Display — headlines, hooks, CTA |
| **<Body>**    | <weights>        | Body and UI                     |

Use the frozen font files the capture produced rather than a render-time font
fetch — a network request at render time breaks the determinism contract.

## Look

- <The single most recognisable visual cue — a glow, a texture, a shape.>
- <Card and surface treatment.>
- <CTA treatment.>

## The logo

<Describe the lockup: vector or raster, where the master lives, and what it
must never be cropped out of. Note what is still needed — a transparent
standalone mark, say — so nobody improvises one.>

## The outro end-card

**1080 × 1920** — the 9:16 canvas exactly. It is fetched and frozen per
project rather than committed — see `outro-card.md`. It is a still, so it has
no natural length; the video-ad-production skill's `references/outro.md` owns
the placement rules.

## When the brand appears at all

This file says what the brand looks like. It does not say that every ad should
look like it. On a variation, **the reference's branding level is a preserved
attribute** — most references in these formats are native-looking, unbranded
UGC, and the variant stays that way. Branding belongs where the reference put
a CTA or end-card treatment, and in the ad's own overlay type. A new ad from a
brief has no reference to match, and is the case that gets the full brand
treatment by default.

## Sourcing anything else

Non-brand media — BGM, SFX, stock imagery, icons — goes through `/media-use`,
which freezes it and records provenance. Do not fetch media directly.

## Ad asset library

<Where reusable brand assets for static ads live — a folder the user names —
and what is in it. Inspect it live rather than assuming its contents. Say
whether any recurring character or mascot is optional or mandatory, and never
redraw or approximate an asset that exists.>
