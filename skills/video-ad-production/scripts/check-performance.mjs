#!/usr/bin/env node
// The generation gate for `clapping-reaction`: does this clip actually PERFORM?
//
//   node check-performance.mjs <clip.mp4> [more.mp4 ...]
//   node check-performance.mjs --json <clip.mp4>
//   node check-performance.mjs --face 18,48 --hands 50,85 <clip.mp4>
//
// A reaction ad is bought for the performer's face. The expensive failure is a
// generation that claps on schedule with a held, empty expression — it passes
// every other check in the skill, looks fine in a contact sheet if you are not
// looking for it, and quietly ships an ad with no emotional payoff. One clip in
// the six that calibrated this blueprint failed exactly that way.
//
// Three measurements, none of which need a model:
//
//   faceIndex  mean temporal motion in the face band, divided by the busiest
//              decile of the same clip. It asks "is the face performing as much
//              as the body is", so it is immune to overall clip brightness,
//              contrast and shot scale. Flat faces score far below moving ones:
//              0.19 against 0.48-0.62 on the calibration set.
//   tempo      dominant period of hand-band motion, by autocorrelation. Counting
//              motion peaks double-counts (a clap is an approach AND a retreat);
//              autocorrelation reads the period directly. `r` is how periodic the
//              clip actually is, which is the number that matters — the models
//              agree to clap on a beat far more often than they deliver one.
//   cuts       scene changes. The blueprint is one continuous take; a generated
//              cut is a re-roll, not something to edit around.
//
// Dependency-free by design: node + ffmpeg/ffprobe, like the other scripts here.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";

/** Analysis resolution. Motion is a where-and-when question, not a detail one. */
export const GRID = { w: 60, h: 107 };

/** Band defaults as fractions of frame height, from the calibration set. */
export const DEFAULT_BANDS = { face: [0.2, 0.5], hands: [0.5, 0.85] };

export const THRESHOLDS = {
  /** Below this the face is holding still — re-roll. */
  faceReroll: 0.25,
  /** Between reroll and this, look at the frames yourself before shipping. */
  faceReview: 0.4,
  /** Autocorrelation r below this means there is no beat to cut music to. */
  tempoWeak: 0.35,
};

/**
 * Per-row mean |frame(t) - frame(t-1)| over the whole clip.
 * @param {Uint8Array|Buffer} buf packed 8-bit luma, `frames` frames of w*h
 */
export function rowMotion(buf, frames, { w, h } = GRID) {
  const rows = new Float64Array(h);
  if (frames < 2) return rows;
  for (let f = 1; f < frames; f++) {
    const a = (f - 1) * w * h;
    const b = f * w * h;
    for (let y = 0; y < h; y++) {
      let s = 0;
      for (let x = 0; x < w; x++) s += Math.abs(buf[b + y * w + x] - buf[a + y * w + x]);
      rows[y] += s / w;
    }
  }
  for (let y = 0; y < h; y++) rows[y] /= frames - 1;
  return rows;
}

/** Mean of `rows` over a fractional band, e.g. [0.2, 0.5]. */
export function bandMean(rows, [from, to]) {
  const h = rows.length;
  const y0 = Math.max(0, Math.round(from * h));
  const y1 = Math.min(h, Math.round(to * h));
  if (y1 <= y0) return 0;
  let s = 0;
  for (let y = y0; y < y1; y++) s += rows[y];
  return s / (y1 - y0);
}

/** Motion per decile of frame height — the shape that says where the ad's action is. */
export function deciles(rows) {
  return Array.from({ length: 10 }, (_, d) => bandMean(rows, [d / 10, (d + 1) / 10]));
}

/**
 * Face-band motion relative to the busiest decile of the same clip.
 * Self-normalising, so it compares across clips with different grades and framing.
 */
export function faceIndex(rows, band = DEFAULT_BANDS.face) {
  const peak = Math.max(...deciles(rows));
  return peak === 0 ? 0 : bandMean(rows, band) / peak;
}

/** Frame-to-frame motion inside a band, as a time series. */
export function bandSignal(buf, frames, band, { w, h } = GRID) {
  const y0 = Math.max(0, Math.round(band[0] * h));
  const y1 = Math.min(h, Math.round(band[1] * h));
  const sig = new Float64Array(Math.max(0, frames - 1));
  for (let f = 1; f < frames; f++) {
    const a = (f - 1) * w * h;
    const b = f * w * h;
    let s = 0;
    for (let y = y0; y < y1; y++) {
      for (let x = 0; x < w; x++) s += Math.abs(buf[b + y * w + x] - buf[a + y * w + x]);
    }
    sig[f - 1] = s / (w * Math.max(1, y1 - y0));
  }
  return sig;
}

/**
 * Dominant period of a signal by autocorrelation, searched over 0.25s-1.5s
 * (240-40 BPM). Returns the period in seconds and the correlation at it, which
 * is the confidence — a clip with no steady rhythm still has a best lag, and `r`
 * is the only thing that tells you not to trust it.
 */
export function dominantPeriod(signal, fps, { minLag = 6, maxLag = 36 } = {}) {
  const n = signal.length;
  if (n < maxLag + 2) return { seconds: null, r: 0 };
  const mean = Array.prototype.reduce.call(signal, (a, b) => a + b, 0) / n;
  const c = Array.from(signal, (v) => v - mean);
  let best = { lag: 0, r: -Infinity };
  for (let lag = minLag; lag <= maxLag; lag++) {
    let num = 0;
    let d1 = 0;
    let d2 = 0;
    for (let i = 0; i + lag < n; i++) {
      num += c[i] * c[i + lag];
      d1 += c[i] * c[i];
      d2 += c[i + lag] * c[i + lag];
    }
    const r = d1 === 0 || d2 === 0 ? 0 : num / Math.sqrt(d1 * d2);
    if (r > best.r) best = { lag, r };
  }
  return { seconds: best.lag / fps, r: best.r };
}

/**
 * The verdict. `reroll` means regenerate; `review` means put your eyes on the
 * frames before shipping it; `pass` means the performance is there.
 */
export function verdict({ cuts, faceIndex: face, tempoR }, t = THRESHOLDS) {
  const reasons = [];
  let level = "pass";
  const raise = (next) => {
    const rank = { pass: 0, review: 1, reroll: 2 };
    if (rank[next] > rank[level]) level = next;
  };
  if (cuts > 0) {
    reasons.push(`${cuts} scene change(s) — the blueprint is one continuous take`);
    raise("reroll");
  }
  if (face < t.faceReroll) {
    reasons.push(`face index ${face.toFixed(2)} < ${t.faceReroll} — the face is holding still`);
    raise("reroll");
  } else if (face < t.faceReview) {
    reasons.push(`face index ${face.toFixed(2)} < ${t.faceReview} — thin expression arc`);
    raise("review");
  }
  if (tempoR < t.tempoWeak) {
    reasons.push(`tempo r=${tempoR.toFixed(2)} — no steady beat; do not cut music to this clip`);
    raise("review");
  }
  return { level, reasons };
}

// ── I/O ─────────────────────────────────────────────────────────────────────

function lumaFrames(path, grid = GRID) {
  const dir = mkdtempSync(join(tmpdir(), "perf-"));
  try {
    const raw = join(dir, "y.gray");
    execFileSync("ffmpeg", [
      "-v",
      "error",
      "-i",
      path,
      "-vf",
      `scale=${grid.w}:${grid.h}:flags=area,format=gray`,
      "-f",
      "rawvideo",
      raw,
      "-y",
    ]);
    const buf = readFileSync(raw);
    return { buf, frames: Math.floor(buf.length / (grid.w * grid.h)) };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

export function probeFps(path) {
  const out = execFileSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=r_frame_rate",
      "-of",
      "csv=p=0",
      path,
    ],
    { encoding: "utf8" },
  ).trim();
  const [num, den] = out.split("/").map(Number);
  const fps = den ? num / den : num;
  // A stream with no frame rate reports `0/0`. Left alone that zero divides
  // through `dominantPeriod` and reports a tempo of Infinity seconds, which
  // reads as a plausible-looking "no beat" rather than as broken input.
  if (!Number.isFinite(fps) || fps <= 0) {
    throw new Error(`${basename(path)}: ffprobe reports no frame rate (r_frame_rate=${out || "?"})`);
  }
  return fps;
}

export function countCuts(path) {
  // `metadata=print` writes to the LOG at info level, not to stdout. With
  // `-v error` — which we want, so a real ffmpeg failure is not buried — the
  // filter's lines were suppressed before they reached either stream, so the
  // previous form matched nothing and silently returned 0 for every clip,
  // making the blueprint's "any cut → reroll" gate a no-op.
  //
  // `file=-` sends the filter's own output to stdout instead of the log, so it
  // survives `-v error`. It is portable across ffmpeg builds (verified on 6.0
  // and 9.0) in a way `file=/dev/stdout` is not.
  const out = execFileSync(
    "ffmpeg",
    [
      "-v",
      "error",
      "-i",
      path,
      "-vf",
      "select='gt(scene,0.15)',metadata=print:file=-",
      "-f",
      "null",
      "-",
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
  return (out.match(/lavfi\.scene_score/g) ?? []).length;
}

export function analyze(path, bands = DEFAULT_BANDS) {
  const fps = probeFps(path);
  const { buf, frames } = lumaFrames(path);
  const rows = rowMotion(buf, frames);
  const tempo = dominantPeriod(bandSignal(buf, frames, bands.hands), fps);
  const face = faceIndex(rows, bands.face);
  const cuts = countCuts(path);
  return {
    clip: basename(path),
    frames,
    fps,
    cuts,
    faceIndex: face,
    tempo: {
      seconds: tempo.seconds,
      clapsPerSecond: tempo.seconds ? 1 / tempo.seconds : null,
      bpm: tempo.seconds ? Math.round(60 / tempo.seconds) : null,
      r: tempo.r,
    },
    deciles: deciles(rows),
    ...verdict({ cuts, faceIndex: face, tempoR: tempo.r }),
  };
}

function parseBand(value, fallback) {
  if (value === undefined) return fallback;
  const parts = value.split(",").map((v) => Number(v) / 100);
  return parts.length === 2 && parts.every((n) => Number.isFinite(n)) ? parts : fallback;
}

function run(argv) {
  const asJson = argv.includes("--json");
  const flagValue = (flag) => {
    const i = argv.indexOf(flag);
    return i === -1 ? undefined : argv[i + 1];
  };
  const bands = {
    face: parseBand(flagValue("--face"), DEFAULT_BANDS.face),
    hands: parseBand(flagValue("--hands"), DEFAULT_BANDS.hands),
  };
  const skip = new Set(["--json", "--face", "--hands", flagValue("--face"), flagValue("--hands")]);
  const clips = argv.slice(2).filter((a) => !skip.has(a) && !a.startsWith("--"));

  if (clips.length === 0) {
    console.error(
      "usage: check-performance.mjs [--json] [--face a,b] [--hands a,b] <clip.mp4> ...",
    );
    return 1;
  }

  const results = clips.map((c) => analyze(c, bands));
  if (asJson) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log("clip                      cuts  faceIndex  claps/s   BPM     r   verdict");
    for (const r of results) {
      console.log(
        `${r.clip.slice(0, 24).padEnd(24)}  ${String(r.cuts).padStart(4)}  ` +
          `${r.faceIndex.toFixed(2).padStart(9)}  ${(r.tempo.clapsPerSecond?.toFixed(2) ?? "—").padStart(7)}  ` +
          `${String(r.tempo.bpm ?? "—").padStart(4)}  ${r.tempo.r.toFixed(2).padStart(5)}   ${r.level}`,
      );
      for (const reason of r.reasons) console.log(`  └ ${reason}`);
    }
  }
  return results.some((r) => r.level === "reroll") ? 1 : 0;
}

const invokedDirectly =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  process.exitCode = run(process.argv);
}
