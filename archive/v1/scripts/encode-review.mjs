import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
const bundled = path.resolve(
  `node_modules/@remotion/compositor-${process.platform}-${process.arch}`,
);
const ffmpeg =
  process.env.FFMPEG_PATH ||
  (existsSync(path.join(bundled, "ffmpeg"))
    ? path.join(bundled, "ffmpeg")
    : "ffmpeg");
const env = { ...process.env, DYLD_LIBRARY_PATH: bundled };
const run = (args) =>
  execFileSync(
    ffmpeg,
    ["-v", "error", "-i", "public/review/rough-cut.mp4", ...args, "-y"],
    { env, stdio: "inherit" },
  );
run([
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
  "public/review/rough-cut-compatible.mp4",
]);
run([
  "-c:v",
  "libvpx-vp9",
  "-b:v",
  "0",
  "-crf",
  "32",
  "-an",
  "public/review/rough-cut.webm",
]);
