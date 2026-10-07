# <Brand> — ad account and planning sources

Where this brand's performance truth and campaign structure live. The
allocation policy itself is workspace convention (the `juicylucy` skill's
`allocation.json`); these are the brand-specific sources it resolves.

## The ad account

- **Ad account:** `<account name>` (`<account id>`), referred to in ledgers
  and manifests as **<short name>**.
- Access is read-only for winner analysis, with credentials supplied at
  runtime in the active session — never stored in files, filenames, logs, or
  summaries (`static-winner-analysis` carries the full contract).

## Planning sources

Both are taken fresh immediately before language selection; a prior snapshot
is never a source:

| Source | What it controls |
| --- | --- |
| `<campaign structure — a document, a sheet, or "ask in the conversation">` | Which campaigns are active for new ads, and which languages belong to which campaign. |
| `<per-language performance — an export, a sheet, or the account itself>` | Language-level conversion volume and cost — the ranking evidence. |

If neither exists yet, say so here in one line: the allocation step then asks
for the languages instead of ranking from memory.

## Delivery

<Where reviewed exports go and what reads them. If an upload automation parses
filenames, its grammar is the one in the workspace skill's `naming.json`; say
so here so nobody renames a file on the way. Reconcile uploader counts only
after the upload finishes, never while it is in flight.>
