import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { continueRender, delayRender, interpolateColors } from "remotion";
import { fontsReady, serif, sans } from "../fonts";
import { C } from "../constants";
import { DUR, STAGGER, tween } from "../motion";

export const FontsGate = ({ children }: { children: ReactNode }) => {
  const [handle] = useState(() => delayRender("Load approved Google Fonts"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    fontsReady
      .then(() => {
        setReady(true);
        continueRender(handle);
      })
      .catch((e) => {
        throw e;
      });
  }, [handle]);
  return ready ? <>{children}</> : null;
};

type Word = { text: string; emphasis: boolean; index: number };
/** "Buying a home is\nalready **complicated.**" → lines of words. */
export const parseHeadline = (src: string) => {
  let index = 0;
  let inEm = false;
  return src.split("\n").map((line) =>
    line
      .trim()
      .split(/\s+/)
      .map((raw): Word => {
        const opens = raw.startsWith("**");
        const closes = raw.endsWith("**");
        if (opens) inEm = true;
        const w = { text: raw.replace(/\*\*/g, ""), emphasis: inEm, index };
        if (closes) inEm = false;
        index++;
        return w;
      }),
  );
};
export const wordCount = (src: string) =>
  src.replace(/\*\*/g, "").trim().split(/\s+/).length;
/** Frame on which the last word of a build has fully landed. */
export const buildEnd = (src: string, start: number) =>
  start + (wordCount(src) - 1) * STAGGER.word + DUR.base;

export type WordBuildProps = {
  text: string;
  frame: number;
  start: number;
  exitAt?: number;
  size?: number;
  weight?: number;
  family?: "serif" | "sans";
  color?: string;
  emphasisColor?: string;
  lineHeight?: number;
  letterSpacing?: number;
  align?: "left" | "center";
  style?: CSSProperties;
  /** Render a node after a specific word (e.g. a loop around it). */
  decorate?: (word: Word) => ReactNode;
};

/**
 * Word-by-word build. Each word rises out of its own mask with the enter
 * curve; emphasis words land in the base colour, then shift to the emphasis
 * colour as a second beat. Exits mask upward with the exit curve.
 */
export const WordBuild = ({
  text,
  frame,
  start,
  exitAt,
  size = 84,
  weight = 600,
  family = "serif",
  color = C.blue,
  emphasisColor = C.navy,
  lineHeight = 1.1,
  letterSpacing = -1.2,
  align = "left",
  style,
  decorate,
}: WordBuildProps) => {
  const lines = parseHeadline(text);
  const out =
    exitAt === undefined ? 0 : tween(frame, exitAt, DUR.short, "exit");
  if (frame < start || out >= 1) return null;
  return (
    <div
      style={{
        fontFamily: family === "serif" ? serif.fontFamily : sans.fontFamily,
        fontWeight: weight,
        fontSize: size,
        lineHeight,
        letterSpacing,
        textAlign: align,
        position: "absolute",
        ...style,
      }}
    >
      {lines.map((words, li) => (
        <div key={li} style={{ whiteSpace: "nowrap" }}>
          {words.map((w, wi) => {
            const s = start + w.index * STAGGER.word;
            const t = tween(frame, s, DUR.base, "enter");
            const landed = s + DUR.base;
            const shift = w.emphasis ? tween(frame, landed + 4, 8, "enter") : 0;
            return (
              <span key={wi} style={{ position: "relative" }}>
                <span
                  style={{
                    display: "inline-block",
                    overflow: "hidden",
                    verticalAlign: "top",
                    padding: "0.04em 0.06em 0.16em",
                    margin: "-0.04em -0.06em -0.16em",
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      transform: `translateY(${(1 - t) * 100 - out * 110}%)`,
                      opacity: t,
                      color: interpolateColors(
                        shift,
                        [0, 1],
                        [color, emphasisColor],
                      ),
                    }}
                  >
                    {w.text}
                  </span>
                </span>
                {decorate?.(w)}
                {wi < words.length - 1 ? " " : null}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export const SmallLabel = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) => (
  <div
    style={{
      fontFamily: sans.fontFamily,
      fontSize: 22,
      fontWeight: 500,
      letterSpacing: 0.2,
      position: "absolute",
      ...style,
    }}
  >
    {children}
  </div>
);
