import { BEAT, DURATION, TEXT, B7 } from "./timeline.ts";

// On-screen copy. **double asterisks** mark the navy emphasis words; "\n" is
// a deliberate line break. Sourced claims (beats 2, 3, 5) keep their wording.
export const headline = {
  h1: "Buying a home is\nalready **complicated.**",
  h2: "**9 out of 10** homebuyers\n**overpay** for their mortgage.",
  h3small: "American homeowners overpay",
  h3number: "$3,343",
  h3line: "on their mortgage, **every year.**",
  h4: "Good rates exist.\nLenders just aren't **made to compete.**",
  h5: "Bankrate makes lenders\n**compete** for your loan.",
  h5secondary: "Until the best rate wins.",
  h6: "You don't have to **overpay.**",
} as const;

export const plain = (s: string) => s.replace(/\*\*/g, "").replace(/\n/g, " ");

export const narrative = {
  coldOpen: plain(headline.h1),
  prevalence: plain(headline.h2),
  annualCost: `${headline.h3small} ${headline.h3number} ${plain(headline.h3line)}`,
  structure: plain(headline.h4),
  competition: `${plain(headline.h5)} ${headline.h5secondary}`,
  resolution: plain(headline.h6),
  attribution: "A consumer-first motion study inspired by Bankrate.",
  credit: "Concept, design and direction by Raj Shah",
  disclosure:
    "Independent exploration. Not affiliated with or commissioned by Bankrate.",
  sourceLabel: "Source: Bankrate · The Hidden Homeownership Tax",
  ratesLabel: "Illustrative rates. Not actual offers.",
} as const;

const beats = [
  BEAT.b1,
  BEAT.b2,
  BEAT.b3,
  BEAT.b4,
  BEAT.b5,
  BEAT.b6,
  BEAT.b7,
  DURATION,
];
export const sceneTiming = beats
  .slice(0, -1)
  .map((from, i) => ({ from, duration: beats[i + 1] - from }));

/** Caption windows (frames) for the WebVTT track and the site transcript. */
export const captions = [
  { from: TEXT.h1.in, to: TEXT.h1.out + 10, text: narrative.coldOpen },
  { from: TEXT.h2.in, to: TEXT.h2.out + 10, text: narrative.prevalence },
  { from: TEXT.h3.in, to: TEXT.h3.out + 10, text: narrative.annualCost },
  { from: TEXT.h4.in, to: TEXT.h4.out + 10, text: narrative.structure },
  { from: TEXT.h5.in, to: TEXT.h5.out + 10, text: narrative.competition },
  { from: TEXT.h6.in, to: B7.exit + 10, text: narrative.resolution },
  {
    from: B7.lines[0],
    to: DURATION,
    text: `${narrative.attribution}\n${narrative.credit}\n${narrative.disclosure}`,
  },
];
