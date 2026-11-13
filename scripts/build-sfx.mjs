// Deterministic sound-effect synthesis. No samples, no downloads: every
// effect is built from sines and seeded noise, then written as 48kHz mono
// float WAVs to public/audio/sfx/. `anchor` marks the sync point (seconds)
// that the mix script lines up with the cue frame.
import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export const SR = 48000;
const TAU = Math.PI * 2;

// Seeded PRNG so every build is bit-identical.
const rng = (seed) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const buf = (sec) => new Float32Array(Math.ceil(sec * SR));
const env = (t, a, d) => (t < a ? t / a : Math.exp(-(t - a) / d));
// One-pole filters.
const lowpass = (x, hz) => {
  const a = Math.exp((-TAU * hz) / SR);
  let y = 0;
  return x.map((v) => (y = (1 - a) * v + a * y));
};
const highpass = (x, hz) => {
  const lp = lowpass(x, hz);
  return x.map((v, i) => v - lp[i]);
};
const bandpass = (x, lo, hi) => lowpass(highpass(x, lo), hi);
const noise = (sec, seed) => {
  const r = rng(seed);
  return buf(sec).map(() => r() * 2 - 1);
};
const normalize = (x, peak = 0.5) => {
  let m = 0;
  for (const v of x) m = Math.max(m, Math.abs(v));
  return m ? x.map((v) => (v / m) * peak) : x;
};
const add = (dst, src, at = 0, gain = 1) => {
  const o = Math.round(at * SR);
  for (let i = 0; i < src.length && o + i < dst.length; i++)
    if (o + i >= 0) dst[o + i] += src[i] * gain;
  return dst;
};
const tone = (sec, partials, decay, attack = 0.004) => {
  const x = buf(sec);
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    let v = 0;
    for (const [hz, amp] of partials) v += Math.sin(TAU * hz * t) * amp;
    x[i] = v * env(t, attack, decay);
  }
  return x;
};
const note = (n) => 440 * 2 ** ((n - 69) / 12); // MIDI → Hz

// ── The palette: warm, quiet, editorial ───────────────────────────────────
const tap = () => {
  // Soft wooden knock: a damped low body plus a short filtered click.
  const body = tone(
    0.18,
    [
      [190, 1],
      [410, 0.35],
    ],
    0.035,
    0.002,
  );
  const click = bandpass(noise(0.03, 11), 700, 2600).map(
    (v, i) => v * env(i / SR, 0.001, 0.006),
  );
  return { x: normalize(add(body, click, 0, 1.2), 0.55), anchor: 0 };
};
const clink = () => {
  // Small metallic coin: inharmonic partials, a tiny second bounce.
  const hit = (seed) => {
    const ring = tone(
      0.35,
      [
        [2093, 0.6],
        [3322, 0.45],
        [4980, 0.3],
        [7040, 0.15],
      ],
      0.07,
      0.001,
    );
    const tick = bandpass(noise(0.35, seed), 3000, 9000);
    return ring.map((v, i) => v + tick[i] * env(i / SR, 0.001, 0.004) * 0.6);
  };
  const x = add(add(buf(0.5), hit(21), 0), hit(22), 0.085, 0.35);
  return { x: normalize(lowpass(x, 9000), 0.5), anchor: 0 };
};
const settle = () => {
  // Gentle two-note bell: G5 + C6, the count lands.
  const x = add(
    tone(
      1.2,
      [
        [note(79), 0.6],
        [note(91), 0.08],
      ],
      0.32,
    ),
    tone(1.2, [[note(84), 0.5]], 0.38),
    0.05,
  );
  return { x: normalize(x, 0.4), anchor: 0 };
};
const whoomp = () => {
  // Low filtered drop: a falling sine plus dark noise.
  const sec = 0.7;
  const x = buf(sec);
  let ph = 0;
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    const hz = 45 + 85 * Math.exp(-t / 0.12);
    ph += (TAU * hz) / SR;
    x[i] = Math.sin(ph) * env(t, 0.015, 0.16);
  }
  const rumble = lowpass(noise(sec, 31), 180).map(
    (v, i) => v * env(i / SR, 0.02, 0.12) * 3,
  );
  return { x: normalize(add(x, rumble), 0.7), anchor: 0 };
};
const air = () => {
  // Short airy fall: band noise sweeping downward.
  const sec = 0.9;
  const n = noise(sec, 41);
  const x = buf(sec);
  let lo = 0;
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    const hz = 2600 * Math.exp(-t / 0.35) + 300;
    const a = Math.exp((-TAU * hz) / SR);
    lo = (1 - a) * n[i] + a * lo;
    x[i] = lo * Math.sin(Math.PI * Math.min(1, t / sec)) ** 1.5;
  }
  return { x: normalize(highpass(x, 200), 0.3), anchor: 0 };
};
const swell = () => {
  // Bright upward swell that crests on the flood (and the music lift).
  const sec = 1.3;
  const peak = 0.55;
  const x = buf(sec);
  const chord = [note(72), note(76), note(79), note(84)];
  const n = bandpass(noise(sec, 51), 2500, 9000);
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    const shape = t < peak ? (t / peak) ** 2.2 : Math.exp(-(t - peak) / 0.22);
    let v = 0;
    chord.forEach(
      (hz, k) => (v += Math.sin(TAU * hz * (1 + 0.004 * t) * t + k) * 0.25),
    );
    x[i] = (v + n[i] * 0.35) * shape;
  }
  return { x: normalize(x, 0.45), anchor: peak };
};
const shuffle = () => {
  // Card-shuffle flicks: quick high noise ticks.
  const x = buf(0.25);
  [0, 0.028, 0.052, 0.074, 0.093].forEach((at, k) => {
    const flick = bandpass(noise(0.03, 61 + k), 2500, 8000).map(
      (v, i) => v * env(i / SR, 0.0008, 0.005),
    );
    add(x, flick, at, 1 - k * 0.12);
  });
  return { x: normalize(x, 0.4), anchor: 0 };
};
const shimmer = () => {
  // Quick rising sparkle as the outline draws.
  const x = buf(0.9);
  [note(84), note(88), note(91), note(96)].forEach((hz, k) =>
    add(
      x,
      tone(
        0.6,
        [
          [hz, 1],
          [hz * 2.01, 0.2],
        ],
        0.16,
        0.002,
      ),
      k * 0.045,
      0.8 - k * 0.12,
    ),
  );
  return { x: normalize(x, 0.35), anchor: 0 };
};
const pop = () => {
  // Soft "check" pop: a quick pitch drop with a rounded click.
  const sec = 0.2;
  const x = buf(sec);
  let ph = 0;
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    const hz = 520 + 520 * Math.exp(-t / 0.018);
    ph += (TAU * hz) / SR;
    x[i] = Math.sin(ph) * env(t, 0.001, 0.035);
  }
  return { x: normalize(x, 0.5), anchor: 0 };
};
const swish = () => {
  // Paper swish: noise through a rising band, swelling then falling.
  const sec = 0.45;
  const n = noise(sec, 71);
  const x = buf(sec);
  let lo = 0;
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    const hz = 700 + 3800 * (t / sec);
    const a = Math.exp((-TAU * hz) / SR);
    lo = (1 - a) * n[i] + a * lo;
    x[i] = lo * Math.sin(Math.PI * (t / sec)) ** 2;
  }
  return { x: normalize(highpass(x, 500), 0.35), anchor: 0.2 };
};
const scribble = () => {
  // Pencil scribble: band noise with a seeded stroke rhythm.
  const sec = 0.62;
  const r = rng(81);
  const n = bandpass(noise(sec, 82), 1800, 5200);
  const x = buf(sec);
  let g = 0;
  let target = 0;
  for (let i = 0; i < x.length; i++) {
    if (i % Math.round(SR / 26) === 0) target = 0.35 + r() * 0.65;
    g += (target - g) * 0.004;
    const t = i / SR;
    x[i] = n[i] * g * Math.min(1, t / 0.03) * Math.min(1, (sec - t) / 0.12);
  }
  return { x: normalize(x, 0.28), anchor: 0 };
};
const chime = () => {
  // One soft final chime: C6 with a warm octave and a gentle fifth.
  const x = add(
    tone(
      2.4,
      [
        [note(84), 0.55],
        [note(72), 0.25],
        [note(91), 0.12],
        [note(84) * 2.76, 0.04],
      ],
      0.6,
      0.003,
    ),
    tone(2.4, [[note(76), 0.18]], 0.5),
    0.012,
  );
  return { x: normalize(x, 0.4), anchor: 0 };
};

export const SFX = {
  tap,
  clink,
  settle,
  whoomp,
  air,
  swell,
  shuffle,
  shimmer,
  pop,
  swish,
  scribble,
  chime,
};

export const wav = (channels, sr = SR) => {
  // 32-bit float WAV (format 3), interleaved.
  const n = channels[0].length;
  const c = channels.length;
  const data = Buffer.alloc(n * c * 4);
  for (let i = 0; i < n; i++)
    for (let k = 0; k < c; k++)
      data.writeFloatLE(channels[k][i], (i * c + k) * 4);
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write("WAVE", 8);
  h.write("fmt ", 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(3, 20);
  h.writeUInt16LE(c, 22);
  h.writeUInt32LE(sr, 24);
  h.writeUInt32LE(sr * c * 4, 28);
  h.writeUInt16LE(c * 4, 32);
  h.writeUInt16LE(32, 34);
  h.write("data", 36);
  h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await mkdir("public/audio/sfx", { recursive: true });
  const manifest = {};
  for (const [name, make] of Object.entries(SFX)) {
    const { x, anchor } = make();
    await writeFile(`public/audio/sfx/${name}.wav`, wav([x]));
    // Sync point: the crest for swells (anchor > 0), else the onset, measured
    // as the first sample above 5% of peak so soft attacks still land on cue.
    let peak = 0;
    let arg = 0;
    x.forEach((v, i) => {
      if (Math.abs(v) > peak) {
        peak = Math.abs(v);
        arg = i;
      }
    });
    let first = 0;
    while (Math.abs(x[first]) < peak * 0.05) first++;
    const crest = anchor > 0;
    manifest[name] = {
      sync: crest ? "crest" : "onset",
      anchor: +((crest ? arg : first) / SR).toFixed(5),
      seconds: +(x.length / SR).toFixed(3),
    };
  }
  await writeFile(
    "public/audio/sfx/manifest.json",
    JSON.stringify(manifest, null, 2),
  );
  console.log(`Built ${Object.keys(manifest).length} sound effects.`);
}
