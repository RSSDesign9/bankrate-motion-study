// Articulation for DrawnPerson. The same op lists produce both the SVG
// transform strings and the matrices used to find where a hand is, so props
// held by the hero always track the drawn arm.
import type { Pose } from "./poses";

export type PersonVariant =
  "straight" | "lean-left" | "lean-right" | "wide" | "compact";
export const variants = {
  straight: { lean: 0, width: 1, height: 1 },
  "lean-left": { lean: -4, width: 0.95, height: 1 },
  "lean-right": { lean: 4, width: 0.96, height: 1 },
  wide: { lean: 0, width: 1.12, height: 0.98 },
  compact: { lean: -2, width: 0.94, height: 0.93 },
} as const;
export const personVariants = Object.keys(variants) as PersonVariant[];

// Pivots in the 130×230 viewBox (feet rest on y=217).
export const PIVOT = {
  feet: [65, 217],
  hips: [63, 137],
  hipL: [51, 137],
  hipR: [75, 137],
  shoulderL: [33, 63],
  shoulderR: [94, 63],
  neck: [64, 50],
} as const;
export const HAND = { L: [19, 136], R: [97, 137] } as const;

type Op =
  | { t: "translate"; x: number; y: number }
  | { t: "rotate"; a: number; cx: number; cy: number }
  | { t: "scale"; x: number; y: number };
type M = [number, number, number, number, number, number];

const r = (n: number) => Math.round(n * 1000) / 1000;
export const opsToString = (ops: Op[]) =>
  ops
    .map((o) =>
      o.t === "translate"
        ? `translate(${r(o.x)} ${r(o.y)})`
        : o.t === "rotate"
          ? `rotate(${r(o.a)} ${o.cx} ${o.cy})`
          : `scale(${r(o.x)} ${r(o.y)})`,
    )
    .join(" ");

const mul = (a: M, b: M): M => [
  a[0] * b[0] + a[2] * b[1],
  a[1] * b[0] + a[3] * b[1],
  a[0] * b[2] + a[2] * b[3],
  a[1] * b[2] + a[3] * b[3],
  a[0] * b[4] + a[2] * b[5] + a[4],
  a[1] * b[4] + a[3] * b[5] + a[5],
];
const opToM = (o: Op): M => {
  if (o.t === "translate") return [1, 0, 0, 1, o.x, o.y];
  if (o.t === "scale") return [o.x, 0, 0, o.y, 0, 0];
  const rad = (o.a * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return mul(mul([1, 0, 0, 1, o.cx, o.cy], [c, s, -s, c, 0, 0]), [
    1,
    0,
    0,
    1,
    -o.cx,
    -o.cy,
  ]);
};
const opsToM = (ops: Op[]): M =>
  ops.reduce<M>((m, o) => mul(m, opToM(o)), [1, 0, 0, 1, 0, 0]);
const apply = (m: M, [x, y]: readonly [number, number]) =>
  [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]] as const;

export const rootOps = (pose: Pose, variant: PersonVariant): Op[] => {
  const v = variants[variant];
  const [fx, fy] = PIVOT.feet;
  const sy = pose.squash;
  const sx = 1 + (1 - sy) * 0.6;
  return [
    { t: "translate", x: 0, y: pose.bodyY },
    { t: "translate", x: fx, y: fy },
    { t: "scale", x: sx, y: sy },
    { t: "translate", x: -fx, y: -fy },
    { t: "rotate", a: pose.lean, cx: fx, cy: fy },
    { t: "rotate", a: v.lean, cx: 65, cy: 140 },
    { t: "translate", x: 65 * (1 - v.width), y: 217 * (1 - v.height) },
    { t: "scale", x: v.width, y: v.height },
  ];
};
export const torsoOps = (pose: Pose): Op[] => [
  { t: "rotate", a: pose.torso, cx: PIVOT.hips[0], cy: PIVOT.hips[1] },
];
export const limbOps = (
  angle: number,
  pivot: readonly [number, number],
): Op[] => [{ t: "rotate", a: angle, cx: pivot[0], cy: pivot[1] }];

/** Hand position in viewBox units. */
export const handInBox = (
  pose: Pose,
  side: "L" | "R",
  variant: PersonVariant = "straight",
) => {
  const arm =
    side === "L"
      ? limbOps(pose.armL, PIVOT.shoulderL)
      : limbOps(pose.armR, PIVOT.shoulderR);
  const m = opsToM([...rootOps(pose, variant), ...torsoOps(pose), ...arm]);
  return apply(m, HAND[side]);
};

/** A figure placed in the world: feet centre at (x, y), drawn `size` tall. */
export type Placement = {
  x: number;
  y: number;
  size: number;
  rotate?: number;
};
/** Converts a viewBox point to world coordinates for a placed figure. */
export const boxToWorld = (
  p: Placement,
  [bx, by]: readonly [number, number],
) => {
  const k = p.size / 230;
  const dx = (bx - 65) * k;
  const dy = (by - 217) * k;
  const a = ((p.rotate ?? 0) * Math.PI) / 180;
  return {
    x: p.x + dx * Math.cos(a) - dy * Math.sin(a),
    y: p.y + dx * Math.sin(a) + dy * Math.cos(a),
  };
};
