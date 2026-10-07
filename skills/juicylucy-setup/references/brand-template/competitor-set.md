# <Brand> — competitor set

The competitors whose paid creative this brand studies, read by the statics
engine's competitor source adapter (`static-ad-production` →
`references/source-adapters.md`). Order is the default research priority;
change it only when the user asks for a different scope.

1. **<Competitor>** — <which of its pages or accounts to inspect, and any to
   exclude>. Public ad-library page id `<id>`, which is what
   `ad-library.mjs --page-id` and a `view_all_page_id=` library URL take.
2. **<Competitor>**
3. **<Competitor>**

Page ids live here and nowhere else. The engine's scripts and references take
the id as an argument and show only its shape, because a page id names a
competitor as precisely as the competitor's name does.

If the user has no competitor list yet, leave the list empty and say so: the
competitors adapter then asks for names rather than guessing at the category.

Rules that travel with the set:

- Inspect the real creative, not only its thumbnail or copy.
- Total impressions are a discovery signal, never proof of profitability.
- Never reproduce a competitor pixel-for-pixel, and never adopt a
  competitor's branding from a reference — reinterpret the hypothesis under
  this brand's own identity (`brand-kit.md`).
