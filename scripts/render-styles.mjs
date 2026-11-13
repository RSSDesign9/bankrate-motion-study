// Renders the v2 style frames, drawing-system sheet and rig regression
// still to docs/v2/style-frames/.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdir } from "node:fs/promises";
import path from "node:path";
const out = "docs/v2/style-frames";
await mkdir(out, { recursive: true });
const serveUrl = await bundle({
  entryPoint: path.resolve("src/remotion/index.ts"),
});
for (const [id, name] of [
  ["StyleFrame-01", "prevalence"],
  ["StyleFrame-03", "structure"],
  ["StyleFrame-05", "resolution"],
  ["Primitives", "drawing-system"],
  ["RigRegression", "rig-rest-pose"],
]) {
  const composition = await selectComposition({ serveUrl, id });
  await renderStill({
    serveUrl,
    composition,
    output: `${out}/${name}.png`,
    imageFormat: "png",
  });
  console.log(`Rendered ${name}`);
}
