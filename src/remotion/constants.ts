import { DURATION } from "./timeline";

export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: DURATION,
} as const;
export const tokens = {
  "--br-navy-900": "#13223B",
  "--br-blue-600": "#0061FE",
  "--br-electric-500": "#009DFF",
  "--br-blue-500": "#5994FD",
  "--br-blue-800": "#14387A",
  "--br-blue-50": "#F2F7FF",
  "--br-paper": "#FAF8F5",
  "--br-paper-muted": "#F5F2EB",
  "--br-border": "#E5E2DB",
  "--br-ink": "#272625",
  "--br-white": "#FFFFFF",
  "--br-red-600": "#C33636",
  "--br-green-500": "#63A475",
  // Secondary palette sampled from the reference film. Boxes, coins, chips and
  // the flood only; paper and blue stay dominant.
  "--br-flood": "#C6E4FD",
  "--br-box": "#908DC1",
  "--br-box-shade": "#817DBA",
  "--br-coin": "#EBBE37",
  "--br-coin-shade": "#C99A1E",
  "--br-tile": "#FDFDFD",
  "--br-chip-yellow": "#FCC33C",
  "--br-chip-gray": "#BCB6B5",
  "--br-chip-purple": "#9691DF",
  "--br-chip-sky": "#6FBBFC",
  "--br-chip-blue": "#5692FA",
  "--br-chip-green": "#7CE19A",
} as const;
export const C = {
  navy: tokens["--br-navy-900"],
  blue: tokens["--br-blue-600"],
  electric: tokens["--br-electric-500"],
  paper: tokens["--br-paper"],
  border: tokens["--br-border"],
  white: tokens["--br-white"],
  flood: tokens["--br-flood"],
  box: tokens["--br-box"],
  boxShade: tokens["--br-box-shade"],
  coin: tokens["--br-coin"],
  coinShade: tokens["--br-coin-shade"],
  tile: tokens["--br-tile"],
} as const;
export const CHIP = {
  yellow: tokens["--br-chip-yellow"],
  gray: tokens["--br-chip-gray"],
  purple: tokens["--br-chip-purple"],
  sky: tokens["--br-chip-sky"],
  blue: tokens["--br-chip-blue"],
  green: tokens["--br-chip-green"],
} as const;
