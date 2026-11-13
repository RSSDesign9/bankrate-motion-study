import type { CSSProperties, ReactNode } from "react";
import {
  AbsoluteFill,
  getStaticFiles,
  interpolateColors,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Audio } from "@remotion/media";
import { measureText } from "@remotion/layout-utils";
import { C, CHIP } from "../constants";
import { serif, sans } from "../fonts";
import { headline, narrative } from "../narrative";
import { B1, B2, B3, B4, B5, B6, B7, BEAT, TEXT } from "../timeline";
import {
  along,
  arc,
  crossBlur,
  DUR,
  mix,
  springAt,
  SPRING,
  tween,
} from "../motion";
import { SmallLabel, WordBuild } from "../components/EditorialText";
import {
  BOX_DEPTH,
  Coin,
  DOC,
  DocumentFace,
  DrawnHouse,
  DrawnPerson,
  DrawPath,
  Figure,
  HOUSE_GROUND,
  Loop,
  PercentBox,
  RateTile,
  TILE,
  Underline,
} from "../components/Primitives";
import {
  BOX,
  BOX_STEP,
  BOXES1_X,
  BOXES6_X,
  camera,
  COIN_R,
  COIN_TH,
  crowd,
  crowdCoin,
  G1,
  G5,
  hero,
  HERO,
  HERO_X1,
  heroHand,
  HOUSE1,
  HOUSE6,
  HERO_X6,
  boxStart,
  SLOTS,
  STACKS,
  streamCoins,
  sx,
  tile,
  TILES,
  WINNER,
  winnerScale,
  type TileState,
} from "./layout";

// ── World plumbing ────────────────────────────────────────────────────────
const W = 4000; // world SVG canvas extends this far past the frame
const WorldSvg = ({ children }: { children: ReactNode }) => (
  <svg
    viewBox={`${-W} ${-W} ${W * 3} ${W * 3}`}
    width={W * 3}
    height={W * 3}
    style={{ position: "absolute", left: -W, top: -W, overflow: "visible" }}
    aria-hidden="true"
  >
    {children}
  </svg>
);
const abs = (x: number, y: number, extra?: CSSProperties): CSSProperties => ({
  position: "absolute",
  left: 0,
  top: 0,
  transform: `translate(${x}px, ${y}px)`,
  ...extra,
});

// ── Beat 1 props: house and the % box wall ────────────────────────────────
const House = ({ x, ground, w }: { x: number; ground: number; w: number }) => {
  const h = (w * 240) / 260;
  return (
    <DrawnHouse
      style={{
        position: "absolute",
        left: x,
        top: ground - h * HOUSE_GROUND,
        width: w,
        height: h,
      }}
    />
  );
};

const BoxWall = ({
  f,
  x0,
  ground,
  rise,
  flatten,
  exit,
}: {
  f: number;
  x0: number;
  ground: number;
  rise: boolean;
  flatten?: number;
  exit?: number;
}) => (
  <>
    {STACKS.map((n, col) => {
      const size = BOX;
      const h = n * size + BOX_DEPTH * size;
      // Bookend: each column collapses into a thin slab lying on the ground
      // line, turning from box purple to the brand underline's blue.
      const flat =
        flatten === undefined ? 0 : tween(f, flatten + col * 2, 10, "move");
      const out = exit === undefined ? 0 : tween(f, exit + col, 8, "exit");
      return (
        <div
          key={col}
          style={{
            position: "absolute",
            left: x0 + col * BOX_STEP,
            top: ground - h,
            width: size * (1 + BOX_DEPTH),
            height: h,
            opacity: 1 - out,
            transformOrigin: "50% 100%",
            transform: `translateY(${out * 16}px) scaleY(${mix(1, 6 / h, flat)})`,
          }}
        >
          {Array.from({ length: n }, (_, row) => {
            const start = rise ? boxStart(col, row) : -1;
            if (start >= 0 && f < start) return null;
            const p = start < 0 ? 1 : springAt(f, start, SPRING.settle);
            const appear = start < 0 ? 1 : tween(f, start, 6, "enter");
            return (
              <div
                key={row}
                style={{
                  position: "absolute",
                  left: 0,
                  top: (n - 1 - row) * size,
                  opacity: appear,
                  transformOrigin: "50% 100%",
                  transform: `translateY(${(1 - p) * 16}px) scale(${mix(0.92, 1, p)})`,
                }}
              >
                <PercentBox
                  size={size}
                  color={interpolateColors(flat, [0, 1], [C.box, C.electric])}
                  shade={interpolateColors(flat, [0, 1], [C.boxShade, C.blue])}
                />
              </div>
            );
          })}
        </div>
      );
    })}
  </>
);

// ── Hero ──────────────────────────────────────────────────────────────────
const HeroFigure = ({ f }: { f: number }) => {
  const s = hero(f);
  const body = (
    <Figure x={s.x} y={s.y} size={HERO.size} rotate={s.rotate}>
      {(w, h) => (
        <DrawnPerson
          variant={HERO.variant}
          seed={HERO.seed}
          pose={s.pose}
          style={{ width: w, height: h }}
        />
      )}
    </Figure>
  );
  // While the portal is a hole in the floor, the hero is masked to the
  // floor plane plus the hole, so the fall reads as dropping *into* it.
  if (f >= B4.fall && f < B4.portalFill + 18) {
    const { rx, ry } = portal(f);
    const cx = HERO_X1 + W;
    const cy = G1 + W;
    const clip = `path("M0 0 H${W * 3} V${cy} H0 Z M${cx - rx} ${cy} A${rx} ${ry} 0 0 0 ${cx + rx} ${cy} Z")`;
    return (
      <div
        style={{
          position: "absolute",
          left: -W,
          top: -W,
          width: W * 3,
          height: W * 3,
          clipPath: clip,
        }}
      >
        <div style={{ position: "absolute", left: W, top: W }}>{body}</div>
      </div>
    );
  }
  return body;
};

// ── Portal and flood ──────────────────────────────────────────────────────
const portal = (f: number) => {
  const open = tween(f, B4.portalOpen, 10, "enter");
  // Sized to just cover the frame so the move curve reads as a sweep.
  const fill = tween(f, B4.portalFill, 16, "enter");
  const rx = mix(mix(40, 190, open), 1900, fill);
  const ry = mix(mix(6, 40, open), 1900, fill);
  return { rx, ry };
};
/** Flood centre in screen space (the camera holds through beats 4–5). */
const FLOOD_AT = { x: 1000, y: 560 };
const floodRadius = (f: number) =>
  f < B6.recede
    ? 1500 * tween(f, B5.flood, B5.floodDur, "enter")
    : 1500 * (1 - tween(f, B6.recede, B6.recedeDur, "exit"));

// ── Tiles ─────────────────────────────────────────────────────────────────
const TileView = ({
  s,
  children,
  w = TILE.w,
  h = TILE.h,
  radius = TILE.r,
  bg = C.tile,
  rotate = 0,
  blur = 0,
}: {
  s: TileState;
  children: ReactNode;
  w?: number;
  h?: number;
  radius?: number;
  bg?: string;
  rotate?: number;
  blur?: number;
}) => (
  <div
    style={abs(s.x - w / 2, s.y - h / 2, {
      width: w,
      height: h,
      borderRadius: radius,
      background: bg,
      opacity: s.opacity,
      transform: `translate(${s.x - w / 2}px, ${s.y - h / 2}px) perspective(1400px) rotateY(${s.ry}deg) rotateZ(${s.rz + rotate}deg) scale(${s.scale})`,
      filter: s.blur + blur > 0.05 ? `blur(${s.blur + blur}px)` : undefined,
    })}
  >
    {children}
  </div>
);

const roundRect = (w: number, h: number, r: number) =>
  `M${r} 0 H${w - r} A${r} ${r} 0 0 1 ${w} ${r} V${h - r} A${r} ${r} 0 0 1 ${w - r} ${h} H${r} A${r} ${r} 0 0 1 0 ${h - r} V${r} A${r} ${r} 0 0 1 ${r} 0Z`;

const Winner = ({ f, s }: { f: number; s: TileState }) => {
  const { scale, lift } = winnerScale(f);
  const m = tween(f, B5.handoff.start, 18, "move");
  const marks = 1 - tween(f, B5.handoff.start, 8, "exit");
  // Fly to the hero's hand on an arc, morphing into the document.
  const hs = hero(f);
  const hand = heroHand(hs);
  const target = { x: hand.x + 10, y: hand.y - DOC.h / 2 + 14 };
  const from = { x: s.x, y: s.y + lift };
  const p = m <= 0 ? from : m >= 1 ? target : along(arc(from, target, 90), m);
  const w = mix(TILE.w, DOC.w, m);
  const h = mix(TILE.h, DOC.h, m);
  const state = {
    ...s,
    x: p.x,
    y: p.y,
    scale: m > 0 ? 1 : s.scale * scale,
  };
  const pad = 9;
  return (
    <>
      <TileView
        s={state}
        w={w}
        h={h}
        radius={mix(TILE.r, DOC.r, m)}
        bg={interpolateColors(m, [0, 1], [C.tile, C.blue])}
        rotate={mix(0, -8, m)}
        blur={crossBlur(m, 4)}
      >
        <RateTile
          from={s.rateFrom}
          to={s.rateTo}
          roll={s.roll}
          chip={CHIP[s.chip]}
          contentOpacity={1 - tween(m, 0, 0.55, "move")}
        />
        <DocumentFace
          opacity={tween(m, 0.45, 0.4, "move")}
          check={tween(f, B5.handoff.start + 14, 8, "draw")}
        />
        {marks > 0 ? (
          <svg
            width={TILE.w + pad * 2}
            height={TILE.h + pad * 2}
            style={{
              position: "absolute",
              left: -pad,
              top: -pad,
              overflow: "visible",
              opacity: marks * (1 - m),
            }}
            aria-hidden="true"
          >
            <g transform={`translate(${pad / 2} ${pad / 2})`}>
              <DrawPath
                d={roundRect(TILE.w + pad, TILE.h + pad, TILE.r + 6)}
                color={C.blue}
                width={5}
                progress={tween(f, B5.outline, 8, "draw")}
              />
            </g>
            <g
              transform={`translate(${TILE.w + pad * 2 - 8} 8)`}
              opacity={tween(f, B5.check, 4, "enter")}
            >
              <circle
                r={22}
                fill={C.blue}
                transform={`scale(${mix(0.92, 1, tween(f, B5.check, 6, "enter"))})`}
              />
              <DrawPath
                d="M-9 0 L-3 7 L10 -7"
                color={C.white}
                width={4.5}
                progress={tween(f, B5.check + 1, 6, "draw")}
              />
            </g>
          </svg>
        ) : null}
        {marks > 0 ? (
          <Loop
            progress={tween(f, B5.loop, 11, "draw")}
            style={{
              position: "absolute",
              left: 36,
              top: -6,
              width: 258,
              height: 92,
              opacity: marks * (1 - m),
            }}
          />
        ) : null}
      </TileView>
    </>
  );
};

// ── World ─────────────────────────────────────────────────────────────────
const World = ({ f }: { f: number }) => {
  const cam = camera(f);
  const members = f >= B2.crowdIn && f < B4.portalFill + 18 ? crowd(f) : [];
  const portalOn = f >= B4.portalOpen && f < B5.flood + B5.floodDur + 2;
  const floodOn = f >= B5.flood && f < B6.recede + B6.recedeDur;
  const tiles =
    f >= B4.tilesIn && f < B5.othersExit + 30
      ? TILES.map((d, i) => tile(f, d, i))
      : [];
  const exitAll = tween(f, B7.exit, DUR.short, "exit");
  const winnerIndex = TILES.findIndex((t) => t.id === WINNER);
  const winner =
    f >= B4.tilesIn ? (
      <Winner f={f} s={tile(f, TILES[winnerIndex], winnerIndex)} />
    ) : null;
  const heroCoins = (
    <>
      {f >= B2.coins && f < B4.portalFill + 18
        ? (() => {
            const own = crowdCoin(f, B2.heroIndex, {
              ...hero(f),
              i: B2.heroIndex,
              size: HERO.size,
              variant: HERO.variant,
              seed: HERO.seed,
              scale: 1,
              opacity: 1,
              x: HERO_X1,
            });
            return own ? <Coin {...own} r={COIN_R} /> : null;
          })()
        : null}
      {f < B4.portalFill + 18
        ? streamCoins(f).map((c, j) => <Coin key={j} {...c} r={COIN_R} />)
        : null}
    </>
  );
  return (
    <AbsoluteFill
      style={{
        transformOrigin: "0 0",
        transform: `translate(960px, 540px) scale(${cam.s}) translate(${-cam.cx}px, ${-cam.cy}px)`,
        opacity: 1 - exitAll,
        filter:
          exitAll > 0 && exitAll < 1
            ? `blur(${crossBlur(exitAll, 3)}px)`
            : undefined,
      }}
    >
      {/* Beat 1: the wall of % boxes between the hero and home. */}
      {f < B2.propsExit + 16 ? (
        <>
          <div
            style={{
              opacity: 1 - tween(f, B2.propsExit, DUR.short, "exit"),
            }}
          >
            <House x={HOUSE1.x} ground={G1} w={HOUSE1.w} />
          </div>
          <BoxWall f={f} x0={BOXES1_X} ground={G1} rise exit={B2.propsExit} />
        </>
      ) : null}
      {/* Beat 2–3: the crowd and their coins. */}
      {members.map((m) => (
        <Figure
          key={m.i}
          x={m.x}
          y={m.y}
          size={m.size * m.scale}
          opacity={m.opacity}
        >
          {(w, h) => (
            <DrawnPerson
              variant={m.variant}
              seed={m.seed}
              pose={m.pose}
              style={{ width: w, height: h }}
            />
          )}
        </Figure>
      ))}
      {members.map((m) => {
        if (m.i === B2.heroIndex) return null;
        const c = crowdCoin(f, m.i, m);
        return c ? (
          <Coin
            key={`c${m.i}`}
            {...c}
            r={COIN_R}
            opacity={c.opacity * m.opacity}
          />
        ) : null;
      })}
      {f >= B4.portalOpen ? heroCoins : null}
      {/* Beat 4: the navy portal opens under the hero. */}
      {portalOn ? (
        <WorldSvg>
          <ellipse
            cx={HERO_X1}
            cy={G1}
            rx={portal(f).rx}
            ry={portal(f).ry}
            fill={C.navy}
          />
        </WorldSvg>
      ) : null}
      {/* Beat 6 set, revealed as the flood recedes. */}
      {f >= B6.recede ? (
        <>
          <House x={HOUSE6.x} ground={G5} w={HOUSE6.w} />
          <div
            style={{
              opacity: 1 - tween(f, B6.ground.start + 8, 10, "enter"),
            }}
          >
            <BoxWall
              f={f}
              x0={BOXES6_X}
              ground={G5}
              rise={false}
              flatten={B6.flatten}
            />
          </div>
          <Underline
            progress={tween(f, B6.ground.start, B6.ground.dur, "draw")}
            color={C.electric}
            style={{
              position: "absolute",
              left: HERO_X6 - 90,
              top: G5 - 14,
              width: HOUSE6.x + HOUSE6.w + 40 - (HERO_X6 - 90),
              height: 30,
            }}
          />
        </>
      ) : null}
      {/* Beat 5: the light-blue flood, from the hero outward. */}
      {floodOn ? (
        <WorldSvg>
          <circle
            cx={f < B6.recede ? sx(FLOOD_AT.x) : HERO_X6}
            cy={f < B6.recede ? FLOOD_AT.y : G5 - 260}
            r={floodRadius(f)}
            fill={C.flood}
          />
        </WorldSvg>
      ) : null}
      {/* Rate tiles, drifting in the dark, then competing. */}
      {tiles
        .filter((t) => t.id !== WINNER && t.opacity > 0.001)
        .map((t) => (
          <TileView key={t.id} s={t}>
            <RateTile
              from={t.rateFrom}
              to={t.rateTo}
              roll={t.roll}
              chip={CHIP[t.chip]}
            />
          </TileView>
        ))}
      {/* The eventual winner shuffles behind the hero like the others, then
          comes forward (no overlap at the swap) for the handoff. */}
      {f < B5.winner ? winner : null}
      <HeroFigure f={f} />
      {f < B4.portalOpen ? heroCoins : null}
      {f >= B5.winner ? winner : null}
    </AbsoluteFill>
  );
};

// ── Text ──────────────────────────────────────────────────────────────────
const LEFT = 200;
const TOP = 110;
const fmt = (n: number) => `$${n.toLocaleString("en-US")}`;
/** Widest digit at display size: every digit gets this cell, so the
 * count-up can never jitter, whatever the font's figure widths. */
const digitWidth = () =>
  Math.max(
    ...Array.from(
      { length: 10 },
      (_, d) =>
        measureText({
          text: String(d),
          fontFamily: serif.fontFamily,
          fontWeight: "600",
          fontSize: 220,
          letterSpacing: "-4px",
        }).width,
    ),
  );

const Number3343 = ({ f }: { f: number }) => {
  const t = tween(f, B3.count.start, B3.count.dur, "enter");
  const enter = tween(f, B3.count.start, DUR.base, "enter");
  const out = tween(f, TEXT.h3.out, DUR.short, "exit");
  const landed = B3.count.start + B3.count.dur;
  if (f < B3.count.start || out >= 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: LEFT - 8,
        top: 196,
        overflow: "hidden",
        padding: "0 8px 20px",
      }}
    >
      <div
        style={{
          fontFamily: serif.fontFamily,
          fontWeight: 600,
          fontSize: 220,
          lineHeight: 1.05,
          letterSpacing: -4,
          fontVariantNumeric: "tabular-nums",
          fontFeatureSettings: '"tnum" 1, "lnum" 1',
          color: interpolateColors(
            tween(f, landed + 4, 8, "enter"),
            [0, 1],
            [C.blue, C.navy],
          ),
          opacity: enter,
          transform: `translateY(${(1 - enter) * 100 - out * 110}%)`,
        }}
      >
        {fmt(Math.round(3343 * t))
          .split("")
          .map((ch, i) =>
            /\d/.test(ch) ? (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  width: digitWidth(),
                  textAlign: "center",
                }}
              >
                {ch}
              </span>
            ) : (
              <span key={i}>{ch}</span>
            ),
          )}
      </div>
    </div>
  );
};

const lineFont = { size: 54, letterSpacing: -0.6 };
const everyWidth = () =>
  measureText({
    text: "every ",
    fontFamily: serif.fontFamily,
    fontWeight: "600",
    fontSize: lineFont.size,
    letterSpacing: `${lineFont.letterSpacing}px`,
  }).width;
const wordWidth = (text: string, size: number, letterSpacing: number) =>
  measureText({
    text,
    fontFamily: serif.fontFamily,
    fontWeight: "600",
    fontSize: size,
    letterSpacing: `${letterSpacing}px`,
  }).width;

const Label = ({
  f,
  text,
  inAt,
  outAt,
  color,
}: {
  f: number;
  text: string;
  inAt: number;
  outAt: number;
  color: string;
}) => {
  const t = tween(f, inAt, DUR.base, "enter");
  const out = tween(f, outAt, DUR.short, "exit");
  if (f < inAt || out >= 1) return null;
  // Same grammar as headlines: rises in, masks up out.
  return (
    <SmallLabel
      style={{
        left: LEFT,
        top: 972,
        color,
        overflow: "hidden",
        paddingBottom: 4,
      }}
    >
      <div
        style={{
          opacity: t * 0.78,
          transform: `translateY(${(1 - t) * 100 - out * 110}%)`,
        }}
      >
        {text}
      </div>
    </SmallLabel>
  );
};

const TextLayer = ({ f }: { f: number }) => {
  return (
    <AbsoluteFill>
      <WordBuild
        text={headline.h1}
        frame={f}
        start={TEXT.h1.in}
        exitAt={TEXT.h1.out}
        style={{ left: LEFT, top: TOP }}
      />
      <WordBuild
        text={headline.h2}
        frame={f}
        start={TEXT.h2.in}
        exitAt={TEXT.h2.out}
        style={{ left: LEFT, top: TOP }}
      />
      <Label
        f={f}
        text={narrative.sourceLabel}
        inAt={TEXT.h2.in + 10}
        outAt={TEXT.h3.out}
        color={C.navy}
      />
      <WordBuild
        text={headline.h3small}
        frame={f}
        start={TEXT.h3.in}
        exitAt={TEXT.h3.out}
        size={lineFont.size}
        letterSpacing={lineFont.letterSpacing}
        style={{ left: LEFT, top: 132 }}
      />
      <Number3343 f={f} />
      <WordBuild
        text={headline.h3line}
        frame={f}
        start={TEXT.h3.line}
        exitAt={TEXT.h3.out}
        size={lineFont.size}
        letterSpacing={lineFont.letterSpacing}
        style={{ left: LEFT, top: 456 }}
        decorate={(w) =>
          w.text === "year." ? (
            <Loop
              progress={
                tween(f, B3.loop.start, B3.loop.dur, "draw") -
                tween(f, TEXT.h3.out, DUR.short, "exit")
              }
              style={{
                position: "absolute",
                left: -everyWidth() - 30,
                top: -14,
                width:
                  everyWidth() +
                  wordWidth("year.", lineFont.size, lineFont.letterSpacing) +
                  60,
                height: 92,
              }}
            />
          ) : null
        }
      />
      {/* Beat 4 text sits on navy. As the flood sweeps out from the hero, a
          navy copy clipped to the flood circle takes over word by word, so
          no word is ever low-contrast on either ground. */}
      {[false, true].map((onFlood) => (
        <AbsoluteFill
          key={String(onFlood)}
          style={
            onFlood
              ? {
                  clipPath: `circle(${f >= B5.flood ? floodRadius(f) : 0}px at ${FLOOD_AT.x}px ${FLOOD_AT.y}px)`,
                }
              : undefined
          }
        >
          <WordBuild
            text={headline.h4}
            frame={f}
            start={TEXT.h4.in}
            exitAt={TEXT.h4.out}
            color={onFlood ? C.navy : C.paper}
            emphasisColor={onFlood ? C.blue : C.electric}
            style={{ left: LEFT, top: TOP }}
          />
          <Label
            f={f}
            text={narrative.ratesLabel}
            inAt={TEXT.h4.in + 12}
            outAt={onFlood ? TEXT.h5.out : B5.flood + B5.floodDur}
            color={onFlood ? C.navy : C.paper}
          />
        </AbsoluteFill>
      ))}
      <WordBuild
        text={headline.h5}
        frame={f}
        start={TEXT.h5.in}
        exitAt={TEXT.h5.out}
        style={{ left: LEFT, top: TOP }}
      />
      <WordBuild
        text={headline.h5secondary}
        frame={f}
        start={TEXT.h5.secondary}
        exitAt={TEXT.h5.out}
        size={lineFont.size}
        letterSpacing={lineFont.letterSpacing}
        color={C.navy}
        style={{ left: LEFT, top: TOP + 196 }}
      />
      <WordBuild
        text={headline.h6}
        frame={f}
        start={TEXT.h6.in}
        exitAt={B7.exit}
        align="center"
        style={{ left: 0, right: 0, top: 700 }}
        decorate={(w) =>
          w.text === "overpay." ? (
            <Underline
              progress={
                tween(f, B6.underline.start, B6.underline.dur, "draw") -
                tween(f, B7.exit, DUR.short, "exit")
              }
              style={{
                position: "absolute",
                left: -6,
                top: 88,
                width: wordWidth("overpay.", 84, -1.2) + 12,
                height: 22,
              }}
            />
          ) : null
        }
      />
      <Slate f={f} />
    </AbsoluteFill>
  );
};

const Slate = ({ f }: { f: number }) => {
  if (f < B7.lines[0]) return null;
  const lines: { text: string; style: CSSProperties }[] = [
    {
      text: narrative.attribution,
      style: {
        fontFamily: serif.fontFamily,
        fontWeight: 600,
        fontSize: 52,
        letterSpacing: -0.6,
        color: C.navy,
      },
    },
    {
      text: narrative.credit,
      style: {
        fontFamily: sans.fontFamily,
        fontWeight: 500,
        fontSize: 30,
        color: C.blue,
      },
    },
    {
      text: narrative.disclosure,
      style: {
        fontFamily: sans.fontFamily,
        fontWeight: 400,
        fontSize: 22,
        color: C.navy,
        opacity: 0.7,
      },
    },
  ];
  const tops = [470, 556, 606];
  return (
    <>
      {lines.map((l, i) => {
        const t = tween(f, B7.lines[i], DUR.base, "enter");
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: tops[i],
              textAlign: "center",
              overflow: "hidden",
              paddingBottom: 8,
            }}
          >
            <div
              style={{
                ...l.style,
                opacity: ((l.style.opacity as number | undefined) ?? 1) * t,
                transform: `translateY(${(1 - t) * 100}%)`,
              }}
            >
              {l.text}
            </div>
          </div>
        );
      })}
    </>
  );
};

// ── Film ──────────────────────────────────────────────────────────────────
const MIX = "audio/mix-v2.wav";
export const Film = () => {
  const f = useCurrentFrame();
  const hasMix = getStaticFiles().some((s) => s.name === MIX);
  return (
    <AbsoluteFill style={{ background: C.paper, overflow: "hidden" }}>
      <World f={f} />
      <TextLayer f={f} />
      {hasMix ? <Audio src={staticFile(MIX)} /> : null}
    </AbsoluteFill>
  );
};
export { BEAT };
