# Default conventions

The conventions every edition ships under the skill name `juicylucy`: the
filename token grammar, the ad-set folder grammar and global sequence,
allocation policy, the language table, the evidence layout — as data, with the
method behind each in `references/`. Generic values: no uploader-specific
folder tokens, no legacy author initials, no pointer to a live planning
document.

A team with its own grammar does not get a different plugin. It keeps its
files in `~/.juicylucy/conventions/` on each Mac, which the `ad-naming` tool —
and, through `SKILL.md` § Which copy to read, the agent — reads ahead of these,
file by file. The agency's own are `workspace/juicylucy/` in this repo,
installed there by `install-team.sh`. A test holds both to the same JSON keys,
so a key added to one and not the other fails the build rather than a Mac.

The skill name stays `juicylucy` on purpose: the naming tool finds the shipped
files by that catalogue name, and every engine skill cites it.
