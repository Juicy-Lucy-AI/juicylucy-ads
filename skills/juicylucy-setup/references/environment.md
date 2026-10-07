# The environment the tools run in, and why none of it is in a config file

Setup changes nothing that configures anything else: not Claude Code's settings, not a shell
profile, not the sandbox. (Outside `~/.juicylucy` it writes only the tools' own caches: npm's in
`~/.npm`, and the headless Chrome hyperframes keeps in `~/.cache/hyperframes`.) Every tool the skills run has a launcher in `~/.juicylucy/bin`, the skills run it by
that full path, and the launcher sets the toolchain's environment for that one command and the
processes it starts, and nothing after it.

## The launchers

| Launcher      | Runs                                                                                    |
| ------------- | --------------------------------------------------------------------------------------- |
| `adsnode`     | The Node setup chose — its own under `~/.juicylucy/node`, or the machine's if it was new enough. Named like `adspython`: nothing here is named after a system tool. |
| `hyperframes` | The pinned renderer CLI.                                                                |
| `juicy`       | The pinned generation command. npm's launcher starts with `#!/usr/bin/env node`, so Node has to be findable, which the launcher sees to. |
| `adspython`   | The standalone Python under `~/.juicylucy/python`.                                      |
| `ffmpeg` · `ffprobe` | Links to the encoders under `~/.juicylucy/node_modules`; they need no environment. |

`install.sh` writes each one with this machine's real paths, and the doctor's `tools` line checks
that they are there and that `bin/hyperframes` runs the pinned version.

## What every launcher sets

| Variable                                               | Why                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PATH`                                                 | Our `bin/` first, then the Node setup chose, then whatever `PATH` the command was started with. So a script run as `~/.juicylucy/bin/adsnode` that starts `ffmpeg`, `hyperframes` or `juicy` by a bare name reaches ours. `bin/` leads because when the Node in use is Homebrew's, that directory also holds Homebrew's ffmpeg, which lacks `drawtext`. |
| `HYPERFRAMES_FFMPEG_PATH` · `HYPERFRAMES_FFPROBE_PATH` | Point hyperframes at the encoders installed under `~/.juicylucy`, so no system ffmpeg and no Homebrew is needed. hyperframes reads these before it scans `PATH`.                                                                                                                 |
| `HYPERFRAMES_SKIP_SKILLS`                              | Stops `~/.juicylucy/bin/hyperframes init` and `skills update` from fetching upstream's skills into the user's skill folders, where they would load beside the plugin's copies — upstream's own router among them, which sends ads to `/product-launch-video`.                                     |
| `HYPERFRAMES_NO_TELEMETRY`                             | **Not optional.** The CLI reports usage by default. Compositions carry ad copy, so it is switched off unconditionally.                                                                                                                                                        |

All of it applies to the launched process and its children only. A tool run by its bare name from
Claude Code gets none of it — which is why the skills never do that.

## Why the encoders are linked into `bin/`

`ffmpeg-static` and `@ffprobe-installer/ffprobe` expose their binaries as package exports and
declare no `bin`, so npm writes no shim: `node_modules/.bin` ends up with `hyperframes` and no
`ffmpeg`. `install.sh` links both encoders into `~/.juicylucy/bin` itself.

The ad skills run ffmpeg and ffprobe directly in several places (probing a reference, dumping a
contact sheet, pulling a first frame to edit, confirming a render is not silent), so they run
`~/.juicylucy/bin/ffmpeg`, never a bare `ffmpeg`. A bare one resolves to whatever the system has.
On a real run the agent reached Homebrew's ffmpeg, which is built without libfreetype, hit
`drawtext: Filter not found`, and abandoned the render path rather than the binary.

## The sandbox, and the network

Claude Code shows the user each command before it runs it, unless the user allowed it already.
Its sandbox is off unless the user turned it on; then it keeps commands to approved network hosts
and out of folders outside the project. Setup leaves all of that as it is. Rendering is local and
writes into the project, so it never notices. `juicy` does: it reaches JuicyLucy's generation
service, and it keeps its session and catalog cache in `~/.juicylucy/juicy/`. So with the sandbox
on, a `juicy` command needs the user's approval for that host and that folder, and Claude Code asks
for it. That decision is the user's; setup never makes it for them by editing Claude Code's
settings or permissions.

A `juicy` command the sandbox stopped fails with code `network` (exit 1), or with
`EPERM: operation not permitted` on a `mkdir` under `~/.juicylucy`. Neither means anything is
broken: run the command again with the approval.

## Signing in

`juicy` keeps the user's session in `~/.juicylucy/juicy/credentials` (mode 600), written by
`~/.juicylucy/bin/juicy auth login`. How that sign-in goes — what to ask the user for, the command — is printed by
`~/.juicylucy/bin/juicy auth help` and followed from there (`../SKILL.md` Step 4), because the method belongs to the
CLI and will change. There is no key to paste and no environment variable to set. The doctor's
`juicy-login` line runs `~/.juicylucy/bin/juicy auth status`, which reads that file and asks the service to confirm
it; run without the network, it says a session is on this machine and could not be confirmed,
never that the user is signed out.

