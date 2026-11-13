import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { continueRender, delayRender } from "remotion";
import { measureText } from "@remotion/layout-utils";
import { fontsReady, serif, sans } from "../fonts";
import { C } from "../constants";
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
export const EditorialText = ({
  lines,
  size = 96,
  width = 1160,
  style,
}: {
  lines: readonly string[];
  size?: number;
  width?: number;
  style?: CSSProperties;
}) => {
  for (const text of lines) {
    const measured = measureText({
      text,
      fontFamily: serif.fontFamily,
      fontWeight: "500",
      fontSize: size,
      letterSpacing: "-1.3px",
      validateFontIsLoaded: true,
    });
    if (measured.width > width + 1)
      throw new Error(
        `Editorial line exceeds ${width}px: ${text} (${measured.width})`,
      );
  }
  return (
    <div
      style={{
        fontFamily: serif.fontFamily,
        fontWeight: 500,
        fontSize: size,
        lineHeight: 1.12,
        width,
        color: C.navy,
        letterSpacing: -1.3,
        ...style,
      }}
    >
      {lines.map((line, i) => (
        <div key={i} style={{ whiteSpace: "nowrap" }}>
          {line}
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
      fontSize: 25,
      fontWeight: 600,
      letterSpacing: 3,
      ...style,
    }}
  >
    {children}
  </div>
);
