// Single source of motion truth. Every animated value in the film is built
// from these tokens; no scene defines its own curve.
import { Easing, interpolate, measureSpring, spring } from "remotion";

import { EASE } from "./ease.ts";
export { EASE };
export const DUR = {
  micro: 6,
  short: 10,
  base: 16,
  medium: 22,
  long: 30,
} as const; // frames @30fps
export const STAGGER = { word: 3, item: 2, crowd: 3 } as const;
export const SPRING = {
  settle: { damping: 16, mass: 0.8, stiffness: 160 }, // ≤5% overshoot
  pop: { damping: 12, mass: 0.6, stiffness: 200 },
} as const;

export type EaseName = keyof typeof EASE;
const curves = Object.fromEntries(
  Object.entries(EASE).map(([k, [a, b, c, d]]) => [
    k,
    Easing.bezier(a, b, c, d),
  ]),
) as Record<EaseName, (t: number) => number>;

export const ease = (name: EaseName, t: number) =>
  curves[name](Math.max(0, Math.min(1, t)));

/** 0→1 over [start, start+dur] with the named curve, clamped both ends. */
export const tween = (
  frame: number,
  start: number,
  dur: number,
  curve: EaseName,
) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: curves[curve],
  });

type SpringConfig = { damping: number; mass: number; stiffness: number };
const settleCache = new Map<string, number>();
/** Frames until a spring stays within 0.002 of rest (measured once). */
const settleFrames = (config: SpringConfig, fps: number) => {
  const key = `${config.damping}/${config.mass}/${config.stiffness}/${fps}`;
  if (!settleCache.has(key))
    settleCache.set(key, measureSpring({ fps, config, threshold: 0.002 }));
  return settleCache.get(key)!;
};
/**
 * Spring from 0→1 starting at `start`. Latches to exactly 1 once the spring
 * has settled for good, so holds are pixel-identical.
 */
export const springAt = (
  frame: number,
  start: number,
  config: SpringConfig = SPRING.settle,
  fps = 30,
) => {
  if (frame <= start) return 0;
  if (frame - start >= settleFrames(config, fps)) return 1;
  return spring({ frame: frame - start, fps, config });
};

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export type Pt = { x: number; y: number };
export type Arc = { from: Pt; to: Pt; ctrl: Pt };
/** Quadratic arc between two points with the control point lifted by `lift`. */
export const arc = (from: Pt, to: Pt, lift: number): Arc => ({
  from,
  to,
  ctrl: {
    x: (from.x + to.x) / 2,
    y: Math.min(from.y, to.y) - lift,
  },
});
export const along = ({ from, to, ctrl }: Arc, t: number): Pt => {
  const u = 1 - t;
  return {
    x: u * u * from.x + 2 * u * t * ctrl.x + t * t * to.x,
    y: u * u * from.y + 2 * u * t * ctrl.y + t * t * to.y,
  };
};

/** Minimum on-screen frames for a line: words ÷ 3.5 words/s + 0.5s. */
export const readFrames = (text: string, fps = 30) => {
  const words = text.replace(/\*\*/g, "").trim().split(/\s+/).length;
  return Math.ceil((words / 3.5 + 0.5) * fps);
};

/** Crossfade helper: blur peaks (≤6px) at the midpoint of a 0→1 crossfade. */
export const crossBlur = (t: number, peak = 4) =>
  Math.min(6, peak) * Math.sin(Math.PI * Math.max(0, Math.min(1, t)));

/** Arc whose control point is pushed `amount` px off the chord's midpoint,
 * toward `toward` (e.g. up for crossings, outward for column moves). */
export const bend = (from: Pt, to: Pt, amount: number, toward: Pt): Arc => {
  const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  let nx = -dy / len;
  let ny = dx / len;
  if (nx * (toward.x - mid.x) + ny * (toward.y - mid.y) < 0) {
    nx = -nx;
    ny = -ny;
  }
  return { from, to, ctrl: { x: mid.x + nx * amount, y: mid.y + ny * amount } };
};
