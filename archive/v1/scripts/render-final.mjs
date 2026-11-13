import { bundle } from "@remotion/bundler";
import {
  renderStill,
  renderMedia,
  selectComposition,
} from "@remotion/renderer";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import path from "node:path";
for (const dir of [
  "public/renders",
  "public/poster",
  "public/og",
  "docs/final-qa",
])
  await mkdir(dir, { recursive: true });
const serveUrl = await bundle({
  entryPoint: path.resolve("src/remotion/index.ts"),
});
const composition = await selectComposition({
  serveUrl,
  id: "BankrateMotionStudy",
});
for (const frame of [
  0, 36, 60, 72, 84, 96, 120, 180, 186, 255, 291, 350, 396, 480, 539, 540, 570,
  599, 629,
]) {
  await renderStill({
    serveUrl,
    composition,
    frame,
    output: `docs/final-qa/frame-${frame}.png`,
    imageFormat: "png",
    scale: 0.5,
  });
  console.log(`QA ${frame}`);
}
for (const [frame, name] of [
  [255, "repeat-255"],
  [599, "hold-599"],
  [629, "hold-629"],
])
  await renderStill({
    serveUrl,
    composition,
    frame,
    output: `docs/final-qa/${name}.png`,
    imageFormat: "png",
    scale: 0.5,
  });
const hash = async (file) =>
  createHash("sha256")
    .update(await readFile(file))
    .digest("hex");
const deterministic =
  (await hash("docs/final-qa/frame-255.png")) ===
  (await hash("docs/final-qa/repeat-255.png"));
const stillEnding =
  (await hash("docs/final-qa/hold-599.png")) ===
  (await hash("docs/final-qa/hold-629.png"));
if (!deterministic || !stillEnding)
  throw new Error("Determinism or ending-hold check failed");
await writeFile(
  "docs/final-qa/checks.json",
  JSON.stringify(
    { deterministic, stillEnding, duration: 21, frames: 630 },
    null,
    2,
  ),
);
await renderStill({
  serveUrl,
  composition,
  frame: 605,
  output: "public/poster/bankrate-motion-study-poster.jpg",
  imageFormat: "jpeg",
  jpegQuality: 88,
  scale: 5 / 6,
});
await renderStill({
  serveUrl,
  composition,
  frame: 605,
  output: "public/og/bankrate-motion-study.jpg",
  imageFormat: "jpeg",
  jpegQuality: 88,
  scale: 0.625,
});
let last = -1;
await renderMedia({
  serveUrl,
  composition,
  outputLocation: "docs/final-qa/master-source.mp4",
  codec: "h264",
  crf: 18,
  pixelFormat: "yuv420p",
  concurrency: 3,
  onProgress: ({ progress }) => {
    const n = Math.floor(progress * 10);
    if (n !== last) {
      last = n;
      console.log(`Master ${n * 10}%`);
    }
  },
});
const bin = path.resolve(
  `node_modules/@remotion/compositor-${process.platform}-${process.arch}`,
);
const ffmpeg = process.env.FFMPEG_PATH || path.join(bin, "ffmpeg");
const env = { ...process.env, DYLD_LIBRARY_PATH: bin };
execFileSync(
  ffmpeg,
  [
    "-v",
    "error",
    "-i",
    "docs/final-qa/master-source.mp4",
    "-vf",
    "scale=in_range=full:out_range=tv",
    "-c:v",
    "libx264",
    "-crf",
    "20",
    "-pix_fmt",
    "yuv420p",
    "-color_range",
    "tv",
    "-movflags",
    "+faststart",
    "public/renders/bankrate-motion-study.mp4",
    "-y",
  ],
  { env, stdio: "inherit" },
);
execFileSync(
  ffmpeg,
  [
    "-v",
    "error",
    "-i",
    "public/renders/bankrate-motion-study.mp4",
    "-c:v",
    "libvpx-vp9",
    "-b:v",
    "0",
    "-crf",
    "32",
    "-an",
    "public/renders/bankrate-motion-study.webm",
    "-y",
  ],
  { env, stdio: "inherit" },
);
console.log("Final master, WebM, poster, OG image and QA ready.");
