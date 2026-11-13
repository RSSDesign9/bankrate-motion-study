import type { CSSProperties, ReactNode } from "react";
import { C } from "../constants";
import { sans } from "../fonts";
import { rest, type Pose } from "./poses";
import {
  PIVOT,
  limbOps,
  opsToString,
  rootOps,
  torsoOps,
  type PersonVariant,
} from "./rig";

export { personVariants, type PersonVariant } from "./rig";

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
    opacity={progress <= 0 ? 0 : 1}
  />
);

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
const ARMS = [
  "M31 61 Q23 66 23 84 Q22 110 14 134 L25 138 Q36 111 35 82Z",
  "M94 62 Q105 68 105 86 L102 137 L91 137 Q94 107 91 83Z",
];

/**
 * Hand-cut geometric figure, articulated at neck, shoulders, hips and feet.
 * With the rest pose it draws exactly the v1 silhouette.
 */
export const DrawnPerson = ({
  variant = "straight",
  color = C.blue,
  detailColor = C.paper,
  pose = rest,
  progress = 1,
  seed = 0,
  style,
}: {
  variant?: PersonVariant;
  color?: string;
  detailColor?: string;
  pose?: Pose;
  progress?: number;
  seed?: number;
  style?: CSSProperties;
}) => {
  const hair = hairstyles[seed % hairstyles.length];
  const skirt = seed % 2 === 1;
  const torso = skirt
    ? "M34 59 L88 58 L74 94 L100 139 L27 142 L52 96Z"
    : "M37 58 L88 59 L81 129 L43 130Z";
  const legs = skirt
    ? ["M44 147 L59 146 L54 217 L44 217Z", "M67 146 L82 145 L75 217 L65 217Z"]
    : ["M44 137 L59 137 L58 217 L43 217Z", "M67 137 L82 137 L85 217 L69 217Z"];
  return (
    <svg
      viewBox="0 0 130 230"
      style={{ overflow: "visible", ...style }}
      aria-hidden="true"
    >
      <g transform={opsToString(rootOps(pose, variant))}>
        <g
          style={{
            clipPath: `inset(0 0 ${(1 - Math.max(0, Math.min(1, progress))) * 100}% 0)`,
          }}
        >
          <g transform={opsToString(limbOps(pose.legL, PIVOT.hipL))}>
            <path d={legs[0]} fill={color} />
          </g>
          <g transform={opsToString(limbOps(pose.legR, PIVOT.hipR))}>
            <path d={legs[1]} fill={color} />
          </g>
          <g transform={opsToString(torsoOps(pose))}>
            <path d={torso} fill={color} />
            <g transform={opsToString(limbOps(pose.armL, PIVOT.shoulderL))}>
              <path d={ARMS[0]} fill={color} />
            </g>
            <g transform={opsToString(limbOps(pose.armR, PIVOT.shoulderR))}>
              <path d={ARMS[1]} fill={color} />
            </g>
            <g transform={opsToString(limbOps(pose.head, PIVOT.neck))}>
              <path d={hair.head} fill={color} />
              <DrawPath d={hair.detail} color={detailColor} width={2.4} />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};

/** Positions a DrawnPerson by its feet centre in world coordinates. */
export const Figure = ({
  x,
  y,
  size,
  rotate = 0,
  opacity = 1,
  children,
}: {
  x: number;
  y: number;
  size: number;
  rotate?: number;
  opacity?: number;
  children: (w: number, h: number) => ReactNode;
}) => {
  const h = size;
  const w = (size * 130) / 230;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: w,
        height: h,
        opacity,
        transformOrigin: `${w / 2}px ${(h * 217) / 230}px`,
        transform: `translate(${x - w / 2}px, ${y - (h * 217) / 230}px) rotate(${rotate}deg)`,
      }}
    >
      {children(w, h)}
    </div>
  );
};

export const DrawnHouse = ({
  progress = 1,
  color = C.navy,
  style,
}: {
  progress?: number;
  color?: string;
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
      <DrawPath key={i} d={d} color={color} width={5} progress={progress} />
    ))}
  </svg>
);
/** House geometry: ground sits at 216/240 of the drawn height. */
export const HOUSE_GROUND = 216 / 240;

/**
 * 2.5D cube with a % mark, in the reference box style. `size` is the front
 * face; the top and side faces add `depth` up and to the right.
 */
export const PercentBox = ({
  size = 100,
  color = C.box,
  shade = C.boxShade,
  mark = C.white,
  style,
}: {
  size?: number;
  color?: string;
  shade?: string;
  mark?: string;
  style?: CSSProperties;
}) => {
  const s = 100;
  const d = 26;
  return (
    <svg
      viewBox={`0 0 ${s + d} ${s + d}`}
      width={(size * (s + d)) / s}
      height={(size * (s + d)) / s}
      style={{ overflow: "visible", ...style }}
      aria-hidden="true"
    >
      <path d={`M0 ${d} L${d} 0 L${s + d} 0 L${s} ${d}Z`} fill={color} />
      <path
        d={`M${s} ${d} L${s + d} 0 L${s + d} ${s} L${s} ${s + d}Z`}
        fill={shade}
      />
      <rect x={0} y={d} width={s} height={s} fill={color} />
      <path
        d={`M1 ${d} L${s} ${d} L${s + d - 1} 1`}
        stroke={C.white}
        strokeOpacity={0.22}
        strokeWidth={2}
        fill="none"
      />
      <g opacity={0.92}>
        <path
          d={`M${s / 2 + 11} ${d + 33} L${s / 2 - 11} ${d + 67}`}
          stroke={mark}
          strokeWidth={5.5}
          strokeLinecap="round"
        />
        <circle cx={s / 2 - 12} cy={d + 37} r={5.2} fill={mark} />
        <circle cx={s / 2 + 12} cy={d + 63} r={5.2} fill={mark} />
      </g>
    </svg>
  );
};
export const BOX_DEPTH = 0.26;

/**
 * Gold coin. tilt 0 = face-on (in flight), 1 = lying flat (landed/stacked).
 * Positioned by its centre.
 */
export const Coin = ({
  x,
  y,
  r = 24,
  tilt = 0,
  rotate = 0,
  scale = 1,
  opacity = 1,
}: {
  x: number;
  y: number;
  r?: number;
  tilt?: number;
  rotate?: number;
  scale?: number;
  opacity?: number;
}) => {
  const ry = r * (1 - 0.68 * tilt);
  const th = r * 0.42 * tilt;
  const ridges = Array.from({ length: 18 }, (_, i) => (i / 18) * Math.PI * 2);
  return (
    <svg
      width={r * 2 + 8}
      height={r * 2 + 8 + th}
      viewBox={`${-r - 4} ${-r - 4} ${r * 2 + 8} ${r * 2 + 8 + th}`}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        overflow: "visible",
        opacity,
        transform: `translate(${x - r - 4}px, ${y - r - 4}px) rotate(${rotate}deg) scale(${scale})`,
        transformOrigin: `${r + 4}px ${r + 4}px`,
      }}
      aria-hidden="true"
    >
      {th > 0.5 ? (
        <>
          <rect x={-r} y={0} width={r * 2} height={th} fill={C.coinShade} />
          <ellipse cx={0} cy={th} rx={r} ry={ry} fill={C.coinShade} />
        </>
      ) : null}
      <ellipse cx={0} cy={0} rx={r} ry={ry} fill={C.coin} />
      <ellipse
        cx={0}
        cy={0}
        rx={r * 0.68}
        ry={ry * 0.68}
        fill="none"
        stroke={C.coinShade}
        strokeWidth={2.6}
      />
      {ridges.map((a, i) => (
        <line
          key={i}
          x1={Math.cos(a) * r * 0.82}
          y1={Math.sin(a) * ry * 0.82}
          x2={Math.cos(a) * r * 0.94}
          y2={Math.sin(a) * ry * 0.94}
          stroke={C.coinShade}
          strokeWidth={1.6}
          strokeLinecap="round"
          opacity={0.75}
        />
      ))}
    </svg>
  );
};

/** Small storefront glyph for lender chips. */
const Building = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
    <path
      d="M2 8 L11 2 L20 8 M4 9 V19 M9 9 V19 M13 9 V19 M18 9 V19 M2 20 H20"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

/**
 * Odometer roll between two rates: changed digits roll up inside a mask.
 * `t` 0→1. Tabular figures keep the width fixed.
 */
export const RollingRate = ({
  from,
  to,
  t,
}: {
  from: number;
  to: number;
  t: number;
}) => {
  const a = from.toFixed(2);
  const b = to.toFixed(2);
  return (
    <span style={{ display: "inline-flex" }}>
      {b.split("").map((ch, i) => {
        const old = a[i];
        if (old === ch || t >= 1)
          return (
            <span key={i} style={{ display: "inline-block" }}>
              {t >= 1 ? ch : old}
            </span>
          );
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              overflow: "hidden",
              position: "relative",
              height: "1.1em",
              lineHeight: "1.1em",
            }}
          >
            <span
              style={{
                display: "block",
                transform: `translateY(${-t * 100}%)`,
              }}
            >
              {old}
            </span>
            <span
              style={{
                display: "block",
                position: "absolute",
                left: 0,
                top: 0,
                transform: `translateY(${(1 - t) * 100}%)`,
              }}
            >
              {ch}
            </span>
          </span>
        );
      })}
      <span>%</span>
    </span>
  );
};

export const TILE = { w: 330, h: 150, r: 22 } as const;
/** White rate tile with an illustrative rate and a coloured LENDER chip. */
export const RateTile = ({
  from,
  to,
  roll = 1,
  chip,
  contentOpacity = 1,
  contentBlur = 0,
}: {
  from: number;
  to: number;
  roll?: number;
  chip: string;
  contentOpacity?: number;
  contentBlur?: number;
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      opacity: contentOpacity,
      filter: contentBlur > 0.05 ? `blur(${contentBlur}px)` : undefined,
    }}
  >
    <div
      style={{
        fontFamily: sans.fontFamily,
        fontWeight: 700,
        fontSize: 58,
        lineHeight: "1.1em",
        letterSpacing: -0.5,
        color: C.navy,
        fontVariantNumeric: "tabular-nums",
        fontFeatureSettings: '"tnum" 1',
      }}
    >
      <RollingRate from={from} to={to} t={roll} />
    </div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: chip,
        color: C.white,
        borderRadius: 8,
        padding: "5px 14px 5px 10px",
        fontFamily: sans.fontFamily,
        fontWeight: 700,
        fontSize: 20,
        letterSpacing: 2.4,
      }}
    >
      <Building color={C.white} />
      LENDER
    </div>
  </div>
);

/** The resolution document the hero carries (v1's look). */
export const DOC = { w: 84, h: 112, r: 8 } as const;
export const DocumentFace = ({
  opacity = 1,
  check = 1,
}: {
  opacity?: number;
  check?: number;
}) => (
  <svg
    viewBox="0 0 80 108"
    style={{ position: "absolute", inset: 0, opacity }}
    aria-hidden="true"
  >
    <path
      d="M20 30 L60 30 M20 44 L53 44"
      fill="none"
      stroke={C.paper}
      strokeWidth={4}
      strokeLinecap="round"
    />
    <DrawPath
      d="M21 69 L30 79 L56 58"
      color={C.paper}
      width={4}
      progress={check}
    />
  </svg>
);

export const Underline = ({
  progress = 1,
  color = C.electric,
  style,
}: {
  progress?: number;
  color?: string;
  style?: CSSProperties;
}) => (
  <svg
    viewBox="0 0 700 40"
    preserveAspectRatio="none"
    style={{ overflow: "visible", ...style }}
    aria-hidden="true"
  >
    <DrawPath
      d="M8 26 Q278 2 686 18 M29 33 Q347 15 670 24"
      progress={progress}
      color={color}
      width={5}
    />
  </svg>
);
export const Loop = ({
  style,
  progress = 1,
  color = C.electric,
}: {
  style?: CSSProperties;
  progress?: number;
  color?: string;
}) => (
  <svg
    viewBox="0 0 350 110"
    preserveAspectRatio="none"
    style={{ overflow: "visible", ...style }}
    aria-hidden="true"
  >
    <DrawPath
      d="M280 14 C166 -9 12 7 13 57 C17 113 334 113 335 59 C336 18 254 8 226 17"
      progress={progress}
      color={color}
      width={4}
    />
  </svg>
);
