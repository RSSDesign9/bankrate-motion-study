import { Composition, Freeze, Still } from "remotion";
import { VIDEO } from "./constants";
import { FontsGate } from "./components/EditorialText";
import { Film } from "./film/Film";
import { CompareLabel, PrimitiveSheet, RigRegression } from "./scenes/Sheets";
import { B2, B4, B6 } from "./timeline";

const Movie = () => (
  <FontsGate>
    <Film />
  </FontsGate>
);
/** A still is the film frozen on a chosen frame, so stills can't drift. */
const at = (frame: number) => {
  const Frame = () => (
    <FontsGate>
      <Freeze frame={frame}>
        <Film />
      </Freeze>
    </FontsGate>
  );
  return Frame;
};
export const POSTER_FRAME = B6.holdStart + 20;
const sheet = (C: React.ComponentType) => () => (
  <FontsGate>
    <C />
  </FontsGate>
);
const still = { width: 1920, height: 1080 } as const;
export const Root = () => (
  <>
    <Composition id="BankrateMotionStudy" component={Movie} {...VIDEO} />
    <Still id="StyleFrame-01" component={at(B2.coins + 40)} {...still} />
    <Still id="StyleFrame-03" component={at(B4.tilesIn + 40)} {...still} />
    <Still id="StyleFrame-05" component={at(POSTER_FRAME)} {...still} />
    <Still id="BankrateMotionPoster" component={at(POSTER_FRAME)} {...still} />
    <Still id="Primitives" component={sheet(PrimitiveSheet)} {...still} />
    <Still id="RigRegression" component={sheet(RigRegression)} {...still} />
    <Still
      id="CompareLabel"
      component={(p: { text: string; sub: string }) => (
        <FontsGate>
          <CompareLabel {...p} />
        </FontsGate>
      )}
      width={960}
      height={64}
      defaultProps={{ text: "v1", sub: "" }}
    />
  </>
);
