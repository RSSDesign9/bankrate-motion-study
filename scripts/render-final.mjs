// Final v2 render: QA stills, determinism and final-hold checks, the master,
// the web encodes (MP4 + WebM, both with audio), poster, OG image and
// docs/final-qa/checks.json. Run `npm run audio` first (or `npm run render:video`,
// which does both).
import { bundle } from "@remotion/bundler";
import {
  renderMedia,
  renderStill,
  selectComposition,
} from "@remotion/renderer";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { B5, B6, B7, BEAT, DURATION, FPS } from "../src/remotion/timeline.ts";

const OUT = {
  mp4: "public/renders/bankrate-motion-study-v2.mp4",
  webm: "public/renders/bankrate-motion-study-v2.webm",
  poster: "public/poster/bankrate-motion-study-poster-v2.jpg",
  og: "public/og/bankrate-motion-study-v2.jpg",
  mix: "public/audio/mix-v2.wav",
};
const QA = "docs/final-qa";
for (const dir of ["public/renders", "public/poster", "public/og", QA])
  await mkdir(dir, { recursive: true });
if (!existsSync(OUT.mix))
  throw new Error("Missing mix: run `npm run audio` first.");

const ffmpeg = process.env.FFMPEG_PATH || "ffmpeg";
const serveUrl = await bundle({
  entryPoint: path.resolve("src/remotion/index.ts"),
});
const composition = await selectComposition({
  serveUrl,
  id: "BankrateMotionStudy",
});
if (composition.durationInFrames !== DURATION)
  throw new Error("Duration mismatch");

// ── QA stills ─────────────────────────────────────────────────────────────
const beats = Object.values(BEAT);
const bounds = [...beats.slice(1)].flatMap((b) => [b - 1, b, b + 1]);
const mids = beats.map((b, i) =>
  Math.round((b + (beats[i + 1] ?? DURATION)) / 2),
);
const rounds = B5.rounds.map((r) => r.start + Math.round(r.dur / 2));
const handoffMid = B5.handoff.start + 9;
const holdA = B6.holdStart;
const holdB = B7.exit - 1;
const frames = [
  ...new Set([
    0,
    ...bounds,
    ...mids,
    ...rounds,
    handoffMid,
    holdA,
    holdB,
    DURATION - 1,
  ]),
].sort((a, b) => a - b);
for (const frame of frames) {
  await renderStill({
    serveUrl,
    composition,
    frame,
    output: `${QA}/frame-${frame}.png`,
    imageFormat: "png",
    scale: 0.5,
  });
}
console.log(`QA stills: ${frames.length}`);
const repeatFrame = handoffMid;
await renderStill({
  serveUrl,
  composition,
  frame: repeatFrame,
  output: `${QA}/repeat-${repeatFrame}.png`,
  imageFormat: "png",
  scale: 0.5,
});
const hash = async (f) =>
  createHash("sha256")
    .update(await readFile(f))
    .digest("hex");
const deterministic =
  (await hash(`${QA}/frame-${repeatFrame}.png`)) ===
  (await hash(`${QA}/repeat-${repeatFrame}.png`));
// The whole final hold must be pixel-identical, not just its two ends.
const holdHashes = new Set();
for (let f = holdA; f <= holdB; f += 4) {
  const out = `${QA}/hold-tmp.png`;
  await renderStill({
    serveUrl,
    composition,
    frame: f,
    output: out,
    imageFormat: "png",
    scale: 0.5,
  });
  holdHashes.add(await hash(out));
}
await renderStill({
  serveUrl,
  composition,
  frame: holdB,
  output: `${QA}/hold-tmp.png`,
  imageFormat: "png",
  scale: 0.5,
});
holdHashes.add(await hash(`${QA}/hold-tmp.png`));
const stillEnding = holdHashes.size === 1;
if (!deterministic || !stillEnding)
  throw new Error(
    `Determinism (${deterministic}) or final-hold (${stillEnding}) check failed`,
  );

// ── Poster and share image (from the final hold) ──────────────────────────
const posterFrame = holdA + 20;
await renderStill({
  serveUrl,
  composition,
  frame: posterFrame,
  output: OUT.poster,
  imageFormat: "jpeg",
  jpegQuality: 88,
  scale: 5 / 6,
});
await renderStill({
  serveUrl,
  composition,
  frame: posterFrame,
  output: OUT.og,
  imageFormat: "jpeg",
  jpegQuality: 88,
  scale: 0.625,
});

// ── Master (lossless PCM audio) and web encodes ───────────────────────────
const master = `${QA}/master-source.mkv`;
let last = -1;
await renderMedia({
  serveUrl,
  composition,
  outputLocation: master,
  codec: "h264-mkv",
  audioCodec: "pcm-16",
  crf: 16,
  pixelFormat: "yuv420p",
  concurrency: 4,
  onProgress: ({ progress }) => {
    const n = Math.floor(progress * 10);
    if (n !== last) console.log(`Master ${(last = n) * 10}%`);
  },
});
const run = (args) =>
  execFileSync(ffmpeg, ["-v", "error", ...args], { stdio: "inherit" });
// Audio comes straight from the lossless mix (identical to what Remotion
// muxed), so it is encoded once.
run([
  "-i",
  master,
  "-i",
  OUT.mix,
  "-map",
  "0:v",
  "-map",
  "1:a",
  "-vf",
  "scale=in_range=full:out_range=tv",
  "-c:v",
  "libx264",
  "-crf",
  "20",
  "-preset",
  "slow",
  "-pix_fmt",
  "yuv420p",
  "-color_range",
  "tv",
  "-c:a",
  "aac",
  "-b:a",
  "192k",
  "-ar",
  "48000",
  "-ac",
  "2",
  "-movflags",
  "+faststart",
  "-shortest",
  OUT.mp4,
  "-y",
]);
run([
  "-i",
  master,
  "-i",
  OUT.mix,
  "-map",
  "0:v",
  "-map",
  "1:a",
  "-c:v",
  "libvpx-vp9",
  "-b:v",
  "0",
  "-crf",
  "32",
  "-row-mt",
  "1",
  "-c:a",
  "libopus",
  "-b:a",
  "128k",
  "-ar",
  "48000",
  "-ac",
  "2",
  "-shortest",
  OUT.webm,
  "-y",
]);

// ── Verify the encodes ────────────────────────────────────────────────────
const probe = (file) =>
  JSON.parse(
    execFileSync("ffprobe", [
      "-v",
      "error",
      "-count_frames",
      "-show_entries",
      "stream=codec_type,codec_name,width,height,r_frame_rate,nb_read_frames,sample_rate,channels:format=duration,size",
      "-of",
      "json",
      file,
    ]).toString(),
  );
const loud = (file) => {
  const r = spawnSync(
    ffmpeg,
    [
      "-hide_banner",
      "-nostats",
      "-i",
      file,
      "-af",
      "ebur128=peak=true",
      "-f",
      "null",
      "-",
    ],
    { encoding: "utf8" },
  );
  const s = r.stderr.slice(r.stderr.lastIndexOf("Summary:"));
  return {
    integratedLUFS: Number(s.match(/I:\s+(-?[\d.]+) LUFS/)[1]),
    truePeakDBTP: Number(s.match(/Peak:\s+(-?[\d.]+) dBFS/)[1]),
  };
};
const encodes = {};
for (const [k, file] of [
  ["mp4", OUT.mp4],
  ["webm", OUT.webm],
]) {
  const p = probe(file);
  const v = p.streams.find((s) => s.codec_type === "video");
  const a = p.streams.find((s) => s.codec_type === "audio");
  encodes[k] = {
    file,
    bytes: Number(p.format.size),
    duration: Number(p.format.duration),
    video: {
      codec: v.codec_name,
      width: v.width,
      height: v.height,
      fps: v.r_frame_rate,
      frames: Number(v.nb_read_frames),
    },
    audio: a
      ? {
          codec: a.codec_name,
          sampleRate: Number(a.sample_rate),
          channels: a.channels,
        }
      : null,
    loudness: loud(file),
  };
  const e = encodes[k];
  if (
    e.video.width !== 1920 ||
    e.video.height !== 1080 ||
    e.video.fps !== "30/1" ||
    e.video.frames !== DURATION ||
    !e.audio ||
    e.audio.sampleRate !== 48000 ||
    e.audio.channels !== 2
  )
    throw new Error(`${k} failed spec: ${JSON.stringify(e)}`);
}
const audioReport = JSON.parse(
  await readFile("docs/v2/audio-report.json", "utf8"),
);
await writeFile(
  `${QA}/checks.json`,
  JSON.stringify(
    {
      version: "v2",
      duration: DURATION / FPS,
      frames: DURATION,
      fps: FPS,
      deterministic,
      deterministicFrame: repeatFrame,
      finalHold: {
        from: holdA,
        to: holdB,
        seconds: +((holdB - holdA + 1) / FPS).toFixed(2),
        pixelIdentical: stillEnding,
      },
      posterFrame,
      qaFrames: frames,
      encodes,
      mixLoudness: audioReport.loudness,
      cues: audioReport.cues,
      allCuesWithinOneFrame: audioReport.allCuesWithinOneFrame,
    },
    null,
    2,
  ),
);
console.log("v2 master, MP4, WebM, poster, OG image and QA ready.");
