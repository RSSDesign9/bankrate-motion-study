import type { CSSProperties } from "react";
import { C } from "../constants";

export const DrawPath = ({
  d,
  progress = 1,
  color = C.electric,
  width = 5,
}: {
  d: string;
  progress?: number;
  color?: string;
  width?: number;
}) => (
  <path
    d={d}
    fill="none"
    stroke={color}
    strokeWidth={width}
    strokeLinecap="round"
    strokeLinejoin="round"
    pathLength={1}
    strokeDasharray={1}
    strokeDashoffset={1 - Math.max(0, Math.min(1, progress))}
  />
);
export type PersonVariant =
  "straight" | "lean-left" | "lean-right" | "wide" | "compact";
const variants = {
  straight: { lean: 0, width: 1, height: 1 },
  "lean-left": { lean: -4, width: 0.95, height: 1 },
  "lean-right": { lean: 4, width: 0.96, height: 1 },
  wide: { lean: 0, width: 1.12, height: 0.98 },
  compact: { lean: -2, width: 0.94, height: 0.93 },
} as const;
export const personVariants = Object.keys(variants) as PersonVariant[];
// Two original geometric body families; hairstyle and posture vary independently.
const hairstyles = [
  {
    head: "M48 42 L47 18 Q48 5 63 6 Q79 5 81 20 L80 43Z",
    detail: "M51 18 Q64 22 77 15",
  },
  {
    head: "M44 28 Q43 7 63 7 Q84 7 86 28 L81 46 Q64 54 47 44Z",
    detail: "M48 23 Q58 25 63 17 Q67 33 80 39",
  },
  {
    head: "M47 42 L45 22 Q43 13 52 11 Q55 1 65 7 Q77 0 82 12 Q91 16 82 26 L80 43Z",
    detail: "M50 24 Q61 28 75 21",
  },
  {
    head: "M46 27 Q45 9 64 8 Q84 8 83 29 Q79 49 61 47 Q47 46 46 27Z M80 28 Q95 20 104 37 Q93 50 82 40Z",
    detail: "M48 21 L61 19 Q63 31 79 38",
  },
  {
    head: "M47 24 Q47 9 62 8 Q81 6 83 25 L80 43 Q62 52 48 42Z M66 8 Q61 -2 72 0 Q84 0 78 12Z",
    detail: "M49 24 Q67 30 79 19",
  },
  {
    head: "M45 27 Q43 13 53 9 Q70 0 82 13 L85 35 L78 45 L48 43Z",
    detail: "M48 22 Q66 24 79 14",
  },
];
export const DrawnPerson = ({
  variant = "straight",
  color = C.blue,
  burden = 0,
  progress = 1,
  seed = 0,
  style,
}: {
  variant?: PersonVariant;
  color?: string;
  accentColor?: string;
  burden?: number;
  progress?: number;
  seed?: number;
  style?: CSSProperties;
}) => {
  const v = variants[variant];
  const hair = hairstyles[seed % hairstyles.length];
  const skirt = seed % 2 === 1;
  const torso = skirt
    ? "M34 59 L88 58 L74 94 L100 139 L27 142 L52 96Z"
    : "M37 58 L88 59 L81 129 L43 130Z";
  const legs = skirt
    ? ["M44 147 L59 146 L54 217 L44 217Z", "M67 146 L82 145 L75 217 L65 217Z"]
    : ["M44 137 L59 137 L58 217 L43 217Z", "M67 137 L82 137 L85 217 L69 217Z"];
  const arms = [
    "M31 61 Q23 66 23 84 Q22 110 14 134 L25 138 Q36 111 35 82Z",
    "M94 62 Q105 68 105 86 L102 137 L91 137 Q94 107 91 83Z",
  ];
  return (
    <svg
      viewBox="0 0 130 230"
      style={{ overflow: "visible", ...style }}
      aria-hidden="true"
    >
      <g
        transform={`translate(0 ${burden * 6}) rotate(${v.lean} 65 140) translate(${65 * (1 - v.width)} ${217 * (1 - v.height)}) scale(${v.width} ${v.height})`}
      >
        <g
          style={{
            clipPath: `inset(0 0 ${(1 - Math.max(0, Math.min(1, progress))) * 100}% 0)`,
          }}
        >
          <path d={hair.head} fill={color} />
          <DrawPath d={hair.detail} color={C.paper} width={2.4} />
          <path d={torso} fill={color} />
          {arms.map((d, i) => (
            <path key={"arm" + i} d={d} fill={color} />
          ))}
          {legs.map((d, i) => (
            <path key={"leg" + i} d={d} fill={color} />
          ))}
        </g>
      </g>
    </svg>
  );
};
export const DrawnHouse = ({
  progress = 1,
  style,
}: {
  progress?: number;
  style?: CSSProperties;
}) => (
  <svg viewBox="0 0 260 240" style={style} aria-hidden="true">
    {[
      "M19 110 L124 21 L238 106",
      "M43 97 L42 216 L220 215 L217 94",
      "M112 214 L113 153 L153 154 L156 214",
      "M66 123 L91 123 L92 149 L66 151Z",
      "M170 122 L197 120 L196 148 L171 148Z",
      "M177 61 L176 29 L204 31 L203 84",
    ].map((d, i) => (
      <DrawPath key={i} d={d} color={C.navy} width={5} progress={progress} />
    ))}
  </svg>
);
// Both equal-radius dots are a 180-degree pair around the slash midpoint (20, 30).
export const PercentGlyph = ({
  progress = 1,
  color = C.electric,
}: {
  progress?: number;
  color?: string;
}) => (
  <>
    <DrawPath d="M28 8 L12 52" width={3} color={color} progress={progress} />
    <g opacity={progress}>
      <circle cx={9} cy={15} r={2.2} fill={color} />
      <circle cx={31} cy={45} r={2.2} fill={color} />
    </g>
  </>
);
export const PaymentMark = ({
  progress = 1,
  style,
}: {
  progress?: number;
  style?: CSSProperties;
}) => (
  <svg viewBox="0 0 90 68" style={style} aria-hidden="true">
    <DrawPath
      d="M6 16 L47 17 M5 31 L42 30 M7 46 L37 46"
      color={C.navy}
      width={4}
      progress={progress}
    />
    <svg x={49} y={6} width={36} height={54} viewBox="0 0 40 60">
      <PercentGlyph progress={progress} />
    </svg>
  </svg>
);
export const Underline = ({
  progress = 1,
  style,
}: {
  progress?: number;
  style?: CSSProperties;
}) => (
  <svg viewBox="0 0 700 40" style={style} aria-hidden="true">
    <DrawPath
      d="M8 26 Q278 2 686 18 M29 33 Q347 15 670 24"
      progress={progress}
      width={5}
    />
  </svg>
);
export const Loop = ({
  style,
  progress = 1,
}: {
  style?: CSSProperties;
  progress?: number;
}) => (
  <svg viewBox="0 0 350 110" style={style} aria-hidden="true">
    <DrawPath
      d="M280 14 C166 -9 12 7 13 57 C17 113 334 113 335 59 C336 18 254 8 226 17"
      progress={progress}
      width={4}
    />
  </svg>
);
export const Burst = ({ style }: { style?: CSSProperties }) => (
  <svg viewBox="0 0 100 100" style={style} aria-hidden="true">
    <DrawPath d="M30 66 L12 55 M46 44 L39 17 M67 49 L84 25" width={5} />
  </svg>
);
export const BRUSH_PATHS = [
  "M52 -40 L1230 -40 L1230 1120 L23 1120 Q45 1052 25 995 Q8 936 20 863 C43 772 7 759 19 679 Q39 600 28 545 C5 476 33 461 31 394 Q12 324 37 266 C61 211 18 177 39 124 Q61 71 52 -40Z",
  "M-40 82 Q121 44 280 64 Q400 79 511 50 Q599 36 689 63 Q792 86 920 55 Q1044 30 1220 83 L1191 228 Q1091 233 991 224 Q896 205 817 225 Q681 250 589 237 Q490 214 402 233 Q312 255 196 238 Q74 221 -40 227Z",
];
export const BrushField = ({
  variant = 0,
  style,
  color = C.navy,
}: {
  variant?: 0 | 1;
  style?: CSSProperties;
  color?: string;
}) => (
  <svg
    viewBox={variant === 0 ? "0 0 1230 1080" : "0 0 1230 280"}
    preserveAspectRatio="none"
    style={style}
    aria-hidden="true"
  >
    <path d={BRUSH_PATHS[variant]} fill={color} />
  </svg>
);
export const OfferCard = ({
  label = "Rate A",
  selected = false,
  style,
}: {
  label?: string;
  selected?: boolean;
  style?: CSSProperties;
}) => (
  <div
    style={{
      width: 240,
      height: 280,
      background: C.paper,
      border: `${selected ? 5 : 2}px solid ${selected ? C.blue : C.border}`,
      borderRadius: 20,
      padding: "26px 28px",
      boxSizing: "border-box",
      color: C.navy,
      ...style,
    }}
  >
    <div style={{ fontSize: 27, fontWeight: 500 }}>{label}</div>
    <svg
      width="90"
      height="93"
      viewBox="0 0 90 93"
      style={{ marginTop: 24 }}
      aria-hidden="true"
    >
      <svg x={10} y={0} width={65} height={93} viewBox="0 0 40 60">
        <PercentGlyph color={C.blue} />
      </svg>
    </svg>
    <div style={{ fontSize: 22, marginTop: 18 }}>
      {selected ? "✓ Best rate" : "— — —"}
    </div>
  </div>
);
export const SafeFrame = () => (
  <div
    style={{
      position: "absolute",
      inset: 96,
      border: "2px dashed magenta",
      pointerEvents: "none",
    }}
  />
);
