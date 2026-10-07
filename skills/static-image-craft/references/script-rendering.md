# Script rendering — per-script craft

Which language uses which script, code, and direction is the `juicylucy` skill's
`languages.json`. This file is how to *render* each script family correctly. It
matters most on Track A, where you draw the glyphs yourself; on Track B the image
model draws pixels, but you still verify the result against these failure modes.

## The rule above all scripts

**Complex shaping is mandatory.** Never trust a text engine that lacks a real shaping
backend (HarfBuzz, or a rasterizer built on it). Naive renderers fail *silently* —
the output looks like text and is wrong. Verify with a proof sheet — render the
target copy, look at it — before rendering any creative, and again at full resolution
on every final.

A broken glyph in a live ad is a brand failure: the local-script equivalent of a `□`
box, visible to every native reader and invisible to you.

## Devanagari (Hindi, Nepali, …)

The hardest common case; plain text drawing renders it wrong.

- **Shaping**: conjuncts (क्ष, त्र, ज्ञ, श्र, द्ध, व्य, ग्र, क्री …), the i-matra that
  reorders *before* its consonant (कि), stacked matras above and below, nukta (़),
  and chandrabindu (ँ) all require a shaping engine — HarfBuzz for shaping plus
  FreeType for rasterization works; PIL alone (without raqm) does not.
- **The shirorekha** (top bar) must run continuously across each word; a broken bar
  betrays a naive renderer instantly.
- **Line height needs headroom**: matras hang above the shirorekha and below the
  baseline — use ~1.3–1.4× line spacing and check the top bar is never clipped.
- **Fonts**: Noto Sans Devanagari (display/headlines) and Noto Serif Devanagari
  (serif body) cover the full conjunct set. No true condensed Devanagari exists in
  Noto — approximate a heavy condensed source headline with weight 900 and document
  the substitution.
- **Register**: ad copy leans on everyday spoken register; common loanwords are
  natural in ads. Avoid over-formal vocabulary that reads like an official notice.

## Mixed scripts in one layout

Brand tokens and numbers stay Latin (the brand's `copy-patterns.md` lists them). A
shaping engine renders the Latin runs from the same font's Latin glyphs, so there is
no visible seam — do not switch fonts mid-line for the Latin tokens.

## Cyrillic (Kazakh and beyond)

- Language-specific letters are the trap: Kazakh needs ә ғ қ ң ө ұ ү һ і —
  render-test them before use; a font that covers Russian Cyrillic does not
  necessarily cover them.
- Kazakh ad copy is written in Cyrillic, not Latin.
- Cyrillic presence in QA is not evidence of source-language residue — distinguish
  languages semantically, not by alphabet.

## CJK

- No word spaces: line wrapping is per character, never per "word".
- Locked punctuation must survive: a full-width ellipsis (……) must not degrade to
  Latin periods in generation or re-typesetting.
- Simplified vs Traditional is a market decision recorded in `languages.json`, not a
  font decision; the font must match the chosen variant (e.g. a TC font for
  Traditional).

## Right-to-left (Arabic script)

- Direction inverts everything: text direction, alignment, and line-wrapping logic.
  A layout approved for a left-to-right language is not evidence the RTL variant is
  safe — re-validate margins, alignment, and reading order per creative.
- RTL needs a dedicated localization pass; never batch it silently with LTR
  languages.

## Verification per script

1. Proof sheet before production: the actual copy, the actual fonts, inspected by eye.
2. Full-resolution inspection of every final: shaping, diacritics, clipped ascenders
   or descenders, direction, punctuation.
3. OCR only as a lead — most engines are weakest exactly where shaping is hardest
   (`static-localization`'s QA references own the interpretation rules).
