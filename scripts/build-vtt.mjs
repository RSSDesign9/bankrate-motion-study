// Writes the WebVTT captions from the same copy and timeline the film uses.
import { writeFile } from "node:fs/promises";
import { captions } from "../src/remotion/narrative.ts";
import { FPS } from "../src/remotion/timeline.ts";

const ts = (frame) => {
  const ms = Math.round((frame / FPS) * 1000);
  const m = Math.floor(ms / 60000);
  const s = ((ms % 60000) / 1000).toFixed(3).padStart(6, "0");
  return `${String(m).padStart(2, "0")}:${s}`;
};
const vtt = [
  "WEBVTT",
  "",
  ...captions.flatMap((c) => [`${ts(c.from)} --> ${ts(c.to)}`, c.text, ""]),
].join("\n");
await writeFile("public/renders/narrative-v2.vtt", vtt);
console.log("Wrote public/renders/narrative-v2.vtt");
