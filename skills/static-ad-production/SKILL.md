---
name: static-ad-production
description: "Produce static image ad creative for paid social (Meta / Instagram / TikTok feed, Stories, Reels placements) as dated, localized campaign batches — either by iterating the account's own winning statics or by reinterpreting competitor statics found in a public ad library. Use for 'make static ads', 'new statics batch', 'iterate our winning statics', 'competitor-inspired statics', or any request whose deliverable is a set of static image ads organized into language/ad-set folders for upload. Sources a reference, writes compliant copy, generates differentiated masters, localizes into every approved language, and QAs the batch against the workspace conventions. For a video ad or video batch use /video-ad-production instead."
---

# Static Ad Production

> **This runs in Claude Code on a Mac.** If this is not Claude Code on the user's own Mac — the
> request came from claude.ai chat, Cowork or the mobile app, whose code sandbox is not the user's
> Mac — say that ad production renders on the user's own Mac inside Claude Code, point them there,
> and stop. Do not plan, write copy, or generate anything from a surface that cannot render the
> result.

**This skill produces static images.** A video batch — even one sharing the
same publish date and the same `#0000` number line — is a separate run through
`/video-ad-production`: a video ad is iterated from a video ad, never from a static
image.

Turn a performance signal — a winning static of your own, or a competitor's
static that is clearly working — into a dated batch of differentiated,
localized static ads, filed and named so the ads manager report can be traced
back to the exact concept and batch that produced each creative.

## Before Step 0 — is this machine set up?

The naming tool, the QA scripts and `juicy` all come from what the
`juicylucy-setup` skill installs, and a machine that has never run setup has
none of them. So **the first command of every run**, before the publish day is
asked about or a folder is inspected, is the setup skill's doctor in preflight
mode:

```bash
sh "${CLAUDE_SKILL_DIR}/../juicylucy-setup/scripts/doctor.sh" --preflight
```

Claude Code fills in this skill's own directory; the setup skill sits beside it
in the plugin's `skills/` folder.
It is read-only, takes a few seconds, reaches no network, and prints one line
per requirement, ending in a `preflight` line that is the verdict:

- **`preflight ok`** (exit 0) — the toolchain is installed and reachable. Go
  on to Step 0. If another line reads `missing` — `juicy-login`, a `juicy`
  other than the pinned version — note it and continue; none of it blocks the
  batch from being planned. Not being signed in is something you fix here
  when generation needs it, by signing the user in in this conversation
  (§ Tool policy) — never a command they run.
- **`preflight missing`** (a non-zero exit) — setup has not been run on this
  machine, or was not run to the end. **Do not start the batch.** Load the
  `juicylucy-setup` skill and run it from its Step 1 through to the sign-in:
  it diagnoses, explains what is missing in plain words, asks before
  installing, and needs no restart. Tell the user the batch starts when they
  ask for it again after setup — nothing has been written yet, so nothing
  needs carrying over.

Running the doctor is not a question and not a stop (§ Where to stop). Do not
substitute a check of your own — `which juicy`, whether `~/.juicylucy` exists
— for it: the doctor knows where setup puts things.

## Step 0 — resolve the three inputs everything depends on

1. **The brand.** This skill knows no brands: no product facts, no palette, no
   claims, no competitor list. Each brand ships as its own skill, named
   `brand-<slug>`. Exactly one installed → that is the brand; name it in your
   reply. Several → ask which. None → say so plainly and create one first:
   the `juicylucy-setup` skill's `extending.md` § Creating the first brand
   (ask for the product facts, write a `brand-<slug>` skill from the template
   into the user's own skill folder, read it for this run). **Never adopt the
   branding visible in a reference ad** — that identity belongs to whoever
   made it, usually a competitor.
2. **The workspace conventions.** Filenames, folder grammar, the global
   sequence, language codes, allocation policy, and the evidence layout live
   in the `juicylucy` skill (`naming.json`, `foldering.json`,
   `allocation.json`, `languages.json`, `evidence.json`) — or, file by file,
   in this Mac's conventions folder, which replaces them (that skill's
   § Which copy to read). Read them before creating anything; if you cannot
   reach them, **stop and ask** rather than working from memory. The
   `ad-naming` skill's tool (`naming.mjs`) is what turns those conventions
   into filenames, folder names and sequence numbers — nobody types one by
   hand.
3. **The source adapter.** Two ways into the pipeline, chosen by where the
   signal comes from — see [references/source-adapters.md](references/source-adapters.md):
   - **winners** — the account's own recent performance, retrieved read-only
     through the `static-winner-analysis` skill.
   - **competitors** — public ad-library research over the brand's competitor
     set (from the brand's `competitor-set.md`).

## Run the workflow

Read [references/workflow.md](references/workflow.md) for the long form of
every phase before the first run.

1. Take the publish day from the request; ask only when nothing in the
   request or the campaign root implies it. Normalize it per the workspace
   `foldering.json` and inspect the output root. A new batch gets a fresh
   verified dated folder **before** source research, created without asking;
   the one question here is a batch for that day already existing — then
   confirm continuation, because a same-date continuation reuses the existing
   folder and mapping,
   treats every existing file as immutable, and reserves collision-free names
   before generating. Never silently reuse or overwrite a batch.
2. Infer the remaining variable inputs, asking only for what cannot be
   inferred: source adapter, lookback
   window or research scope, output root, ad sets per language, ads per ad
   set, aspect ratio (default per `naming.json`), positioning emphasis, and
   reference assets. Treat every demonstrated value as an input, not a
   default.
3. Build the iteration history **before** selecting a source: inspect prior
   dated batches, their manifests, project-state files, references, and
   previews; group by underlying creative concept with last-iteration date,
   days since, markets, and mutation mode. Prefer manifest and visual evidence
   over filenames; label uncertain matches.
4. Run the selected source adapter to produce a ranked, concept-deduplicated
   candidate list with a verified visual reference per concept
   ([references/source-adapters.md](references/source-adapters.md)).
5. Reconcile candidates with the iteration history and present **two viable
   paths with evidence** — repeat the strongest current concept (naming when
   it was last iterated and how many days ago) or explore a credible
   different concept with a clear learning hypothesis. Take the path the user chose;
   when they did not choose, take the stronger one, say which and why, and
   carry on — the master review is where it gets overturned. Never silently
   repeat the top-ranked concept merely because it is still ranked first.
6. For new markets or language iterations, allocate languages per the
   workspace `allocation.json`: live sources only, every active campaign
   covered, ranked by volume and efficiency together, exclusions applied, and
   the preflight table shown in the reply before any subfolder exists —
   shown, not waited on.
7. Extract the transferable elements from the selected reference — hook,
   promise, proof pattern, copy structure, layout, hierarchy, palette,
   audience intent. Preserve the strategy, not the design. Mark anything
   location- or culture-specific as a transferable role with a
   non-transferable asset.
8. Draft several compliant English copy directions. Read the
   `static-copywriting` skill before drafting; product claims come from the
   brand's `product-truth.md` and prohibitions from its
   `compliance-overlay.md`.
9. Generate several materially different master concepts — with `juicy`, always
   with `--no-preset` (§ Tool policy) —
   without pausing between them, each with one explicit mutation mode — **copy-led**,
   **visual-led**, or **full remix** — using all three across the set when
   volume allows. Every generation brief states the reference, mode, exact
   copy, dimensions, exact brand treatment, elements preserved, and elements
   changed. Default to a minimal, scan-first composition.
10. Inspect every master visually at full size — iteration-mode compliance,
    exact brand naming, legibility, hierarchy, differentiation, and the
    three-second clarity check ([references/workflow.md](references/workflow.md)
    § Master QA) — then show the set together and take the direction before
    localization. **That review is the one stop in this workflow**;
    localization is the batch that costs time.
11. Create or reuse the language/ad-set folders per the workspace
    `foldering.json` — the global sequence reserved with the `ad-naming` tool
    (`naming.mjs reserve`, run immediately before creation, never earlier in
    the session) and every folder name composed by `naming.mjs folder`; one
    language per folder.
12. Choose the localization mode per master — text-only or creative
    adaptation — and localize per the `static-localization` and
    `static-image-craft` skills: meaning over words, scripts reflowed,
    landmarks substituted for the target market, a stress-testing sample
    inspected before scaling.
13. Save every creative into its mapped folder under a filename produced by
    the `ad-naming` tool (`naming.mjs name`, or `naming.mjs inherit` for a
    localized copy) — never typed by hand; verify dimensions, language,
    branding, uniqueness, and readability. Never overwrite; collisions
    increment the version.
14. Run the batch QA checklist and deliver the manifest
    ([references/workflow.md](references/workflow.md) § QA and § Delivery
    manifest).

## Where to stop

A stop is required only when the next step spends significant money (paid
generation: motion, or a provider image batch), significant time (a batch of
many generations or localizations), or writes outside the workspace
irreversibly. Everything else: decide, do, report what you did.

Here that means one review — the master set, shown together before
localization. The setup doctor before Step 0 is a read-only probe whose
verdict decides only whether the setup skill runs first; it asks nothing. The
publish day, the inputs, the dated folder, the repeat-or-explore path and the
language allocation are inferred and stated, asked only when they cannot be
inferred or when a batch for the same day already exists.
 A question that decides nothing the user can judge yet is
noise, and noise is what makes the one real review get approved unread.

## Tool policy

- Performance retrieval is read-only, through `static-winner-analysis` and its
  standing-authorization contract. No ad-platform write of any kind belongs to
  this workflow.
- Make every raster creative — masters and localizations — with `juicy`:
  `~/.juicylucy/bin/juicy image generate` for a new image, `~/.juicylucy/bin/juicy image edit --image <source>`
  when a source image is the reference, as every localization's is. Always
  pass `--no-preset`: juicy's default preset is written for video first frames
  and bans the on-image text, logo and interface a finished static must carry,
  so the prompt itself states the exact copy and brand treatment. Each call
  costs credits: put `--max-cost` on it, as the `juicy-cli` skill says. Its
  output lands under the project's `.media/`: copy each into the folder it
  belongs to. On repeated failure within one request, preserve the reference
  and the complete specification and retry once with `--force` — never with a
  context-free "again". When `juicy` is unavailable, say so and stop — never
  compose a stand-in image with a script or a drawing library.
- **`juicy` signed out is not `juicy` unavailable.** Exit `3`
  (`no_credentials`), or the doctor's `juicy-login` line reading `missing not
  signed in`, means you sign the user in here, in the conversation: keep what
  the batch has made, load the `juicylucy-setup` skill and follow its § Step 4
  — the sign-in (run `~/.juicylucy/bin/juicy auth help` before asking for anything, then ask for
  what it names, e.g. "Want me to sign you in here? Tell me the email for your
  JuicyLucy account"), and once the sign-in is confirmed carry on from the
  call that stopped. `juicy`'s error names a `next` command and says the user
  must act: that command is addressed to you; the user's part is to answer a
  question here. If the turn ends before they answer, end it on that offer.
  Never print a sign-in command for the user, never send them to Terminal or
  a browser, and never say "sign in and ask again".
- Use a signed-in browser or computer use only for ad-library research,
  uploads/downloads, and visual checks that cannot be done from files.
- Use filesystem tools for folder creation, collision checks, and output
  verification. Before writing outside the active workspace, request approval.
- Never store credentials, cookies, or tokens in skills, manifests, logs,
  filenames, or summaries.

## Guardrails

- Do not mix mediums in one shortlist, one reference set, or one QA pass.
- Do not hardcode a demonstrated date, path, page, language set, count,
  campaign number, or filesystem root — all inputs.
- Do not start production until: the brand is resolved, the workspace
  conventions are readable, prior batches were checked for concept reuse, and
  the repeat-versus-explore choice was made or supplied.
- Do not fill multiple source slots with executions of one underlying concept;
  deduplicate first and keep one strongest reference per concept.
- Do not copy any source pixel-for-pixel — retain the winning hypothesis while
  changing composition and execution; a color swap is not a new concept.
- Do not blur the mutation mode: copy-led preserves recognizable visual
  continuity, visual-led preserves the approved text exactly, full remix
  changes both materially.
- Do not transplant a location-specific landmark or cultural symbol unchanged
  across markets; substitute a verified target-appropriate equivalent that
  preserves its compositional role.
- Do not confuse richness with density: one visual hero, one unmistakable copy
  hierarchy, one primary CTA.
- Do not translate text without reflowing type for the actual script and
  length.
- Do not overwrite existing creatives, renumber existing folders, or rerun
  allocation in a same-date continuation.
- Pause before publishing, launching, or changing live campaigns unless the
  user explicitly requests that separate action.
