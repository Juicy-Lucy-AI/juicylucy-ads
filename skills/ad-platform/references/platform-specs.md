# Platform specs and safe zones

Read when deriving `aspect` from `placement` and again at the QA pass, in either
medium. **Medium scope:** the aspect/canvas table, safe zones, and file caps
apply to statics and video alike; the duration, codec/bitrate, and audio
sections below are video-only.

> **Last verified: 2026-08-17** against Meta's and TikTok's current ad guidance. Re-verify before a
> new campaign quarter — placement specs change, and a stale safe-zone number silently puts the CTA
> under the platform's own UI. Sources are listed at the bottom; the two that matter (the 9:16
> keep-outs) are corroborated by two independent sources each.

## Aspect by placement

| Platform | Placement     | Aspect | Canvas      | Supported duration         | Ship at |
| -------- | ------------- | ------ | ----------- | -------------------------- | ------- |
| Meta     | Reels (FB+IG) | 9:16   | 1080 x 1920 | 4s floor, minutes-long cap | 6–15s   |
| Meta     | Stories       | 9:16   | 1080 x 1920 | 1s – 2 min                 | 6–15s   |
| Meta     | Feed          | 4:5    | 1080 x 1350 | 1s – 241 min               | 6–15s   |
| Meta     | Feed (square) | 1:1    | 1080 x 1080 | 1s – 241 min               | 6–15s   |
| TikTok   | In-feed       | 9:16   | 1080 x 1920 | 1s – 10 min                | 6–15s   |

**The caps are not the constraint; the floor and the feed are.** Every cap above is orders of
magnitude beyond anything this skill produces, and published cap values disagree with each other
(Reels ads are variously documented as 15s, 90s, 15 min, and "no maximum"). Do not plan against a
cap. The two numbers that bind:

- **4s is the Reels floor.** A 3s cut is rejected at upload, not merely truncated.
- **Stories shows ~15s per card.** Anything longer is split across cards and the tail hold — the
  frame the whole blueprint is built to land — ends up on a card most viewers never reach.

Set the canvas once in the composition. Never deliver a 9:16 by letterboxing a 16:9 — the platform
crops or pads it again and the result is unpredictable.

**Deliver exact canvas dimensions.** One of our own reference creatives ships at 1080 x 1934, which
is not 9:16; the platform rescales it, which softens every glyph edge and shifts the safe-zone
percentages the overlay was placed against. Check the rendered file's dimensions at Step 5, not the
composition's declared canvas.

## Safe zones

The keep-outs are where the platform draws its own UI (profile name, caption, CTA button, sound
attribution, progress bar). Text inside a keep-out is text the viewer does not see.

| Placement                  | Top keep-out | Bottom keep-out | Side keep-out    | Safe band (of height) |
| -------------------------- | ------------ | --------------- | ---------------- | --------------------- |
| Meta Reels **and** Stories | 270px (14%)  | 670px (35%)     | 65px (6%) each   | 14% – 65%             |
| TikTok In-feed             | 130px (7%)   | 484px (25%)     | 44px L / 140px R | 7% – 75%              |
| Meta Feed 4:5              | 250px        | 250px           | 100px each       | advisory only         |
| Meta Feed 1:1              | 100px        | 100px           | 100px each       | advisory only         |

All pixel values are for the canvas in the table above (9:16 rows: 1080 x 1920).

Three things about this table are easy to get wrong:

1. **Meta unified Stories and Reels in March 2026.** They used to differ, and older guidance (this
   file included, before 2026-08-17) told you to check the row rather than the aspect. That is no
   longer true for Meta: one 9:16 safe zone now covers Facebook Stories, Facebook Reels, Instagram
   Stories, and Instagram Reels, built around the tightest of the four. Design to Reels and all four
   are safe. The rule still holds **across platforms** — Meta's 9:16 and TikTok's 9:16 are not the
   same keep-out.
2. **TikTok's right keep-out is the asymmetric one.** 140px on the right for the like/comment/share
   stack against 44px on the left. A centred text column is unaffected; a right-aligned badge or
   logo bug is not. TikTok also states plainly that its safe zone varies with caption length and ad
   format, so treat 484px as a floor rather than an exact figure.
3. **The Feed rows are not platform UI.** In feed the platform's chrome sits outside the media
   rectangle, so nothing is covered. Those margins are design padding — they stop text from reading
   as though it is falling off the card. Never cite a feed "keep-out" as a defect the way you would
   a Reels one.

The intersection, if you need one creative safe everywhere: **top 14%, bottom 35%, sides 6%** —
Meta's 9:16 zone is tighter than TikTok's on every edge except TikTok's right.

The **background footage deliberately runs through the keep-outs** — it is full-bleed and being
partially covered is fine. Only layer 3 (message) and layer 4 (furniture) are constrained.

### What this costs you in the 9:16 frame

The safe band is 14%–65% of frame height, which is **not symmetric about the centre**: 36% of the
frame above the midpoint, 15% below it. A vertically-centred text block can therefore only grow
15% of frame height downward before it crosses into the bottom keep-out — 30% of frame height in
total, whatever headroom is left above.

At the measured house line pitch (~3.5% of frame height per line — see the blueprint), that is a
hard ceiling of **9 lines** for a centred block, and our longest reference sits at exactly 9 lines
with its last glyph row at 65.05%: over the line by 15px. Nine lines is the ceiling, not the target.

## Delivery

| Property      | Value                                                                |
| ------------- | -------------------------------------------------------------------- |
| Container     | MP4                                                                  |
| Video codec   | H.264, square pixels, progressive scan                               |
| Audio codec   | AAC stereo, 128 kbps or better, 44.1 or 48 kHz                       |
| Frame rate    | 30 fps, fixed — variable frame rate is rejected by some upload paths |
| Max file size | 4 GB on Meta, **500 MB on TikTok** — TikTok is the binding one       |
| Bitrate       | 6–10 Mbps at 1080 x 1920 (what our references ship at)               |

`H.265 / HEVC` uploads and transcodes on both platforms, and two of our three references use it, but
H.264 is what both platforms document. Encode H.264 unless something forces otherwise.

**Every ad ships with a real audio stream**, and a file with no audio stream is rejected or silently
transcoded by some upload paths anyway. A muxed silent AAC track is a container fix, not a
soundtrack — it satisfies the encoder and fails the ad. Where the audio comes from is decided in
`../SKILL.md` § Audio is not optional; the default is the reference creative's own track.

## The sound-off assumption

Autoplay is muted. This is a design constraint **on the overlay**, not on delivery: the text carries
the entire argument because most viewers never unmute. Verify it at Step 5 by watching each variant
through once with sound off — the QA gate exists because it is easy to approve an ad you have only
ever watched with your own audio on.

**Sound-off does not mean silent, and it never licenses a silent delivery.** All three reference
creatives carry a full-duration music bed and no voiceover, which is the house default: argument in
the text, music as texture, audio present from frame 0 to the final frame. The viewers who do unmute
are disproportionately the ones already interested, and shipping them silence is the single thing
the sound-off rule is most often misread as permitting. The second Step 5 watch — with sound **on**
— is what catches it.

## Sources

Meta's own ads-guide and Business Help Centre pages are JavaScript-rendered and cannot be fetched
directly, so the numbers above come from secondary sources that quote them, cross-checked so no
value rests on one source:

- 9:16 keep-outs (270 / 670 / 65 px) and the March 2026 unification — corroborated by
  [AdNabu](https://blog.adnabu.com/meta-ads/meta-safe-zones/) and
  [Lucid Media](https://www.lucidmedia.co.nz/blog/instagram-facebook-ad-safe-zones-2026/),
  agreeing to the pixel.
- Meta per-placement specs, codecs and file size —
  [AdSights](https://www.adsights.ai/resources/guides/meta-ad-creative-video-specs-guide),
  [QuickFrame](https://quickframe.com/blog/facebook-video-ad-specs),
  [Hootsuite](https://blog.hootsuite.com/facebook-ad-sizes/).
- TikTok technical specs (500 MB, ≥516 kbps, formats, resolutions) — TikTok's own
  [ad specifications article](https://ads.tiktok.com/help/article?aid=10002742), which is fetchable.
- TikTok safe zone (130 / 484 / 140 / 44 px) —
  [EzUGC](https://www.ezugc.ai/blog/tiktok-safe-zones-guide) and
  [Recharm](https://www.recharm.com/blog/tiktok-video-ad-specs); TikTok publishes downloadable
  safe-zone templates in its Business Help Centre rather than a pixel table, and states the zone
  varies by caption length and format.
