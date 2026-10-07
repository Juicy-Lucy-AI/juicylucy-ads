# Source adapters — where the batch's signal comes from

Phase 1 of the pipeline is pluggable. Both adapters deliver the same
contract back to [workflow.md](workflow.md) § Phase 1: a concept-clustered,
ranked candidate list with a verified visual reference and a transferable
hypothesis per concept, joined to the prior-iteration history. What differs
is the evidence source and what its numbers can honestly claim.

## `winners` — the account's own performance

The signal is real conversion data from the brand's own ad account, retrieved
under the read-only contract owned by the `static-winner-analysis` skill —
read it before the first retrieval; its permission boundary, credential
hygiene, ranking, deduplication, and evidence rules all apply verbatim.

Adapter specifics:

1. Retrieve current static-ad performance for the requested lookback window —
   statics only; a video ad never seeds a static iteration.
2. Rank by conversion volume **and** cost efficiency together; exclude ads
   without enough delivery to judge; prefer repeatable winners over a single
   cheap conversion.
3. Open the selected winner's actual creative preview and visually confirm it
   matches the winning performance row before capturing it as the reference.
   Do not substitute an older local execution with the same concept name
   without confirming the match.
4. Record per selection: ad identifier/name, spend, results, cost per result,
   return metrics when available, preview confirmation, concept-cluster name,
   deduplicated sibling executions, and the reference path. Never the access
   token.

Do not rely on a prior report, manifest, filename, or old local asset when
live access is available; and do not begin drafting until a current winner
and its matching visible creative are recorded as this cycle's reference.

## `competitors` — public ad-library research

The signal is what competitors are running at scale in the platform's public
ad library. It shows what is *live*, with no performance data: impressions
and longevity are discovery signals, never proof of profitability or ROAS.

The competitor set and research order come from the brand's
`competitor-set.md` — this skill names no competitors. If the brand has no
competitor file, ask for the set before researching.

Adapter specifics:

1. Before opening the library, extend the iteration history with a
   competitor-source dimension: competitor/page, source URL or visible ad
   identifier, visual fingerprint or concise description, concept, batch
   dates, last-used date, markets, iteration modes. Recognize a reused
   source even when its filename, crop, language, or path changed; label
   uncertain matches.
2. For each competitor in the brand's stated order: open the ad library for
   the relevant page in a signed-in browser; filter to active ads, all
   countries, and static image media; sort by total impressions when offered;
   inspect the real creative, not its thumbnail or copy alone.
3. Save each selected reference to the batch's working folder and record the
   competitor/page, source identifier, hook, audience pain, promise, proof
   pattern, copy structure, layout, hierarchy, reusable hypothesis, and
   prior-use status. Retain no login state and no tokens.
4. Cluster before selecting: translations, alternate sizes, and cosmetic
   variants of one concept occupy one slot.
5. Default the recommendation toward a credible new or underused source when
   several recent batches reused the same competitor concept — variety is
   this adapter's usual objective.

**A competitor's identity is never the output's.** The reference's name,
logo, offer, and landing page belong to whoever made it. Extract the
hypothesis; the brand resolved at Step 0 supplies everything identity-shaped.
