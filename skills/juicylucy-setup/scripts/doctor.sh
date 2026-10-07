#!/bin/sh
# JuicyLucy: report what ad production needs and what this machine has.
#
# POSIX sh on purpose. The first thing this checks is whether Node exists, so it
# cannot itself be a Node script — on a fresh machine there would be nothing to
# run it with. macOS always has /bin/sh.
#
# Read-only. It installs nothing, writes nothing, and reads no config file.
# One line reaches the network, and says so when it cannot: juicy-login asks
# the generation service whose session this machine holds.
#
#   sh doctor.sh             human-readable
#   sh doctor.sh --quiet     the STATUS lines only, for a caller to parse
#   sh doctor.sh --preflight the STATUS lines, then one `preflight` line; for
#                            the ad workflows, which run it before Step 0
#
# Exit code is the number of missing requirements, so a caller can branch on it.
#
# --preflight answers a narrower question: has setup been run on this machine?
# It counts only the toolchain lines — what install.sh puts down, and the
# launchers in ~/.juicylucy/bin the skills run (node, hyperframes, hf-version,
# ffmpeg, ffprobe, adspython, juicy, tools) — and skips the sign-in check's
# network call. The other lines are still printed but do not decide: chrome is
# fetched on the first render, a juicy other than the pinned one is an update
# rather than an absence, the sign-in says so itself at the step that needs it,
# and the skills and conventions lines are inventory. An ad run on a machine with no
# toolchain cannot even create its project; one with a toolchain and a missing
# sign-in gets as far as generation and is told exactly what to do there.

set -u

# Whatever PATH this runs under, the system directories are on it, so the
# checks below can run.
PATH="$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export PATH

JUICYLUCY_HOME="${JUICYLUCY_HOME:-$HOME/.juicylucy}"
# The agent this copy was emitted for — codex or claude. build-plugin.mjs stamps
# it per edition; it decides which skill folders the skills line reads.
JUICYLUCY_HOST=claude
NODE_MIN=22
MISSING=0
QUIET=0
PREFLIGHT=0
for arg in "$@"; do
  case "$arg" in
    --quiet) QUIET=1 ;;
    --preflight) PREFLIGHT=1; QUIET=1 ;;
    *) printf 'doctor.sh: unknown option %s\n' "$arg" >&2; exit 64 ;;
  esac
done

# The lines --preflight decides on, and what it found missing among them.
PREFLIGHT_LINES=" node hyperframes hf-version ffmpeg ffprobe adspython juicy tools "
PREFLIGHT_MISSING=0
PREFLIGHT_NAMES=""

say() { [ "$QUIET" -eq 1 ] || printf '%s\n' "$*"; }

# `name  ok|missing  detail` — one line per requirement, always printed.
status() {
  printf '%-12s %-8s %s\n' "$1" "$2" "$3"
  if [ "$2" = "missing" ]; then
    MISSING=$((MISSING + 1))
    case "$PREFLIGHT_LINES" in
      *" $1 "*) PREFLIGHT_MISSING=$((PREFLIGHT_MISSING + 1)); PREFLIGHT_NAMES="$PREFLIGHT_NAMES${PREFLIGHT_NAMES:+, }$1" ;;
    esac
  fi
  return 0
}

# First existing executable among the arguments, or empty.
first_exec() {
  for candidate in "$@"; do
    [ -n "$candidate" ] && [ -x "$candidate" ] && printf '%s' "$candidate" && return 0
  done
  return 0
}

resolve() { command -v "$1" 2>/dev/null || true; }

say ""
say "JuicyLucy setup — checking this machine"
say ""
status arch ok "$(uname -m) ($(uname -s))"

# ── node ──────────────────────────────────────────────────────────────────────
NODE_BIN=$(first_exec "$JUICYLUCY_HOME/node/bin/node" "$(resolve node)")
if [ -z "$NODE_BIN" ]; then
  status node missing "not found — nothing else can run without it"
else
  NODE_VER=$("$NODE_BIN" --version 2>/dev/null | tr -d 'v')
  NODE_MAJOR=${NODE_VER%%.*}
  if [ "${NODE_MAJOR:-0}" -lt "$NODE_MIN" ] 2>/dev/null; then
    status node missing "v$NODE_VER is too old — v$NODE_MIN or newer is required"
  else
    status node ok "v$NODE_VER at $NODE_BIN"
  fi
fi

# ── the hyperframes CLI ───────────────────────────────────────────────────────
# The skills were written against one CLI version (UPSTREAM.lock: cli); the
# installer pins it, and the hf-version line says whether this machine has it.
HF_EXPECTED="0.8.71"
HF_VER=""
HF_BIN=$(first_exec "$JUICYLUCY_HOME/node_modules/.bin/hyperframes" "$JUICYLUCY_HOME/bin/hyperframes" "$(resolve hyperframes)")
if [ -n "$HF_BIN" ]; then
  status hyperframes ok "$HF_BIN"
  # npm's launcher starts with `#!/usr/bin/env node`: on a Mac whose only Node
  # is setup's own, nothing on PATH runs it, so put the Node we found first —
  # as the juicy check does. (Found by a fresh-machine install, 2026-10-05.)
  HF_VER=$(PATH="${NODE_BIN:+$(dirname "$NODE_BIN"):}$PATH" "$HF_BIN" --version 2>/dev/null | head -1 | tr -d 'v')
  if [ "$HF_VER" = "$HF_EXPECTED" ]; then
    status hf-version ok "$HF_VER"
  else
    status hf-version missing "installed ${HF_VER:-unknown}, expected $HF_EXPECTED — re-run setup's tools step"
  fi
else
  status hyperframes missing "the program that renders the video is not installed"
fi

# ── ffmpeg / ffprobe ──────────────────────────────────────────────────────────
# The env vars win, which is the whole reason a system ffmpeg is optional:
# packages/parsers reads HYPERFRAMES_FFMPEG_PATH / HYPERFRAMES_FFPROBE_PATH
# before it scans PATH.
ARCH=$(uname -m)
[ "$ARCH" = "x86_64" ] && FF_ARCH=x64 || FF_ARCH=arm64
FFMPEG_BIN=$(first_exec "${HYPERFRAMES_FFMPEG_PATH:-}" \
  "$JUICYLUCY_HOME/node_modules/ffmpeg-static/ffmpeg" "$JUICYLUCY_HOME/bin/ffmpeg" "$(resolve ffmpeg)")
FFPROBE_BIN=$(first_exec "${HYPERFRAMES_FFPROBE_PATH:-}" \
  "$JUICYLUCY_HOME/node_modules/@ffprobe-installer/darwin-$FF_ARCH/ffprobe" "$JUICYLUCY_HOME/bin/ffprobe" "$(resolve ffprobe)")
[ -n "$FFMPEG_BIN" ] && status ffmpeg ok "$FFMPEG_BIN" || status ffmpeg missing "the video encoder is not installed"
[ -n "$FFPROBE_BIN" ] && status ffprobe ok "$FFPROBE_BIN" || status ffprobe missing "the video inspector is not installed"

# ── headless Chrome ───────────────────────────────────────────────────────────
# hyperframes downloads its own, so this is only "not yet fetched", never a
# manual install. The places are the ones hyperframes looks in, in its order: a
# browser named in the environment, puppeteer's cache, its own cache under
# ~/.cache/hyperframes/chrome, then the system's Chrome. `hyperframes browser
# path` is not asked instead: when it finds nothing it downloads a browser, and
# the doctor installs nothing.
headless_shell_in() {
  [ -d "$1" ] || return 0
  find "$1" -maxdepth 4 -type f -name chrome-headless-shell -perm -100 2>/dev/null | head -1
}
CHROME_FOUND=""
CHROME_ENV="${HYPERFRAMES_BROWSER_PATH:-${PRODUCER_HEADLESS_SHELL_PATH:-}}"
if [ -n "$CHROME_ENV" ] && [ -e "$CHROME_ENV" ]; then
  CHROME_FOUND="$CHROME_ENV (named in the environment)"
fi
[ -n "$CHROME_FOUND" ] || CHROME_FOUND=$(headless_shell_in "$HOME/.cache/puppeteer/chrome-headless-shell")
[ -n "$CHROME_FOUND" ] || CHROME_FOUND=$(headless_shell_in "$HOME/.cache/hyperframes/chrome")
if [ -z "$CHROME_FOUND" ]; then
  CHROME_SYSTEM=""
  if [ "$(uname -s)" = "Darwin" ] && [ -x "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then
    CHROME_SYSTEM="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  else
    CHROME_SYSTEM=$(resolve google-chrome)
    [ -n "$CHROME_SYSTEM" ] || CHROME_SYSTEM=$(resolve chromium)
  fi
  [ -z "$CHROME_SYSTEM" ] ||
    CHROME_FOUND="$CHROME_SYSTEM (the system's; hyperframes browser ensure fetches the headless build it prefers)"
fi
if [ -n "$CHROME_FOUND" ]; then
  status chrome ok "$CHROME_FOUND"
else
  status chrome missing "hyperframes will download it (hyperframes browser ensure)"
fi

# ── Python QA (statics) ──────────────────────────────────────────────────────
# The statics QA scripts run through the adspython shim — our own standalone
# CPython under JUICYLUCY_HOME with Pillow in it. install.sh --only python sets
# it up; nothing here ever runs the Mac's python3, which may be a stub that
# opens Apple's Command Line Tools installer.
ADSPY=$(first_exec "$JUICYLUCY_HOME/bin/adspython" "$(resolve adspython)")
if [ -n "$ADSPY" ] && "$ADSPY" -c "import PIL" 2>/dev/null; then
  status adspython ok "$ADSPY ($("$ADSPY" --version 2>&1))"
else
  status adspython missing "the statics QA interpreter — install.sh --only python sets it up"
fi

# ── the juicy command ─────────────────────────────────────────────────────────
# Every image, video and music generation goes through `juicy`, which setup
# installs at the version this plugin release pins and the user signs in to
# once. Three lines, so "not installed", "not the pinned version" and "not
# signed in" each name their own fix. `--version` reads local files only;
# `auth status` asks the generation service, and its being unreachable is
# reported as exactly that — not as a problem with the machine, and not as a
# missing sign-in.
# The version install.sh pins — the same value as `version` in the repo's
# build/juicy-cli.lock, kept in step by a test.
JUICY_EXPECTED="0.1.7"
JUICY_BIN=$(first_exec "$JUICYLUCY_HOME/bin/juicy" "$JUICYLUCY_HOME/node_modules/.bin/juicy" "$(resolve juicy)")
if [ -z "$JUICY_BIN" ]; then
  status juicy missing "the command that generates images, video and music — install.sh --only juicy"
else
  status juicy ok "$JUICY_BIN"
  # Its launcher needs a node on PATH; put the one we found first.
  JUICY_PATH="${NODE_BIN:+$(dirname "$NODE_BIN"):}$PATH"
  JUICY_VER=$(PATH="$JUICY_PATH" "$JUICY_BIN" --version 2>/dev/null | sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' | head -1)
  if [ -z "$JUICY_VER" ]; then
    status juicy-version missing "juicy runs but prints no version — re-run setup's juicy step"
  elif [ "$JUICY_VER" = "$JUICY_EXPECTED" ]; then
    status juicy-version ok "$JUICY_VER (the version this release pins)"
  else
    status juicy-version missing "installed $JUICY_VER, this release pins $JUICY_EXPECTED — re-run setup's juicy step"
  fi
  # The session. `auth status` asks the service (it reports the balance), so
  # inside a sandbox with the network off it fails — and a failure to ask is
  # not an answer. juicy says "no session" itself: exit 3, before any request
  # when the file is absent, or when the service refuses the one it holds. A
  # `network` error therefore means a session IS on disk and could not be
  # confirmed; it is reported as that, never as "not signed in", which sends
  # the agent to ask the user for a password this machine does not need.
  JUICY_AUTH=$(PATH="$JUICY_PATH" "$JUICY_BIN" auth status 2>&1); JUICY_AUTH_EXIT=$?
  JUICY_WHO=$(printf '%s\n' "$JUICY_AUTH" | sed -n 's/.*"email": *"\([^"]*\)".*/\1/p' | head -1)
  JUICY_AUTH_CODE=$(printf '%s\n' "$JUICY_AUTH" | sed -n 's/.*"code": *"\([^"]*\)".*/\1/p' | head -1)
  if [ "$JUICY_AUTH_EXIT" -eq 0 ] && [ -n "$JUICY_WHO" ]; then
    status juicy-login ok "signed in as $JUICY_WHO"
  elif [ "$JUICY_AUTH_EXIT" -eq 3 ]; then
    status juicy-login missing "not signed in — run juicy auth help and follow it (SKILL.md Step 4)"
  elif [ "$JUICY_AUTH_CODE" = "network" ]; then
    # Best effort, for the account's name only; the verdict does not rest on it.
    JUICY_SAVED=$(sed -n 's/.*"email": *"\([^"]*\)".*/\1/p' "$JUICYLUCY_HOME/juicy/credentials" 2>/dev/null | head -1)
    if [ "${CODEX_SANDBOX_NETWORK_DISABLED:-}" = "1" ]; then JUICY_WHY="this command ran in a sandbox with the network off"
    else JUICY_WHY="the service could not be reached"; fi
    status juicy-login ok "a session${JUICY_SAVED:+ for $JUICY_SAVED} is on this machine, not confirmed: $JUICY_WHY — do NOT ask the user to sign in; juicy auth status run with network approval confirms it"
  else
    status juicy-login missing "could not check: juicy auth status exited $JUICY_AUTH_EXIT${JUICY_AUTH_CODE:+ ($JUICY_AUTH_CODE)} — that is not \"not signed in\"; run it and read its error before asking the user for anything"
  fi
fi

# ── the launchers the skills run ──────────────────────────────────────────────
# The skills run every tool by its full path under ~/.juicylucy/bin, never by
# a bare name, so nothing in Codex's own configuration has to change for them
# to be found. The launchers carry what the tools need — the pinned
# hyperframes with our encoders, telemetry and the skills refresh off, and the
# Node the npm launchers expect — so each line above can be ok while a launcher
# is missing or points somewhere else. This line checks the launchers
# themselves.
TOOLS_GAPS=""
for cmd in adsnode hyperframes juicy adspython ffmpeg ffprobe; do
  [ -x "$JUICYLUCY_HOME/bin/$cmd" ] || TOOLS_GAPS="$TOOLS_GAPS${TOOLS_GAPS:+, }$cmd"
done
if [ -x "$JUICYLUCY_HOME/bin/hyperframes" ]; then
  BIN_HF_VER=$("$JUICYLUCY_HOME/bin/hyperframes" --version 2>/dev/null | head -1 | tr -d 'v')
  [ "$BIN_HF_VER" = "$HF_EXPECTED" ] || TOOLS_GAPS="$TOOLS_GAPS${TOOLS_GAPS:+, }bin/hyperframes runs ${BIN_HF_VER:-nothing} rather than $HF_EXPECTED"
fi
if [ -z "$TOOLS_GAPS" ]; then
  status tools ok "$JUICYLUCY_HOME/bin carries adsnode, hyperframes $HF_EXPECTED, juicy, adspython, ffmpeg and ffprobe"
else
  status tools missing "$JUICYLUCY_HOME/bin lacks: $TOOLS_GAPS — when the tools above read ok, install.sh --only launchers writes them and downloads nothing; otherwise re-run install.sh"
fi

# ── local skills ──────────────────────────────────────────────────────────────
# Codex reads skills from a project's .agents/skills (walked up from the working
# directory), from ~/.agents/skills and /etc/codex/skills, as well as from the
# plugin — and a copy in any of those SHADOWS the plugin's copy of the same name.
# That is how a user adds a brand or tries a change without a release
# (references/extending.md). It is also how a stale
# copy of a workflow skill stops receiving updates without anyone noticing, so
# intentional workflow replacements are inventory with an update reminder.
# A juicy-cli copy — an earlier setup wrote one there — overrides the plugin's
# command reference, and needs checking against the installed binary.
SHIPPED_SKILLS=$(cd "$(dirname "$0")/../.." 2>/dev/null && pwd -P)
# Physical paths on both sides of the walk: a home reached through a symlink
# (/var → /private/var on a Mac) would otherwise never match and the walk
# would run past it to /.
HOME_REAL=$(cd "$HOME" 2>/dev/null && pwd -P || printf '%s' "$HOME")
# Claude Code reads a project's .claude/skills and ~/.claude/skills the same
# way, except that a skill there loads BESIDE the plugin's (whose names carry
# the plugin's prefix) rather than in its place.
if [ "$JUICYLUCY_HOST" = claude ]; then SKILLS_SUBDIR=.claude/skills; else SKILLS_SUBDIR=.agents/skills; fi
skill_roots() {
  dir=$(pwd -P)
  while [ "$dir" != "$HOME_REAL" ] && [ "$dir" != "/" ]; do
    printf '%s\n' "$dir/$SKILLS_SUBDIR"
    # A repository's root is Codex's project root: it reads no .agents/skills
    # above it, so neither does this. (A workspace inside a checkout that sits
    # under some other home otherwise walked on into that home's skills.)
    [ -e "$dir/.git" ] && break
    dir=$(dirname "$dir")
  done
  [ "$dir" = "/" ] && printf '%s\n' "/$SKILLS_SUBDIR"
  printf '%s\n' "$HOME/$SKILLS_SUBDIR"
  [ "$JUICYLUCY_HOST" = claude ] || printf '%s\n' "/etc/codex/skills"
}
# One tab-separated line per local skill that matters: kind, name, root.
local_skills() {
  skill_roots | while IFS= read -r root; do
    # The root this doctor was shipped in is the shipped set, not a shadow of it
    # — the case when the skills are staged in a project's .agents/skills.
    [ -d "$root" ] && [ "$(cd "$root" && pwd -P)" = "$SHIPPED_SKILLS" ] && continue
    for skill in "$root"/*/; do
      [ -f "$skill/SKILL.md" ] || continue
      name=$(basename "$skill")
      short=$(printf '%s' "$root" | sed "s|^$HOME_REAL|~|; s|^$HOME|~|")
      if [ "$JUICYLUCY_HOST" = claude ]; then
        # Nothing local replaces a plugin skill here. A brand is added; a copy
        # of a shipped skill only sits beside the one the plugin uses.
        case "$name" in
          brand-*) printf 'added\t%s\t%s\n' "$name" "$short" ;;
          *) [ -d "$SHIPPED_SKILLS/$name" ] && printf 'beside\t%s\t%s\n' "$name" "$short" ;;
        esac
        continue
      fi
      case "$name" in
        juicylucy) printf 'replaces\t%s\t%s\n' "$name" "$short" ;;
        juicy-cli) printf 'shadows\t%s\t%s\n' "$name" "$short" ;;
        brand-*)
          if [ -d "$SHIPPED_SKILLS/$name" ]; then printf 'replaces\t%s\t%s\n' "$name" "$short"
          else printf 'added\t%s\t%s\n' "$name" "$short"; fi ;;
        *) [ -d "$SHIPPED_SKILLS/$name" ] && printf 'replaces\t%s\t%s\n' "$name" "$short" ;;
      esac
    done
  done
}
LOCAL_SKILLS=$(local_skills)
SHADOWS=$(printf '%s\n' "$LOCAL_SKILLS" | awk -F '\t' '$1 == "shadows" { printf "%s%s (in %s)", sep, $2, $3; sep = ", " }')
EXTENSIONS=$(printf '%s\n' "$LOCAL_SKILLS" | awk -F '\t' '$1 != "shadows" && NF { printf "%s%s (%s, in %s)", sep, $2, $1, $3; sep = ", " }')
if [ -n "$SHADOWS" ]; then
  status skills missing "$SHADOWS overrides the plugin's juicy command reference — an earlier setup wrote it; check it against the installed juicy version (references/extending.md)"
elif [ -n "$EXTENSIONS" ] && [ "$JUICYLUCY_HOST" = claude ]; then
  status skills ok "local: $EXTENSIONS — brands are read from there; a copy beside a shipped skill is not what the plugin runs, and the user may delete it"
elif [ -n "$EXTENSIONS" ]; then
  status skills ok "local: $EXTENSIONS — local replacements do not receive plugin updates; keep intentional customizations"
else
  status skills ok "shipped skills only — no local brands or overrides"
fi

# ── local conventions ─────────────────────────────────────────────────────────
# A plain data folder, not a skill: each of the five conventions files placed
# in ~/.juicylucy/conventions replaces the plugin's own, on both hosts — the
# naming tool reads it first (ad-naming's naming.mjs), and the conventions
# skill tells the agent to read the languages, allocation and evidence files
# from it too. A team installs its grammar there (the plugin repo's
# install-team.sh). Inventory, never missing: the defaults are a complete set.
CONVENTIONS_DIR="$JUICYLUCY_HOME/conventions"
CONVENTIONS_SHORT=$(printf '%s' "$CONVENTIONS_DIR" | sed "s|^$HOME_REAL|~|; s|^$HOME|~|")
CONVENTIONS_FOUND=""
CONVENTIONS_COUNT=0
CONVENTIONS_OTHER=""
if [ -d "$CONVENTIONS_DIR" ]; then
  for file in naming.json foldering.json allocation.json languages.json evidence.json; do
    [ -f "$CONVENTIONS_DIR/$file" ] || continue
    CONVENTIONS_FOUND="$CONVENTIONS_FOUND${CONVENTIONS_FOUND:+, }$file"
    CONVENTIONS_COUNT=$((CONVENTIONS_COUNT + 1))
  done
  for path in "$CONVENTIONS_DIR"/*; do
    [ -e "$path" ] || continue
    file=$(basename "$path")
    case "$file" in
      naming.json | foldering.json | allocation.json | languages.json | evidence.json) ;;
      *) CONVENTIONS_OTHER="$CONVENTIONS_OTHER${CONVENTIONS_OTHER:+, }$file" ;;
    esac
  done
fi
if [ -n "$CONVENTIONS_FOUND" ]; then
  CONVENTIONS_DETAIL="local: $CONVENTIONS_SHORT holds $CONVENTIONS_FOUND — each replaces the plugin's own file, so filenames, folders and codes follow it"
  [ "$CONVENTIONS_COUNT" -lt 5 ] && CONVENTIONS_DETAIL="$CONVENTIONS_DETAIL; the others come from the conventions skill"
  [ -n "$CONVENTIONS_OTHER" ] && CONVENTIONS_DETAIL="$CONVENTIONS_DETAIL; not read: $CONVENTIONS_OTHER"
  status conventions ok "$CONVENTIONS_DETAIL"
elif [ -n "$CONVENTIONS_OTHER" ]; then
  status conventions ok "the plugin's defaults — $CONVENTIONS_SHORT holds none of the five conventions files (not read: $CONVENTIONS_OTHER)"
else
  status conventions ok "the plugin's defaults — no local conventions folder ($CONVENTIONS_SHORT)"
fi

# ── the preflight verdict ─────────────────────────────────────────────────────
# One more line in the same shape, so the ad workflow reads a verdict rather
# than adding the lines up itself; the exit code says the same thing.
if [ "$PREFLIGHT" -eq 1 ]; then
  if [ "$PREFLIGHT_MISSING" -eq 0 ]; then
    if [ "$MISSING" -eq 0 ]; then
      status preflight ok "the toolchain is installed and reachable; every other line reads ok too"
    else
      status preflight ok "the toolchain is installed and reachable; $MISSING other line(s) read missing — setup's to fix, not a blocker for starting an ad"
    fi
  else
    status preflight missing "$PREFLIGHT_NAMES — setup has not been run to the end on this machine; run the juicylucy-setup skill first"
  fi
  exit "$PREFLIGHT_MISSING"
fi

say ""
if [ "$MISSING" -eq 0 ]; then
  say "Everything needed is present. Nothing to install."
else
  say "$MISSING thing(s) missing. Install what can be installed with:"
  say "  sh \"\$(dirname \"\$0\")/install.sh\""
fi
say ""
exit "$MISSING"

