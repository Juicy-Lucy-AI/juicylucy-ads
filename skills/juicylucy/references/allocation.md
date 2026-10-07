# Allocation — method

Values live in [`../allocation.json`](../allocation.json).

## The math, applied

`languages per campaign = ceil(minimum ad sets / ad sets per language)`, per
active campaign, summed for the batch. The worked table: 1 ad set/language →
5 languages · 2 → 3 · 3 → 2 · 4 → 2 · 5 → 1. Five per campaign is a floor —
rounding up may yield six or more ad sets, and that is correct.

Cover **every** campaign the user's campaign structure marks active for new
ads. A user-supplied total that leaves an active campaign short is corrected
during preflight and the corrected total presented — an active campaign is
never silently omitted.

## Sources are fresh, always

The campaign structure and the per-language performance figures come from
wherever the brand's `ad-account.md` says they live, or from the conversation.
Resolve those pointers and take a fresh copy immediately before selection. A
snapshot from an earlier run, an old export, or memory of "how the campaigns
are set up" is not a source. Campaign membership for a language comes from the
structure; a language is never moved between campaigns because of its global
performance rank. When the user has neither a structure nor performance
figures, ask which languages to make rather than ranking from memory.

## Ranking and exclusion

Rank candidates within their assigned campaign by meaningful conversion volume
and cost efficiency **together**. Exclude under-delivered rows; never promote
a language because a single conversion produced a flattering CPA. Exclude
languages already used in the current dated batch, and in any other batch the
user names; a historical folder alone does not disqualify a language when the
task is to iterate on proven languages.

## Preflight

Before creating subfolders, present the proposed allocation with evidence:
campaign, language, results, spend, CPA, ad sets per language, total planned
ad sets, rank, and exclusion rationale. Verify every active campaign meets the
floor and every selected language belongs to its campaign.
