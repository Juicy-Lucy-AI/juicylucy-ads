# The defect gate

Before telling the user a build is finished, prove it has no known defects. `~/.juicylucy/bin/hyperframes check`
is the sensor; this file is how you read it and what to do about the ad-specific failures it cannot
see on its own.

## When to run

As the final step of every build or substantive edit, after your last write and before your closing
reply — then **again after every fix**, until the gate is clear or you hit the cap.

```bash
~/.juicylucy/bin/hyperframes lint
~/.juicylucy/bin/hyperframes check
~/.juicylucy/bin/hyperframes snapshot --at <first frame, each beat swap, the outro start, the final frame>
```

## The three outcomes

| Outcome      | Meaning                                            | What to do                                                                                                             |
| ------------ | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **clear**    | The check ran and found nothing.                   | Nothing.                                                                                                               |
| **detected** | The check ran and found a fixable defect.          | Fix it, then re-run the gate.                                                                                          |
| **unknown**  | The check could not run (missing key, tool threw). | **Never retry it as a defect and never let it block finishing.** Note it as a remaining unknown in your closing reply. |

The build is done when nothing is `detected` — `clear` and `unknown` both let you finish.

## The loop is capped

1. Run the gate.
2. Nothing detected → finish, mentioning any unknowns as caveats.
3. Something detected → fix, then **re-run**.
4. **Cap at 2 fix-and-recheck rounds for the whole gate** — counted across all defect types
   together, not per defect. After the cap, stop fixing, finish the build, and report the remaining
   defects as known issues. Do not loop indefinitely.

## Ad-specific defects and their fixes

`~/.juicylucy/bin/hyperframes check` covers runtime errors, layout, and WCAG contrast. These are the ad failures it
does not name, and they are the ones that actually get creatives rejected or wasted.

| Defect                           | How it shows                                                                                                                                                                                            | Fix                                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **unreadable-text**              | Text illegible in the rendered video — insufficient contrast, occlusion by busy footage, too small, or clipped out of frame.                                                                            | Match the fix to the reason: contrast → add or strengthen the caption background plate; too small → raise the size; occlusion → reposition onto a calmer area or add a plate; clipped → move inside the safe area. If it merely flashes past, slow it. **Prefer a background plate over a stroke** — a semi-transparent block behind the text is the readable choice on generated footage, whose luminance varies per seed. |
| **outro-integrity**              | An outro was placed but incorrectly: not last, not full-canvas, not a still, or **playing over silence** because the soundtrack stops before it does.                                                   | Read `outro.md`. Fix silence by pulling the outro _inside_ the music — retime the last content clip to end earlier and move the outro back — not by extending the audio. A reused reference soundtrack runs out when the source ad does.                                                                                                                                                                                    |
| **duplicate ending**             | A recreated end-card sits immediately before the canonical outro.                                                                                                                                       | Remove the recreated end-card. `outro.md` § One ending only.                                                                                                                                                                                                                                                                                                                                                                |
| **screenshot-artifact**          | Baked-in device or app chrome in the generated visual — phone status bar, social-app buttons, REC dot.                                                                                                  | Regenerate with an explicit ban on device UI, status bars, and capture overlays.                                                                                                                                                                                                                                                                                                                                            |
| **placeholder-in-footage**       | A blank plate, empty banner, sign, sticker outline, or on-image text baked into a generated frame or clip — most often a reference's caption block that an edit emptied instead of removing — presented as the place the copy will go.                            | The copy and its plate are composition layers, never footage. Regenerate the frame with the plate ban in the prompt — on a variation, re-edit the reference's own frame with an instruction that removes the overlay and rebuilds what is behind it — then re-run motion from the clean frame. Nothing downstream fixes it: a baked plate is sized to no copy row and survives every variant. `generation.md` § The footage carries no text and no place for text.                                                          |
| **wrong-orientation**            | The generated visual is sideways or shaped for the opposite framing.                                                                                                                                    | Regenerate for the correct framing; do not crop your way out of it.                                                                                                                                                                                                                                                                                                                                                         |
| **asset-generation-failed**      | An asset failed to resolve and would render as a blank clip.                                                                                                                                            | Regenerate it, or remove it and its clip if it isn't needed.                                                                                                                                                                                                                                                                                                                                                                |
| **frame-0 blank**                | The hook animates in, so the feed thumbnail is empty.                                                                                                                                                   | The hook must be at full opacity, final position, final size on frame 0. Blueprint § Failure modes.                                                                                                                                                                                                                                                                                                                         |
| **silent tail**                  | The ad outlasts its soundtrack; the last seconds are dead air.                                                                                                                                          | Shorten the ad. Frames past the audio source's end render silent whatever duration is set.                                                                                                                                                                                                                                                                                                                                  |
| **missing or substituted audio** | No audio stream at all, a muxed silent track standing in for a soundtrack, or a soundtrack that is not the reference's — a generated bed swapped in, a re-cut of the song, or a TTS voice laid over it. | Restore the reference's own audio, unmodified, spanning frame 0 to the final frame including any outro. Only an explicit user instruction changes an ad's soundtrack; "localise it" is not one, and nothing makes an ad silent. `reference-iteration.md` § Reuse the reference's soundtrack.                                                                                                                                |
| **not rendered by HyperFrames**  | A delivered mp4 with no composition behind it — assembled by an ffmpeg pipeline, a shell script, or any tool that is not the renderer. Tell-tales: no `hyperframes.json`, an `index.html` still holding its `init` scaffold (the placeholder clip reading `Title`), a `render-*.sh` in the campaign, or renders whose names are not the export convention. | There is nothing to fix in the file — it is outside the process, so no gate above has inspected it and no seed, copy row, or blueprint is joined to it. Delete it, and either compose properly or **stop and report the blocker** (`../SKILL.md` § Never leave the framework). This defect is invisible to `lint` and `check`, which is precisely why it is listed: those tools report on a composition, and here there is none. |
| **arc dropped**                  | On a variation: the reference's emotional arc is not in the variant — it opens on the wrong state, skips the turn, or holds one state where `REFERENCE.md` § Ad craft recorded three. The frames can match the reference exactly and this still be true. | Re-read `REFERENCE.md` § Timeline and rebuild the missing beats — for generated footage that means prompting the transition (`blueprints/clapping-reaction.md` § The six rules it encodes: a start state, a change, an end state), not re-rolling and hoping. A reference recorded as a single sustained state has no arc to drop; check what was written before assuming a defect. |
| **reference drift**              | On a variation: more than two of the seven visual attributes moved — subject, wardrobe, setting, role read, framing, palette, props. Or the opposite, a frame that reproduces the reference's performer or set. | Put the variant's first frame beside the reference's and ask "same ad, different detail?". Drifted → re-derive the frame by editing the reference's own frame and change only the attributes the brief named. Too close → change one attribute more, never fewer. `reference-iteration.md` § How close is close enough. Applies only when `AD_BRIEF.md` names a reference. |
| **safe-zone collision**          | Text sits under the platform's own UI.                                                                                                                                                                  | Reposition per the `ad-platform` skill's `platform-specs.md`, checking the **placement** row, not just the aspect.                                                                                                                                                                                                                                                                                                                                    |

## The manual pass the tools cannot do

Four checks need your eyes, per variant — five when there is a reference — and they are the ones
that matter most:

0. **Side by side with the reference.** Two passes, because they catch different things.

   *Surface* — first frame against first frame. Name what differs. Past two of the seven
   visual attributes and the variant drifted; nothing at all and it is a copy. Both are defects.

   *Arc* — frame strip against frame strip, at the same sample rate. Walk `REFERENCE.md`
   § Timeline and find each of its beats in the variant, at roughly the same point. A
   variant that opens content where the reference opened frustrated has dropped the
   argument, and no single-frame comparison will show it — the two stills can match
   perfectly while the ads say different things. Reference-driven variants only.
1. **Frame 0 at thumbnail scale** — is the hook legible, with no clipped words?
2. **One watch with sound off** — does the argument land without audio? Autoplay is muted; this is
   the real viewing condition, and it is easy to approve an ad you have only ever watched with your
   own audio on.
3. **One watch with sound on** — is there audio at all; is it the reference's track, unmodified; does
   it run from frame 0 to the final frame; is there no synthetic voice on top of it? Sound-off is the
   **reading** condition, never the **delivery** format — no ad ships silent (`../SKILL.md` § Audio
   is not optional). `~/.juicylucy/bin/ffmpeg -i out.mp4 -af volumedetect -f null -` catches a track that is present
   but silent, which is the version of this defect no gate above will see.
4. **The final frame alone** — offer, CTA, and brand all present and static.

## Before you finish

- [ ] Every delivered file came out of `~/.juicylucy/bin/hyperframes render` — no file assembled another way
- [ ] `lint` and `check` both ran and nothing is `detected`
- [ ] Snapshots inspected at frame 0, each beat swap, and the final frame
- [ ] The four manual checks done per variant — five with a reference, the side-by-side included
- [ ] On a variation: the changed visual attributes are the ones `AD_BRIEF.md` named, and there are
      no more than two of them
- [ ] On a variation: every beat in `REFERENCE.md` § Timeline appears in the variant, or the
      reference was recorded as a single sustained state
- [ ] The ad carries audio end to end — the reference's soundtrack unmodified, or the replacement the
      user explicitly asked for — and the rendered file's audio stream is present and not silence
- [ ] Every claim traced to `AD_BRIEF.md` § claims (or, for user-supplied copy, the risk named in
      the closing reply — `ad-copy.md` § When this gate blocks a line, and when it only reports one)
- [ ] `.media/manifest.jsonl` records model, prompt, and seed for every generated asset
- [ ] The export naming record is `complete: true`
- [ ] Any `unknown` checks named as caveats in the closing reply
