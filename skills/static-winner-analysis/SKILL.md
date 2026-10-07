---
name: static-winner-analysis
description: Analyze an ad account's static-ad performance through the platform's marketing API under a strict read-only contract, to select fresh winning static concepts for iteration. Use when retrieving insights, ads, creatives, and previews to rank winners, deduplicating localized executions into unique concepts, maintaining an unused-winner ledger, or verifying a winner's creative before it becomes a generation reference — without creating, editing, publishing, pausing, budgeting, or otherwise mutating anything in the account. Also use whenever someone asks to pause, resume, edit, or re-budget an ad, ad set, or campaign, or pastes an ad-platform access token into the conversation: this skill holds the rule that such a change is declined and pointed to the platform's own manager, and that a pasted token serves reads only and is never persisted or repeated.
---

# Static Winner Analysis — read-only

Retrieve what is working, prove it, and hand the pipeline a deduplicated,
evidence-backed winner list. This skill holds the permission boundary and the
credential rules for every ad-account read the statics pipeline performs.

## Decide this first

Two things arrive here that this skill never acts on. Settle them before any
command runs, because each is decided once, in the reply, and not revisited
when a permission, the network, a connector, or a confirmation turns up later.

- **A change to the account — pause, resume, edit, publish, budget, delete,
  duplicate, upload, or anything else that alters an object or its
  delivery.** This skill makes no write of any kind: not for an urgent
  request, not with the user's explicit permission, not after a
  confirmation. Decline it in the reply, say in one line that this route is
  read-only, and point to where the change is made — the ad platform's own
  manager (for Meta, Ads Manager: find the ad set and switch it off) or a
  person with write access to the account. Describing those steps in the
  platform's interface is the only how-to you give. Never:
  - call anything that writes, however it is labelled ("only a lookup first");
  - offer to make the change later — once the user allows a host, grants a
    permission, connects something, or confirms the exact object;
  - hand the user a write to perform themselves — no `curl`, script, API
    request, SDK snippet, or URL that changes anything, with or without the
    token in it.

  A request that is both — "pause it, and show me how it did" — gets its
  read half through the supported route below and its write half declined.
- **A token pasted into the conversation.** It may serve this session's
  read-only queries (§ The permission contract) and nothing else: it never
  makes a write acceptable, and it is never persisted. Pass it at runtime
  only, in an `Authorization: Bearer` header from a shell variable assigned in
  the same command — never in a URL or query string (`access_token=`), never
  written to a file, an environment file, a log or the manifest, never echoed
  or printed, and never repeated in a reply, in whole or in part. It now sits
  in the transcript, so when the analysis is done, tell the user to revoke it
  and generate a new one, and say that an insights export or a connector
  avoids pasting one next time.

## The permission contract

- **The read-only routes**, in order of preference: a connector the host
  already has to the ad platform, which holds its own credentials; an
  insights export from the platform's manager placed in the workspace, which
  needs no credential at all; a token the session already holds outside the
  conversation, used by reference (an environment variable's name); or a
  token the user pastes for this session, used as § Decide this first says.
  Never change the host's settings, permissions, or network allowlist to make
  a route work. None of it is ever stored in a skill, config, manifest, or
  artifact.
- Once a supported route exists, read-only retrieval for winner analysis is
  **standing-authorized**: run the GET requests the analysis needs without
  re-asking per query. If the session has none, say so once and name the
  routes above — an export is usually the quickest; a pasted token should
  carry read permissions only.
- **Read-only means read-only.** Retrieve account metadata, campaigns, ad
  sets, ads, creatives and previews, insights, actions, spend, and conversion
  fields. Never call anything that creates, updates, publishes, pauses,
  resumes, deletes, duplicates, uploads, or adjusts any object, budget,
  audience, billing, or delivery state. Writes are outside this skill
  entirely — not a step it reaches with more permission — and the user makes
  them in the platform's own manager (§ Decide this first).
- State the read-only boundary in the run's manifest so the contract is
  visible in the record.

## Credential hygiene

- Never write a token into a file, URL, log, filename, summary, command
  echo, reply, or recorded artifact of any kind. A token the session holds is
  referred to by name; a pasted one is passed in a header at runtime only
  (§ Decide this first). Redact it from anything persisted.
- Treat a token found in client-side or public configuration (for example a
  browser-exposed environment variable) as compromised: do not use it, flag
  it, and advise rotation.
- Retain no login state, cookies, or session material after the run.

## Retrieve and rank

1. Query insights for the requested lookback window, restricted to static
   image ads — media type is part of the query, not a post-filter hope.
2. Parse results from the actual action/conversion fields; do not trust a
   pre-aggregated column whose definition you have not checked.
3. Rank on meaningful conversion volume **and** cost efficiency together.
   Exclude under-delivered ads; never promote an ad because one conversion
   produced a flattering cost figure.
4. Open each shortlisted ad's creative preview and visually confirm it
   corresponds to its performance row before treating it as a winner.

## Deduplicate into concepts

Cluster by underlying creative concept before filling any slot: language,
translated copy, localized names, and target market are execution attributes.
One concept, one slot — the strongest execution becomes the visual reference;
the other executions are cross-market validation, not additional winners.

## The unused-winner ledger

Maintain a dated ledger of ranked winners not yet iterated: concept, best
execution, evidence, and why it was passed over. It feeds the next cycle's
repeat-versus-explore decision, per the workspace evidence conventions
(`juicylucy` skill, `evidence.json` § retention).

## Record the evidence

Per selected winner: account (by name, not token), reporting window, ad
name/ID, results, spend, cost per result, return metrics when available,
preview confirmation, concept-cluster name, deduplicated siblings, and the
reference image path or capture. This record is what makes "we iterated a
winner" auditable later.

## One winner, five variations

A confirmed winner seeds a review cycle, not a clone: five materially
distinct variations — different composition, setting, typography, or copy
angle around the same hypothesis — so the next report can say *why* it won,
not merely that it did. The mutation modes and master QA live in
`static-ad-production`.

## Guardrails

- Product truth outranks performance: a winning claim the brand's
  `product-truth.md` does not support is a rejected claim, however well it
  converted. Resolve the brand skill before turning any winner into copy.
- Never expose account data beyond what the run needs, and never paste raw
  API responses containing identifiers into shipped artifacts.
- A stale local asset is not a winner; when live access exists, the live
  numbers decide.
