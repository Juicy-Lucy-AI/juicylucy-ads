#!/usr/bin/env node
// speech-cuts — the instrument behind `ugc-testimonial`'s edit. It never renders anything:
// it reads speaking clips and tells the composition where to cut, the way a human UGC editor
// cuts — on the word, with the dead air between sentences taken out.
//
//   node speech-cuts.mjs frame <clip.mp4> <out.png>
//       The hold frame for chaining: the frame just after the clip's last spoken word, where the
//       prompt asked for a closed-mouth smile. The next shot starts from it. Prints JSON; warns
//       (exit 3) when speech runs to the end of the clip, because then there is no clean frame.
//
//   node speech-cuts.mjs anchor <casting-shot.mp4> <out.wav>
//       A voice anchor: the casting shot's speech, from 0.15 s before the first word to 0.3 s after
//       the last, at least 5.2 s, as mono 44.1 kHz wav — the format a reference-audio input takes
//       (juicy uploads wav or mp3, not m4a). Prints JSON.
//
//   node speech-cuts.mjs plan --project <dir> --out <cuts.json> [--pace jumpcut|natural] [--outro <s>] [--lines <lines.json>] <clip.mp4>...
//       The edit plan for shots in timeline order: for each clip, the ranges to keep (speech, padded,
//       pauses over the pace's GAP removed) placed edge to edge on the timeline, plus a demuxed audio file per
//       clip under .media/audio/ for the <audio> ranges. With --lines (a JSON array: the verbatim
//       line each clip speaks, in the same order), it also times phrase captions to the kept speech.
//       With --outro, the last shot runs on into its closed-mouth hold for that long, so the brand's
//       end card sits over the shot's own sound inside the ad's length (references/outro.md: the
//       outro is never additive and never silent). Exit 3 when the clip ends before the card does.
//
// Why audio energy and not a transcript: a transcriber's word times were too loose to cut on in
// the 2026-10-07 bake-off, and the spoken words are already known — every model spoke its line
// verbatim. Why a threshold per clip: a car's room tone sits between -38 and -32 dB, so a fixed
// threshold finds no pauses in it. Thresholds came from re-cutting three bake-off chains (26–33%
// shorter, longest pause 0.33 s, no word lost); docs/long-form-ugc in the plugin repository.
//
// Dependency-free by design: node + ffmpeg/ffprobe, like the other scripts here.

import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { basename, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Cut tuning. PRE/POST: kept before the first and after the last speech of a clip. GAP: a pause
 *  longer than this inside a clip is cut out, keeping PAD either side. MIN_SPEECH: shorter energy
 *  bursts are noise — but a clipped "but" is ~70 ms, so this stays small. */
export const TUNING = { PRE: 0.05, POST: 0.12, GAP: 0.45, PAD: 0.12, MIN_SPEECH: 0.04, HOLD: 0.35, MARGIN_DB: 15 };

/** The two edits a creator video is cut in (blueprints/ugc-testimonial.md § Choosing the pace).
 *  jumpcut — the fast-paced creator edit: every real pause cut, the speech runs on. Judged
 *    "snappier… human-editor like" in the 2026-10-08 re-cut, and "maybe slightly too frequent" at
 *    a 0.3 s gap, so the gap here is 0.45 s.
 *  natural — the take as it was spoken: only pauses over a second shortened, the rhythm kept. The
 *    judge liked the uncut chains "for what they are" except a 1.5–2 s pause. */
export const PACES = {
  jumpcut: TUNING,
  natural: { ...TUNING, PRE: 0.15, POST: 0.3, GAP: 1.0, PAD: 0.3 },
};

/** The silence threshold for one clip: MARGIN_DB under its loud speech, clamped to [-45, -28]. */
export function thresholdFromRms(rmsLevels, marginDb = TUNING.MARGIN_DB) {
  const v = rmsLevels.filter(Number.isFinite).sort((a, b) => a - b);
  const p90 = v.length ? v[Math.floor(v.length * 0.9)] : -20;
  return Math.max(-45, Math.min(-28, p90 - marginDb));
}

/** Speech spans: the complement of the silences, dropping bursts shorter than minSpeech. */
export function speechSpans(silences, duration, minSpeech = TUNING.MIN_SPEECH) {
  const spans = [];
  let t = 0;
  for (const [a, b] of [...silences].sort((x, y) => x[0] - y[0])) {
    if (a > t) spans.push([t, a]);
    t = Math.max(t, b);
  }
  if (t < duration) spans.push([t, duration]);
  return spans.filter(([a, b]) => b - a >= minSpeech);
}

/** The ranges of one clip to keep: pauses under GAP merged, the rest cut, everything padded. */
export function keepPieces(spans, duration, tuning = TUNING) {
  if (!spans.length) return [[0, duration]];
  const merged = [];
  for (const [a, b] of spans) {
    const last = merged[merged.length - 1];
    if (last && a - last[1] < tuning.GAP) last[1] = b;
    else merged.push([a, b]);
  }
  return merged.map(([a, b], i) => [
    round(Math.max(0, a - (i === 0 ? tuning.PRE : tuning.PAD))),
    round(Math.min(duration, b + (i === merged.length - 1 ? tuning.POST : tuning.PAD))),
  ]);
}

/** Pieces of each clip placed edge to edge on the timeline, in clip order. Consecutive pieces
 *  alternate between two audio tracks: edge-to-edge ranges on one track read as an overlap to
 *  `hyperframes lint` (duplicate_audio_track) once their times are rounded. */
export function layout(clipPieces) {
  let start = 0;
  let n = 0;
  return clipPieces.map((pieces) =>
    pieces.map(([a, b]) => {
      const piece = { mediaStart: a, duration: round(b - a), start: round(start), audioTrack: n++ % 2 };
      start += b - a;
      return piece;
    }),
  );
}

/** Split a spoken line into caption phrases at punctuation, keeping each phrase readable. */
export function phrases(line, maxWords = 6) {
  const out = [];
  for (const part of line.match(/[^,.;:!?—]+[,.;:!?—]*/g) ?? []) {
    const words = part.trim().split(/\s+/).filter(Boolean);
    // Balanced chunks, so a long phrase never leaves one orphan word on its own caption.
    const size = Math.ceil(words.length / Math.ceil(words.length / maxWords));
    for (let i = 0; i < words.length; i += size) out.push(words.slice(i, i + size).join(" "));
  }
  return out.filter(Boolean);
}

/** Time a clip's phrases across its placed pieces, in proportion to their letters. */
export function allocateCaptions(line, placed) {
  const ps = phrases(line);
  const speech = placed.reduce((a, p) => a + p.duration, 0);
  const weight = (s) => s.replace(/[^\p{L}\p{N}]/gu, "").length || 1;
  const total = ps.reduce((a, p) => a + weight(p), 0);
  // Map "speech seconds into this clip" to timeline time across the pieces.
  const at = (s) => {
    let left = s;
    for (const p of placed) {
      if (left <= p.duration) return p.start + left;
      left -= p.duration;
    }
    const last = placed[placed.length - 1];
    return last.start + last.duration;
  };
  let acc = 0;
  return ps.map((text) => {
    const from = at((acc / total) * speech);
    acc += weight(text);
    return { text, start: round(from), end: round(at((acc / total) * speech)) };
  });
}

/** A number as ffmpeg prints it, exponent included: "2.08333e-05" is 0.0000208, not 2.08333. */
const NUM = String.raw`-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?`;

/** Silence intervals from silencedetect's log. A silence still open at the end runs to duration. */
export function parseSilences(log, duration) {
  const silences = [];
  let open = null;
  for (const line of log.split("\n")) {
    const s = new RegExp(`silence_start: (${NUM})`).exec(line);
    const e = new RegExp(`silence_end: (${NUM})`).exec(line);
    if (s) open = Number(s[1]);
    if (e && open !== null) {
      silences.push([open, Number(e[1])]);
      open = null;
    }
  }
  if (open !== null) silences.push([open, duration]);
  return silences;
}

/** Per-frame RMS levels from astats' log; "-inf" (digital silence) is dropped. */
export function parseRms(log) {
  return [...log.matchAll(new RegExp(`RMS_level=(${NUM}|-inf)`, "g"))].map((m) => Number(m[1])).filter(Number.isFinite);
}

/** Let the last placed piece run on into its clip's hold for the end card: the card is placed over
 *  [start, end] inside the ad, on the shot's own sound. Returns what was available. */
export function extendForOutro(placed, clipDuration, fps, seconds) {
  const lastClip = placed[placed.length - 1];
  const last = lastClip[lastClip.length - 1];
  const contentEnd = last.start + last.duration;
  const room = Math.max(0, clipDuration - 1 / fps - (last.mediaStart + last.duration));
  const add = Math.min(seconds, room);
  last.duration = round(last.duration + add);
  return { start: round(contentEnd), end: round(contentEnd + add), seconds: round(add), short: add + 1e-6 < seconds };
}

function round(x) {
  return Math.round(x * 1000) / 1000;
}

// ---------- ffmpeg instruments ----------

function probe(file) {
  const out = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=codec_type,codec_name,r_frame_rate", "-of", "json", file], { encoding: "utf8" });
  const j = JSON.parse(out);
  const v = j.streams.find((s) => s.codec_type === "video");
  const a = j.streams.find((s) => s.codec_type === "audio");
  const [n, d] = (v?.r_frame_rate ?? "24/1").split("/").map(Number);
  return { duration: Number(j.format.duration), fps: n / d, audioCodec: a?.codec_name ?? null };
}

function analyse(file) {
  const { duration, fps, audioCodec } = probe(file);
  if (!audioCodec) throw new Error(`${file} has no audio stream: a speaking clip must carry its speech`);
  const rms = parseRms(runInfo(["-i", file, "-af", "astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level"]));
  const threshold = thresholdFromRms(rms);
  const silences = parseSilences(runInfo(["-i", file, "-af", `silencedetect=noise=${threshold.toFixed(1)}dB:d=0.1`]), duration);
  return { duration, fps, audioCodec, threshold, spans: speechSpans(silences, duration) };
}

/** ffmpeg writes filter reports to stderr, which execFileSync drops on success. */
function runInfo(args) {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-v", "info", ...args, "-f", "null", "-"], { encoding: "utf8", maxBuffer: 1 << 26 });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${String(r.stderr).trim().split("\n").pop()}`);
  return String(r.stderr);
}

// ---------- commands ----------

function frame(clip, out) {
  // A shot with no speech (or no audio track at all) has no word to hold after: take the frame
  // just before the end, which is where a chained non-speaking shot continues from.
  const p = probe(clip);
  const a = p.audioCodec ? analyse(clip) : { ...p, spans: [] };
  const latest = a.duration - 2 / a.fps;
  const speaks = a.spans.length > 0;
  const last = speaks ? a.spans[a.spans.length - 1][1] : latest;
  const ranToEnd = speaks && last + TUNING.HOLD > latest;
  const t = Math.max(0, speaks ? Math.min(last + TUNING.HOLD, latest) : latest);
  mkdirSync(resolve(out, ".."), { recursive: true });
  execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", t.toFixed(3), "-i", clip, "-frames:v", "1", out]);
  const result = { clip, frame: out, at: round(t), lastSpeechEnd: speaks ? round(last) : null, ranToEnd };
  console.log(JSON.stringify(result, null, 2));
  if (ranToEnd) {
    console.error(
      "speech runs to the end of the clip, so there is no clean hold frame: regenerate this shot with fewer words or a longer --duration rather than chaining from a mid-word frame",
    );
    process.exitCode = 3;
  }
}

function anchor(clip, out) {
  const a = analyse(clip);
  if (!a.spans.length) throw new Error(`${clip} has no detectable speech to take a voice anchor from`);
  const start = Math.max(0, a.spans[0][0] - 0.15);
  let end = Math.min(a.duration, a.spans[a.spans.length - 1][1] + 0.3);
  if (end - start < 5.2) end = Math.min(a.duration, start + 5.2);
  mkdirSync(resolve(out, ".."), { recursive: true });
  execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", start.toFixed(3), "-to", end.toFixed(3), "-i", clip, "-vn", "-ac", "1", "-ar", "44100", out]);
  const result = { clip, anchor: out, from: round(start), to: round(end), seconds: round(end - start) };
  console.log(JSON.stringify(result, null, 2));
  if (end - start < 5) {
    console.error("under 5 s of audio: some reference-audio inputs need 5 s or more — regenerate the casting shot with a longer line");
    process.exitCode = 3;
  }
}

function plan(argv) {
  const opt = { project: ".", out: "cuts.json", lines: null, pace: "jumpcut", outro: 0 };
  const clips = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--project") opt.project = argv[++i];
    else if (argv[i] === "--out") opt.out = argv[++i];
    else if (argv[i] === "--lines") opt.lines = argv[++i];
    else if (argv[i] === "--pace") opt.pace = argv[++i];
    else if (argv[i] === "--outro") opt.outro = Number(argv[++i]);
    else clips.push(argv[i]);
  }
  if (!clips.length) usage();
  const tuning = PACES[opt.pace];
  if (!tuning) throw new Error(`--pace must be one of ${Object.keys(PACES).join(", ")}`);
  if (!(opt.outro >= 0)) throw new Error("--outro takes the end card's length in seconds");
  const lines = opt.lines ? JSON.parse(readFileSync(opt.lines, "utf8")) : null;
  if (lines && lines.length !== clips.length) {
    throw new Error(`--lines has ${lines.length} lines for ${clips.length} clips; give one verbatim line per clip, in order`);
  }
  const root = resolve(opt.project);
  const audioDir = join(root, ".media", "audio");
  mkdirSync(audioDir, { recursive: true });
  const analysed = clips.map((c) => ({ clip: c, ...analyse(c) }));
  const placed = layout(analysed.map((a) => keepPieces(a.spans, a.duration, tuning)));
  const out = { pace: opt.pace, duration: 0, maxPause: 0, clips: [], captions: [] };
  const names = analysed.map((a) => basename(a.clip, extname(a.clip)));
  analysed.forEach((a, i) => {
    const name = names.filter((n) => n === names[i]).length > 1 ? `${names[i]}-${i + 1}` : names[i];
    const audio = join(audioDir, `${name}-speech.m4a`);
    const codec = a.audioCodec === "aac" ? ["-c:a", "copy"] : ["-c:a", "aac", "-b:a", "192k"];
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", a.clip, "-vn", ...codec, audio]);
    out.clips.push({
      src: relative(root, resolve(a.clip)),
      audio: relative(root, audio),
      threshold_db: Math.round(a.threshold * 10) / 10,
      pieces: placed[i],
    });
    if (lines) out.captions.push(...allocateCaptions(lines[i], placed[i]));
  });
  // Captions are timed above, before the last piece runs on under the end card.
  if (opt.outro > 0) {
    const lastClip = analysed[analysed.length - 1];
    out.outro = extendForOutro(placed, lastClip.duration, lastClip.fps, opt.outro);
  }
  const all = placed.flat();
  const last = all[all.length - 1];
  out.duration = round(last.start + last.duration);
  // The longest pause left inside a kept piece, so the gate can read it without listening.
  out.maxPause = round(Math.max(0, ...analysed.flatMap((a, i) => innerPauses(a.spans, placed[i]))));
  writeFileSync(opt.out, JSON.stringify(out, null, 2));
  console.log(JSON.stringify({ out: opt.out, pace: opt.pace, clips: out.clips.length, pieces: all.length, duration: out.duration, maxPause: out.maxPause, outro: out.outro ?? null }));
  if (out.outro?.short) {
    console.error(
      `the last shot has only ${out.outro.seconds} s after its last word, short of the ${opt.outro} s end card: regenerate the last shot with that much more --duration, or shorten the card (1.5 s is the floor, references/outro.md)`,
    );
    process.exitCode = 3;
  }
}

/** Pauses that survive inside the kept pieces (always < GAP by construction, reported for the gate). */
export function innerPauses(spans, placedPieces) {
  const out = [];
  for (const p of placedPieces) {
    const inside = spans.filter(([a, b]) => a >= p.mediaStart - 1e-6 && b <= p.mediaStart + p.duration + 1e-6);
    for (let i = 1; i < inside.length; i++) out.push(inside[i][0] - inside[i - 1][1]);
  }
  return out;
}

function usage() {
  console.error("usage: speech-cuts.mjs frame <clip.mp4> <out.png>\n       speech-cuts.mjs anchor <casting-shot.mp4> <out.wav>\n       speech-cuts.mjs plan --project <dir> --out <cuts.json> [--pace jumpcut|natural] [--outro <s>] [--lines <lines.json>] <clip.mp4>...");
  process.exit(2);
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  const [cmd, ...rest] = process.argv.slice(2);
  try {
    if (cmd === "frame" && rest.length === 2) frame(rest[0], rest[1]);
    else if (cmd === "anchor" && rest.length === 2) anchor(rest[0], rest[1]);
    else if (cmd === "plan") plan(rest);
    else usage();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
