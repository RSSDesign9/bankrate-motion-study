import { AbsoluteFill } from "remotion";
import { C, CHIP } from "../constants";
import { sans } from "../fonts";
import {
  Coin,
  DOC,
  DocumentFace,
  DrawnHouse,
  DrawnPerson,
  Loop,
  PercentBox,
  RateTile,
  TILE,
  Underline,
  personVariants,
} from "../components/Primitives";
import {
  crouch,
  fall,
  hold,
  land,
  leanIn,
  reach,
  rest,
  slump,
  stepBack,
  walk,
  type Pose,
} from "../components/poses";

const Canvas = ({ children }: { children: React.ReactNode }) => (
  <AbsoluteFill
    style={{ background: C.paper, color: C.navy, fontFamily: sans.fontFamily }}
  >
    {children}
  </AbsoluteFill>
);

/** Exact replica of v1's figure row: rendered in rest pose for the
 * silhouette regression against docs/v2/baseline/v1-primitives.png. */
export const RigRegression = () => (
  <Canvas>
    {personVariants.map((variant, i) => (
      <div
        key={variant}
        style={{
          position: "absolute",
          left: 120 + i * 345,
          top: 177,
          width: 280,
        }}
      >
        <DrawnPerson
          variant={variant}
          seed={i}
          style={{ height: 300, width: 170 }}
        />
        <div style={{ marginTop: 20, fontSize: 27 }}>{variant}</div>
        <div
          style={{ display: "flex", gap: 35, alignItems: "end", marginTop: 30 }}
        >
          <DrawnPerson
            variant={variant}
            seed={i}
            style={{ height: 160, width: 90 }}
          />
          <DrawnPerson
            variant={variant}
            seed={i}
            style={{ height: 80, width: 45 }}
          />
        </div>
      </div>
    ))}
  </Canvas>
);

const POSES: [string, Pose][] = [
  ["rest", rest],
  ["walk · contact", walk(4)],
  ["walk · pass", walk(8)],
  ["stepBack", stepBack],
  ["slump", slump],
  ["crouch", crouch],
  ["fall", fall],
  ["land", land],
  ["leanIn", leanIn],
  ["reach", reach],
  ["hold", hold],
];

/** v2 drawing system: pose library and the new primitives. */
export const PrimitiveSheet = () => (
  <Canvas>
    <div
      style={{
        position: "absolute",
        left: 120,
        top: 70,
        fontSize: 24,
        fontWeight: 600,
        letterSpacing: 3,
      }}
    >
      DRAWING SYSTEM / v2 · POSE LIBRARY
    </div>
    {POSES.map(([name, pose], i) => (
      <div
        key={name}
        style={{ position: "absolute", left: 110 + i * 158, top: 150 }}
      >
        <DrawnPerson seed={2} pose={pose} style={{ height: 300, width: 170 }} />
        <div style={{ marginTop: 14, fontSize: 21, textAlign: "center" }}>
          {name}
        </div>
      </div>
    ))}
    <DrawnHouse
      style={{
        position: "absolute",
        left: 120,
        top: 640,
        width: 260,
        height: 240,
      }}
    />
    <div style={{ position: "absolute", left: 450, top: 690 }}>
      <PercentBox size={110} />
    </div>
    <div style={{ position: "absolute", left: 0, top: 0 }}>
      <Coin x={700} y={735} r={30} />
      <Coin x={700} y={830} r={30} tilt={1} />
    </div>
    <div
      style={{
        position: "absolute",
        left: 800,
        top: 690,
        width: TILE.w,
        height: TILE.h,
        borderRadius: TILE.r,
        background: C.tile,
        boxShadow: `0 0 0 2px ${C.border}`,
      }}
    >
      <RateTile from={6.48} to={6.48} chip={CHIP.blue} />
    </div>
    <div
      style={{
        position: "absolute",
        left: 1190,
        top: 700,
        width: DOC.w,
        height: DOC.h,
        borderRadius: DOC.r,
        background: C.blue,
        transform: "rotate(-8deg)",
      }}
    >
      <DocumentFace />
    </div>
    <Underline
      style={{
        position: "absolute",
        left: 1340,
        top: 700,
        width: 400,
        height: 30,
      }}
    />
    <Loop
      style={{
        position: "absolute",
        left: 1380,
        top: 780,
        width: 300,
        height: 100,
      }}
    />
  </Canvas>
);

/** Caption bar for the v1-vs-v2 comparison media (docs/v2). */
export const CompareLabel = ({ text, sub }: { text: string; sub: string }) => (
  <AbsoluteFill
    style={{
      background: C.navy,
      color: C.paper,
      fontFamily: sans.fontFamily,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 28px",
      fontSize: 26,
      fontWeight: 600,
    }}
  >
    <span>{text}</span>
    <span style={{ fontWeight: 400, opacity: 0.75, fontSize: 22 }}>{sub}</span>
  </AbsoluteFill>
);
