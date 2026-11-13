import {
  AbsoluteFill,
  interpolate,
  Easing,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C } from "../constants";
import { sans } from "../fonts";
import { narrative } from "../narrative";
import { EditorialText, SmallLabel } from "../components/EditorialText";
import {
  DrawnPerson,
  DrawnHouse,
  PaymentMark,
  Underline,
  BrushField,
  OfferCard,
  Burst,
  personVariants,
  Loop,
} from "../components/Primitives";
const ease = (f: number, start: number, end: number) =>
  interpolate(f, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
const Canvas = ({
  children,
  opacity = 1,
}: {
  children: React.ReactNode;
  opacity?: number;
}) => (
  <AbsoluteFill
    style={{
      background: C.paper,
      color: C.navy,
      fontFamily: sans.fontFamily,
      opacity,
    }}
  >
    {children}
  </AbsoluteFill>
);
export const NineOfTen = ({ still = false }: { still?: boolean }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = still ? 100 : frame;
  return (
    <Canvas opacity={still ? 1 : ease(f, 0, 24)}>
      <EditorialText
        lines={["9 out of 10 homebuyers", "overpay for their mortgage."]}
        size={88}
        style={{ position: "absolute", top: 139, left: 200 }}
      />
      <EditorialText
        lines={["9 out of 10"]}
        size={88}
        style={{ position: "absolute", top: 139, left: 200, color: C.blue }}
      />

      {Array.from({ length: 10 }, (_, i) => {
        const p =
          i === 0
            ? 1
            : ease(
                f,
                i < 5 ? 0.4 * fps : 0.8 * fps,
                i < 5 ? 1.2 * fps : 1.6 * fps,
              );
        const burden = i < 9 ? ease(f, 30 + i * 4, 46 + i * 4) : 0;
        const h = [262, 248, 279, 255, 241, 270, 249, 279, 258, 267][i];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left:
                i === 0 ? 650 + (191 - 650) * ease(f, 0, 36) : 191 + i * 153,
              top: i === 0 ? 475 + (780 - h - 475) * ease(f, 0, 36) : 780 - h,
              opacity: p,
              transform: `translateY(${(1 - p) * 18}px)`,
            }}
          >
            <PaymentMark
              progress={burden}
              style={{
                position: "absolute",
                width: 80,
                height: 61,
                left: 34,
                top: -85,
              }}
            />
            <DrawnPerson
              variant={personVariants[i % 5]}
              seed={i + 2}
              burden={burden}
              progress={p}
              style={{
                height: i === 0 ? 304 + (h - 304) * ease(f, 0, 36) : h,
                width: i === 0 ? 172 + (148 - 172) * ease(f, 0, 36) : 148,
              }}
            />
          </div>
        );
      })}
      <svg
        viewBox="0 0 1540 45"
        style={{
          position: "absolute",
          top: 794,
          left: 184,
          width: 1540,
          height: 45,
        }}
        aria-hidden="true"
      >
        <path
          d="M12 18 Q650 34 1528 17"
          fill="none"
          stroke={C.navy}
          strokeOpacity={0.2}
          strokeWidth={2}
        />
      </svg>
      <SmallLabel
        style={{
          position: "absolute",
          left: 200,
          bottom: 121,
          fontSize: 24,
          letterSpacing: 0,
          fontWeight: 400,
        }}
      >
        Source: Bankrate · The Hidden Homeownership Tax
      </SmallLabel>
    </Canvas>
  );
};
export const StructuralProblem = ({ still = false }: { still?: boolean }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = still ? 100 : frame;
  const reveal = ease(f, 0, 0.65 * fps);
  const text = ease(f, 0.65 * fps, 1.15 * fps);
  return (
    <Canvas>
      <EditorialText
        lines={["Good rates", "exist."]}
        size={88}
        width={600}
        style={{ position: "absolute", left: 130, top: 149 }}
      />
      <DrawnPerson
        variant="lean-right"
        seed={2}
        style={{
          position: "absolute",
          left: 267,
          top: 469,
          height: 343,
          width: 194,
        }}
      />
      <Underline
        style={{
          position: "absolute",
          left: 204,
          top: 810,
          width: 330,
          height: 28,
        }}
      />
      {["Rate A", "Rate B", "Rate C", "Rate D", "Rate E"].map((label, i) => (
        <OfferCard
          key={label}
          label={label}
          style={{ position: "absolute", left: 520 + i * 260, top: 603 }}
        />
      ))}
      <BrushField
        style={{
          position: "absolute",
          left: 765 + (1 - reveal) * 1300,
          top: 0,
          width: 1155,
          height: 1080,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 1000,
          top: 163,
          opacity: text,
          transform: `translateY(${18 * (1 - text)}px)`,
        }}
      >
        <EditorialText
          lines={["The system just", "doesn't make", "them compete."]}
          size={88}
          width={800}
          style={{ color: C.paper }}
        />
        <Underline
          progress={ease(f, 42, 65)}
          style={{
            width: 574,
            height: 40,
            position: "absolute",
            left: 0,
            top: 297,
          }}
        />
      </div>

      <SmallLabel
        style={{
          position: "absolute",
          left: 130,
          bottom: 121,
          fontSize: 24,
          letterSpacing: 0,
          fontWeight: 400,
        }}
      >
        Illustrative offers. No advertised rates.
      </SmallLabel>
    </Canvas>
  );
};
export const Resolution = ({ still = false }: { still?: boolean }) => {
  const frame = useCurrentFrame();
  const f = still ? 100 : frame;
  return (
    <Canvas opacity={still ? 1 : ease(f, 0, 12)}>
      <DrawnHouse
        progress={ease(f, 0, 22)}
        style={{
          position: "absolute",
          left: 973,
          top: 164,
          width: 353,
          height: 326,
        }}
      />
      <DrawnPerson
        variant="straight"
        seed={2}
        progress={ease(f, 0, 18)}
        style={{
          position: "absolute",
          left: 692,
          top: 181,
          width: 172,
          height: 304,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 823,
          top: 292,
          transform: "rotate(-8deg)",
          opacity: ease(f, 8, 24),
          width: 79,
          height: 108,
          borderRadius: 7,
          background: C.blue,
        }}
      >
        <svg viewBox="0 0 80 108" aria-hidden="true">
          <path
            d="M20 30 L60 30 M20 44 L53 44 M21 69 L30 79 L56 58"
            fill="none"
            stroke={C.paper}
            strokeWidth={4}
            strokeLinecap="round"
          />
        </svg>
      </div>
      <svg
        viewBox="0 0 800 30"
        style={{
          position: "absolute",
          left: 565,
          top: 487,
          width: 800,
          height: 30,
        }}
        aria-hidden="true"
      >
        <path
          d="M12 11 Q413 23 787 10"
          fill="none"
          stroke={C.navy}
          strokeWidth={2}
          strokeOpacity={0.2}
        />
      </svg>
      <EditorialText
        lines={[narrative.resolution]}
        size={88}
        width={1320}
        style={{
          position: "absolute",
          left: 300,
          top: 576,
          textAlign: "center",
          opacity: ease(f, 5, 23),
        }}
      />
      <Underline
        progress={ease(f, 22, 46)}
        style={{
          position: "absolute",
          left: 908,
          top: 697,
          width: 520,
          height: 38,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 220,
          right: 220,
          top: 798,
          textAlign: "center",
          fontSize: 34,
          opacity: ease(f, 24, 42),
        }}
      >
        {narrative.attribution}
      </div>
      <SmallLabel
        style={{
          position: "absolute",
          left: 220,
          right: 220,
          top: 920,
          textAlign: "center",
          fontSize: 24,
          letterSpacing: 0,
          fontWeight: 400,
        }}
      >
        Designed and built by Raj Shah
      </SmallLabel>
    </Canvas>
  );
};
export const PrimitiveSheet = () => (
  <Canvas>
    <SmallLabel style={{ position: "absolute", left: 120, top: 75 }}>
      ORIGINAL DRAWING SYSTEM / 01
    </SmallLabel>
    {personVariants.map((variant, i) => (
      <div
        key={variant}
        style={{
          position: "absolute",
          left: 120 + i * 345,
          top: 177,
          width: 280,
        }}
      >
        <DrawnPerson
          variant={variant}
          seed={i}
          style={{ height: 300, width: 170 }}
        />
        <div style={{ marginTop: 20, fontSize: 27 }}>{variant}</div>
        <div
          style={{ display: "flex", gap: 35, alignItems: "end", marginTop: 30 }}
        >
          <DrawnPerson
            variant={variant}
            seed={i}
            style={{ height: 160, width: 90 }}
          />
          <DrawnPerson
            variant={variant}
            seed={i}
            style={{ height: 80, width: 45 }}
          />
        </div>
      </div>
    ))}
    <DrawnHouse
      style={{
        position: "absolute",
        left: 120,
        top: 715,
        width: 230,
        height: 213,
      }}
    />
    <PaymentMark
      style={{
        position: "absolute",
        left: 445,
        top: 762,
        width: 110,
        height: 90,
      }}
    />
    <OfferCard
      style={{
        position: "absolute",
        left: 662,
        top: 753,
        transform: "scale(.68)",
        transformOrigin: "top left",
      }}
    />
    <BrushField
      variant={1}
      style={{
        position: "absolute",
        left: 965,
        top: 737,
        width: 380,
        height: 102,
      }}
    />
    <Underline
      style={{
        position: "absolute",
        left: 978,
        top: 880,
        width: 350,
        height: 30,
      }}
    />
    <Burst
      style={{
        position: "absolute",
        left: 1440,
        top: 715,
        width: 140,
        height: 140,
      }}
    />
    <Loop
      style={{
        position: "absolute",
        left: 1460,
        top: 870,
        width: 270,
        height: 90,
      }}
    />
  </Canvas>
);
