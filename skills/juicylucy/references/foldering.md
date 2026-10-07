# The folder grammar and the global sequence — method

Values live in [`../foldering.json`](../foldering.json).

## Resolve the campaign root

Use the root the user — or the agent coordinating the batch — supplied; never
hard-code a home directory, a cloud-drive account, or a machine path, least of
all someone else's. If no root is supplied, inspect the working directory and
the nearby shared hierarchy for the folder holding recent dated campaign
directories and numbered ad sets; if more than one plausible root remains, ask
one concise question before writing. Record the resolved absolute root in
`PROJECT_STATE.md` and the manifest.

## Lock the structure before creating it

Collect or derive: the campaign date, target language names and exact codes,
ordered source batches, expected count per batch, persona/batch description,
the format and ICP fields and any other field the pattern carries, and whether
basenames must be inherited. Ask only for
what cannot be discovered; when the source campaign and requested languages
are explicit, inherit batch order, counts, and descriptions.

## Reserve the global sequence

1. Scan the campaign parent recursively for basenames beginning `#` + four
   digits — every date, every language, **both mediums** (statics and video
   draw from one number line; scanning only one half hands out numbers the
   other half already claimed).
2. Take the global maximum and allocate one contiguous ordered block covering
   the whole request — six batches × three languages needs 18 consecutive
   numbers, one complete ordered batch range per language.
3. Write the proposed mapping into a manifest before any agent starts.
4. **Re-scan immediately before directory creation.** If another process
   claimed a reserved number, recompute the entire not-yet-created remainder
   from the new global maximum.

Never infer the next number from memory, an earlier conversation, a tracker,
or one language folder.

## Create the hierarchy

`CAMPAIGN_ROOT/YYYY.MM.DD/LANGUAGE/AD_SET_NAME`, ad-set names per the grammar.
Treat the pattern as a grammar, not a template: copy the exact recent/source
pattern and change only the sequence, the language code, and fields the new
campaign explicitly requires. For a localization clone: preserve batch order
and counts and all non-language fields, assign consecutive numbers, one
language directory per language, never two languages in one numbered folder.
Create directories only after the manifest is locked.

## Redistributing a mixed creative library

When the requested ad-set split changes after production (25 creatives
re-split as `8 + 8 + 9`, say):

1. Inventory every final image by creative family and version before moving
   anything, and lock the requested totals first — do not preserve the old
   layout after the user changes the contract.
2. Distribute families round-robin so no family repeats in one folder until
   every other family is represented, where mathematically possible.
3. Keep each version exactly once; verify the union of destination hashes
   equals the source set before removing superseded folders.
4. Rename every destination folder so its `N Ads` token matches its final
   count.
5. For localization, reproduce the identical source-to-ad-set mapping in every
   language.
6. Reconcile per-folder counts, the total, and hash uniqueness after all
   moves — a recursive total alone cannot prove the split.

If the requested arithmetic is inconsistent, confirm the corrected split
before writing; once corrected, the corrected total is authoritative.

## Verify and hand off

List the exact folders from the filesystem; confirm language count, ad-set
count, numbering range, batch order, and zero-padding; confirm no duplicate
sequence number in the scanned scope; save the final mapping in
`PROJECT_STATE.md` and the manifest; assign each language range to exactly one
agent — never split ownership of one language directory.

## Safety rules

- Never create a guessed count, persona, code, or root.
- Never reuse a number that exists anywhere in the scanned scope.
- If the exact destination already exists, verify and report it rather than
  creating a renamed duplicate.
- If concurrent work is plausible, re-scan both before creation and before
  production begins.
- Filesystem counts are authoritative; chat and trackers may lag.
