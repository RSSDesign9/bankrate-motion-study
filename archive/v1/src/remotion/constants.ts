export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationSeconds: 21,
  durationInFrames: 630,
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
} as const;
export const C = {
  navy: tokens["--br-navy-900"],
  blue: tokens["--br-blue-600"],
  electric: tokens["--br-electric-500"],
  paper: tokens["--br-paper"],
  border: tokens["--br-border"],
} as const;
