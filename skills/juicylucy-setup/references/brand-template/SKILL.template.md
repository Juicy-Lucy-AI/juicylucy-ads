---
name: brand-<slug>
description: "The <Brand> brand — what the product is and is not, its voice, the claims it may not make, its colour and type, and its end card. Load whenever an ad, a caption, or a composition is being made for <Brand>, and before writing or reviewing any copy that asserts what the product does. Also the answer to 'which brands do we have?' — this skill existing IS the brand being available."
---

<!-- Rename this file to SKILL.md when the template is copied into a skill
     directory. Replace every <placeholder>; rewrite the description above so it
     names the product — two skills claiming to be "the brand" is the failure
     the description exists to prevent. -->

# <Brand>

Everything true about this product and nobody else. The ad workflows carry no
brand facts of their own: they read them from here.

**One brand, one skill.** If this is the only `brand-*` skill in the catalogue,
it is the brand — use it without asking. If there are several, ask which. That
resolution happens at Step 0, before the brief is written.

## The one-line version

**"<The product's own tagline, or one sentence a customer would say.>"**
<What it does, for whom, at what price, in two sentences.>

That paragraph is a summary, not the source. Before asserting anything about
what the product does, read the file that owns it.

## What each file owns

| Read | For |
| --- | --- |
| [`product-truth.md`](product-truth.md) | **The** source of scope: what it is, what it is not, who it is for, real features, pricing, voice. Nothing else asserts product scope. |
| [`compliance-overlay.md`](compliance-overlay.md) | What this brand may not say, over and above platform policy. |
| [`brand-kit.md`](brand-kit.md) | Colour, type, the lockup, and how restrained the branding should be on a given ad. |
| [`outro-card.md`](outro-card.md) | The end-card asset: source, dimensions, and the digest to verify it against. |
| [`copy-patterns.md`](copy-patterns.md) | Approved copy patterns and protected terms, once there are any. |
| [`competitor-set.md`](competitor-set.md) | Whose ads this brand studies, in what order, with what exclusions. |
| [`ad-account.md`](ad-account.md) | The ad account and where campaign structure and performance figures live. |
| [`format-renditions.md`](format-renditions.md) | This brand's narrowing of the engine's static format catalogue, if any. |
| [`history/`](history/) | Dated evidence — rejection logs, run post-mortems, performance records. Evidence, not instruction; nothing here overrides the files above. |

## The claims that get ads rejected

Read `compliance-overlay.md` for the full set. List here the two or three
boundaries that matter most for this product — usually features it does not
have that copy is tempted to imply:

1. **<Boundary one>** — <what the product does not do>.
2. **<Boundary two>** — <what must never be promised>.

## Using this brand in an ad

- **Product claims** come from `product-truth.md`, and the compliance gate in
  `/video-ad-production` § Step 2 checks copy against `compliance-overlay.md`.
- **Branding level is read off the reference**, not raised to ours — most
  references that work in these formats are unbranded UGC, and a logo bug moves
  the ad from content toward ad. `brand-kit.md` says what the brand looks like
  when it appears; `/video-ad-production` § reference-iteration decides
  *whether* it appears.
- **The end card** is the one place branding is unambiguous, and only when the
  reference had one. `outro-card.md` has the asset.

## Using this brand in a static ad

The statics pipeline (`static-ad-production`) resolves this skill at Step 0:
competitor research reads `competitor-set.md`, winner analysis reads
`ad-account.md`, copy reads `product-truth.md` + `compliance-overlay.md` +
`copy-patterns.md`, format choice consults `format-renditions.md`, and
character/asset decisions read `brand-kit.md`.
