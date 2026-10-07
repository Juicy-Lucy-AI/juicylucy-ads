---
name: juicylucy-setup
description: "Set up or repair the local tools JuicyLucy's ad production needs — Node, the hyperframes CLI, ffmpeg, headless Chrome, the `juicy` generation command and its sign-in. Use when an ad workflow's preflight (`doctor.sh --preflight`) reports the machine is not set up, when a render or generation fails because `hyperframes` or `juicy` is missing, when a user asks to sign in, when `juicy` reports no session or no credits, when a newer `juicy` is out, when a first-time user asks to get started or a plugin update asks for setup again, or when ads don't work on a machine. Also the home of references/extending.md and the brand template: read it when an ad workflow finds no brand installed, or to add or change a brand, the conventions, or how ads are made on this machine. Installs tools under ~/.juicylucy, with no administrator password, no Homebrew and no change to Claude Code's settings or a shell profile. Formerly /adframes-setup."
---

# JuicyLucy setup

> **This runs in Claude Code on a Mac.** If this is not Claude Code on the user's own Mac — the
> request came from claude.ai chat, Cowork or the mobile app, whose code sandbox is not the user's
> Mac — say that setup installs tools on the user's own Mac inside Claude Code, point them there,
> and stop.

Get one machine ready to make ads. The person running this is usually **not technical** — they want
working software, not a tour of the toolchain. So: check first, explain what is missing in plain
words, ask before installing anything, then verify.

Everything lands in **`~/.juicylucy/`**. No administrator password, no Homebrew, no Xcode tools,
and never a shell profile, Claude Code's settings or a skill folder. Outside it only the
tools' own caches are written: the headless Chrome hyperframes keeps in `~/.cache/hyperframes`,
and npm's download cache in `~/.npm`. Deleting `~/.juicylucy` undoes the install — and removes the
user's own conventions folder, `~/.juicylucy/conventions`, if they keep one; setup never writes
there, and an update leaves it alone.

**Older installs.** Before plugin 0.12.0 the same toolchain lived in `~/.adframes/`, under the
video side's old internal name. Nothing reads that folder any more. A machine that has one is set
up again from scratch here — the downloads are the same size as the first time — and the old folder
can be deleted once the doctor reads clean. Do not move or reuse it. The product is called
JuicyLucy; use that name for all of this when talking to the user.

## The rules of this workflow

1. **Diagnose before you touch anything.** Always run the doctor first, even if the user has told
   you what is broken.
2. **Ask before each install — and only before an install.** Downloading 200 MB onto someone's
   machine is a judgement call, so say what it is and roughly how big it is, and never install
   something the doctor did not report as missing. Everything else here — running the doctor,
   listing what is installed, re-running the doctor to verify — is reversible and decides nothing, so
   just do it. § Do not make the user click through your own work.
3. **Never use `sudo`.** If a step seems to need it, you have the wrong step — the whole design
   avoids it. Stop and say so.
4. **Explain in ordinary words.** "The video encoder is missing, I'll download it into your JuicyLucy
   folder" — not "ffprobe is not on PATH".
5. **Verify by re-running the doctor**, not by assuming the install worked.
6. **Never send the user to Terminal.** Nothing here needs it: no Xcode Command Line Tools, no
   Homebrew, no `xcode-select --install`, and not the sign-in either — `juicy` tells you how to do
   that from here. If a step seems to need Terminal, it is the wrong step — stop and say so.
7. **Leave Claude Code's own settings alone.** Setup never edits Claude Code's settings, its
   permissions, a shell profile, or any file outside `~/.juicylucy`, and never asks the user to.
   The skills run each tool by its full path under `~/.juicylucy/bin`, so nothing needs to be added
   to `PATH`, and nothing needs a restart. Claude Code asks the user before it runs a command; the
   user decides.

## Do not make the user click through your own work

A first-time user reads every prompt as a decision they are supposed to understand. Spend that
attention only where their answer changes what happens.

**Ask when the answer changes the outcome:** installing software, the paid half of the smoke test, anything that costs money or cannot be undone by deleting `~/.juicylucy`.

**Do not ask — just do it, and say what you did:** running either script here, reading a file to
find out what is already configured, listing a directory, re-running the doctor. If the runtime
puts up its own approval prompt for one of these — a folder that happens to sit inside iCloud or
Google Drive, say — that is the sandbox asking, not a question you should be forwarding or
elaborating on. Approve what the step needs and keep going.

The failure this prevents: a setup that reads as an interrogation, where the user approves nine
things they cannot evaluate and then cannot tell which one mattered.

## Step 1 — diagnose

```bash
sh "${CLAUDE_SKILL_DIR}/scripts/doctor.sh"
```

Claude Code fills in this skill's own directory.

Each line is `name  ok|missing  detail`. Read the summary at the end. If everything is `ok`, say so
in one sentence and stop — do not install anything.

**Arriving from an ad run.** Both ad workflows run this doctor as `--preflight` before their
Step 0: the same lines, without the sign-in's network call, plus a final `preflight` line whose verdict and
exit code count only the toolchain — `node`, `hyperframes` and `hf-version`, `ffmpeg`, `ffprobe`,
`adspython`, `juicy`, and `tools`, whether the launchers the skills run are in `~/.juicylucy/bin`. A `preflight missing` is how a run that was asked for an ad
ends up here. Treat it as a first-time setup: run the full doctor anyway (rule 1), take every step
through to the sign-in, and say that the ad is asked for again after it — the ad run wrote nothing,
so nothing needs carrying over. A `preflight ok` beside other `missing` lines (a sign-in, a newer
`juicy`) never sends a run here on its own; the run names them in its reply, and they
are fixed here when the user asks.


## Step 2 — explain, and ask

Tell the user only about the things that are missing, in the order the doctor lists them, and what
each one is for. Before anything is installed, `tools` reads `missing` too — that is the same
install, not a separate problem:

| Missing              | Say roughly                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| `node`               | "The runtime everything else needs." Only downloaded when the machine has none v22+; say so.      |
| `hyperframes`        | "The program that turns the ad into a video file. About 200 MB with its extras."                  |
| `ffmpeg` / `ffprobe` | "The video encoder. About 80 MB."                                                                 |
| `chrome`             | "A headless browser used to draw each frame. About 150 MB, downloaded by hyperframes itself."     |
| `adspython`          | "A private copy of Python the static-ad checks run through. About 25 MB."                         |
| `juicy`              | "The command that makes the images, video clips and music. A small download."                     |
| `juicy-version`      | "The generation command is not the version this plugin release uses." The juicy step installs that one; it is small and needs no sign-in again. |
| `juicy-login`        | "Signing in to your JuicyLucy account." Not a download; `~/.juicylucy/bin/juicy auth help` says what to ask for — Step 4. |
| `tools`              | The small launchers in `~/.juicylucy/bin` the skills run. Not a download: when the tools themselves read `ok` and only `tools` is missing — a machine set up before launchers existed — run `install.sh --only launchers`, which writes them and downloads nothing, and say you did. Otherwise they come with the install. |
| `skills`             | Not a download. The user's own brands in `~/.claude/skills` (or a project's `.claude/skills`), and any copy there of a shipped skill, which loads beside the plugin's and is not what the plugin runs — `references/extending.md`. |
| `conventions`        | Never missing, never installed. Which of the five conventions files `~/.juicylucy/conventions` holds; each replaces the plugin's default. Leave the folder as it is — `references/extending.md` § Changing the conventions. |

Then ask permission to install the ones that can be installed.

## Step 3 — install

```bash
sh "${CLAUDE_SKILL_DIR}/scripts/install.sh"
```

It is idempotent: it skips whatever is already present, so it is safe to re-run after a failure.
Pass `--only node`, `--only tools`, `--only juicy`, `--only chrome`, or `--only python` to do one
part. Every version is fixed by this plugin release: hyperframes, and `juicy`, which the plugin's
`juicy-cli` skill describes exactly — a plugin update is how either moves, never a fetch of whatever
was published last. Every tool gets a launcher in `~/.juicylucy/bin` — `adsnode` (the Node setup chose), `hyperframes`,
`juicy`, `ffmpeg`, `ffprobe`, `adspython` — and the skills run it by that full path. Each launcher
sets, for that command and the processes it starts, what the toolchain needs: our tools first on
`PATH`, the installed encoders, telemetry off, and the skills refresh off
(`references/environment.md`). The python step provisions `adspython`, the interpreter the statics engine's QA scripts run through —
a standalone Python unpacked under `~/.juicylucy/python`, the same way Node is. It never runs the
Mac's own `python3`, which on a fresh machine is a stub that opens Apple's Command Line Tools
installer and asks the user to finish in Terminal.

It edits no config file and asks for none. When it finishes, the only thing left is the sign-in.

## Step 4 — the sign-in

Generation is paid for by the user's JuicyLucy account, and `juicy` keeps the session for it in
`~/.juicylucy/juicy/credentials` — one file on this machine, mode 600, outside any project or git
repository.

**`juicy` needs the network, and Claude Code asks before it runs.** Claude Code shows the user
each command before running it, and a `juicy` command — the sign-in, and every generation later —
reaches JuicyLucy's service and writes under `~/.juicylucy`. If the user turned Claude Code's
sandbox on, that network host and that folder need their approval too. Setup changes none of it.
Say so once, before the first one: *"Claude Code will ask you to allow the JuicyLucy command; it
reaches the internet to sign you in and to make images and video."* If Claude Code offers to allow
`juicy` commands for the rest of the session, that is the user's choice to make, not yours.

**How a user signs in belongs to `juicy`, not to this skill**, because it changes from one `juicy`
version to the next — what to ask the user for, and how many steps it takes. So do not work from
memory, and do not ask the user for anything before you have read it. Run

```bash
~/.juicylucy/bin/juicy auth help
```

and follow what it prints: the method this version uses, what to ask the user for, the exact
command, and what never to do with what they gave you. Say what happens before you ask, in your own
words: the session stays on this Mac in that one file, `juicy` sends it only to JuicyLucy's own
service on their own generation requests, and `~/.juicylucy/bin/juicy auth logout` or deleting `~/.juicylucy` ends
it. Whatever method `auth help` names, three things hold:

- **The user never leaves this conversation for it.** No Terminal (rule 6).
- **What the user gives you is for the sign-in only.** Never repeat it back, never write it into a
  file or a project, never keep it once the sign-in is done.
- **A user without an account signs up the same way.** Ask for the address they want the account
  under; the sign-in command sends an address with no account a sign-up code instead, and says so
  in its output (`auth help` names the fields). Before you ask for that code, tell the user that
  entering it creates their JuicyLucy account and accepts the Terms and Conditions and the Privacy
  Policy at the links `juicy` printed, as the email also says; handing you the code is their
  decision. After the sign-in, run the `next` command it prints and follow it.

Then check it took: re-run the doctor and read `juicy-login`. It runs `~/.juicylucy/bin/juicy auth status`, which asks
the service whose session this machine holds, so `ok signed in as …` means the sign-in worked. Run
without the network, the question cannot be asked, and the line says exactly that — `ok`, a session
is on this machine, *not confirmed* — rather than `missing`. **Only `missing not signed in` means the
user has to sign in.** Never ask for sign-in details on any other wording of that line: run
`~/.juicylucy/bin/juicy auth status` with the network approved and read its answer.

## Step 5 — verify

Re-run the doctor. Every line should read `ok`.
Then confirm the toolchain agrees:

```bash
~/.juicylucy/bin/hyperframes doctor
```

Its own report should show FFmpeg, FFprobe, and
Chrome all found. Ignore the optional rows it flags
— whisper-cpp, Kokoro, MusicGen, and Docker are not needed to make an ad.

A session that exists is not yet a session that works, and a machine that runs `juicy` is not yet
one that reaches the service. Finish with two commands in a scratch folder. The first is free and
proves the download path; the second spends a few credits and proves generation, so say so and ask
before it (rule 2):

```bash
~/.juicylucy/bin/juicy sample get person-clapping-9x16-frame --project /tmp/juicy-smoke
~/.juicylucy/bin/juicy image generate --role first-frame --aspect 9:16 --variant smoke --max-cost 100 \
  --prompt "a plain grey studio backdrop with soft light, empty, no people" --project /tmp/juicy-smoke
```

Each prints one JSON record with a `path`; a file at that path means the setup is done. Exit `3`
means the sign-in did not take — back to Step 4. Exit `5` (`insufficient_credits`) is the account,
not this machine: § When it still does not work.
Anything else: send the JSON it printed to whoever maintains the plugin. Delete the scratch folder
afterwards.

Tell the user they are ready, and that the next thing to say is what ad they want.

## Extending it, on this machine

When an ad workflow finds no brand installed, when the user asks for a brand that is not
installed, wants a brand changed, or wants the conventions or the ads made differently, read
`references/extending.md` before doing anything. The short version: the plugin is read-only, and
every folder of it is replaced by the next update. The user's own brands live in
`~/.claude/skills`, where a first brand is made from `references/brand-template/`; Claude Code
reads that folder as it changes, so a new brand needs no restart. In Claude Code a brand is the one
thing extended locally: a copy of any other shipped skill there loads beside the plugin's and is
not what the plugin runs. The conventions are data, not a skill: a file in
`~/.juicylucy/conventions` replaces the shipped one of the same name. The doctor's `skills` and
`conventions` lines are the inventory of what is local.

## When it still does not work

- **A render fails on a codec or format.** The bundled encoder is an older build (ffmpeg 6). It is
  enough for ordinary ads; if a specific render rejects it, say so and send the error to whoever
  maintains the plugin.
- **`hyperframes` is found but skills keep changing.** It was run by a bare name, not through
  `~/.juicylucy/bin/hyperframes`, whose launcher switches the skills refresh off. Run it by the
  full path.
- **`juicy` exits `3` (`no_credentials`, `session_expired`).** The session is missing or was revoked;
  nothing is broken. Sign the user in again (Step 4: `~/.juicylucy/bin/juicy auth help`). Do not reinstall
  anything.
- **`juicy` exits `5` (`insufficient_credits`).** Nothing on this machine is wrong. Follow the
  error's `hint` and `next`, and the `juicy-cli` skill's guidance for it. Do not retry the
  generation until that is resolved.
- **The doctor says `juicy-version missing`.** The installed `juicy` is not the version this plugin
  release pins — after a plugin update, usually. `install.sh --only juicy` installs the pinned one;
  it is quick and needs no sign-in again.
- **Every generation call asks for approval.** That is Claude Code doing its job: it asks before
  running a command, and `juicy` needs the network. The user approves it, once per command or for
  `juicy` as a whole when Claude Code offers. Never edit Claude Code's settings or permissions to
  avoid the prompt, and never suggest the user does.
- **The doctor says `juicy-login ok … not confirmed`.** A session is on this machine and the doctor
  could not reach the service to confirm it. **The user is signed in as far as anyone can tell; do
  not ask them to sign in again.** `~/.juicylucy/bin/juicy auth status`, run with the network approved, prints the
  account.
- **A machine set up before this version.** The doctor's `tools` line reads `missing` with the
  tools themselves `ok`: run `install.sh --only launchers` (no download, no question needed).
- **Nothing at all runs after installing.** The user may be on an Intel Mac; the doctor prints the
  architecture it detected. Everything here supports both, but check that line before digging.
- **The preview editor still shows the HyperFrames logo, or green instead of orange.** Cosmetic, and
  never a reason to stop, reinstall or mention it unasked: the editor works the same either way.
  `scripts/studio-brand.mjs` applies the branding and is silent by design; if the user asks, its
  last run is in `~/.juicylucy/studio-brand.log`, and running it again is safe.
