import { bundle } from "@remotion/bundler";
import {
  renderStill,
  renderMedia,
  selectComposition,
} from "@remotion/renderer";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
await mkdir("public/review/qa", { recursive: true });
const serveUrl = await bundle({
  entryPoint: path.resolve("src/remotion/index.ts"),
});
const composition = await selectComposition({
  serveUrl,
  id: "BankrateMotionStudy",
});
for (const frame of [
  0, 35, 36, 110, 150, 220, 255, 330, 360, 445, 503, 504, 560, 629,
]) {
  await renderStill({
    serveUrl,
    composition,
    frame,
    output: `public/review/qa/frame-${frame}.png`,
    imageFormat: "png",
    scale: 0.5,
  });
  console.log(`QA ${frame}`);
}
const duplicate = "public/review/qa/determinism.png";
await renderStill({
  serveUrl,
  composition,
  frame: 220,
  output: duplicate,
  imageFormat: "png",
  scale: 0.5,
});
const hash = async (p) =>
  createHash("sha256")
    .update(await readFile(p))
    .digest("hex");
if ((await hash(duplicate)) !== (await hash("public/review/qa/frame-220.png")))
  throw new Error("Frame determinism check failed");
await writeFile(
  "docs/determinism.json",
  JSON.stringify(
    { frame: 220, sha256: await hash(duplicate), identical: true },
    null,
    2,
  ),
);
console.log("Determinism passed. Rendering silent rough cut.");
let last = -1;
await renderMedia({
  serveUrl,
  composition,
  outputLocation: "public/review/rough-cut.mp4",
  codec: "h264",
  pixelFormat: "yuv420p",
  crf: 22,
  scale: 2 / 3,
  concurrency: 3,
  onProgress: ({ progress }) => {
    const n = Math.floor(progress * 10);
    if (n !== last) {
      last = n;
      console.log(`${n * 10}%`);
    }
  },
});
console.log("Rough cut ready.");
