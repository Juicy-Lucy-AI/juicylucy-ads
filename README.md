# JuicyLucy Ads

Create video and static ads from a brief or your existing creative, adapt them for Meta, Instagram
and TikTok, and localize them for different markets — in Claude Code, on your Mac.

## What it does

Two entry points:

- **`/video-ad-production`** — a new ad from a brief or, more often, a variation of a reference
  creative ("copy this ad, change the hook"). It generates the first frame and then the footage,
  cuts to the placement spec, checks the copy against Meta's advertising policies, and exports under
  a filename an ads-manager report can be traced back to.
- **`/static-ad-production`** — iterate your own winning statics into a batch, write
  policy-compliant copy, localize into every approved language, and QA the batch before upload.

Behind them: the composition, motion and media skills a video run reads, the placement specs and
copy-rejection taxonomy both engines share, the naming and foldering conventions that make exports
traceable, and `/juicylucy-setup`, which gets your Mac ready. Product facts, the claims a brand may
not make, and its colours and type come from a brand skill. The first time you ask for an ad, the
plugin creates that brand skill with you in `~/.claude/skills`.

## What you need

- **Claude Code on macOS.** Ad production renders video and images on your Mac. The plugin does not
  work in claude.ai chat, in Cowork or on a phone; asked there, it says so and points you to Claude
  Code.
- **A JuicyLucy account for image and video generation.** Composition, cutting and export work
  without one. `/juicylucy-setup` signs you in with a code sent to your email, and creates the
  account the same way if you have none.
- **Nothing else.** The first time you ask, `/juicylucy-setup` installs everything the plugin needs,
  with no administrator password, and asks before each download.

## What it installs, and from where

Everything goes into `~/.juicylucy`; deleting that folder removes it. Setup never edits Claude
Code's settings, its permissions or a shell profile.

| What | From |
| --- | --- |
| Node.js 22, when the Mac has no recent Node | `nodejs.org`, checked against its published checksum |
| The HyperFrames renderer, at the version this plugin pins, and the ffmpeg and ffprobe encoders | the npm registry, `registry.npmjs.org` |
| `juicy`, JuicyLucy's generation command, at the version this plugin pins | the npm registry, `registry.npmjs.org` |
| A standalone Python for the statics QA scripts | the python-build-standalone releases on `github.com`, checked against its checksum |
| A headless Chrome the renderer draws frames with | Google's Chrome for Testing (`googlechromelabs.github.io`, `storage.googleapis.com`), fetched by the renderer into `~/.cache/hyperframes` |

Setup also puts JuicyLucy's logo and colour on the renderer's local preview editor.

## What reaches the network

- **JuicyLucy's generation service**, through `juicy`, under your account: generation prompts,
  settings and the reference media a generation needs. The service runs at
  `ugysfpaumsxxsrbilpmc.supabase.co`; `juicy` also uploads reference media to, and downloads
  results from, its generation provider fal (`queue.fal.run`, `rest.alpha.fal.ai`). The providers
  process and host the generated media, and the service stores job and usage records. Account
  links point at `www.juicylucy.io`.
- **Meta's public Ad Library**, only when you ask to study an ad there: the ad's page
  (`www.facebook.com`), and the media files the ad links to (`*.fbcdn.net`).
- **Meta's Marketing API** (`graph.facebook.com`), only for winner analysis, with an access token
  you supply, under a read-only contract. The token is never written to a file.
- **Rendering**: a composition loads its animation library and web fonts from public CDNs
  (`cdn.jsdelivr.net`, `fonts.googleapis.com`) while it is previewed or rendered. No project
  content is sent to them.
- **A public link to a draft**, only when you ask for one: the renderer's `publish` uploads that
  project's source and assets to HyperFrames' hosting, run by HeyGen.

The renderer's telemetry is switched off. Composition and rendering happen on your Mac, where project
files and downloaded media are saved. Claude processes the conversation and task context under your
Claude account.

## Support

- Email: plugin@juicylucy.io
- Privacy policy: https://www.juicylucy.io/privacy-policy
- Terms of service: https://www.juicylucy.io/terms-conditions

Copyright Juicy Lucy AI, UAB. The plugin's own skills are proprietary (`LICENSE`); the HyperFrames
skills it carries are Apache-2.0 (`THIRD_PARTY_LICENSES`, `NOTICE`).
