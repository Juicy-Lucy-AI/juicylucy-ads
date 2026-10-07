---
name: static-formats
description: The static ad format library — 36 named creative mechanisms for single-image ads (breaking news, reviews, us-vs-them, iPhone notes, transformation, tier list, testimonial, meme, stat headline, Venn diagram, and more) with a generation workflow, a copy-ready image prompt template, an iteration recipe by campaign objective, and a production QA checklist. Use when choosing a format for a new static concept, when a brief asks "what format should this ad take", when generating format baselines and controlled variants, or when auditing a static creative against its format's mechanism. Formats only — copy rules live in static-copywriting, the pipeline in static-ad-production.
---

# Static ad format library

Thirty-six creative mechanisms that work as a single static image, derived
from observed high-performing paid-social formats. Six clearly video-first
formats are deliberately absent — script, whiteboard, AI podcast, claymation,
native/UGC, and greenscreen — because a still cannot carry them; video ad
types come from the `/video-ad-production` blueprints, not from this list.

Examples use the fictional product **VELORA Daily Focus Gummies** so the
mechanism — not a brand — is what you compare. They are concept examples, not
claim-approved production ads.

**A brand may narrow this catalogue.** Resolve the brand first (`brand-<slug>`
in the catalogue; exactly one installed → use it; several → ask; none → create
one first, per the `juicylucy-setup` skill's `extending.md`).
If the brand carries a `format-renditions.md`, it re-angles these mechanisms
for that brand and may exclude some outright — its exclusions win.

## The formats and what each one does

1. **Breaking news** — Borrows the urgency and hierarchy of a news bulletin to frame the product update as timely.
2. **Reviews / ratings** — Leads with rating, stars, and short review cards; use only substantiated reviews and avoid third-party logos without permission.
3. **Offer** — Makes price, bundle, gift, or discount the dominant visual hook.
4. **Us vs. them** — Side-by-side feature comparison that makes the choice easy to scan.
5. **Doodle** — Handwritten arrows, circles, and notes create a casual creator-made feel.
6. **Low-stock alert** — Scarcity headline plus inventory cue; only use when scarcity is truthful.
7. **Myth vs. fact** — Contrasts a familiar misconception with the brand's corrective idea.
8. **iPhone notes** — Looks like a personal note or checklist; low-polish and native-feeling.
9. **Transformation** — Before/after contrast showing a visible change in state or routine.
10. **Zero stars** — Pattern interrupt that opens negative, then flips into a positive reveal.
11. **Search results** — Search-engine mockup that mirrors the customer's question-and-answer path; avoid real logos.
12. **Bundle** — Product-stack image that communicates quantity, savings, and completeness.
13. **Don't be an idiot** — Provocative blunt headline that challenges an unhelpful habit; keep tone playful.
14. **Forum post** — Anonymous forum-thread aesthetic that reads like a candid discovery; avoid impersonating real users.
15. **Side effect** — Reframes the desired outcome as a humorous "side effect."
16. **We're sorry** — Mock apology that turns a benefit into a witty confession.
17. **Tier list** — Ranks habits or options from best to worst for fast, shareable comparison.
18. **Story-style** — Casual vertical-social visual language with handwriting, polls, or stickers; no platform logo needed.
19. **X signs** — Numbered symptom/sign list that helps viewers self-identify with the problem.
20. **Problem vs. solution** — Split layout that makes pain and resolution visually immediate.
21. **Warning** — Caution-label visual used as a humorous or dramatic benefit hook.
22. **You can avoid** — Prevention angle focused on escaping an unwanted outcome.
23. **Reasons why** — Short numbered reasons supporting purchase or adoption.
24. **Email screenshot** — Familiar inbox/message format that feels personal and specific.
25. **Text message** — Short conversational proof or objection handling in chat bubbles.
26. **Problems** — Clusters several pain points around the product and crosses them out.
27. **Hack 101** — Educational formula or lesson that packages the product as a simple tactic.
28. **Emergency** — High-urgency "rescue" framing for an acute moment of need.
29. **Testimonial** — Portrait, quote, name, and proof markers; use real approved testimony in production.
30. **Don't buy this** — Reverse-psychology opener followed by a qualifier that identifies the ideal customer.
31. **Stat headline** — One oversized number drives attention; clearly label personal experiments and substantiate broader claims.
32. **Meme** — Familiar two-panel joke built around a relatable before/after moment.
33. **New vs. old** — Contrasts the previous routine or product with the improved one.
34. **Text on skin** — Editorial human close-up with a short message written on skin for an unexpected visual hook.
35. **Us vs. us** — Shows product or brand evolution without attacking a competitor.
36. **Venn diagram** — Two audience desires overlap at the product or core benefit.

## Step-by-step generation workflow

1. **Choose one mechanism.** Start from the list above. Do not combine more
   than two mechanisms in the first draft.
2. **Lock the input facts.** Product name and appearance, one audience, one
   pain point, one benefit, one proof point, one offer, the exact CTA — from
   the resolved brand and the brief, with every claim needing substantiation
   marked. Copy passes `static-copywriting`'s two compliance layers.
3. **Write one hook.** Short enough to read on a phone — ideally 3–9 words.
4. **Choose the proof object.** Product photo, rating, quote, comparison
   rows, checklist, chart, message thread, or before/after scene.
5. **Set the hierarchy.** Hook first, proof second, product third, CTA last.
   The ad should still make sense at thumbnail size.
6. **Generate the image** with `~/.juicylucy/bin/juicy image generate --no-preset`, using the
   prompt template below — one distinct style per call.
7. **Check exact text.** Image models misspell and alter copy. Regenerate
   with less text, or replace text via `static-image-craft` when exact
   wording matters.
8. **Check claim safety.** Remove invented ratings, testimonials, scarcity,
   percentages, endorsements, or outcome claims; replace with approved
   evidence.
9. **Create controlled variants.** Mechanism fixed; vary one variable at a
   time — hook, hero image, color, proof, or offer.
10. **Export platform sizes.** 1080×1080 square and 1080×1350 feed portrait
    as baselines; 1080×1920 only when the layout still reads as a static
    story. The batch's contracted ratio wins when the pipeline sets one.
11. **Name per the workspace grammar.** Filenames come from the `ad-naming`
    skill's tool applying the `juicylucy` skill's `naming.json` — never an
    ad-hoc scheme, never typed by hand; reserve collision-free names before
    moving outputs in.
12. **Record results.** Log spend, impressions, thumb-stop/CTR, CVR, CPA, and
    the exact variable changed. Promote mechanisms, not just artworks.

## Copy-ready image prompt template

```text
Use case: ads-marketing
Asset type: [RATIO] paid-social static ad
Primary request: Create a [STYLE NAME] static ad for [PRODUCT].
Audience: [ONE SPECIFIC AUDIENCE]
Scene/backdrop: [SETTING OR UI-LIKE FORMAT]
Subject: [PRODUCT + PERSON/OBJECT IF NEEDED]
Composition: [HOOK POSITION], [PROOF OBJECT], [PRODUCT POSITION], [CTA POSITION]
Style: polished performance creative, mobile-first hierarchy, [BRAND AESTHETIC]
Color palette: [COLORS]
Text (verbatim):
- Headline: "[HEADLINE]"
- Proof: "[PROOF OR SUPPORTING LINE]"
- CTA: "[CTA]"
Constraints: fictional placeholders only unless supplied; no third-party logos; no watermark; no unsupported badges; product label legible.
Avoid: tiny copy, clutter, duplicated products, extra fingers, fake platform chrome, invented certifications.
```

## Iteration recipe

For a new concept round, pick 3–5 mechanisms matching the campaign objective:

- **Awareness / pattern interrupt:** Breaking news, warning, zero stars,
  don't buy this, meme.
- **Problem education:** X signs, problems, myth vs. fact, problem vs.
  solution, you can avoid.
- **Trust / proof:** Reviews, testimonial, forum post, stat headline,
  transformation.
- **Purchase intent:** Offer, bundle, low stock, us vs. them, new vs. old.
- **Native / organic feel:** Doodle, notes, story-style, email, text message.

Generate one baseline per mechanism, select the best two, then create three
controlled variants of each. Keep a clean control so performance differences
attribute to the changed variable.

## Production QA checklist

- Headline is readable at 25% zoom.
- Product and brand are identifiable in under one second.
- Only one primary message and one CTA.
- Copy is spelled exactly as approved.
- Ratings, testimonials, statistics, scarcity, and comparisons are documented.
- No unlicensed platform, publication, or review-site logos.
- Before/after imagery is representative and policy-compliant.
- Required disclaimers remain readable.
- Export has correct dimensions, color, and safe margins.
- Filename follows the workspace grammar and the experiment log identifies
  style, hook, audience, and version.
