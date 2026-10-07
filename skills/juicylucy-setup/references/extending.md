# Extending JuicyLucy on this machine

Read this when an ad workflow finds no brand installed, when the user asks for a brand that is not
installed, or wants a brand, the conventions or the ads changed — and is not going to wait for a
plugin release. It says what can be done on one Mac and where it goes.

The rule underneath everything here: **the plugin is read-only, and Claude Code has a place for the
user's own skills.** In Claude Code that place holds the user's **brands**. The conventions are
data, not a skill, and have a folder of their own, `~/.juicylucy/conventions` (§ Changing the
conventions). Everything else the plugin does changes with a plugin release.

## Where a local skill lives

Claude Code reads the user's own skills from two places, beside the plugin's:

| Root                                  | Scope                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------ |
| `<project>/.claude/skills/<name>/`    | Only when Claude Code is working in that project.                        |
| `~/.claude/skills/<name>/`            | This Mac, in every project. **The usual place.**                         |
| the installed plugin                  | Everything JuicyLucy ships, under the `juicylucy-ads:` prefix. Read-only. |

A skill is a directory with a `SKILL.md` in it. Its `description:` line in the frontmatter is what
the agent sees before it does anything, so that line has to say what the skill is and when to load it.

**A local skill never replaces a plugin skill here.** The plugin's skills carry its prefix
(`juicylucy-ads:video-ad-production`), so a local skill with the same name loads beside the shipped
one: both are in the catalogue, and the plugin's tools and workflows keep reading the shipped one.
That is why a brand — the plugin ships none — is the one skill extended locally.

Claude Code watches both folders, so a skill added or changed there is in the running session's
catalogue without a restart. The exception is a skills folder that did not exist when the session
started, which is picked up by the next session.

Two places look writable and are not:

- The plugin's own folder under `~/.claude/plugins/`. A new release installs into a new directory
  and the old one is dropped.
- `~/.juicylucy`, the toolchain — all of it but `~/.juicylucy/conventions`, which is the user's
  and which updates leave alone. Deleting `~/.juicylucy` is how the install is undone, and takes
  that folder with it.

An edit in either is lost at the next update, silently.

## Creating the first brand

An ad workflow that finds **no** `brand-*` skill in the catalogue says so and comes here. This is
the normal first run for anyone who installed the plugin from the directory, where no brand ships;
it is also what happens on a Mac where the only brand was removed. Do not build the ad from facts
gathered in the conversation and left there: every later step reads brand files by name, and the
next ad would start from nothing again. Make the brand, then make the ad.

1. **Ask for the product facts**, in plain words and in one go where you can. What the product is
   and does, in the product's own words; what it does not do that copy might imply; who it is for;
   the price and terms; the site or design system to capture colours and type from; whether there
   is an end-card image and where; any competitor to study; any claim the user already knows they
   must never make. What the user does not know yet is left as a placeholder, not invented.
2. **Copy the template** — this skill's `references/brand-template/` — to
   `~/.claude/skills/brand-<slug>/`, where `<slug>` is the product's name in lowercase with
   hyphens. Rename `SKILL.template.md` to `SKILL.md`. Keep every other filename: the workflows
   read the files by name, and a missing file is a missing input, not a default.
3. **Fill the files in.** Each owns one kind of fact and says at the top what belongs in it.
   `product-truth.md` and `compliance-overlay.md` first — they gate every line of copy — then
   `brand-kit.md` (run `~/.juicylucy/bin/hyperframes capture` against the site if the user gave one, and record
   extracted values, not eyeballed ones), then the rest. Replace every `<placeholder>`; a file
   with nothing to say yet keeps its one-line "not yet" statement rather than an invented value.
4. **Rewrite the `description:`** so it names the product and says when to load the skill.
5. **Read the new skill directly for this run** — it is on disk, and the workflow can open its
   files by path. Claude Code adds it to the catalogue as soon as it is written (or from the next
   session, if `~/.claude/skills` did not exist before), so later ads find the brand by name.
6. Confirm it: the setup doctor's `skills` line lists it as `added`.

Say two things at the end: where the brand lives (the folder, so they can open it), and that it
is theirs — every later ad reads it, and changing a fact there changes every ad after.

## Adding a brand

A brand is a skill named `brand-<slug>`. Both ad workflows resolve the brand by looking at which
`brand-*` skills exist: one means that is the brand, several means ask, none means create one
(§ Creating the first brand). Nothing in the workflows names a brand, so adding one changes
nothing else.

1. Copy this skill's `references/brand-template/` to `~/.claude/skills/brand-<slug>/` and rename
   `SKILL.template.md` to `SKILL.md`. (Another brand skill, where one is installed, is the
   worked example of a filled-in template — read it for the shape of a finished file, but start
   from the template, so nothing of another product carries over.) Keep every filename: the
   workflows read the files by name, and a missing file is a missing input, not a default.
2. Fill every file in for the new product. Each file owns one kind of fact: `product-truth.md`
   (what it is, is not, who it is for, pricing, voice), `compliance-overlay.md` (what this brand
   may not say), `brand-kit.md`, `outro-card.md`, `copy-patterns.md`, `competitor-set.md`,
   `ad-account.md`, `format-renditions.md`, and a `history/` folder for dated evidence. The
   template's `SKILL.md` § What each file owns is the roster; keep that table.
3. Rewrite the `description:` so it names the product and says when to load the skill. Two
   skills with the same description both claim to be the brand.
4. Nothing to restart: Claude Code reads the folder as it changes.
5. Confirm it: the setup doctor's `skills` line lists it as `added`, and the next ad request will
   find two brands and ask which — that is the expected behaviour, not a fault.

Do not put a second product's facts into an existing brand's files, and do not put brand facts
into a campaign folder's brief instead of a brand skill. A brief is one run; the brand is every run.

## Changing a brand

A brand in `~/.claude/skills` is the user's own: change it by editing its files there. Every later
ad reads it, so a changed fact changes every ad after. Plugin updates never touch that folder.

A brand someone else installed for the user — a team's install script, say — is theirs to change:
the script that put it there may put its own copy back at the next update. Make the change where
that brand comes from, or ask whoever maintains it; a local edit meanwhile lasts until then.

## Changing the conventions

The conventions are five files: `naming.json` (the filename grammar), `foldering.json` (the ad-set
folder grammar and its global sequence), `languages.json` (the language table and its codes),
`allocation.json` and `evidence.json`. The plugin ships a complete default set in its `juicylucy`
skill. **A file of the same name in `~/.juicylucy/conventions/` replaces the shipped one**, on this
Mac, for every ad — that folder is the one place a change to the conventions goes. It is a plain
folder of data, not a skill: nothing is catalogued, nothing needs a restart, and plugin updates
leave it alone.

1. **Ask what has to change and why.** Usually it is an upload automation or a report that reads
   filenames or ad-set names: its grammar is the one to adopt, exactly, including any fixed tokens.
   Find out which files that touches — a grammar is `naming.json` and `foldering.json`, a market
   code is `languages.json`.
2. **Copy only those files** from the installed `juicylucy` skill into `~/.juicylucy/conventions/`
   (make the folder if it is not there). Keep each filename and every key; the naming tool reads
   the keys, and a missing key fails it loud.
3. **Change the values.** In `foldering.json` the pattern must keep the six tokens the tool fills —
   `#NNNN`, `LL`, `BATCH`, `N Ads`, `ICP`, `FORMAT` — and may add fixed text around them. In
   `naming.json`, list any older author token the user's archives carry under `legacy_authors`, so
   those files are still recognised.
4. **Verify with the tool.** Run the `ad-naming` tool's `where` and confirm each changed file
   resolves to the folder (`"origin": "conventions"`). Then `name` with a sample record and
   `folder` with a sample sequence (neither writes anything) and check both against a real name
   the user's automation accepts.
5. **Say what it means.** Every filename and folder from now on follows the folder, and the tool
   says so on every call; a file the folder lacks stays the plugin's default. Later releases that
   change a default the folder replaces do not reach this Mac — the folder's copy wins until it is
   removed. Removing a file returns that part to the defaults.

The doctor's `conventions` line lists what the folder holds. A team keeps one folder's worth of
files and puts the same copy on every teammate's Mac — by its own install script, for instance —
because a grammar that differs between two Macs splits the team's history in two.

## Changing how the ads are made

Not on this Mac, in Claude Code. A copy of a workflow skill in `~/.claude/skills` loads beside the
shipped one, and the workflows keep reading the shipped one, so the copy changes nothing but adds a
second skill of the same name to the catalogue. Say so plainly, and offer to write the change down
as a request to the plugin's maintainers at plugin@juicylucy.io. Never edit the plugin's own files.

The same is true of a copy of the `juicylucy` conventions skill: the naming tool does not read it.
The conventions change through the conventions folder (§ Changing the conventions).

## What the doctor reports

```
skills       ok        shipped skills only — no local brands or overrides
skills       ok        local: brand-<slug> (added, in ~/.claude/skills) — brands are read from there; a copy beside a shipped skill is not what the plugin runs, and the user may delete it
skills       ok        local: brand-<slug> (added, in ~/.claude/skills), juicylucy (beside, in ~/.claude/skills) — brands are read from there; a copy beside a shipped skill is not what the plugin runs, and the user may delete it
conventions  ok        the plugin's defaults — no local conventions folder (~/.juicylucy/conventions)
conventions  ok        local: ~/.juicylucy/conventions holds naming.json, foldering.json — each replaces the plugin's own file, so filenames, folders and codes follow it; the others come from the conventions skill
```

The `skills` line scans the project's `.claude/skills` and `~/.claude/skills`, from the working
directory the doctor was run in, so a project-scoped brand shows up only when the doctor runs
inside that project.
