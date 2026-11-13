import { createRoot } from "react-dom/client";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { captions, narrative } from "../remotion/narrative";
import { tokens } from "../remotion/constants";
import { EASE } from "../remotion/ease.ts";
import { DURATION, FPS } from "../remotion/timeline";
import "./styles.css";
for (const [key, value] of Object.entries(tokens))
  document.documentElement.style.setProperty(key, value);
// The page's press feedback uses the film's own enter curve.
for (const [key, [a, b, c, d]] of Object.entries(EASE))
  document.documentElement.style.setProperty(
    `--ease-${key}`,
    `cubic-bezier(${a}, ${b}, ${c}, ${d})`,
  );
// v2 is the film; v1 (the original 2-hour interview sprint, silent) stays
// one click away for comparison. ?v=1 deep-links to it.
const VERSIONS = {
  v2: {
    name: "v2",
    tag: "current",
    file: "bankrate-motion-study-v2",
    captions: "narrative-v2",
    length: DURATION / FPS,
    sound: true,
    note: "the directed revision · with sound",
  },
  v1: {
    name: "v1",
    tag: "original",
    file: "bankrate-motion-study-v1",
    captions: "narrative-v1",
    length: 21,
    sound: false,
    note: "the 2-hour sprint · silent",
  },
} as const;
type VersionKey = keyof typeof VERSIONS;
const initialVersion = (): VersionKey =>
  new URLSearchParams(location.search).get("v") === "1" ? "v1" : "v2";
const clock = (seconds: number) =>
  `0:${Math.floor(seconds).toString().padStart(2, "0")}`;
// Sound preference survives reloads; storage can throw (private mode,
// blocked site data), so every access is guarded and the page still works.
const SOUND_KEY = "motion-study-sound";
const readSound = () => {
  try {
    return localStorage.getItem(SOUND_KEY) === "on";
  } catch {
    return false;
  }
};
const writeSound = (on: boolean) => {
  try {
    localStorage.setItem(SOUND_KEY, on ? "on" : "off");
  } catch {
    /* preference just won't persist */
  }
};
function Icon({
  kind,
}: {
  kind: "play" | "pause" | "replay" | "muted" | "sound";
}) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {kind === "play" ? (
        <path d="m8 5 11 7-11 7Z" fill="currentColor" />
      ) : kind === "pause" ? (
        <path d="M8 5v14M16 5v14" strokeWidth="4" />
      ) : kind === "replay" ? (
        <>
          <path d="M4 10a8 8 0 1 1 1 8M4 4v6h6" />
        </>
      ) : (
        <>
          <path d="M3 9h4l5-4v14l-5-4H3Z" />
          {kind === "muted" ? (
            <path d="m17 9 5 6m0-6-5 6" />
          ) : (
            <path d="M17 8q4 4 0 8m3-11q7 7 0 14" />
          )}
        </>
      )}
    </svg>
  );
}
function Player() {
  const video = useRef<HTMLVideoElement>(null);
  const [versionKey, setVersionKey] = useState<VersionKey>(initialVersion);
  const v = VERSIONS[versionKey];
  const LENGTH = v.length;
  const SECONDS = Math.round(LENGTH);
  const [playing, setPlaying] = useState(false);
  // Starts muted unless the viewer chose sound before; playback itself is
  // always user-initiated.
  const [soundOn, setSoundOn] = useState(readSound);
  const muted = !soundOn;
  const toggleSound = () =>
    setSoundOn((on) => {
      writeSound(!on);
      return !on;
    });
  useEffect(() => {
    if (video.current) video.current.muted = muted;
  }, [muted, versionKey]);
  const [time, setTime] = useState(0);
  // timeupdate fires ~4×/s, which makes the progress bar step; while
  // playing, follow the video every animation frame instead.
  useEffect(() => {
    if (!playing) return;
    let id = 0;
    const tick = () => {
      setTime(video.current?.currentTime || 0);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [playing]);
  const [ended, setEnded] = useState(false);
  const [error, setError] = useState("");
  const play = async () => {
    if (!video.current) return;
    try {
      setError("");
      await video.current.play();
    } catch {
      setError(
        "Playback could not start. You can open the MP4 directly below.",
      );
    }
  };
  const toggle = () => {
    if (video.current?.paused) void play();
    else video.current?.pause();
  };
  const replay = () => {
    if (video.current) {
      video.current.currentTime = 0;
      setTime(0);
      setEnded(false);
      void play();
    }
  };
  const switchTo = (next: VersionKey) => {
    if (next === versionKey) return;
    video.current?.pause();
    setVersionKey(next);
    setPlaying(false);
    setEnded(false);
    setTime(0);
    setError("");
  };
  const key = (e: KeyboardEvent<HTMLElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.code === "Space") {
      e.preventDefault();
      toggle();
    }
    if (e.key.toLowerCase() === "m" && v.sound) {
      e.preventDefault();
      toggleSound();
    }
  };
  return (
    <section
      className="player-shell"
      aria-label="Consumer-first motion study video"
      tabIndex={0}
      onKeyDown={key}
    >
      <div className="version-bar">
        <div className="version-switch" role="group" aria-label="Film version">
          {(Object.keys(VERSIONS) as VersionKey[]).map((k) => (
            <button
              key={k}
              aria-pressed={versionKey === k}
              onClick={() => switchTo(k)}
            >
              {VERSIONS[k].name}
              <span className="version-tag"> · {VERSIONS[k].tag}</span>
            </button>
          ))}
        </div>
        <a
          className="compare-link"
          href="/renders/bankrate-motion-study-v1-vs-v2.mp4"
          target="_blank"
          rel="noopener"
        >
          Side by side
          <span className="sr-only"> (opens video in a new tab)</span>
          <span aria-hidden="true"> ↗</span>
        </a>
      </div>
      <div className="viewport">
        <video
          key={versionKey}
          ref={video}
          width="1920"
          height="1080"
          poster={`/poster/bankrate-motion-study-poster-${v.name}.jpg`}
          preload="none"
          playsInline
          muted={muted}
          onClick={toggle}
          onPlay={() => {
            setPlaying(true);
            setEnded(false);
          }}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false);
            setEnded(true);
          }}
          onTimeUpdate={() => setTime(video.current?.currentTime || 0)}
          onError={() =>
            setError(
              "This browser could not load the film. Open the MP4 directly below.",
            )
          }
          aria-label={
            v.sound
              ? `${SECONDS}-second motion study with optional sound; transcript below`
              : `${SECONDS}-second original version, silent`
          }
        >
          <source src={`/renders/${v.file}.mp4`} type="video/mp4" />
          <source src={`/renders/${v.file}.webm`} type="video/webm" />
          <track
            kind="captions"
            src={`/renders/${v.captions}.vtt`}
            srcLang="en"
            label="English"
          />
        </video>
        {!playing ? (
          <button
            className="poster-play"
            onClick={ended ? replay : () => void play()}
            aria-label={ended ? "Replay film" : "Play film"}
          >
            <Icon kind={ended ? "replay" : "play"} />
            <span>
              {ended ? "Watch again" : "Play study"}{" "}
              <span className="duration">/ {SECONDS} sec</span>
            </span>
          </button>
        ) : null}
      </div>
      <div className="controls">
        <button
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          title={playing ? "Pause" : "Play"}
        >
          <Icon kind={playing ? "pause" : "play"} />
        </button>
        <button onClick={replay} aria-label="Replay from start" title="Replay">
          <Icon kind="replay" />
        </button>
        <label className="sr-only" htmlFor="progress">
          Video progress
        </label>
        <input
          id="progress"
          type="range"
          min="0"
          max={LENGTH}
          step="0.1"
          value={time}
          aria-valuetext={`${clock(time)} of ${clock(LENGTH)}`}
          onChange={(e) => {
            const t = Number(e.target.value);
            if (video.current) video.current.currentTime = t;
            setTime(t);
          }}
          style={{
            background: `linear-gradient(to right,var(--br-electric-500) ${(time / LENGTH) * 100}%,#ffffff55 ${(time / LENGTH) * 100}%)`,
          }}
        />
        <span className="time">
          <span>{clock(time)}</span>
          <span className="time-total">/ {clock(LENGTH)}</span>
        </span>
        {v.sound ? (
          <button
            className="sound-toggle"
            onClick={toggleSound}
            aria-pressed={soundOn}
            title="Sound (M)"
          >
            <Icon kind={soundOn ? "sound" : "muted"} />
            <span>{soundOn ? "Sound on" : "Sound off"}</span>
          </button>
        ) : (
          <span className="silent-label">
            <Icon kind="muted" />
            Silent cut
          </span>
        )}
      </div>
      <div className="player-meta">
        <span>01 — Consumer-first</span>
        <span>{`${v.name} · ${v.note}`}</span>
      </div>
      {error ? (
        <p className="playback-error" role="alert">
          {error} <a href={`/renders/${v.file}.mp4`}>Open MP4</a>
        </p>
      ) : null}
    </section>
  );
}
function App() {
  return (
    <>
      <div className="background" aria-hidden="true">
        <svg className="brush brush-one" viewBox="0 0 600 650">
          <path d="M-100 83Q71 47 169 72Q312 104 451 33L510 97Q395 190 245 199Q76 185-40 237ZM-70 310Q183 210 464 260L541 332Q250 310-40 487Z" />
        </svg>
        <svg className="brush brush-two" viewBox="0 0 600 650">
          <path d="M85 240Q261 270 471 155L672 258Q368 470 30 403Z" />
        </svg>
      </div>
      <main>
        <header>
          <h1>
            When lenders compete,
            <br className="desktop-break" /> homebuyers can win.
          </h1>
          <p className="intro">
            A short exploration of how Bankrate’s consumer-first story could
            move.
          </p>
        </header>
        <Player />
        <section className="project-note" aria-label="About this study">
          <p className="note-title">
            Financial rates matter
            <br />
            because they affect people.
          </p>
          <div>
            <p>
              Bankrate’s new identity puts people—not percentages—at the center
              of financial decisions. This independent study explores how that
              idea could move: one continuous character, a camera instead of
              cuts, a small set of easing and timing rules, and an original
              sound layer.
            </p>
            <p className="credit">
              Concept, design, and development by Raj Shah · Built as an
              independent exploration after learning about Bankrate’s Brand
              Product team.
            </p>
            <p className="disclosure">{narrative.disclosure}</p>
          </div>
          <svg className="note-burst" viewBox="0 0 100 100" aria-hidden="true">
            <path d="M30 66 12 55M46 44 39 17M67 49 84 25" />
          </svg>
        </section>
        <details>
          <summary>
            Read the transcript (v2) <span aria-hidden="true">+</span>
          </summary>
          <ol className="transcript">
            {captions.map((c) => (
              <li key={c.text}>
                <span>{`00:${Math.floor(c.from / FPS)
                  .toString()
                  .padStart(2, "0")}`}</span>
                <p>{c.text.replace(/\n/g, " ")}</p>
              </li>
            ))}
          </ol>
          <p className="sources">
            Financial claims:{" "}
            <a href="https://www.bankrate.com/">Bankrate homepage</a> and{" "}
            <a href="https://www.bankrate.com/mortgages/the-hidden-homeownership-tax/">
              The Hidden Homeownership Tax
            </a>
            . Verified October 12, 2026. Rates shown in the film are
            illustrative, not actual offers. Music: “Pop Parapop” by Michael
            Ramir C. (Mixkit Stock Music Free License). Sound effects are
            generated in code.
          </p>
        </details>
        <footer>
          <span>Raj Shah</span>
          <span>Independent exploration · 2026</span>
        </footer>
      </main>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);

if (import.meta.env.DEV && new URLSearchParams(location.search).has("audit")) {
  window.addEventListener(
    "load",
    () => {
      void import("./audit").then(({ auditPage }) => auditPage());
    },
    { once: true },
  );
}
