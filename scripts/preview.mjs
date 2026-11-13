// Dev helper: fast half-resolution preview render for review passes.
// node scripts/preview.mjs <out.mp4> [scale]   |   COMP=Primitives node scripts/preview.mjs <out.png>
import { bundle } from "@remotion/bundler";
import {
  renderMedia,
  renderStill,
  selectComposition,
} from "@remotion/renderer";
import path from "node:path";
const [out, scale = "0.5"] = process.argv.slice(2);
const serveUrl = await bundle({
  entryPoint: path.resolve("src/remotion/index.ts"),
});
const id = process.env.COMP || "BankrateMotionStudy";
const composition = await selectComposition({ serveUrl, id });
if (id !== "BankrateMotionStudy") {
  await renderStill({
    serveUrl,
    composition,
    output: out,
    scale: Number(scale),
  });
} else {
  await renderMedia({
    serveUrl,
    composition,
    codec: "h264",
    outputLocation: out,
    scale: Number(scale),
    crf: 20,
    concurrency: 6,
    muted: !process.env.AUDIO,
  });
}
console.log("wrote", out);
