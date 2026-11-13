// The four easing curves, dependency-free so the landing page can share
// them without bundling Remotion. motion.ts re-exports these for the film.
export const EASE = {
  enter: [0.23, 1, 0.32, 1], // strong ease-out: things arriving
  move: [0.77, 0, 0.175, 1], // strong ease-in-out: on-screen moves, camera
  exit: [0.55, 0, 1, 0.45], // ease-in: ONLY things leaving frame or falling
  draw: [0.65, 0, 0.35, 1], // line and stroke draws
} as const;
