// Pose library for the articulated DrawnPerson. Angles in degrees (positive =
// clockwise on screen). Rest pose is all zeros, so it reproduces v1 exactly.

export type Pose = {
  bodyY: number; // px in the 130×230 viewBox; positive sinks the body
  squash: number; // 1 = none; 0.95 squashes 5% (width compensates)
  lean: number; // whole-body tilt around the feet
  torso: number; // upper body around the hip centre
  head: number;
  armL: number; // viewer's left arm; positive swings it outward/up-left
  armR: number; // viewer's right arm; negative swings it outward/up-right
  legL: number;
  legR: number;
};

export const rest: Pose = {
  bodyY: 0,
  squash: 1,
  lean: 0,
  torso: 0,
  head: 0,
  armL: 0,
  armR: 0,
  legL: 0,
  legR: 0,
};

const keys = Object.keys(rest) as (keyof Pose)[];
export const blend = (a: Pose, b: Pose, t: number): Pose =>
  Object.fromEntries(keys.map((k) => [k, a[k] + (b[k] - a[k]) * t])) as Pose;
/** Additive layer: offsets `b` from rest, scaled by t, added onto `a`. */
export const add = (a: Pose, b: Partial<Pose>, t = 1): Pose =>
  Object.fromEntries(
    keys.map((k) => [k, a[k] + ((b[k] ?? rest[k]) - rest[k]) * t]),
  ) as Pose;

/**
 * 8-frame step (16-frame stride). Contact = legs widest, body lowest;
 * passing = legs together, body 3px higher. `dir` 1 walks right.
 */
export const walk = (t: number, dir: 1 | -1 = 1): Pose => {
  const s = Math.sin((2 * Math.PI * t) / 16);
  return {
    ...rest,
    bodyY: -3 * (1 - Math.abs(s)),
    lean: 3 * dir,
    head: -2 * dir,
    legL: 15 * s,
    legR: -15 * s,
    armL: -9 * s,
    armR: -9 * s,
  };
};

export const stepBack: Pose = {
  ...rest,
  bodyY: 2,
  lean: -4,
  head: 7,
  legL: 7,
  legR: -5,
  armL: 6,
  armR: 4,
};
export const slump: Pose = {
  ...rest,
  bodyY: 5,
  squash: 0.98,
  torso: 2,
  head: 9,
  armL: -3,
  armR: 3,
};
export const crouch: Pose = {
  ...rest,
  bodyY: 14,
  squash: 0.9,
  head: -4,
  armL: 18,
  armR: -18,
  legL: 7,
  legR: -7,
};
export const fall: Pose = {
  ...rest,
  bodyY: -4,
  head: -8,
  armL: 150,
  armR: -140,
  legL: 12,
  legR: -18,
};
/** Drifting in the dark: arms loose and out, head bowed. */
export const adrift: Pose = {
  ...rest,
  bodyY: -2,
  torso: -3,
  head: 10,
  armL: 58,
  armR: -48,
  legL: 10,
  legR: -16,
};
export const land: Pose = {
  ...rest,
  bodyY: 6,
  squash: 0.95,
  armL: 24,
  armR: -24,
  legL: 6,
  legR: -6,
};
export const hop: Pose = {
  ...rest,
  bodyY: -6,
  armL: 28,
  armR: -28,
  legL: -8,
  legR: 8,
};
export const leanIn: Pose = {
  ...rest,
  lean: 7,
  torso: 3,
  head: 6,
};
/** Right arm reaching out toward the winning tile. */
export const reach: Pose = {
  ...leanIn,
  armR: -78,
  armL: 8,
};
/** Right arm carrying the document, bent forward at a natural angle. */
export const hold: Pose = {
  ...rest,
  armR: -26,
};
