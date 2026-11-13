import { AbsoluteFill, Composition, Sequence, Still } from "remotion";
import { VIDEO, C } from "./constants";
import { FontsGate } from "./components/EditorialText";
import {
  NineOfTen,
  StructuralProblem,
  Resolution,
  PrimitiveSheet,
} from "./scenes/StyleFrames";
import {
  ColdOpen,
  RecurringCost,
  CompetitionReveal,
} from "./scenes/RemainingScenes";
const PrevalenceFrame = () => (
  <FontsGate>
    <NineOfTen still />
  </FontsGate>
);
const StructureFrame = () => (
  <FontsGate>
    <StructuralProblem still />
  </FontsGate>
);
const ResolutionFrame = () => (
  <FontsGate>
    <Resolution still />
  </FontsGate>
);
const PrimitivesFrame = () => (
  <FontsGate>
    <PrimitiveSheet />
  </FontsGate>
);
// All six scenes use the approved 630-frame timeline.
const Draft = () => (
  <FontsGate>
    <AbsoluteFill style={{ background: C.paper }}>
      <Sequence from={0} durationInFrames={96} premountFor={30}>
        <ColdOpen />
      </Sequence>
      <Sequence from={72} durationInFrames={114} premountFor={30}>
        <NineOfTen />
      </Sequence>
      <Sequence from={186} durationInFrames={105} premountFor={30}>
        <RecurringCost />
      </Sequence>
      <Sequence from={291} durationInFrames={105} premountFor={30}>
        <StructuralProblem />
      </Sequence>
      <Sequence from={396} durationInFrames={156} premountFor={30}>
        <CompetitionReveal />
      </Sequence>
      <Sequence from={540} durationInFrames={90} premountFor={30}>
        <Resolution />
      </Sequence>
    </AbsoluteFill>
  </FontsGate>
);
export const Root = () => (
  <>
    <Composition id="BankrateMotionStudy" component={Draft} {...VIDEO} />
    <Still
      id="StyleFrame-01"
      component={PrevalenceFrame}
      width={1920}
      height={1080}
    />
    <Still
      id="StyleFrame-03"
      component={StructureFrame}
      width={1920}
      height={1080}
    />
    <Still
      id="StyleFrame-05"
      component={ResolutionFrame}
      width={1920}
      height={1080}
    />
    <Still
      id="BankrateMotionPoster"
      component={ResolutionFrame}
      width={1920}
      height={1080}
    />
    <Still
      id="Primitives"
      component={PrimitivesFrame}
      width={1920}
      height={1080}
    />
  </>
);
