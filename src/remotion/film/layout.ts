// World layout and per-frame choreography. Pure functions of the frame, so
// every layer (and any still) reads the same state.
import { B1, B2, B3, B4, B5, B6 } from "../timeline";
import type { CHIP } from "../constants";
import {
  along,
  arc,
  bend,
  DUR,
  ease,
  mix,
  springAt,
  SPRING,
  tween,
  type Pt,
} from "../motion";
import {
  add,
  blend,
  crouch,
  fall,
  adrift,
  hold,
  hop,
  land,
  reach,
  rest,
  slump,
  stepBack,
  walk,
  type Pose,
} from "../components/poses";
import { boxToWorld, handInBox, type PersonVariant } from "../components/rig";

// ── World constants ────────────────────────────────────────────────────────
export const HERO = {
  size: 460,
  variant: "straight" as PersonVariant,
  seed: 2,
};
const K = HERO.size / 400; // scale relative to the first layout pass
export const G1 = 840; // ground, beats 1–3
export const G5 = 900; // ground, beats 5–6
export const HERO_X1 = 680;
export const SPACING = 250; // crowd spacing
/** Beat 3 frames the hero at screen x 1450. The camera then holds, so for
 * beats 3–5 world x = screen x − OFF. */
const CAM3 = { cx: HERO_X1 - 490, cy: 540, s: 1 };
export const OFF = 960 - CAM3.cx;
export const sx = (screenX: number) => screenX - OFF;

// ── Props ─────────────────────────────────────────────────────────────────
export const BOX = 112;
export const BOX_STEP = 123;
export const STACKS = [2, 3, 2]; // boxes per column, left to right
export const HOUSE_W = 360;
const heroHalf = (HERO.size * 65) / 230;
export const BOXES1_X = HERO_X1 + heroHalf + 50;
export const HOUSE1 = { x: BOXES1_X + 3 * BOX_STEP + 70, w: HOUSE_W };
// Beat 6 restages the same wall between the hero and home.
export const HERO_X6 = 960 - OFF;
export const BOXES6_X = HERO_X6 + heroHalf + 40;
export const HOUSE6 = { x: BOXES6_X + 3 * BOX_STEP + 80, w: HOUSE_W };
export const HERO_X6_END = HOUSE6.x - heroHalf + 8;
const CAM6 = {
  cx: (HERO_X6_END - heroHalf + HOUSE6.x + HOUSE_W) / 2,
  cy: G5 - 100,
  s: 1,
};

// ── Camera ────────────────────────────────────────────────────────────────
type Cam = { cx: number; cy: number; s: number };
const CAMS: { at: number; dur: number; to: Cam }[] = [
  {
    at: B2.camera.start,
    dur: B2.camera.dur,
    to: { cx: HERO_X1 + 1.5 * SPACING, cy: 407, s: 0.6 },
  },
  { at: B3.camera.start, dur: B3.camera.dur, to: CAM3 },
  // Beat 6: tilt up while the flood recedes (one transition), then pan
  // with the walk so the hero arrives at a centred final composition.
  { at: B6.recede, dur: 22, to: { cx: CAM3.cx, cy: CAM6.cy, s: 1 } },
  { at: B6.camera.start, dur: B6.camera.dur, to: CAM6 },
];
export const camera = (f: number): Cam => {
  let c: Cam = { cx: 960, cy: 540, s: 1 };
  for (const k of CAMS) {
    const t = tween(f, k.at, k.dur, "move");
    c = {
      cx: mix(c.cx, k.to.cx, t),
      cy: mix(c.cy, k.to.cy, t),
      s: mix(c.s, k.to.s, t),
    };
  }
  return c;
};

/** Rise frame per box, or -1 if it is already standing at frame 0. */
export const boxStart = (col: number, row: number) => {
  if (row === 0) return -1;
  const order = [
    [0, 1],
    [1, 1],
    [2, 1],
    [1, 2],
  ].findIndex(([c, r]) => c === col && r === row);
  return B1.boxRise[order];
};

// ── Crowd (beat 2) ────────────────────────────────────────────────────────
const SIZES = [400, 379, 426, 400, 368, 412, 380, 420, 394, 408].map(
  (v) => v * K,
);
const VARIANTS: PersonVariant[] = [
  "lean-left",
  "wide",
  "compact",
  "straight",
  "lean-right",
  "straight",
  "wide",
  "lean-left",
  "compact",
  "lean-right",
];
const SEEDS = [3, 1, 4, 2, 5, 0, 1, 3, 5, 4];
export const crowdX = (i: number) => HERO_X1 + (i - B2.heroIndex) * SPACING;
const entranceOrder = Array.from({ length: 10 }, (_, i) => i)
  .filter((i) => i !== B2.heroIndex)
  .sort(
    (a, b) => Math.abs(a - B2.heroIndex) - Math.abs(b - B2.heroIndex) || a - b,
  );
export const overpayers = Array.from({ length: 10 }, (_, i) => i).filter(
  (i) => i !== B2.spared,
);
export const coinStart = (i: number) => B2.coins + overpayers.indexOf(i) * 3;
export const coinLand = (i: number) => coinStart(i) + B2.coinFlight;

export type CrowdMember = {
  i: number;
  x: number;
  y: number;
  size: number;
  variant: PersonVariant;
  seed: number;
  pose: Pose;
  scale: number;
  opacity: number;
};
export const crowd = (f: number): CrowdMember[] =>
  entranceOrder.map((i) => {
    const start = B2.crowdIn + entranceOrder.indexOf(i) * 3;
    const t = tween(f, start, B2.hop, "move");
    const side = i < B2.heroIndex ? -1 : 1;
    const p = along(
      arc({ x: crowdX(i) + side * 90, y: G1 }, { x: crowdX(i), y: G1 }, 40),
      t,
    );
    let pose = blend(rest, hop, Math.sin(Math.PI * t));
    const landed = start + B2.hop;
    if (f >= landed)
      pose = add(pose, land, 1 - springAt(f, landed, SPRING.settle));
    if (i !== B2.spared) pose = add(pose, slump, springAt(f, coinLand(i)));
    const tint = mix(1, 0.12, tween(f, B3.camera.start, 18, "move"));
    return {
      i,
      x: p.x,
      y: p.y,
      size: SIZES[i],
      variant: VARIANTS[i],
      seed: SEEDS[i],
      pose,
      scale: mix(0.92, 1, tween(f, start, B2.hop, "enter")),
      opacity: tween(f, start, DUR.short, "enter") * tint,
    };
  });

// ── Coins ─────────────────────────────────────────────────────────────────
export const COIN_R = 28;
export const COIN_TH = 11;
const coinRest = (x: number) => ({ x: x + 118, y: G1 - 20 });
export type CoinState = {
  x: number;
  y: number;
  tilt: number;
  scale: number;
  opacity: number;
};
const flight = (
  f: number,
  start: number,
  dur: number,
  from: Pt,
  to: Pt,
  apex: number,
  bounce = 8,
): CoinState => {
  const t = Math.max(0, Math.min(1, (f - start) / dur));
  // Projectile: uniform horizontal speed, parabolic height (gravity).
  const x = mix(from.x, to.x, t);
  let y = mix(from.y, to.y, t) - 4 * apex * t * (1 - t);
  const u = (f - start - dur) / 6;
  if (u > 0 && u < 1) y -= bounce * 4 * u * (1 - u);
  const pop = tween(f, start, 4, "enter");
  return {
    x,
    y,
    tilt: tween(f, start + dur - 3, 4, "enter"),
    scale: mix(0.92, 1, pop),
    opacity: pop,
  };
};
export const crowdCoin = (f: number, i: number, member: CrowdMember) => {
  const s = coinStart(i);
  if (f < s) return null;
  const chest = { x: member.x, y: G1 - member.size * 0.55 };
  return flight(f, s, B2.coinFlight, chest, coinRest(member.x), 90);
};
/** Beat 3: coins stream from the hero into a stack on the hero's coin. */
export const streamCoins = (f: number) =>
  B3.coinStream
    .map((s, j) => {
      if (f < s) return null;
      const base = coinRest(HERO_X1);
      return flight(
        f,
        s,
        B3.coinFlight,
        { x: HERO_X1 + 20, y: G1 - HERO.size * 0.55 },
        { x: base.x, y: base.y - (j + 1) * COIN_TH },
        60,
        4,
      );
    })
    .filter((c): c is CoinState => c !== null);

// ── Hero ──────────────────────────────────────────────────────────────────
export type HeroState = { x: number; y: number; rotate: number; pose: Pose };
const FLOAT = { x: sx(1000), y: 760 };
const STAND5 = { x: HERO_X6, y: G5 };

export const hero = (f: number): HeroState => {
  // Beat 1: walk in, stop short, half-step back.
  const walkT = tween(f, -30, 30 + B1.walkEnd, "move");
  let x = mix(476, HERO_X1 + 16, walkT);
  let pose = walk((x - 476) / 7.5);
  pose = blend(pose, rest, tween(f, B1.walkEnd - 6, 6, "enter"));
  const back = springAt(f, B1.stepBack, SPRING.settle);
  pose = add(pose, stepBack, back);
  x -= 16 * tween(f, B1.stepBack, 10, "move");
  pose = add(pose, stepBack, -tween(f, B2.camera.start, 16, "move"));
  let y = G1;
  let rotate = 0;
  // Beat 2: slump when the coin lands.
  pose = add(pose, slump, springAt(f, coinLand(B2.heroIndex)));
  // Beat 3: sink a little more with every coin on the stack.
  B3.coinStream.forEach((s) => {
    pose = add(pose, { bodyY: 2 }, springAt(f, s + B3.coinFlight));
  });
  // Beat 4: crouch (anticipation), fall into the portal, float in the dark.
  pose = blend(pose, crouch, tween(f, B4.crouch, 8, "move"));
  pose = blend(pose, fall, tween(f, B4.fall, 10, "move"));
  pose = blend(pose, adrift, tween(f, B4.float, 32, "move"));
  y += 230 * tween(f, B4.fall, B4.fallDur, "exit");
  const g = tween(f, B4.float, 32, "move");
  if (g > 0) {
    const p = along(arc({ x, y }, FLOAT, 120), g);
    x = p.x;
    y = p.y + 8 * Math.sin((2 * Math.PI * Math.max(0, f - B4.float - 32)) / 70);
    rotate = -10 * g;
  }
  // Beat 5: land upright in the centre as the flood arrives.
  const l = tween(f, B5.flood, B5.land - B5.flood, "move");
  if (l > 0) {
    const from = { x, y };
    const p = along(arc(from, STAND5, 40), l);
    x = p.x;
    y = p.y;
    rotate = mix(rotate, 0, l);
    pose = blend(pose, land, l);
    pose = blend(pose, rest, springAt(f, B5.land, SPRING.settle));
  }
  // React: dip, then lean in and reach for the winning tile.
  pose = add(
    pose,
    crouch,
    0.35 * Math.sin(Math.PI * tween(f, B5.react, 8, "move")),
  );
  pose = blend(pose, reach, springAt(f, B5.react + 6, SPRING.settle));
  // Handoff: the arm brings the document in.
  const h0 = B5.handoff.start + 18;
  pose = blend(pose, hold, tween(f, h0, 14, "move"));
  // Beat 6: walk to the house holding the document.
  const w = tween(f, B6.walk.start, B6.walk.dur, "move");
  if (w > 0) {
    x = mix(STAND5.x, HERO_X6_END, w);
    const stride = walk((x - STAND5.x) / 7.5);
    const walking = Math.sin(Math.PI * w);
    pose = blend(
      hold,
      { ...stride, armR: hold.armR },
      Math.min(1, walking * 2),
    );
    y = G5 - 6 * Math.sin(Math.PI * w);
    pose = blend(
      pose,
      hold,
      tween(f, B6.walk.start + B6.walk.dur - 4, 10, "enter"),
    );
  }
  return { x, y, rotate, pose };
};

export const heroHand = (s: HeroState) =>
  boxToWorld(
    { x: s.x, y: s.y, size: HERO.size, rotate: s.rotate },
    handInBox(s.pose, "R", HERO.variant),
  );

// ── Rate tiles (beats 4–5) ────────────────────────────────────────────────
type TileDef = {
  id: string;
  chip: keyof typeof CHIP;
  dark: {
    x: number;
    y: number;
    s: number;
    rz: number;
    ry: number;
    blur: number;
  };
};
export const TILES: TileDef[] = [
  {
    id: "A",
    chip: "yellow",
    dark: { x: 1340, y: 400, s: 0.8, rz: -7, ry: 26, blur: 0 },
  },
  {
    id: "B",
    chip: "gray",
    dark: { x: 1660, y: 420, s: 0.6, rz: 10, ry: -24, blur: 1.6 },
  },
  {
    id: "C",
    chip: "purple",
    dark: { x: 1700, y: 790, s: 0.92, rz: 4, ry: 30, blur: 0 },
  },
  {
    id: "D",
    chip: "sky",
    dark: { x: 560, y: 830, s: 0.72, rz: -9, ry: -28, blur: 0.8 },
  },
  {
    id: "E",
    chip: "blue",
    dark: { x: 330, y: 560, s: 0.6, rz: 8, ry: 24, blur: 1.6 },
  },
  {
    id: "F",
    chip: "green",
    dark: { x: 900, y: 990, s: 0.66, rz: -5, ry: -30, blur: 1 },
  },
];
/** Rank slots (screen centres). The right column, inside the hero's reach,
 * holds the three best rates; the middle row sits closest to the hero. */
export const SLOTS: Pt[] = [
  { x: 1260, y: 640 }, // 0 right-middle: the hero's hand
  { x: 1300, y: 810 },
  { x: 1300, y: 470 },
  { x: 660, y: 640 },
  { x: 620, y: 810 },
  { x: 620, y: 470 },
];
// Rates per round (index 0 = as the tiles snap in). Illustrative only.
export const RATES: Record<string, number[]> = {
  A: [6.48, 6.44, 6.39, 6.36],
  B: [6.21, 6.19, 6.17, 6.15],
  C: [6.93, 6.88, 6.81, 6.77],
  D: [6.35, 6.31, 6.28, 6.26],
  E: [6.77, 6.4, 6.22, 5.98],
  F: [6.62, 6.58, 6.49, 6.45],
};
export const WINNER = "E";
const rankAt = (id: string, round: number) =>
  Object.keys(RATES)
    .sort((a, b) => RATES[a][round] - RATES[b][round])
    .indexOf(id);

export type TileState = {
  id: string;
  chip: TileDef["chip"];
  x: number;
  y: number;
  scale: number;
  rz: number;
  ry: number;
  blur: number;
  opacity: number;
  rateFrom: number;
  rateTo: number;
  roll: number;
};
export const tile = (f: number, def: TileDef, index: number): TileState => {
  const d = def.dark;
  // Beat 4: drift idle in the dark, each turned slightly away.
  const enter = tween(f, B4.tilesIn + index * 3, 16, "enter");
  const phase = index * 1.7;
  const drift = Math.sin((2 * Math.PI * (f - B4.tilesIn)) / 96 + phase);
  let x = d.x;
  let y = d.y + 8 * drift + 12 * (1 - enter);
  let scale = d.s * Math.min(1, 0.92 + 0.08 * enter);
  let rz = d.rz + 1.5 * drift;
  let ry = d.ry;
  let blur = d.blur;
  let opacity = enter * (d.blur > 1 ? 0.82 : 1);
  // Beat 5: the flood pulls each tile into its slot, nearest the hero first.
  const dist = Math.hypot(d.x - 1000, d.y - 640);
  const snapStart = B5.tilesSnap + Math.round(dist / 160) * 3;
  const snap = tween(f, snapStart, 16, "enter");
  let rank = rankAt(def.id, 0);
  let slot = SLOTS[rank];
  if (snap > 0) {
    const p = along(arc({ x, y }, slot, 60), snap);
    x = p.x;
    y = p.y;
    scale = mix(scale, 1, snap);
    rz = mix(rz, 0, snap);
    ry = mix(ry, 0, snap);
    blur = mix(blur, 0, snap);
    opacity = mix(opacity, 1, snap);
  }
  // Three competition rounds, each faster than the last.
  let rateFrom = RATES[def.id][0];
  let rateTo = rateFrom;
  let roll = 1;
  B5.rounds.forEach((r, i) => {
    if (f < r.start) return;
    rateFrom = RATES[def.id][i];
    rateTo = RATES[def.id][i + 1];
    roll = tween(f, r.start, 6, "move");
    const next = rankAt(def.id, i + 1);
    if (next !== rank) {
      const from = SLOTS[rank];
      const to = SLOTS[next];
      const crossing = Math.sign(from.x - 960) !== Math.sign(to.x - 960);
      // Improving tiles arc up/outward in front; losing tiles dip
      // down/inward, behind, so paths never collide.
      const better = next < rank;
      const outward = from.x < 960 ? -4000 : 6000;
      const toward = crossing
        ? { x: 960, y: better ? -4000 : 6000 }
        : { x: better ? outward : 960, y: (from.y + to.y) / 2 };
      // Crossings: the improving tile leaps clear over the hero's head and
      // the losing tile leaves a beat later. Same-column swaps pass on
      // opposite arcs at the same time, with a touch of scale for depth.
      const delay = crossing && !better ? 4 : 0;
      const t = tween(f, r.start + 3 + delay, r.dur - 4 - delay, "move");
      const amount = crossing ? (better ? 560 : 150) : better ? 170 : 110;
      const p = along(bend(from, to, amount, toward), t);
      x = p.x;
      y = p.y;
      if (!crossing)
        scale *= 1 + (better ? 0.03 : -0.03) * Math.sin(Math.PI * t);
      rank = next;
      slot = to;
    }
  });
  // Winner beat: everyone else steps back.
  if (def.id !== WINNER) {
    opacity *= mix(1, 0.45, tween(f, B5.outline, 10, "enter"));
    const out = tween(f, B5.othersExit + index * 2, 14, "exit");
    opacity *= 1 - out;
    y += 14 * out;
    scale *= mix(1, 0.96, out);
  }
  return {
    id: def.id,
    chip: def.chip,
    x: sx(x),
    y,
    scale,
    rz,
    ry,
    blur,
    opacity,
    rateFrom,
    rateTo,
    roll,
  };
};

/** Winner pop: dip to 0.97, spring up past 1.04, settle at 1.0. */
export const winnerScale = (f: number) => {
  const dip = tween(f, B5.winner, 3, "move");
  const p = springAt(f, B5.winner + 3, SPRING.pop);
  const hump = Math.sin(Math.PI * tween(f, B5.winner + 3, 12, "move"));
  return {
    scale: mix(1, 0.97, dip) * (1 - p) + p * (1 + 0.04 * hump),
    lift: -10 * p,
  };
};

/** Eased value helper for components that need raw curve access. */
export const curve = ease;
