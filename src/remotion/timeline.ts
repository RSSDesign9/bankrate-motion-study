// Every beat boundary and cue frame (30fps). Scenes AND the audio scripts
// import this file, so picture and sound cannot drift apart.
// Plain, dependency-free TypeScript: Node runs it directly via type stripping.

export const FPS = 30;

export const BEAT = {
  b1: 0, // Buying a home is already complicated.
  b2: 74, // 9 out of 10 overpay
  b3: 178, // $3,343 every year
  b4: 282, // Lenders aren't made to compete
  b5: 388, // Bankrate makes lenders compete (hero beat)
  b6: 526, // You don't have to overpay
  b7: 655, // End slate
} as const;
export const DURATION = 703;

// Headline windows: `in` = first word starts, `out` = mask-up exit starts.
export const TEXT = {
  h1: { in: 6, out: 73 },
  h2: { in: 86, out: 179 },
  h3: { in: 188, count: 194, line: 204, out: 282 },
  h4: { in: 296, out: 389 },
  h5: { in: 398, secondary: 468, out: 526 },
  h6: { in: 570 },
  slate: { in: 666 },
} as const;

export const B1 = {
  walkEnd: 44,
  stepBack: 44,
  // Bottom row is already standing at frame 0; the rest rise on a stagger.
  boxRise: [8, 13, 18, 23] as const,
} as const;

export const B2 = {
  camera: { start: 74, dur: 20 },
  propsExit: 72,
  crowdIn: 86, // + order * STAGGER.crowd
  hop: 14,
  heroIndex: 3,
  spared: 7, // the one figure that does not overpay
  coins: 126, // + k * 3
  coinFlight: 16,
} as const;

export const B3 = {
  camera: { start: 178, dur: 22 },
  count: { start: 194, dur: 30 },
  coinStream: [196, 200, 204, 208, 213, 218] as const,
  coinFlight: 9,
  loop: { start: 234, dur: 11 },
} as const;

export const B4 = {
  crouch: 282,
  portalOpen: 282,
  fall: 290,
  fallDur: 14,
  portalFill: 294,
  tilesIn: 304,
  float: 306,
} as const;

export const B5 = {
  flood: 388,
  floodDur: 16,
  land: 398,
  tilesSnap: 398,
  rounds: [
    { start: 426, dur: 22 },
    { start: 448, dur: 16 },
    { start: 464, dur: 12 },
  ] as const,
  winner: 476,
  outline: 480,
  check: 488,
  loop: 492,
  react: 480,
  handoff: { start: 502, dur: 30 },
  othersExit: 502,
} as const;

// Beat 6: reveal → flatten (the ground line draws through the last of it)
// → walk home, with the camera tracking the walk. The headline starts a third of the way into
// the walk; its last word lands just after the hero settles;
// then everything holds still.
export const B6 = {
  recede: 526,
  recedeDur: 16,
  flatten: 548,
  ground: { start: 552, dur: 16 },
  camera: { start: 562, dur: 30 },
  walk: { start: 562, dur: 26 },
  underline: { start: 600, dur: 10 },
  holdStart: 610,
} as const;

export const B7 = {
  exit: 655,
  lines: [666, 669, 672] as const,
} as const;

// Music edit (Mixkit "Pop Parapop", 83.81 BPM). Track times in seconds,
// fitted to the beat grid. The bass entry (the lift) lands on the flood.
export const MUSIC = {
  file: "references/audio/mixkit-pop-parapop-855.mp3",
  beat: 0.7159,
  lift: 24.532, // bar where the bass enters
  splitAt: 27.396, // next bar: splice out here…
  resumeAt: 81.804, // …into the final phrase, so the ending lands on time
  finalBeatFrame: 603, // last strong beat of the ending, in film frames
} as const;
/** Track time playing at film frame 0. */
export const musicStart = () => MUSIC.lift - BEAT.b5 / FPS;

export type Sfx =
  | "tap"
  | "clink"
  | "ticker"
  | "settle"
  | "whoomp"
  | "air"
  | "swell"
  | "shuffle"
  | "shimmer"
  | "pop"
  | "swish"
  | "scribble"
  | "chime";

export type Cue = {
  frame: number;
  sfx: Sfx;
  gain: number; // dB relative to the sfx bus
  semitones?: number;
  pan?: number; // -1 left … 1 right
  duck?: boolean; // dip the music ~4dB under this cue
  label: string;
};

// Seeded ±2 semitone variation for the coin clinks.
const seeded = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const coinOrder = Array.from({ length: 10 }, (_, i) => i).filter(
  (i) => i !== B2.spared,
);

export const CUES: Cue[] = [
  ...B1.boxRise.map((f, i) => ({
    frame: f + 3,
    sfx: "tap" as const,
    gain: -4,
    semitones: [0, 3, -2, 5][i],
    label: `box ${i + 1} settles`,
  })),
  ...coinOrder.map((_, k) => ({
    frame: B2.coins + k * 3 + B2.coinFlight,
    sfx: "clink" as const,
    gain: -5 - (k % 3),
    semitones: Math.round((seeded(k) * 4 - 2) * 10) / 10,
    pan: Math.round((coinOrder[k] - 4.5) * 0.094 * 100) / 100,
    duck: true,
    label: `coin ${k + 1} lands`,
  })),
  {
    frame: B3.count.start,
    sfx: "ticker",
    gain: -6,
    label: "count-up ticker",
  },
  {
    frame: B3.count.start + B3.count.dur,
    sfx: "settle",
    gain: -6,
    label: "$3,343 lands",
  },
  {
    frame: B4.fall,
    sfx: "whoomp",
    gain: -3,
    duck: true,
    label: "portal opens, hero falls",
  },
  { frame: B4.fall + 4, sfx: "air", gain: -8, label: "airy fall" },
  {
    frame: B5.flood,
    sfx: "swell",
    gain: 2,
    label: "flood (music lift)",
  },
  ...B5.rounds.map((r, i) => ({
    frame: r.start,
    sfx: "shuffle" as const,
    gain: 5 + i,
    semitones: i * 2,
    label: `round ${i + 1}`,
  })),
  {
    frame: B5.outline,
    sfx: "shimmer",
    gain: -6,
    duck: true,
    label: "winner outline",
  },
  {
    frame: B5.check + 2,
    sfx: "pop",
    gain: -4,
    duck: true,
    label: "check pops",
  },
  {
    frame: B5.handoff.start + 9,
    sfx: "swish",
    gain: 4,
    label: "tile to document (crest at mid-flight)",
  },
  {
    frame: B6.ground.start,
    sfx: "scribble",
    gain: 2,
    label: "ground line draws",
  },
  {
    frame: MUSIC.finalBeatFrame,
    sfx: "chime",
    gain: -2,
    label: "final line (on the music's last strong beat)",
  },
];
