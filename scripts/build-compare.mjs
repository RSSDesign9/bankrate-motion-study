// Portfolio comparison media: four annotated v1/v2 still pairs, a handoff
// strip, and a labelled side-by-side video (v1 padded with its last frame).
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { B5, B6, DURATION, FPS } from "../src/remotion/timeline.ts";

const V1 = "archive/v1/renders/bankrate-motion-study.mp4";
const V2 = "public/renders/bankrate-motion-study-v2.mp4";
const OUT = "docs/v2/compare";
await mkdir(OUT, { recursive: true });
const ffmpeg = process.env.FFMPEG_PATH || "ffmpeg";
const run = (args) =>
  execFileSync(ffmpeg, ["-v", "error", ...args, "-y"], { stdio: "inherit" });

const serveUrl = await bundle({
  entryPoint: path.resolve("src/remotion/index.ts"),
});
const label = async (name, text, sub) => {
  const composition = await selectComposition({
    serveUrl,
    id: "CompareLabel",
    inputProps: { text, sub },
  });
  await renderStill({
    serveUrl,
    composition,
    inputProps: { text, sub },
    output: `${OUT}/${name}.png`,
  });
  return `${OUT}/${name}.png`;
};
const l1 = await label("label-v1", "v1 · 2-hour sprint", "21.0s · silent");
const l2 = await label(
  "label-v2",
  "v2 · brand motion system",
  `${(DURATION / FPS).toFixed(1)}s · with sound`,
);

const pairs = [
  ["01-continuity-cut", 80, 100],
  ["02-the-3343-moment", 255, 240],
  ["03-competition-and-handoff", 480, B5.winner + 18],
  ["04-bookend-ending", 605, B6.holdStart + 20],
];
for (const [name, f1, f2] of pairs) {
  run([
    "-i",
    V1,
    "-i",
    V2,
    "-i",
    l1,
    "-i",
    l2,
    "-filter_complex",
    `[0:v]select=eq(n\\,${f1}),scale=960:540[a];[1:v]select=eq(n\\,${f2}),scale=960:540[b];[2][a]vstack[la];[3][b]vstack[lb];[la][lb]hstack`,
    "-frames:v",
    "1",
    `${OUT}/${name}.png`,
  ]);
}
// The handoff in three frames: tile, morph midpoint (blurred), document.
const h = B5.handoff.start;
run([
  "-i",
  V2,
  "-vf",
  `select='eq(n\\,${h})+eq(n\\,${h + 9})+eq(n\\,${h + 20})',crop=900:600:760:360,scale=640:-1,tile=3x1`,
  "-frames:v",
  "1",
  "-fps_mode",
  "vfr",
  `${OUT}/03b-handoff-strip.png`,
]);
// Continuity: the same hero, one camera move, from wall to crowd.
run([
  "-i",
  V2,
  "-vf",
  "select='eq(n\\,44)+eq(n\\,80)+eq(n\\,90)+eq(n\\,150)',scale=480:-1,tile=4x1",
  "-frames:v",
  "1",
  "-fps_mode",
  "vfr",
  `${OUT}/01b-continuity-strip.png`,
]);
// Side by side: both scaled to 960 wide; v1 holds its last frame to match.
run([
  "-i",
  V1,
  "-i",
  V2,
  "-loop",
  "1",
  "-i",
  l1,
  "-loop",
  "1",
  "-i",
  l2,
  "-filter_complex",
  `[0:v]scale=960:540,tpad=stop_mode=clone:stop_duration=${(DURATION / FPS - 21 + 0.1).toFixed(2)}[a];[1:v]scale=960:540[b];[2]scale=960:64,fps=30[la];[3]scale=960:64,fps=30[lb];[la][a]vstack[va];[lb][b]vstack[vb];[va][vb]hstack,format=yuv420p[v]`,
  "-map",
  "[v]",
  "-map",
  "1:a",
  "-r",
  "30",
  "-t",
  String(DURATION / FPS),
  "-c:v",
  "libx264",
  "-crf",
  "20",
  "-preset",
  "slow",
  "-c:a",
  "aac",
  "-b:a",
  "192k",
  "-movflags",
  "+faststart",
  "docs/v2/v1-vs-v2-side-by-side.mp4",
]);
console.log("Comparison stills and side-by-side video ready.");
