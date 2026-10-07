# The statics pipeline — long form

Five phases: establish the batch → select the source → develop masters →
prepare folders → localize, QA, and deliver. The workspace conventions
(`juicylucy` skill) own every value this file refers to by name; the brand
skill owns every product fact. If either cannot be read, stop and ask.

## Inputs

- Intended publish day
- Source adapter (winners / competitors) and its scope — lookback window or
  competitor set
- Output root
- Ad sets per language and ads per ad set
- Aspect ratio (default per the workspace `naming.json`)
- Target languages, or the allocation inputs that determine them
- Positioning emphasis and any visual direction
- Reference assets, when the user supplies them

Ask only for missing inputs that materially change the result. Infer the rest
by inspecting adjacent campaign batches — and treat everything inferred as
this run's input, never as a permanent default.

## Phase 0 — establish the batch

Before any of this, `SKILL.md` § Before Step 0 has run the setup skill's
doctor in preflight mode and it read `preflight ok`; a machine it failed on is
in the setup skill, not here.


1. Ask `What is the intended publish day?` unless supplied. Normalize it and
   resolve the dated folder under the output root per `foldering.json`.
2. Inspect the destination first. An existing date folder is reused only on an
   explicit same-date-continuation confirmation. Never assume reuse is safe.
3. New batch: create and verify the empty dated folder **before** source
   research. Continuation: verify and reuse the existing folder, inventory its
   language/ad-set folders and creative basenames, and treat every existing
   file as immutable — preserve the allocation and mapping, do not refetch
   languages, do not renumber, reserve collision-free names (from the `ad-naming` tool) or
   next version numbers before saving anything new, and append the new cycle to the
   existing manifest.
4. For a new batch or a requested allocation change, allocate languages per
   the workspace `allocation.json`: resolve the live campaign-structure and
   language-performance sources named in the brand's files, fetch fresh
   snapshots, apply the coverage floor and the ranking and exclusion rules,
   and present the preflight table before creating subfolders. Snapshots are
   temporary read artifacts — re-fetch on every run. If live access is
   unavailable, ask the user to restore it; do not fall back to an old export.

## Phase 1 — select the source

Run the adapter chosen at Step 0 — [source-adapters.md](source-adapters.md)
carries each one's procedure. Both adapters end at the same contract:

- a ranked candidate list, **clustered by underlying creative concept** —
  language, translated copy, localized names, and market are execution
  attributes, not separate concepts; one concept occupies one slot, with its
  strongest execution as the visual reference and the rest recorded as
  supporting evidence;
- a **verified visual reference** per selected concept: the actual creative,
  opened and visually confirmed against the row or listing that nominated it,
  captured or located as the generation reference;
- the concept's **transferable hypothesis** in plain language — hook, promise,
  proof pattern, copy structure, layout, hierarchy, audience intent — with
  any location-specific device described as a transferable role (recognition,
  pride, scale, anchoring) separate from its non-transferable local asset;
- the join against the prior-iteration history, feeding the
  **repeat-versus-explore** decision: present both paths with evidence (last
  iteration date and age in days for a repeat; credible delivery and a
  distinct learning hypothesis for an explore) and ask unless the user
  already chose. Recommend exploration when recent batches reused the same
  concept.

## Phase 2 — develop the masters

1. Extract hook, audience pain, product mechanism, benefit, proof, CTA, and
   visual hierarchy from the selected reference.
2. Read the `static-copywriting` skill, the brand's `product-truth.md`, and
   its `compliance-overlay.md`. Draft several English copy directions from
   the same hypothesis; rewrite anything resembling a guaranteed outcome,
   fabricated precision, or an unsupported performance promise as product
   capability, user experience, or qualified benefit. Keep the product
   mechanism, audience, offer, and CTA clear.
3. Decide whether character substitution applies: when the source concept
   prominently depends on its own character, mascot, or spokesperson and the
   brand has character assets (its `brand-kit.md`), translating the device
   into the brand's own character can strengthen the adaptation — reference
   the actual asset files rather than redrawing them. When the source has no
   character-led device, do not insert brand characters by default; build the
   strongest differentiated visual for the idea.
4. Assign every master one explicit mutation mode:
   - **Copy-led** — change the text; retain the source background's core
     environment, structure, or motif, re-rendered into a recognizably
     similar but new execution. Never a pixel-for-pixel clone.
   - **Visual-led** — keep the approved text exactly unchanged; materially
     change the setting, subject, surface, composition, or visual metaphor.
   - **Full remix** — change both materially, retaining only the marketing
     hypothesis.
   Use all three modes across the set when volume allows, and record each
   master's mode and its preserved/changed elements before generation.
5. Generate multiple materially different master concepts at the requested
   ratio — with `~/.juicylucy/bin/juicy image generate --no-preset` (SKILL.md § Tool policy) — without pausing
   between them. Each generation brief states: the reference, the mutation mode, the
   exact copy, dimensions, the exact brand name and treatment, elements that
   must remain, elements that must change. Make weak concepts materially
   different with explicit follow-ups (different setting, surface, type,
   angle) — never "another version".
6. **Composition doctrine:** default to a minimal, scan-first composition —
   one dominant hook, one short mechanism or proof block, one primary CTA,
   and only the supporting elements the idea needs. Prefer whitespace and a
   clear reading path over dashboards of cards, badges, notifications,
   arrows, or repeated UI panels.

### Master QA

Inspect every master at full size, then show the set together and take the
direction before localization — the one stop in the workflow:

- iteration-mode compliance — the declared preserved/changed split actually
  holds;
- exact, full brand naming (shortened or approximated brand names are
  defects) and correct logo treatment;
- accurate, supported copy; no policy-risk claims;
- legibility and hierarchy: no clipping, no awkward breaks, no excessive
  empty space, readable CTA;
- differentiation: materially different from the source and from sibling
  masters, not merely recolored;
- **the three-second clarity check at phone size**: the viewer must get the
  main promise and next action without tracing competing elements. If it
  feels busy, remove secondary UI, duplicate proof, extra CTA treatments, and
  decorative badges before shrinking type.

Save approved masters into the batch's references folder and record each
one's mode.

### Image-generation recovery

1. On a transient failure, retry once with the same complete specification.
2. On a second failure, start a fresh generation task: reattach the reference
   and brand assets and restate the whole brief — ratio, scene, exact
   on-image copy, typography, brand treatment, preserved elements.
3. Never depend on the failed task's conversational memory or submit "again".
4. Verify the recovered output against the original brief before approval.

## Phase 3 — prepare the folders

Everything here is the workspace's `foldering.json` applied: reinspect the
output root and the newest neighboring batch; create one folder per approved
language in a new batch (or build the destination map from the existing
folders in a continuation); reserve the global `#0000` block with the `ad-naming` tool (`naming.mjs
reserve`, run immediately before creation) and compose each folder name with
`naming.mjs folder`; apply the established folder grammar; confirm
the destination count equals the approved language count before generating at
scale.

## Phase 4 — localize and adapt

Select one mode per master before generating:

- **Text-only localization** — the image, subject, composition, palette,
  symbols, and CTA structure stay fixed; only language-dependent text and
  locale fields change, reflowed for the script.
- **Creative adaptation** — the winning hypothesis and brand system stay; the
  subject, environment, object, styling, or cultural treatment may change.

Location-specific concepts default to creative adaptation: preserve the
device's winning role but replace the source landmark or cultural symbol with
a verified equivalent recognizable to each target market. If a language spans
several markets and the geography is unclear, use a broadly recognizable
setting or ask.

Build a preflight table — language, code (per `languages.json`), destination
folder, localization mode, planned filename — with exactly one destination
per language. Then, per locale: translate meaning and marketing intent;
localize names, handles, punctuation, and cultural cues; preserve the
approved concept and exact brand naming; recompose typography for script
expansion, contraction, and direction rather than swapping strings in a fixed
layout.

**Before full-batch generation**, produce and inspect a stress sample: a
compact Latin translation, a long one, a non-Latin script, and a
right-to-left script when present. Fix the rule, not the instance, before
scaling. The per-asset recreation contract, attempt accounting, and retry
discipline live in `static-image-craft` and `static-localization`.

## Batch QA checklist

Every output, before delivery:

- correct language and locale; no untranslated fragments; natural phrasing
- exact brand/product naming and treatment
- no clipped, overlapping, or tiny text; balanced spacing; strong hierarchy;
  readable CTA
- correct ratio and dimensions; file opens and contains the intended final
  image
- mutation mode respected; localization mode respected
- materially different from source and siblings
- landmarks and cultural symbols appropriate to the target market
- right-to-left and non-Latin scripts render correctly
- correct destination folder; collision-free, grammar-compliant filename; no
  existing file overwritten; every ad set holds the requested number of
  distinct files (never one file duplicated to satisfy a count)
- recovered generations still match their complete original brief

If multiple outputs share a layout defect, stop the batch, fix the master or
the localization rule, and regenerate the affected variants.

## Delivery manifest

Report: the source adapter, scope, and selection criteria; selected concepts
with prior-use status and the hypothesis retained; the iteration history
consulted; the repeat-versus-explore options and decision; mutation mode and
preserved/changed elements per master; the allocation table applied; folder
tree and per-language counts; QA failures corrected; exceptions and items
needing human review; and an explicit note that no live campaign was
published unless publishing was requested.
