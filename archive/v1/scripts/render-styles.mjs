import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const serveUrl = await bundle({
  entryPoint: path.resolve("src/remotion/index.ts"),
});
for (const [id, name] of [
  ["StyleFrame-01", "scene-1"],
  ["StyleFrame-03", "scene-3"],
  ["StyleFrame-05", "scene-5"],
  ["Primitives", "primitives"],
]) {
  const composition = await selectComposition({ serveUrl, id });
  await renderStill({
    serveUrl,
    composition,
    output: `public/review/${name}.png`,
    imageFormat: "png",
  });
  console.log(`Rendered ${name}`);
}
