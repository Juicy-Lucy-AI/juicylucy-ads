#!/bin/sh
# JuicyLucy: install everything ad production needs, under ~/.juicylucy, with no
# administrator password. Outside it only the tools' own caches are written —
# npm's in ~/.npm and the headless Chrome hyperframes keeps in
# ~/.cache/hyperframes — and never a shell profile, Codex's configuration or a
# skill folder.
#
# Three deliberate choices:
#
#   * Node comes from the official TARBALL, not the .pkg installer. The .pkg
#     writes to /usr/local and demands an admin password; the tarball unpacks
#     into a folder we own. Same binaries, no prompt.
#   * ffmpeg and ffprobe come from npm rather than Homebrew, because
#     `HYPERFRAMES_FFMPEG_PATH` / `HYPERFRAMES_FFPROBE_PATH` let hyperframes use
#     any binary we point it at. Verified working.
#     ffprobe comes from @ffprobe-installer, NOT from ffprobe-static: the
#     latter's "darwin/arm64" binary is actually x86_64 (checked with `file`),
#     so on Apple Silicon it runs only under Rosetta — which a fresh Mac may not
#     have, and installing Rosetta needs the admin password this whole design
#     avoids. @ffprobe-installer ships a real arm64 build, and LGPL-2.1 rather
#     than GPL. ffmpeg-static's binary IS native arm64, so it stays; it is
#     GPL-3.0-or-later, which is fine to install here but never to redistribute.
#   * Chrome is left to `hyperframes browser ensure`, which already knows how to
#     find or fetch the exact build the renderer expects.
#   * `juicy`, the command every image, video and music generation goes
#     through, is an npm package installed the same way as hyperframes, at the
#     exact version this plugin release pins — never a moving tag such as
#     `latest`, so what lands on the machine is what the release was tested
#     with, and the plugin's own juicy-cli skill describes exactly that binary.
#     A plugin update moves the pin. `juicy` carries no credential; the
#     user signs in once and the session lives under ~/.juicylucy/juicy/.
#   * Python comes as a standalone build from python-build-standalone, the same
#     way Node comes as a tarball. A fresh Mac's /usr/bin/python3 is a stub that
#     opens Apple's Command Line Tools dialog the first time it runs — an
#     interactive install a non-technical user cannot be sent to Terminal for.
#
# npm is anchored with a package.json written into JUICYLUCY_HOME FIRST. Without
# it npm walks UP the directory tree looking for a package root, and a user with
# a ~/package.json — which is common — gets hyperframes' whole dependency tree
# installed into ~/node_modules instead. Observed on a real machine, not
# theoretical: it mixed ~60 MB of our transitive deps into someone's unrelated
# project.
#
# Every tool the skills run gets a launcher in ~/.juicylucy/bin, and the skills
# call it by that full path. Every launcher sets the same environment — our
# bin/ and Node first on PATH, the encoders hyperframes should use, telemetry
# and the skills refresh switched off — for that one command and the processes
# it starts, and nothing after it. A script run through bin/adsnode therefore finds
# our ffmpeg, hyperframes and juicy by their bare names. So nothing outside this
# folder has to change for the tools to work: no PATH in a config file, no
# environment block, no restart.
#
# Idempotent: every step checks first, so re-running after a failure is safe.
#
#   sh install.sh
#   sh install.sh --only node|tools|juicy|chrome|python
#   sh install.sh --only launchers   # rewrite the launchers for what is
#                                    # installed; downloads nothing

set -eu

# Put the system directories on PATH, so curl, tar and shasum run whatever
# environment this script was started from.
PATH="$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export PATH

JUICYLUCY_HOME="${JUICYLUCY_HOME:-$HOME/.juicylucy}"
# The agent this copy was emitted for — codex or claude. build-plugin.mjs stamps
# it per edition; only the closing words below depend on it.
JUICYLUCY_HOST=claude
SCRIPT_DIR=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)
NODE_TRAIN="${JUICYLUCY_NODE_TRAIN:-latest-v22.x}"
# The hyperframes version the shipped skills were written against — the same
# value as `cli` in the repo's vendor/hyperframes/UPSTREAM.lock, kept in step
# by a test. The skills describe THIS CLI; a newer one may not match them.
HYPERFRAMES_VERSION="${JUICYLUCY_HYPERFRAMES_VERSION:-0.8.71}"
# The juicy version this plugin release was built and tested against — the
# same value as `version` in the repo's build/juicy-cli.lock, which is also the
# version the shipped juicy-cli skill was generated from; kept in step by a
# test. Never `latest`: a moving tag installs code nobody has tested with this
# release. A path to a packed tarball in JUICYLUCY_JUICY_CLI_SPEC lets an
# unpublished build be tested through this script.
JUICY_VERSION="${JUICYLUCY_JUICY_VERSION:-0.1.7}"
JUICY_CLI_SPEC="${JUICYLUCY_JUICY_CLI_SPEC:-@juicylucy/cli@$JUICY_VERSION}"
NODE_MIN=22
ONLY=""
FORCE_NODE=0
for arg in "$@"; do
  [ "$arg" = "--force-node" ] && FORCE_NODE=1
done
[ "${1:-}" = "--only" ] && ONLY="${2:-}"

wanted() { [ -z "$ONLY" ] || [ "$ONLY" = "$1" ]; }
step() { printf '\n▶ %s\n' "$*"; }

ARCH=$(uname -m)
if [ "$ARCH" = "x86_64" ]; then NODE_ARCH=x64; FF_ARCH=x64; else NODE_ARCH=arm64; FF_ARCH=arm64; fi

mkdir -p "$JUICYLUCY_HOME"

# ── Node ──────────────────────────────────────────────────────────────────────
# The machine's own node, looked up past our bin/: a launcher must point at a
# real Node, never at another launcher. A PATH that already leads with our bin/
# — an earlier setup's config, or a run from inside a launcher — is the case.
machine_node() {
  ( PATH=$(printf '%s' "$PATH" | tr ':' '\n' | grep -vxF "$JUICYLUCY_HOME/bin" | paste -sd: -)
    command -v node 2>/dev/null || true )
}

# Major version of a node binary, or 0 if it is not usable.
node_major() {
  [ -x "${1:-}" ] || { printf '0'; return 0; }
  ver=$("$1" --version 2>/dev/null | tr -d 'v')
  printf '%s' "${ver%%.*}"
}

install_node() {
  if [ -x "$JUICYLUCY_HOME/node/bin/node" ]; then
    printf '  already present: %s\n' "$("$JUICYLUCY_HOME/node/bin/node" --version)"
    write_node_launchers
    return 0
  fi

  # Don't download 50 MB to duplicate a Node that is already here and new
  # enough. Asking a non-technical user to approve that reads as busywork, and
  # it is. --force-node overrides, for a machine whose Node is likely to move.
  system_node=$(machine_node)
  if [ "$FORCE_NODE" -eq 0 ] && [ "$(node_major "$system_node")" -ge "$NODE_MIN" ] 2>/dev/null; then
    printf '  using the Node already on this machine: %s (%s)\n' "$("$system_node" --version)" "$system_node"
    write_node_launchers
    return 0
  fi

  # SHASUMS256.txt names the current build of the train and gives its checksum,
  # so we never hardcode a version that will rot.
  base="https://nodejs.org/dist/$NODE_TRAIN"
  line=$(curl -fsSL "$base/SHASUMS256.txt" | grep "darwin-$NODE_ARCH.tar.gz$" | head -1)
  [ -n "$line" ] || { echo "could not find a darwin-$NODE_ARCH build in $base" >&2; return 1; }
  sum=${line%% *}
  file=${line##* }

  printf '  downloading %s\n' "$file"
  tmp=$(mktemp -d)
  curl -fsSL -o "$tmp/$file" "$base/$file"

  printf '  verifying checksum\n'
  actual=$(shasum -a 256 "$tmp/$file" | cut -d' ' -f1)
  [ "$actual" = "$sum" ] || { echo "checksum mismatch for $file — refusing to install" >&2; rm -rf "$tmp"; return 1; }

  rm -rf "$JUICYLUCY_HOME/node"
  mkdir -p "$JUICYLUCY_HOME/node"
  tar xzf "$tmp/$file" -C "$JUICYLUCY_HOME/node" --strip-components=1
  rm -rf "$tmp"
  printf '  installed %s\n' "$("$JUICYLUCY_HOME/node/bin/node" --version)"
  write_node_launchers
}

# ── the launchers ─────────────────────────────────────────────────────────────
# Wherever the Node we settled on lives — ours if we installed one, otherwise
# the machine's.
node_dir() {
  if [ -x "$JUICYLUCY_HOME/node/bin/node" ]; then
    printf '%s' "$JUICYLUCY_HOME/node/bin"
  else
    dirname "$(machine_node)"
  fi
}

# One launcher: ~/.juicylucy/bin/<name>, which sets the toolchain's environment
# and runs <target>. The settings apply to that command and its children only:
#   PATH                      our bin/ first, then our Node, then the caller's
#                             PATH — so a bare `ffmpeg` or `hyperframes` inside
#                             a script resolves to ours
#   HYPERFRAMES_FFMPEG_PATH / _FFPROBE_PATH  our encoders, read before PATH
#   HYPERFRAMES_SKIP_SKILLS   init and `skills update` leave ~/.agents/skills alone
#   HYPERFRAMES_NO_TELEMETRY  the CLI reports usage by default; compositions
#                             carry ad copy, so it never does here
# The paths are written in at install time. A Node that moves later breaks the
# launcher, which the doctor's `tools` line reports; re-running this fixes it.
write_launcher() {
  # No Node yet (the python step alone, say): leave it off rather than add ".".
  nd=$(node_dir 2>/dev/null || true)
  [ "$nd" = "." ] && nd=""
  mkdir -p "$JUICYLUCY_HOME/bin"
  rm -f "$JUICYLUCY_HOME/bin/$1"
  cat > "$JUICYLUCY_HOME/bin/$1" <<LAUNCHER
#!/bin/sh
# Written by JuicyLucy setup (install.sh). Runs $1 with the toolchain's environment.
HYPERFRAMES_FFMPEG_PATH="$JUICYLUCY_HOME/node_modules/ffmpeg-static/ffmpeg"
HYPERFRAMES_FFPROBE_PATH="$JUICYLUCY_HOME/node_modules/@ffprobe-installer/darwin-$FF_ARCH/ffprobe"
HYPERFRAMES_SKIP_SKILLS=1
HYPERFRAMES_NO_TELEMETRY=1
PATH="$JUICYLUCY_HOME/bin${nd:+:$nd}:\$PATH"
export HYPERFRAMES_FFMPEG_PATH HYPERFRAMES_FFPROBE_PATH HYPERFRAMES_SKIP_SKILLS HYPERFRAMES_NO_TELEMETRY PATH
exec "$2" "\$@"
LAUNCHER
  chmod +x "$JUICYLUCY_HOME/bin/$1"
}

# adsnode: the Node setup chose, under a name of its own — like adspython — so a
# skill script run as ~/.juicylucy/bin/adsnode gets the environment above.
# Nothing in bin/ is named after a system tool: a `node` there would read as
# a stand-in for the real one, and the OpenAI directory's skill scan flagged
# every skill that ran it (2026-10-05; the same skills passed with adsnode).
write_node_launchers() {
  write_launcher adsnode "$(node_dir)/node"
  "$JUICYLUCY_HOME/bin/adsnode" --version >/dev/null 2>&1 || {
    echo "the adsnode launcher does not run — $JUICYLUCY_HOME/bin/adsnode" >&2
    return 1
  }
  printf '  adsnode ready in %s/bin
' "$JUICYLUCY_HOME"
}

# ── hyperframes + the encoders ────────────────────────────────────────────────

# THE ANCHOR. npm resolves the package root by walking up from the working
# directory, so without a package.json of our own it can adopt ~/package.json
# and install into ~/node_modules. Writing one first pins it here. Both npm
# installs below go through this.
anchor_npm() {
  [ -f "$JUICYLUCY_HOME/package.json" ] || cat > "$JUICYLUCY_HOME/package.json" <<'JSON'
{
  "name": "juicylucy-tools",
  "private": true,
  "description": "Local toolchain for JuicyLucy ad production. Managed by /juicylucy-setup; safe to delete this whole folder."
}
JSON
}

install_tools() {
  bindir=$(node_dir)
  [ -x "$bindir/node" ] || { echo "Node is not available yet — run with --only node first" >&2; return 1; }
  anchor_npm

  # npm's launcher carries a `#!/usr/bin/env node` shebang, so the Node we chose
  # has to be on PATH for it — an absolute path to node is not enough.
  printf '  installing hyperframes and the video encoders (a few hundred MB)\n'
  ( cd "$JUICYLUCY_HOME" \
      && PATH="$bindir:$PATH" npm install --silent --no-audit --no-fund --save-exact \
        "hyperframes@$HYPERFRAMES_VERSION" ffmpeg-static @ffprobe-installer/ffprobe )

  # Verify rather than announce. The previous version fell back to printing
  # "installed" when the version call failed, so a install that put its files
  # somewhere else still reported success.
  hf="$JUICYLUCY_HOME/node_modules/.bin/hyperframes"
  [ -x "$hf" ] || {
    echo "install finished but $hf is not there — the packages landed somewhere else" >&2
    return 1
  }
  printf '  hyperframes %s\n' "$(PATH="$bindir:$PATH" "$hf" --version)"

  link_encoders
  write_node_launchers
  write_launcher hyperframes "$hf"
  # Verify through the launcher: it is what the skills run.
  got=$("$JUICYLUCY_HOME/bin/hyperframes" --version 2>/dev/null | head -1 | tr -d 'v')
  [ "$got" = "$HYPERFRAMES_VERSION" ] || {
    echo "the hyperframes launcher runs ${got:-nothing}, not $HYPERFRAMES_VERSION — $JUICYLUCY_HOME/bin/hyperframes" >&2
    return 1
  }
  printf '  hyperframes launcher ready: %s/bin/hyperframes\n' "$JUICYLUCY_HOME"
  brand_studio "$bindir"
}

# ── the Studio's logo and colour ──────────────────────────────────────────────
# The editor `hyperframes preview` opens carries upstream's logo and green;
# studio-brand.mjs gives it JuicyLucy's. It is cosmetic, so on a user's machine
# it can never fail this step and never says it did: it prints nothing, exits
# 0, keeps what happened in $JUICYLUCY_HOME/studio-brand.log, and leaves what it
# could not apply as upstream shipped it. A developer who wants a broken anchor
# to stop the install sets JUICYLUCY_BRANDING_STRICT=1. CI runs the same strict
# check against the pinned version (build/check-studio-brand.mjs).
brand_studio() {
  if [ "${JUICYLUCY_BRANDING_STRICT:-}" = "1" ]; then
    PATH="$1:$PATH" JUICYLUCY_HOME="$JUICYLUCY_HOME" node "$SCRIPT_DIR/studio-brand.mjs" --strict "$JUICYLUCY_HOME/node_modules/hyperframes"
  else
    PATH="$1:$PATH" JUICYLUCY_HOME="$JUICYLUCY_HOME" node "$SCRIPT_DIR/studio-brand.mjs" "$JUICYLUCY_HOME/node_modules/hyperframes" \
      >/dev/null 2>&1 || true
  fi
  printf '  the preview editor wears JuicyLucy colours\n'
}

# ── juicy ─────────────────────────────────────────────────────────────────────
# The generation command. Same npm, same anchor, and a launcher in bin/ beside
# ffmpeg, which the skills run by its full path. No credential is written here: the user signs in
# afterwards (the setup skill, Step 4) and `juicy` keeps the session in
# ~/.juicylucy/juicy/credentials, mode 600, on this machine only.
install_juicy() {
  bindir=$(node_dir)
  [ -x "$bindir/node" ] || { echo "Node is not available yet — run with --only node first" >&2; return 1; }
  anchor_npm

  printf '  installing juicy $JUICY_VERSION (the command that generates images, video and music)\n'
  ( cd "$JUICYLUCY_HOME" \
      && PATH="$bindir:$PATH" npm install --silent --no-audit --no-fund --save-exact "$JUICY_CLI_SPEC" )

  juicy="$JUICYLUCY_HOME/node_modules/.bin/juicy"
  [ -x "$juicy" ] || {
    echo "install finished but $juicy is not there — the package landed somewhere else" >&2
    return 1
  }
  # A launcher, not a symlink: npm's `juicy` starts with `#!/usr/bin/env node`,
  # so the Node we chose has to be on PATH when it runs.
  write_node_launchers
  write_launcher juicy "$juicy"

  # Verify through the launcher: "installed" is not the same as "runs".
  got=$("$JUICYLUCY_HOME/bin/juicy" --version 2>/dev/null \
    | sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' | head -1)
  case "$got" in
    [0-9]*.[0-9]*.[0-9]*) ;;
    *) echo "juicy is linked but reports no version (got '${got:-nothing}') — refusing to call this installed" >&2; return 1 ;;
  esac
  printf '  juicy %s ready: %s/bin/juicy\n' "$got" "$JUICYLUCY_HOME"
}

# ── encoder shims ─────────────────────────────────────────────────────────────
# `ffmpeg-static` and `@ffprobe-installer/ffprobe` expose their binaries as
# package exports and declare no `bin`, so npm creates no shim and
# node_modules/.bin gets `hyperframes` but no `ffmpeg`, and a bare `ffmpeg`
# resolves to whatever the system has — Homebrew's build, or nothing at all.
#
# That is not academic: the ad skills tell the agent to run ffmpeg and ffprobe
# directly — as ~/.juicylucy/bin/ffmpeg, which this links (probe a reference, dump a contact sheet, pull a first frame, check a
# render is not silent). Observed on a real run — the agent reached Homebrew's
# ffmpeg, which is built without libfreetype, hit "drawtext: Filter not found",
# and abandoned the framework rather than the binary. On a machine set up by
# this script there is no Homebrew ffmpeg at all, so those same commands would
# simply not be found.
link_encoders() {
  ffmpeg_bin="$JUICYLUCY_HOME/node_modules/ffmpeg-static/ffmpeg"
  ffprobe_bin="$JUICYLUCY_HOME/node_modules/@ffprobe-installer/darwin-$FF_ARCH/ffprobe"

  mkdir -p "$JUICYLUCY_HOME/bin"
  for pair in "ffmpeg:$ffmpeg_bin" "ffprobe:$ffprobe_bin"; do
    name=${pair%%:*}
    target=${pair#*:}
    [ -x "$target" ] || {
      echo "expected $name at $target, but it is not there" >&2
      return 1
    }
    ln -sf "$target" "$JUICYLUCY_HOME/bin/$name"
  done

  # Verify through the shim, not the target: a symlink that resolves to nothing
  # still looks fine in `ls`.
  "$JUICYLUCY_HOME/bin/ffmpeg" -hide_banner -version >/dev/null 2>&1 || {
    echo "the ffmpeg shim does not run — $JUICYLUCY_HOME/bin/ffmpeg" >&2
    return 1
  }
  printf '  ffmpeg and ffprobe linked into %s/bin\n' "$JUICYLUCY_HOME"
}

# ── Python QA (statics) ──────────────────────────────────────────────────────
# The statics engine's QA scripts (contact sheets, campaign verification) are
# Python with one dependency, Pillow. The interpreter is OUR OWN: a relocatable
# CPython from python-build-standalone, unpacked under JUICYLUCY_HOME like Node.
#
# Not the Mac's python3, on purpose. On a machine without Apple's Command Line
# Tools, /usr/bin/python3 is a stub whose first run opens a GUI installer and
# tells the user to complete it in Terminal — the one thing this setup promises
# never to do. A private interpreter needs no venv either: nothing else can
# install into it. One shim, `adspython`, exposes it beside ffmpeg in bin/.
#
# The release is pinned. Old releases stay downloadable, the asset names are
# stable within one, and Pillow does not care which 3.12 it runs on — so a pin
# cannot rot the way a floating "latest" can break. Bump PY_RELEASE deliberately.
PY_RELEASE="${JUICYLUCY_PY_RELEASE:-20260901}"
PY_SERIES="3.12"

install_python() {
  py="$JUICYLUCY_HOME/python/bin/python3"
  if [ ! -x "$py" ]; then
    [ "$ARCH" = "x86_64" ] && py_arch=x86_64 || py_arch=aarch64
    base="https://github.com/astral-sh/python-build-standalone/releases/download/$PY_RELEASE"

    # SHA256SUMS names the exact asset and gives its checksum, so nothing here
    # hardcodes a patch version and nothing unverified is unpacked.
    line=$(curl -fsSL "$base/SHA256SUMS" \
      | grep -E "cpython-${PY_SERIES}\.[0-9]+\+${PY_RELEASE}-${py_arch}-apple-darwin-install_only_stripped\.tar\.gz$" \
      | head -1)
    [ -n "$line" ] || { echo "no ${PY_SERIES} build for ${py_arch} in python-build-standalone $PY_RELEASE" >&2; return 1; }
    sum=${line%% *}
    file=${line##* }

    printf '  downloading %s (about 25 MB)\n' "$file"
    tmp=$(mktemp -d)
    curl -fsSL -o "$tmp/$file" "$base/$file"

    printf '  verifying checksum\n'
    actual=$(shasum -a 256 "$tmp/$file" | cut -d' ' -f1)
    [ "$actual" = "$sum" ] || { echo "checksum mismatch for $file — refusing to install" >&2; rm -rf "$tmp"; return 1; }

    rm -rf "$JUICYLUCY_HOME/python"
    mkdir -p "$JUICYLUCY_HOME/python"
    tar xzf "$tmp/$file" -C "$JUICYLUCY_HOME/python" --strip-components=1
    rm -rf "$tmp"
    [ -x "$py" ] || { echo "unpacked, but $py is not there" >&2; return 1; }
    printf '  installed %s\n' "$("$py" --version)"
  else
    printf '  already present: %s\n' "$("$py" --version)"
  fi

  printf '  installing Pillow\n'
  "$py" -m pip install --quiet --disable-pip-version-check "pillow>=10,<12"

  # A launcher, NOT a symlink: a symlink would resolve to a path the
  # interpreter no longer recognises as its own home.
  write_launcher adspython "$py"

  # Verify through the shim: it must import the one dependency the scripts need.
  "$JUICYLUCY_HOME/bin/adspython" -c "import PIL" 2>/dev/null || {
    echo "adspython cannot import Pillow — the install failed" >&2
    return 1
  }
  printf '  adspython ready: %s\n' "$("$JUICYLUCY_HOME/bin/adspython" --version 2>&1)"
}

# ── Chrome ────────────────────────────────────────────────────────────────────
install_chrome() {
  hf="$JUICYLUCY_HOME/node_modules/.bin/hyperframes"
  [ -x "$hf" ] || { echo "hyperframes is not installed yet — run with --only tools first" >&2; return 1; }
  printf '  asking hyperframes to find or download Chrome\n'
  PATH="$(node_dir):$PATH" "$hf" browser ensure
}

# ── launchers alone ───────────────────────────────────────────────────────────
# For a machine whose tools are installed but whose bin/ lacks a launcher — set
# up before launchers existed, say. Rewrites one for every tool that is there
# and downloads nothing. Never part of a full run: each step writes its own.
write_launchers() {
  wrote=""
  if [ -n "$(machine_node)" ] || [ -x "$JUICYLUCY_HOME/node/bin/node" ]; then
    write_node_launchers; wrote="$wrote adsnode"
  fi
  if [ -x "$JUICYLUCY_HOME/node_modules/.bin/hyperframes" ]; then
    link_encoders
    write_launcher hyperframes "$JUICYLUCY_HOME/node_modules/.bin/hyperframes"; wrote="$wrote hyperframes"
  fi
  if [ -x "$JUICYLUCY_HOME/node_modules/.bin/juicy" ]; then
    write_launcher juicy "$JUICYLUCY_HOME/node_modules/.bin/juicy"; wrote="$wrote juicy"
  fi
  if [ -x "$JUICYLUCY_HOME/python/bin/python3" ]; then
    write_launcher adspython "$JUICYLUCY_HOME/python/bin/python3"; wrote="$wrote adspython"
  fi
  printf '  launchers written:%s\n' "${wrote:- none — nothing is installed yet; run install.sh without --only}"
}

if [ "$ONLY" = "launchers" ]; then
  step "launchers"
  write_launchers
  printf '\nDone. Nothing was downloaded. Re-run doctor.sh.\n'
  exit 0
fi

wanted node && { step "Node"; install_node; }
wanted tools && { step "hyperframes and the video encoders"; install_tools; }
wanted juicy && { step "juicy, the generation command"; install_juicy; }
wanted chrome && { step "headless Chrome"; install_chrome; }
wanted python && { step "Python QA (statics)"; install_python; }

# ── what the caller still has to do ───────────────────────────────────────────
if [ "$JUICYLUCY_HOST" = claude ]; then
  AGENT="Claude Code"
  APPROVAL="Claude Code asks the user to approve juicy commands, and when its sandbox is on, the
network host too; they can allow them for the rest of the session when it offers."
else
  AGENT="Codex"
  APPROVAL="Codex asks the user to approve
juicy commands; they can allow them for the rest of the session when it
offers."
fi
cat <<EOF

▶ Done installing. Nothing to add to $AGENT's configuration and no restart:
  the skills run every tool by its full path under $JUICYLUCY_HOME/bin.

One thing left: sign the user in to JuicyLucy. The method belongs to juicy and
will change, so do not assume one — run

  $JUICYLUCY_HOME/bin/juicy auth help

and follow what it prints: what to ask the user for, the command to run, what
never to do with what they gave you. juicy needs the network and writes its
session to $JUICYLUCY_HOME/juicy/credentials, so $APPROVAL Nothing sends the user to Terminal.

Then re-run doctor.sh. Every line should read ok.
EOF
