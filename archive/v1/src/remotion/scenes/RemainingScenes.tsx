import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { C } from "../constants";
import { sans } from "../fonts";
import { EditorialText, SmallLabel } from "../components/EditorialText";
import {
  DrawnPerson,
  DrawnHouse,
  Underline,
  PaymentMark,
  personVariants,
  Loop,
  OfferCard,
  BrushField,
  DrawPath,
  Burst,
} from "../components/Primitives";
const p = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const Canvas = ({ children }: { children: React.ReactNode }) => (
  <AbsoluteFill
    style={{ background: C.paper, color: C.navy, fontFamily: sans.fontFamily }}
  >
    {children}
  </AbsoluteFill>
);
export const ColdOpen = () => {
  const f = useCurrentFrame();
  const draw = p(f, 0, 18);
  return (
    <Canvas>
      <EditorialText
        lines={["Buying a home is", "already complicated."]}
        size={88}
        style={{
          position: "absolute",
          left: 200,
          top: 139,
          opacity: mix(0.6, 1, p(f, 0, 9)) * (1 - p(f, 60, 72)),
          transform: `translateY(${18 * (1 - p(f, 0, 9))}px)`,
        }}
      />
      <DrawnPerson
        variant="straight"
        seed={2}
        progress={draw}
        style={{
          position: "absolute",
          left: 650,
          top: 475,
          height: 304,
          width: 172,
        }}
      />
      <DrawnHouse
        progress={draw}
        style={{
          position: "absolute",
          left: 946,
          top: 481,
          height: 280,
          width: 303,
        }}
      />
      <Underline
        progress={p(f, 5, 23)}
        style={{
          position: "absolute",
          left: 597,
          top: 798,
          width: 705,
          height: 34,
        }}
      />
    </Canvas>
  );
};
export const RecurringCost = () => {
  const f = useCurrentFrame();
  const gather = p(f, 0, 27);
  const number = p(f, 15, 32);
  return (
    <Canvas>
      <div
        style={{
          position: "absolute",
          left: 200,
          top: 146,
          fontSize: 48,
          opacity: p(f, 0, 12),
        }}
      >
        American homeowners overpay
      </div>
      {Array.from({ length: 10 }, (_, i) => {
        const h = [262, 248, 279, 255, 241, 270, 249, 279, 258, 267][i];
        return (
          <div key={i}>
            <DrawnPerson
              variant={personVariants[i % 5]}
              seed={i + 2}
              burden={1 - gather}
              style={{
                position: "absolute",
                left: mix(
                  191 + i * 153,
                  i === 8 ? 1390 : 191 + i * 153,
                  gather,
                ),
                top: mix(780 - h, i === 8 ? 355 : 870 - h, gather),
                height: mix(h, i === 8 ? 340 : h, gather),
                width: mix(148, i === 8 ? 192 : 148, gather),
                opacity: i === 8 ? 1 : mix(1, 0.06, gather),
              }}
            />
            {i < 9 ? (
              <PaymentMark
                style={{
                  position: "absolute",
                  left: mix(225 + i * 153, 420 + i * 38, gather),
                  top: mix(695 - h, 425, gather),
                  width: mix(80, 55, gather),
                  height: 61,
                  opacity: 1 - number,
                }}
              />
            ) : null}
          </div>
        );
      })}
      <EditorialText
        lines={["$3,343"]}
        size={184}
        width={1160}
        style={{
          position: "absolute",
          left: 200,
          top: 276,
          color: C.blue,
          opacity: number,
          transform: `translateY(${10 * (1 - number)}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 206,
          top: 547,
          fontSize: 48,
          opacity: p(f, 18, 32),
        }}
      >
        on their mortgage{" "}
        <span style={{ position: "relative" }}>
          every year.
          <Loop
            progress={p(f, 32, 56)}
            style={{
              position: "absolute",
              left: -25,
              top: -23,
              width: 294,
              height: 98,
            }}
          />
        </span>
      </div>
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
export const CompetitionReveal = () => {
  const f = useCurrentFrame();
  const uncover = p(f, 0, 31);
  const reorder = p(f, 46, 70);
  const selected = f >= 72;
  return (
    <Canvas>
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
      {["Rate A", "Rate B", "Rate C", "Rate D", "Rate E"].map((label, i) => {
        const align = p(f, i * 4, 28 + i * 4);
        const slot = [1, 2, 0, 3, 4][i];
        return (
          <OfferCard
            key={label}
            label={label}
            selected={i === 2 && selected}
            style={{
              position: "absolute",
              left: mix(
                520 + i * 260,
                530 + mix(i, slot, reorder) * 250,
                align,
              ),
              top: mix(603, 520, align),
            }}
          />
        );
      })}
      <BrushField
        style={{
          position: "absolute",
          left: 765 + uncover * 1250,
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
          opacity: 1 - p(f, 0, 12),
        }}
      >
        <EditorialText
          lines={["The system just", "doesn't make", "them compete."]}
          size={88}
          width={800}
          style={{ color: C.paper }}
        />
        <Underline
          style={{ width: 574, height: 40, position: "absolute", top: 297 }}
        />
      </div>
      <div style={{ opacity: p(f, 24, 38) }}>
        <EditorialText
          lines={["Bankrate makes lenders", "compete for your loan."]}
          size={88}
          style={{ position: "absolute", left: 200, top: 139 }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 870,
          top: 852,
          fontSize: 46,
          opacity: p(f, 75, 88),
        }}
      >
        Until the best rate wins.
      </div>
      <svg
        viewBox="0 0 550 250"
        style={{
          position: "absolute",
          left: 348,
          top: 770,
          width: 550,
          height: 250,
        }}
        aria-hidden="true"
      >
        <DrawPath
          d="M300 33 L300 161 Q300 183 271 183 L35 183 Q15 183 15 158 L15 60 M4 76 L15 58 L26 76"
          progress={p(f, 79, 110)}
          width={4}
        />
      </svg>
      {selected ? (
        <Burst
          style={{
            position: "absolute",
            left: 698,
            top: 442,
            width: 115,
            height: 115,
            opacity: p(f, 72, 83),
          }}
        />
      ) : null}
      <SmallLabel
        style={{
          position: "absolute",
          right: 130,
          bottom: 121,
          fontSize: 24,
          letterSpacing: 0,
          fontWeight: 400,
        }}
      >
        Illustrative offers
      </SmallLabel>
    </Canvas>
  );
};
