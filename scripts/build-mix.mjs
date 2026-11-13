// Mixes the edited music and the generated SFX to picture.
// Cue frames come from src/remotion/timeline.ts (the same file the scenes
// read), so sound and picture cannot drift. Output: public/audio/mix-v2.wav,
// 48kHz stereo, two-pass loudnorm to −16 LUFS / ≤ −1.5 dBTP.
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  B3,
  CUES,
  DURATION,
  FPS,
  MUSIC,
  musicStart,
} from "../src/remotion/timeline.ts";
import { tween } from "../src/remotion/motion.ts";
import { SR, wav } from "./build-sfx.mjs";

const ffmpeg = process.env.FFMPEG_PATH || "ffmpeg";
const LEN = Math.round((DURATION / FPS) * SR);
const tmp = await mkdtemp(path.join(tmpdir(), "mix-v2-"));
const db = (v) => 10 ** (v / 20);

// ── Music edit ────────────────────────────────────────────────────────────
execFileSync(ffmpeg, [
  "-v",
  "error",
  "-i",
  MUSIC.file,
  "-ac",
  "2",
  "-ar",
  String(SR),
  "-f",
  "f32le",
  path.join(tmp, "music.f32"),
  "-y",
]);
const raw = await readFile(path.join(tmp, "music.f32"));
const src = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
const at = (t, ch) => {
  const i = Math.round(t * SR);
  return i >= 0 && i * 2 + ch < src.length ? src[i * 2 + ch] : 0;
};
const start = musicStart();
const splice = MUSIC.splitAt - start; // film seconds
const XF = 0.025; // equal-power crossfade at the splice, on the downbeat
const music = [new Float32Array(LEN), new Float32Array(LEN)];
for (let i = 0; i < LEN; i++) {
  const t = i / SR;
  const a = start + t; // segment A track time
  const b = MUSIC.resumeAt + (t - splice); // segment B track time
  const x = Math.max(0, Math.min(1, (t - splice + XF / 2) / XF));
  const ga = Math.cos((x * Math.PI) / 2);
  const gb = Math.sin((x * Math.PI) / 2);
  const fadeIn = Math.min(1, t / 0.35);
  const fadeOut = Math.min(1, (DURATION / FPS - t) / 0.3);
  for (let ch = 0; ch < 2; ch++)
    music[ch][i] = (at(a, ch) * ga + at(b, ch) * gb) * fadeIn * fadeOut;
}

// ── Effects ───────────────────────────────────────────────────────────────
const manifest = JSON.parse(
  await readFile("public/audio/sfx/manifest.json", "utf8"),
);
const readWav = async (name) => {
  const b = await readFile(`public/audio/sfx/${name}.wav`);
  return new Float32Array(
    b.buffer.slice(b.byteOffset + 44, b.byteOffset + b.length),
  );
};
const resample = (x, semitones = 0) => {
  const r = 2 ** (semitones / 12);
  if (r === 1) return x;
  const out = new Float32Array(Math.floor(x.length / r));
  for (let i = 0; i < out.length; i++) {
    const p = i * r;
    const k = Math.floor(p);
    out[i] = x[k] + ((x[k + 1] ?? 0) - x[k]) * (p - k);
  }
  return out;
};
const SFX_BUS = -9; // dB: effects sit under the music
const sfx = [new Float32Array(LEN), new Float32Array(LEN)];
const placed = [];
const place = (
  x,
  anchorSec,
  frame,
  gainDb,
  pan = 0,
  label = "",
  crest = false,
) => {
  const o = Math.round((frame / FPS - anchorSec) * SR);
  const g = db(SFX_BUS + gainDb);
  const gl = Math.cos(((pan + 1) * Math.PI) / 4) * Math.SQRT2;
  const gr = Math.sin(((pan + 1) * Math.PI) / 4) * Math.SQRT2;
  for (let i = 0; i < x.length; i++) {
    const j = o + i;
    if (j < 0 || j >= LEN) continue;
    sfx[0][j] += x[i] * g * gl;
    sfx[1][j] += x[i] * g * gr;
  }
  placed.push({ label, frame, x, o, crest });
};
const cache = {};
for (const c of CUES) {
  if (c.sfx === "ticker") continue;
  cache[c.sfx] ??= await readWav(c.sfx);
  const r = 2 ** ((c.semitones ?? 0) / 12);
  const m = manifest[c.sfx];
  place(
    resample(cache[c.sfx], c.semitones),
    m.anchor / r,
    c.frame,
    c.gain,
    c.pan,
    c.label,
    m.sync === "crest",
  );
}
// Count-up ticker: one soft tick each time the eased count passes a step,
// so the ticks follow the number (dense, then slowing into the landing).
const tick = resample(await readWav("tap"), 14);
const ticker = CUES.find((c) => c.sfx === "ticker");
for (let k = 1; k < 18; k++) {
  let f = B3.count.start;
  while (
    tween(f, B3.count.start, B3.count.dur, "enter") < k / 18 &&
    f < B3.count.start + B3.count.dur
  )
    f += 0.05;
  place(tick, 0, f, ticker.gain - 6 + k * 0.15, 0, `ticker ${k}`);
}

// ── Ducking: dip the music ~4dB around key effects ────────────────────────
const duck = new Float32Array(LEN).fill(1);
for (const c of CUES.filter((c) => c.duck)) {
  const t0 = c.frame / FPS;
  for (let i = 0; i < LEN; i++) {
    const t = i / SR - t0;
    let d = 0;
    if (t > -0.06 && t < 0) d = (t + 0.06) / 0.06;
    else if (t >= 0 && t < 0.3) d = 1;
    else if (t >= 0.3 && t < 0.55) d = 1 - (t - 0.3) / 0.25;
    if (d > 0) duck[i] = Math.min(duck[i], 1 - (1 - db(-4)) * d);
  }
}

const mix = [0, 1].map((ch) =>
  music[ch].map((v, i) => v * duck[i] + sfx[ch][i]),
);
await writeFile(path.join(tmp, "pre.wav"), wav(mix));
await writeFile(path.join(tmp, "sfx.wav"), wav(sfx));

// ── Loudness: two-pass loudnorm, then verify with ebur128 ─────────────────
const target = "I=-16:TP=-1.5:LRA=11";
const stderrOf = (args) => {
  // ffmpeg prints its analysis to stderr; capture it via spawnSync.
  const r = spawnSync(ffmpeg, ["-hide_banner", "-nostats", ...args], {
    encoding: "utf8",
  });
  return r.stderr;
};
// The source track peaks above 0 dBFS, which would force loudnorm into
// dynamic (compressing) mode. A gentle limiter first keeps it linear.
execFileSync(ffmpeg, [
  "-v",
  "error",
  "-i",
  path.join(tmp, "pre.wav"),
  "-af",
  "aresample=192000,alimiter=limit=0.8:attack=4:release=80:level=false,aresample=48000",
  "-c:a",
  "pcm_f32le",
  path.join(tmp, "lim.wav"),
  "-y",
]);
const p1 = stderrOf([
  "-i",
  path.join(tmp, "lim.wav"),
  "-af",
  `loudnorm=${target}:print_format=json`,
  "-f",
  "null",
  "-",
]);
const m1 = JSON.parse(p1.slice(p1.lastIndexOf("{"), p1.lastIndexOf("}") + 1));
await mkdir("public/audio", { recursive: true });
const p2 = stderrOf([
  "-i",
  path.join(tmp, "lim.wav"),
  "-af",
  `loudnorm=${target}:measured_I=${m1.input_i}:measured_TP=${m1.input_tp}:measured_LRA=${m1.input_lra}:measured_thresh=${m1.input_thresh}:offset=${m1.target_offset}:linear=true:print_format=json`,
  "-ar",
  String(SR),
  "-ac",
  "2",
  "-c:a",
  "pcm_s24le",
  "public/audio/mix-v2.wav",
  "-y",
]);
const m2 = JSON.parse(p2.slice(p2.lastIndexOf("{"), p2.lastIndexOf("}") + 1));
const ebur = stderrOf([
  "-i",
  "public/audio/mix-v2.wav",
  "-af",
  "ebur128=peak=true",
  "-f",
  "null",
  "-",
]);
const summary = ebur.slice(ebur.lastIndexOf("Summary:"));
const integrated = Number(summary.match(/I:\s+(-?[\d.]+) LUFS/)[1]);
const truePeak = Number(summary.match(/Peak:\s+(-?[\d.]+) dBFS/)[1]);
const lra = Number(summary.match(/LRA:\s+(-?[\d.]+) LU/)[1]);

// ── Sync check: find each effect's sync point in its own isolated render
// (onset for percussive cues, crest for anchored swells) and compare it
// with the cue frame the picture uses.
const onsets = placed
  .filter((p) => !p.label.startsWith("ticker"))
  .map((p) => {
    let peak = 0;
    let arg = 0;
    for (let i = 0; i < p.x.length; i++)
      if (Math.abs(p.x[i]) > peak) {
        peak = Math.abs(p.x[i]);
        arg = i;
      }
    let first = 0;
    while (Math.abs(p.x[first]) < peak * 0.05) first++;
    const idx = p.crest ? arg : first;
    const measured = ((p.o + idx) / SR) * FPS;
    // Level of the effect against the music under it (150ms window at the
    // sync point). Negative = the effect sits under the music.
    const rms = (arr, i0) => {
      let e = 0;
      for (let i = i0; i < i0 + 0.15 * SR && i < LEN; i++) e += arr[i] * arr[i];
      return Math.sqrt(e / (0.15 * SR)) + 1e-9;
    };
    const i0 = Math.max(0, Math.round((measured / FPS) * SR) - 0.01 * SR);
    const vsMusic =
      20 *
      Math.log10(
        rms(sfx[0], i0) /
          rms(
            music[0].map((v, i) => v * duck[i]),
            i0,
          ),
      );
    return {
      label: p.label,
      frame: p.frame,
      measuredFrame: +measured.toFixed(2),
      offsetFrames: +(measured - p.frame).toFixed(2),
      sfxVsMusicDb: +vsMusic.toFixed(1),
    };
  });
const report = {
  music: {
    file: MUSIC.file,
    startSeconds: +start.toFixed(4),
    spliceFilmSeconds: +splice.toFixed(4),
    resumeAt: MUSIC.resumeAt,
    liftFilmFrame: +((MUSIC.lift - start) * FPS).toFixed(2),
  },
  loudness: {
    integratedLUFS: integrated,
    truePeakDBTP: truePeak,
    lraLU: lra,
    secondPassMode: m2.normalization_type,
    limiter: "alimiter −1.9 dBFS (source track peaks above 0 dBFS)",
  },
  withinSpec: Math.abs(integrated + 16) <= 1 && truePeak <= -1.5,
  cues: onsets,
  allCuesWithinOneFrame: onsets.every((o) => Math.abs(o.offsetFrames) <= 1),
};
await mkdir("docs/v2", { recursive: true });
await writeFile("docs/v2/audio-report.json", JSON.stringify(report, null, 2));
await rm(tmp, { recursive: true, force: true });
console.log(
  `Mix: ${integrated} LUFS, true peak ${truePeak} dBTP, LRA ${lra} LU; cues in sync: ${report.allCuesWithinOneFrame}`,
);
if (!report.withinSpec) process.exitCode = 1;
