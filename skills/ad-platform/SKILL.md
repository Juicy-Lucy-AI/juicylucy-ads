---
name: ad-platform
description: Platform truth for paid social ads on Meta / Instagram / TikTok, shared by the video and statics engines — placement specs, canvases and safe zones (platform-specs), and the copy rejection taxonomy (why converting copy gets banned under fraud/scams/deceptive-practices and financial-services policies). Load when deriving aspect or safe zones from a placement, when QA-checking text position against platform UI, or when writing or reviewing ad copy against platform policy. Facts here are true for any advertiser in either medium; brand-specific prohibitions live in the brand's compliance overlay, and each engine's copy method lives with that engine.
---

# Ad platform truth

What the platforms themselves impose, stated once for both mediums. The video
engine (`video-ad-production`) and the statics engine (`static-copywriting`,
`static-ad-production`) read these files rather than restating them; each
keeps its own *method*, and this skill owns the *facts* the methods check
against.

| Read | For |
| --- | --- |
| [`references/platform-specs.md`](references/platform-specs.md) | Aspect by placement, canvases, safe-zone keep-outs, file caps — medium-shared. The duration, codec, and audio sections apply to video only. |
| [`references/rejection-taxonomy.md`](references/rejection-taxonomy.md) | The copy patterns platform review rejects and why: absolutes, fabricated precision, guaranteed outcomes, fake urgency, scam-coded formats, and the money-framing trigger class. |

Two rules travel with the facts:

- **Compliance has two layers, both mandatory.** This skill is the platform
  layer; the resolved brand's `compliance-overlay.md` is the brand layer. A
  line must clear both.
- **A digest never outranks this skill.** Engine method files may carry
  operative digests of these rules for their gates; when a digest and this
  skill disagree, this skill wins and the digest is the bug.
