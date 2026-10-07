# The outro asset — source and freeze

The canonical end-card is **not committed to this skill.** It is a binary every
project copies locally anyway, and the skills are text. Instead it is
**fetched once per project and frozen**, which is what the media doctrine
requires of every asset (the video-ad-production skill's
`references/generation.md` § Freezing and provenance): a composition never
references a remote URL, because the URL can rotate and a render-time fetch
breaks determinism.

## Source of truth

| Property   | Value                                                     |
| ---------- | --------------------------------------------------------- |
| URL        | `<https://where-the-card-is-hosted/end-card.png>`         |
| Dimensions | 1080 × 1920 (8-bit RGB, non-interlaced) — the 9:16 canvas |
| Size       | <bytes>                                                   |
| SHA-256    | `<digest>`                                                |
| Verified   | <date>                                                    |

If the brand has no end-card yet, say so here in one line and delete the table
— the video workflow then ends on the reference's own ending or a plain brand
plate, and never invents a card.

## Freeze it into the project

Fetch to `.media/brand/outro-end-card.png`, then verify before use:

```bash
mkdir -p .media/brand
curl -sS -L -o .media/brand/outro-end-card.png "<URL from the table>"
shasum -a 256 .media/brand/outro-end-card.png
```

**Compare the digest to the table above.** A mismatch means the card was
re-exported upstream — stop and confirm which version is current rather than
shipping an unrecognised end-card on paid creative. Then append a
`.media/manifest.jsonl` record with `"kind": "brand-asset"`, the URL, and the
digest, so the project records which card it used.

The card ships at canvas size, so the freeze is a straight copy — nothing to
crop, scale, or letterbox. Once frozen, the video skill's `outro.md` owns
everything about whether and how to place it.

> **This file is the one place the URL lives.** `brand-kit.md` points here
> rather than repeating it. A re-export must stay 1080×1920; the placement
> rules assume a card that lands on the canvas 1:1.
