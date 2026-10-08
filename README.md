# JuicyLucy Ads

Create video and static ads from a brief or your existing creative, adapt them for Meta, Instagram
and TikTok, and localize them for different markets — in Claude Code, on your Mac.

## What it does

Two entry points:

- **`/video-ad-production`** — a new ad from a brief or, more often, a variation of an existing
  ad ("same ad, new hook"). It generates the first frame and then the footage,
  cuts to the placement spec, checks the copy against Meta's advertising policies, and exports under
  a filename an ads-manager report can be traced back to.
- **`/static-ad-production`** — iterate your own winning statics into a batch, write
  policy-compliant copy, localize into every approved language, and QA the batch before upload.

The ad you start from can be one of your own or a public one you are studying, such as a
competitor's in Meta's Ad Library. The plugin takes the idea that made it work and builds your ad
from your brand: every image and frame it ships is generated for you, never another brand's name,
logo, offer, landing page or performer, and never a frame-for-frame reproduction.

Behind them: the composition, motion and media skills a video run reads, the placement specs and
copy-rejection taxonomy both engines share, the naming and foldering conventions that make exports
traceable, and `/juicylucy-setup`, which gets your Mac ready. Product facts, the claims a brand may
not make, and its colours and type come from a brand skill. The first time you ask for an ad, the
plugin creates that brand skill with you in `~/.claude/skills`.

## Try it

In Claude Code, from the folder you keep the campaign in:

- Create a 15-second vertical video ad from this brief.
- Replace the male actor in this video ad with a female actor. Keep the setting, actions, captions and timing.
- Localize this static ad into German, French and Spanish.

Each starts with a quick check that your Mac is set up; the first time, it offers to run
`/juicylucy-setup`. Generating footage, the step that costs most, waits for your go-ahead.

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

## Troubleshooting

Run `/juicylucy-setup`. It checks every tool, the sign-in and the versions this plugin pins, says in
plain words what is missing, and fixes it with your approval. Deleting `~/.juicylucy` and running it
again starts over. Common answers:

- **"No session" or "session expired"** — sign in again through `/juicylucy-setup`; nothing needs
  reinstalling.
- **"Insufficient credits"** — nothing is wrong with your Mac. `juicy` can create a payment link for
  a credit pack, which you pay in your browser; the plugin never pays for anything.
- **Every generation asks for approval** — that is Claude Code asking before a command reaches the
  network. Approve it once, or for `juicy` as a whole; the plugin never changes Claude Code's
  permissions to avoid the prompt.
- **"Use Claude Code"** — asked in claude.ai chat, Cowork or on a phone, the plugin cannot render.
  Open Claude Code on your Mac.

## Support

- Email: plugin@juicylucy.io
- Security issues: plugin@juicylucy.io, with "Security" in the subject.
- Privacy policy: https://www.juicylucy.io/privacy-policy
- Terms of service: https://www.juicylucy.io/terms-conditions

Copyright Juicy Lucy AI, UAB. The plugin's own skills are proprietary (`LICENSE`); the HyperFrames
skills it carries are Apache-2.0 (`THIRD_PARTY_LICENSES`, `NOTICE`).
