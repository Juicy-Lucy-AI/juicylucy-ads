---
name: static-copywriting
description: Write, review, or localize the copy for static image ads — hooks, overlay text, body copy, and CTA — so it converts and complies with Meta's advertising policies. Use when drafting copy for a static ad batch, generating diverse test variations per concept (typically 5), rewriting a rejected or risky draft, locking localized copy before image generation, or judging whether a line will trip Meta's fraud/scams/deceptive-practices review. Applies the platform rejection taxonomy — absolutes, fabricated precision, guaranteed outcomes, fake urgency, scam-coded formats — which lives in the ad-platform skill's rejection-taxonomy.md, not here. Product facts come from the resolved brand skill (a `brand-*` skill), never from here.
---

# Static ad copywriting

Copy for static ads earns its read in one glance and survives two reviews: the
platform's policy reviewer and the customer's scam radar. This skill is the
method for both. It carries **no product facts** — see below.

Read the `ad-platform` skill's `rejection-taxonomy.md`
before writing anything, and
[references/narrative-and-localization.md](references/narrative-and-localization.md)
before writing multi-line overlay copy or localizing.

## Step 0 — resolve the brand

Every claim an ad makes about what the product is, does, costs, or cannot say
comes from the brand, and the brand is a separate skill — `brand-<slug>` in
the catalogue:

- Exactly one `brand-*` skill installed → that is the brand. Use it, and name
  it in your reply so the choice is visible.
- Several → ask which.
- None → say plainly that no brand is installed and create one from the
  product facts before writing a line — the `juicylucy-setup` skill's
  `extending.md` § Creating the first brand. **Never** fall back
  to the branding visible in a reference ad: that identity belongs to whoever
  made it, usually a competitor.

From the resolved brand, `product-truth.md` owns what may be claimed,
`compliance-overlay.md` owns what may not, and `copy-patterns.md` (when
present) owns the brand's proven phrasings and protected terms. If you cannot
read them, **stop and ask** — do not write copy from memory, and do not treat
this skill's examples as product scope: they use the fictional placeholder
**VELORA**, not a client.

## Compliance has two layers, both mandatory

1. **The platform layer — this skill.** True for every advertiser: no
   guaranteed outcomes, no absolutes, no fabricated precision, no fake
   urgency, no scam-coded formats (the `ad-platform` skill's `rejection-taxonomy.md`).
2. **The brand layer — the resolved brand's `compliance-overlay.md`.** What
   this client may not say over and above policy (a banned CTA style, a
   feature that must never be implied). A line passing the platform layer can
   still be forbidden by the brand.

Check every line against both. Neither substitutes for the other.

## When the user supplied the copy

Both layers govern copy **you** author. When the user supplies the copy
verbatim — "use this text", a pasted line, a signed-off hook — the gate reports
and does not block, and that report branch outranks every rule in both layers,
the brand's hard rules included. Build the words as given; then name each risk
specifically in your reply — the platform pattern it matches, the brand rule it
breaks, any conflict with `product-truth.md` — and offer a compliant
alternative for each. Never rewrite the user's words silently, and never
withhold the batch over them.

## Core writing rules

1. **Simple words, short sentences.** Write like you're texting a friend. If
   a 12-year-old wouldn't understand a word, cut it.
2. **Name the reader's specific version of the problem.** Not "grow your
   business" — "you post a product and nobody sees it", "you've spent hours
   in Canva for one ad". Specificity in the *pain* earns the read.
3. **Lead with the relief, not the mechanism.** The reader doesn't care that
   it's AI-powered; they care that they stop doing the annoying manual task.
4. **Write from inside the reader's head.** Before finishing a line, ask: if
   I were this exact person, scrolling tired at 11pm, would this make me feel
   understood, or suspicious?
5. **One idea per ad.** Don't stack the discount, the urgency, the stat, and
   the guarantee in the same 20 words.
6. **Soft-guarantee language, not hard.** "can help you", "many users start
   seeing", "built for", "made for people who…" — never "will",
   "guaranteed", "never again".

## Platform compliance rules

- **No exact, granular result numbers presented as an expected outcome.**
  Ranges and feature descriptions are fine ("more orders", "new leads coming
  in"); fabricated precision ("43 orders before lunch") is not.
- **No absolute claims** ("never", "always", "guaranteed", "100%"). Replace
  with reduction language: "spend less time on…", "skip the manual part of…".
- **No stacking an extreme price with an extreme outcome** in one line.
- **Urgency only when it's real** — a genuine dated promotion, not an
  evergreen "ends tonight" running across every audience and every day.
- **No handwritten-note / flyer / found-on-the-street visual concepts**, and
  no first-person "I made $X" income story with invented daily numbers.
- **No "one action → guaranteed cascade of success" checklist endings.** A
  checklist may describe *what the product does*; it must not end on "sales
  start pouring in" or "you go viral". End on what the reader gets to stop
  doing, or on a feature.
- **Money-management framing is platform-sensitive.** Copy built around the
  reader's ad budget, advertising spend, or agency fees ("pause your ad
  budget"-style lines) sits near the platform's financial-services triggers;
  treat it as high-risk and prefer the underlying pain instead.
- **When in doubt:** read the line back and ask "could this appear, verbatim,
  in a scam text message?" If yes, rewrite it regardless of how well it might
  convert.

## Generating 5 test variations for a concept

Vary along all five axes so the set is genuinely diverse, not five rewordings:

1. **Emotional entry point** — the overwhelmed beginner, the person who tried
   and failed, the skeptic, the time-strapped solopreneur, the comparer.
2. **Format** — one checklist/how-it-works, one direct problem→relief, one
   question hook, one light testimonial-style line, one POV/relatable moment.
3. **Length** — at least one under-10-words punch, at least one that sets up
   the problem before the relief.
4. **Benefit angle** — time saved, money saved, stress reduced, confidence
   gained; don't let all five lean on one.
5. **Every variant still passes both compliance layers.** If a risky version
   clearly outperforms, rebuild what made it work emotionally within the
   rules — never keep the risky line because it converts.

## The localization copy lock

Before generating any localized image:

1. Transcribe the source message; identify hook, mechanism, control/proof
   line, and CTA.
2. Rewrite as concise native customer language preserving the approved claim
   (`references/narrative-and-localization.md` — meaning, not words).
3. Check product scope against the brand's `product-truth.md`.
4. Check both compliance layers.
5. Preserve the brand's protected Latin terms (its `copy-patterns.md` lists
   them).
6. Lock line breaks that fit the reference hierarchy with mobile-safe margins.
7. Record the exact copy in the language's provenance ledger **before** image
   generation (the `juicylucy` skill's `evidence.json` → `qa_package`).
8. Inspect every rendered glyph at full resolution; OCR finds candidates, a
   human adjudicates (`static-localization` owns the QA procedure).

Prefer shorter natural copy over literal copy that forces tiny type. Language
defaults (script, direction, Simplified-vs-Traditional) come from the
`juicylucy` skill's `languages.json`, not from memory.

## Pre-submission checklist

- [ ] Brand resolved; `product-truth.md`, `compliance-overlay.md`, and
      `copy-patterns.md` read this session
- [ ] No exact/granular outcome numbers presented as what will happen
- [ ] No "never" / "always" / "guaranteed" / "100%" about performance
- [ ] No extreme price + extreme outcome in one line
- [ ] Urgency/discount reflects a real, dated promotion
- [ ] No flyer/handwritten-note concept, no itemized income story
- [ ] Checklist copy ends on a feature or relief, not a promised result
- [ ] No high-risk money-management framing
- [ ] Every line passes the brand's `compliance-overlay.md`
- [ ] Every claim is supported by the brand's `product-truth.md`
- [ ] Short sentences, plain vocabulary, one idea per ad
- [ ] The variation set differs across all five axes, not just wording
- [ ] The scam-text test passes on every line

## Boundaries

- Typography, face protection, and layout of the copy on the image belong to
  `static-image-craft`; batch orchestration and QA to `static-localization`;
  the production pipeline to `static-ad-production`. Video copy runs through
  `/video-ad-production`.
