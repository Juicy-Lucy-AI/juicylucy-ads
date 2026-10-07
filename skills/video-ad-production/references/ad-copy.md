# Ad copy — what converts and complies with Meta's advertising policies

Load this whenever you are about to write or revise ad copy: scene text while planning, on-screen
text while building or editing, or localized variants — not only when the user explicitly asks for
copy.

A batch of our highest-performing ad texts (~20 creatives across 12 languages) was rejected by Meta
for **"fraud, scams and deceptive practices."** Those ads worked commercially — the emotional
pattern was right. The problem was a specific set of _language and format choices_ layered on top of
a sound emotional core. This file separates the two: keep the emotional core, replace the risky
language.

## When this gate blocks a line, and when it only reports one

**This gate never stops the run.** It decides what happens to a line, not whether the ad gets
built: copy that is clean, already approved, or the user's own needs no sign-off, and the user
changes any line in the editor after the ad is built and before it is localised.

| Situation                                                                                      | Behaviour                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **You are authoring the copy** (new ad, variations, localized rewrites)                        | The compliance rules **block the line**. Do not ship one that breaks them; rewrite it, record the verdict, and say what changed and why in the closing reply. Then continue.                    |
| **The user supplied the copy verbatim** (a preservation brief, "use this text", pasted script) | The gate **reports, it does not block**. Build what was asked as given, then name each specific risk in your closing reply — which pattern, and the compliant rewrite you would suggest. Then continue. |

The distinction matters: the user may be deliberately re-testing a line, appealing a rejection, or
running copy that has already cleared review. Silently rewriting their words is not your call.
Silently shipping a known-rejected pattern without telling them is also not your call.

**The report branch outranks every rule** — the rules in this file, the platform taxonomy, and the
brand's `compliance-overlay.md`, its hard rules included. User-supplied copy is built as given.
"Reports" means the closing reply names each risk specifically — the platform pattern it matches, the
brand rule it breaks, and any conflict with `product-truth.md` — and offers a compliant alternative
for each, without rewriting the user's words and without withholding the build.

## The brand you are writing for

**This file carries no product facts.** Every claim an ad makes about what the
product is, does, costs, or cannot say comes from the brand, and the brand is a
separate skill — `brand-<slug>` in the catalogue.

Resolve it once, at Step 0, and load it before writing a line:

- Exactly one `brand-*` skill installed → that is the brand. Use it, and name it
  in your reply so the choice is visible.
- Several → ask which.
- None → say plainly that no brand is installed and create one from the product
  facts before writing a line — the `juicylucy-setup` skill's `extending.md`
  § Creating the first brand. **Never** fall back to the branding visible in a
  reference ad: that identity belongs to whoever made it, usually a competitor.

From the resolved brand, `product-truth.md` owns what may be claimed and
`compliance-overlay.md` owns what may not. The gate below checks copy against
both; it does not restate them, because a fact with two homes acquires two
versions.

**The overlay carries product-specific prohibitions this file deliberately does
not list** — a banned CTA style, a feature that must never be implied, a claim
class this client cannot make. Read it before the rules below: a line that
clears every rule here can still be forbidden by the brand.

## The platform layer

The taxonomy of what platform review rejects and why — the seven flagged
patterns, absolutes, fabricated precision, guaranteed outcomes, fake urgency,
flyer-style scam-coded formats, and the money-framing trigger class — has one
home: the `ad-platform` skill's `rejection-taxonomy.md`, shared with the
statics engine. Read it before writing. The compliance rules below are this
gate's operative digest of it; when the digest and the taxonomy disagree, the
taxonomy wins and the digest is the bug.

## Core writing rules

1. **Simple words, short sentences.** Write like you're texting a friend. If a 12-year-old wouldn't
   understand a word, cut it.
2. **Name the reader's specific version of the problem.** Not "grow your business" — "you post a
   product and nobody sees it", "you've spent hours in Canva for one ad". Specificity in the _pain_
   earns the read.
3. **Lead with the relief, not the mechanism.** The reader doesn't care that it's AI-powered; they
   care that they stop doing the annoying manual task.
4. **Write from inside the reader's head.** Before finishing a line, ask: if I were this exact
   person, scrolling tired at 11pm, would this make me feel understood, or suspicious?
5. **One idea per ad.** Don't stack the discount, the urgency, the stat, and the guarantee in the
   same 20 words.
6. **Soft-guarantee language, not hard.** "can help you", "many users start seeing", "built for",
   "made for people who…" instead of "will", "guaranteed", "never again".

## Compliance rules

- **No exact, granular result numbers presented as an expected outcome.** Ranges and feature
  descriptions are fine ("more orders", "new leads coming in"); fabricated precision is not.
- **No absolute claims** ("never", "always", "guaranteed", "100%"). Replace with reduction language:
  "spend less time on…", "skip the manual part of…".
- **No stacking an extreme price with an extreme outcome** in one line.
- **Urgency only when it's real** — a genuine dated promo, not an evergreen "ends tonight".
- **No handwritten-note / flyer / found-on-the-street visual concepts**, and no first-person "I made
  $X" income story with invented daily numbers.
- **No "one action → guaranteed cascade of success" checklist endings.** A checklist may describe
  _what the product does_; it must not end on "sales start pouring in" or "you go viral". End on
  what the reader gets to stop doing.
- **Whatever the resolved brand's `compliance-overlay.md` forbids.** Banned CTA styles, features
  that must never be implied, claim classes this client cannot make — they are product-specific, so
  they live with the brand and are not restated here. A line clearing every rule above can still
  fail there.
- **When in doubt:** read the line back and ask "could this appear, verbatim, in a scam text
  message?" If yes, rewrite it regardless of how well it might convert.

## Compliant templates


**VELORA is a placeholder**, not a client. Examples in this file name a fictional
product so the structure can be read without a brand attached — swap in the resolved
brand's name and its own proven phrasings, which live with the brand, not here.

Each keeps the emotional shape that worked, with the risky language swapped out.

**1. Stop doing this by hand** (was: an absolute "never again" claim stacked on an extreme low
daily price, for a capability the product does not have)

- "Tired of writing every caption yourself? Let VELORA take the busywork off your plate."
- "Stop starting from a blank page every time you need a new post."
- "Spend less time planning content, more time running your business."
- "Built for people who'd rather not open a content calendar every morning."

**2. How it works** (was: a guaranteed viral outcome via ads)

- "Tell VELORA about your business once. 📝 / It learns your voice and style. 🎨 / It writes and
  designs your posts. ✍️ / It posts them when your audience is active. ⏰ / So content stops being
  the thing you never get to. ✅"
- Swap the last line, never for an outcome: "One less thing to remember every day." / "No more
  guessing what to post next." / "You get your time back."

**3. Relatable pain / POV** (was: a POV meme with an implausible speed/effort ratio, closing on a
granular unverifiable order count)

- "POV: your co-founder is still fighting with Canva, and your week's posts are already scheduled."
- "You upload a photo. VELORA writes the post. That's the whole job now."
- "The post your competitor spent all afternoon on? Yours took two minutes."

**4. Light social proof** (was: a torn-paper flyer with itemized daily earnings)

- "I used to spend hours writing posts that went nowhere. VELORA changed that for me."
- "My posts used to take all afternoon. Now they take two minutes."
- "I stopped guessing what to post — VELORA does that part."

**5. Discount / time-limited** — only with a real, dated promotion, and keep the claim modest next
to the discount.

- "This week only: try VELORA at a lower price."
- "New here? Get a discount on your first month."

## Generating a set of variations

When asked for N copies of one concept, vary along these axes so the set is genuinely diverse rather
than N rewordings:

1. **Emotional entry point** — the overwhelmed beginner, the person who tried and failed, the
   skeptic, the time-strapped solopreneur, the person comparing tools.
2. **Format** — mix: one checklist, one direct problem-to-relief, one question hook, one light
   testimonial, one POV moment.
3. **Length** — at least one under 10 words, at least one that sets up the problem first.
4. **Angle** — time saved, money saved, stress reduced, confidence gained. Don't let them all lean
   on the same benefit.
5. **Every variant passes the rules above.** If a risky version clearly outperforms, rebuild that
   feeling within the rules rather than keeping the risky line.

## Localization

Rewrite as concise native customer language preserving the approved claim — never translate
literally into copy that forces tiny type. Check product scope against the brand's
`product-truth.md` and compliance in the target language against its `compliance-overlay.md`,
preserve Latin product names, and lock line breaks that fit the reference hierarchy with
mobile-safe margins. Inspect every rendered glyph at full resolution; use OCR to find
review candidates but adjudicate unsupported scripts visually.

## Pre-submission checklist

- [ ] No exact/granular outcome numbers presented as what will happen to the reader
- [ ] No "never", "always", "guaranteed", "100%" about product performance
- [ ] No extreme price stacked with an extreme outcome
- [ ] Urgency reflects a real, dated promotion
- [ ] No handwritten-note / flyer visual, no itemized income story
- [ ] Checklist copy ends on a feature or a relief, not a guaranteed result
- [ ] Every line survives "could this appear in a scam text message?"
- [ ] Short sentences, plain vocabulary, one idea per ad
- [ ] Variations differ in entry point, format, length, and benefit angle — not just wording
- [ ] Every line checked against the resolved brand's `compliance-overlay.md`, including the CTA
