# Pulling references out of the Meta Ads Library

A preservation brief starts with a reference creative, and the reference usually lives in the
[Meta Ads Library](https://www.facebook.com/ads/library/). Getting it onto disk is a solved problem
with one sharp edge, and the edge is where every agent cuts itself.

**The rule is one line: browse in the browser, download outside it.**

```bash
~/.juicylucy/bin/adsnode <SKILL_DIR>/scripts/ad-library.mjs fetch \
  --page-id <page-id> --video-only --limit 6 \
  --out AD_REFERENCES.json --out-dir .media/references
```

That is the whole happy path. The rest of this file is why it is shaped that way, and what to do
when it is not enough.

## `--video-only` is not an optimisation

**A video ad is iterated from a video ad**, so `--video-only` is mandatory here, not a way to save
bandwidth. Drop it and the pull returns the page's image ads too, which cannot answer a single
question the variation path asks — pacing, cut rhythm, ending, soundtrack, performance — and an
agent handed a still fills those in from imagination rather than failing.

The same rule governs the browser half. When you filter the library UI by hand, the media filter is
**Videos**, not "Images and memes". A page running both mediums serves two different lists of ads
under those two filters, and the statics list is the wrong list. In a library URL that is
`media_type=video`.

Everything that comes down then goes through the Step 0 gate before production starts —
`reference-manifest.md`. `download` already writes the manifest it verifies.

## Why downloading through the page fails

The reported failure, on a video the agent had already found:

```
TypeError: Failed to fetch
  at fetch (https://static.xx.fbcdn.net/rsrc.php/v4/y1/r/0NgMS-WPRTe.js:288:3523)
```

It reads like a block. It is not one — and reading it as one sends you off building
anti-detection machinery for a problem that does not exist. Two things give it away: there is **no
HTTP status**, and the throw comes from Facebook's own bundled `fetch`. A status-less `TypeError`
is a failure to reach the host at all.

The cause is in the hostname of the asset:

```
scontent.frtm1-1.fna.fbcdn.net
                 ^^^
```

`fna` is a **Facebook Network Appliance** — a cache box that Meta installs _inside an ISP's own
network_. Those hostnames resolve to ISP-local addresses. Measured on the reported URL: the FNA
hostname resolved into a Lithuanian ISP range, and a differently-named FNA host was being handed to
a browser on the same machine minutes later.

So a media URL minted while a page loads on one network names a machine that may be **unroutable
from anywhere else**. The moment the fetch happens somewhere other than where the page loaded — a
cloud browser, a proxied automation layer, an asset-bundling step that egresses differently — it
fails exactly this way.

None of this is Meta refusing you. The asset is public:

```bash
# The exact URL that threw "Failed to fetch" in the browser.
# No cookies. No referer. No user-agent. 200, 579,481 bytes of video/mp4.
curl -o ref.mp4 "https://scontent.frtm1-1.fna.fbcdn.net/o1/v/t2/f2/m412/AQOG….mp4?…"
```

Verified too: the CDN sets `access-control-allow-origin` for `https://www.facebook.com` and answers
the CORS preflight. **CORS was never the problem either.** Fetching from inside the page adds the
page's CSP, the automation tool's asset bundler, and the browser sandbox's egress to the list of
things that must all work — and buys nothing, because the URL carries its own signature.

## The host swap, and the one thing you must not touch

When a URL's own host will not answer, point the request at Meta's global CDN host instead:

| Minted host                    | Swap to                 |
| ------------------------------ | ----------------------- |
| `video.<pop>.fna.fbcdn.net`    | `video.xx.fbcdn.net`    |
| `scontent.<pop>.fna.fbcdn.net` | `scontent.xx.fbcdn.net` |

**Leave the `_nc_ht` query parameter exactly as it was.** The `oh` signature covers the `_nc_ht`
_parameter_; it does not cover the host you open the connection to. Measured on one URL:

| Variant                                  | Result             |
| ---------------------------------------- | ------------------ |
| as minted                                | 200, 579,481 bytes |
| host → `scontent.xx`, `_nc_ht` untouched | 200, 579,481 bytes |
| host → `scontent.xx`, `_nc_ht` rewritten | **403**            |
| host → `scontent.xx`, `_nc_ht` deleted   | **403**            |

"Make the URL self-consistent" is the intuitive move and it is the one that breaks. `ad-library.mjs`
does the swap automatically as a second attempt, so you only need this table when hand-debugging —
`probe` prints it for a single URL:

```bash
~/.juicylucy/bin/adsnode <SKILL_DIR>/scripts/ad-library.mjs probe --url "<fbcdn url>"
```

## Why discovery still needs a browser

The library page returns **403 to any plain HTTP client**, so finding ads genuinely needs one.
But do not scrape the grid: the `<video>` elements only ever mount the **SD preview**. The HD file,
the ad copy, the CTA, the landing URL and the run dates all live in the GraphQL payload the page
fetches for itself. `discover` reads that payload instead, and gets a far better record for it.

Per ad you get: `ad_archive_id`, `permalink`, `page_name`, `title`, `body`, `caption`, `cta_text`,
`link_url`, `display_format`, `start_date` / `end_date`, `is_active`, `publisher_platform`, and
every video (HD + SD + poster), image, and carousel card.

That copy block is not a bonus — it is Step 2's input. Reading the reference's own headline and CTA
off the payload beats transcribing them off a video frame, and it is what
`reference-iteration.md` § Decompose the reference first asks you to fill in.

## When you have a browser tool but not a browser module

`discover` drives `puppeteer` or `playwright` if either resolves from the project. If neither does —
you are on browser-use, a Playwright MCP, or anything else that owns its own browser — **use your
tool for discovery only**, capture the payload, and hand it over:

1. Open the library URL in your browser tool.
2. Capture the response body of any request to `https://www.facebook.com/api/graphql/` that contains
   `ad_archive_id`. Save it to a file verbatim. Several files is fine, and so is the text of an
   inline `application/json` script tag from the first render.
3. Then:

```bash
~/.juicylucy/bin/adsnode <SKILL_DIR>/scripts/ad-library.mjs discover --from-json captured.json --out AD_REFERENCES.json
~/.juicylucy/bin/adsnode <SKILL_DIR>/scripts/ad-library.mjs download --from AD_REFERENCES.json --out-dir .media/references
```

The parser deep-walks for any object carrying both `ad_archive_id` and `snapshot`, so it does not
care how the payload is nested or whether Meta reshaped the query this week. **The download half
never needs a browser at all** — that is the half that was broken, and it is now the half with no
moving parts.

## Traps

**The same creative appears many times.** The library lists one creative once per _ad instance_, so
"six references from one page" is routinely two files repeated. `download` content-hashes every file
and prints `IDENTICAL to …` plus a summary count; the manifest carries `content_hash` and
`duplicate_of`. This matters concretely: `reference-iteration.md` § Calibrating a blueprint will only
promote a value that **three independent winners** agree on, and three copies of one ad is a sample
of one wearing a disguise.

**URLs expire.** The `oe` parameter is a hex unix timestamp — observed windows run from ~5 hours to
~4.4 days. `download` checks it before spending a request and tells you to re-run `discover` rather
than reporting a mystery 403. Discover and download in the same session and it never comes up.

**A 200 is not a video.** An expired or rejected request can still return a small HTML body.
`download` checks the `ftyp` / JPEG magic bytes and refuses to write anything that is not the media
it asked for.

**One page is one advertiser's ads, not "winning ads".** The library shows what is _running_, with
no performance data. Longevity is the only signal available — an ad still active with an old
`start_date` has survived, which is weak evidence but the only evidence there is. Never call a
reference a winner because it was in the library.

## What you may do with what you download

`reference-iteration.md` § Build it as your own governs, and downloading changes nothing about it.
The **visuals** are for measurement and decomposition — hook shape, argument order, pacing, beat
dwell, overlay geometry, the ending classification. Reproduce the _structure_; generate your own
creative. Do not reproduce a specific person, a recognisable set, a trademarked look, or a
competitor's brand assets, and do not ship a competitor's footage.

**The soundtrack is the deliberate exception**, so do not read the paragraph above as "nothing from
the reference ships". Reusing the reference's own audio track, unmodified, is the _default_ for a
variation — `../SKILL.md` § Audio is not optional and `reference-iteration.md` § Reuse the
reference's soundtrack. That is the main reason a reference has to be a real downloaded file rather
than a set of measurements, and it is why `--video-only` is about skipping still images, never about
dropping audio: the track arrives inside the MP4.

So check it arrived. Every video record in the manifest carries an ffprobe `has_audio`; a reference
that came down silent cannot supply a soundtrack, and shipping a silent ad is a defect rather than a
preserved choice. `reference-manifest.mjs verify` flags it for you, as a warning rather than a block
— a silent reference is buildable, but only against an explicit audio decision in the brief.

**Reference media stays out of git.** Keep it in the campaign's own gitignored storage and commit
the measurements, not the files — there is no Git LFS here, so a committed clip is a committed clip
in every clone, forever.

## Command reference

```
discover  --page-id <id> | --url <library-url> | --ad-id <archive-id> | --from-json <file>
          [--out refs.json] [--scrolls N] [--limit N] [--active-only] [--video-only] [--country XX]
download  --from refs.json [--out-dir .media/references] [--video-only] [--force]
          [--manifest <path>]
fetch     discover + download in one pass; takes both sets of flags
probe     --url <fbcdn-url>   diagnose one asset URL without downloading it
```

Downloads append a `kind: "reference"` record per file to `<out-dir>/manifest.jsonl`, in the same
shape `generation.md` § Freezing and provenance defines, carrying the ad's copy fields, the
`permalink` back to the library, the host it actually downloaded from, and an ffprobe reading of
duration and canvas when ffprobe is on `PATH`.
