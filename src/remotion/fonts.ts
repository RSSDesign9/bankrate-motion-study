import { loadFont as loadSerif } from "@remotion/google-fonts/SourceSerif4";
import { loadFont as loadSans } from "@remotion/google-fonts/InstrumentSans";
export const serif = loadSerif("normal", {
  weights: ["500", "600"],
  subsets: ["latin"],
});
export const sans = loadSans("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});
export const fontsReady = Promise.all([
  serif.waitUntilDone(),
  sans.waitUntilDone(),
]);
