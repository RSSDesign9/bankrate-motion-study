import { createRoot } from "react-dom/client";
import { useRef, useState, type KeyboardEvent } from "react";
import { narrative } from "../remotion/narrative";
import { tokens } from "../remotion/constants";
import "./styles.css";
for (const [key, value] of Object.entries(tokens))
  document.documentElement.style.setProperty(key, value);
const clock = (seconds: number) =>
  `0:${Math.floor(seconds).toString().padStart(2, "0")}`;
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
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
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
  const key = (e: KeyboardEvent<HTMLElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.code === "Space") {
      e.preventDefault();
      toggle();
    }
    if (e.key.toLowerCase() === "m") {
      e.preventDefault();
      setMuted((m) => !m);
    }
  };
  return (
    <section
      className="player-shell"
      aria-label="Consumer-first motion study video"
      tabIndex={0}
      onKeyDown={key}
    >
      <div className="viewport">
        <video
          ref={video}
          width="1920"
          height="1080"
          poster="/poster/bankrate-motion-study-poster.jpg"
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
          aria-label="21-second silent motion study; transcript below"
        >
          <source src="/renders/bankrate-motion-study.mp4" type="video/mp4" />
          <source src="/renders/bankrate-motion-study.webm" type="video/webm" />
          <track
            kind="captions"
            src="/renders/narrative.vtt"
            srcLang="en"
            label="English narrative"
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
              <span className="duration">/ 21 sec</span>
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
          max="21"
          step="0.1"
          value={time}
          aria-valuetext={`${clock(time)} of 0:21`}
          onChange={(e) => {
            const t = Number(e.target.value);
            if (video.current) video.current.currentTime = t;
            setTime(t);
          }}
          style={{
            background: `linear-gradient(to right,var(--br-electric-500) ${(time / 21) * 100}%,#ffffff55 ${(time / 21) * 100}%)`,
          }}
        />
        <span className="time">
          {clock(time)} <span>/ 0:21</span>
        </span>
        <button
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute" : "Mute"}
          aria-describedby="silent-note"
          title={muted ? "Unmute (silent film)" : "Mute"}
        >
          <Icon kind={muted ? "muted" : "sound"} />
        </button>
      </div>
      <div className="player-meta">
        <span>01 — Consumer-first</span>
        <span id="silent-note">A silent motion study</span>
      </div>
      {error ? (
        <p className="playback-error" role="alert">
          {error} <a href="/renders/bankrate-motion-study.mp4">Open MP4</a>
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
          <div className="eyebrow">
            <span className="label-dot" />
            Independent motion study{" "}
            <span className="byline">Raj Shah / 2026</span>
          </div>
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
              idea could extend into motion through drawing, reveal, comparison,
              and resolution.
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
            Read the transcript <span aria-hidden="true">+</span>
          </summary>
          <ol className="transcript">
            {[
              narrative.coldOpen,
              narrative.prevalence,
              narrative.annualCost,
              narrative.structure.join(" "),
              narrative.competition.join(" "),
              `${narrative.resolution} ${narrative.attribution}`,
            ].map((text, i) => (
              <li key={text}>
                <span>
                  {["00:00", "00:02", "00:06", "00:09", "00:13", "00:18"][i]}
                </span>
                <p>{text}</p>
              </li>
            ))}
          </ol>
          <p className="sources">
            Financial claims:{" "}
            <a href="https://www.bankrate.com/">Bankrate homepage</a> and{" "}
            <a href="https://www.bankrate.com/mortgages/the-hidden-homeownership-tax/">
              The Hidden Homeownership Tax
            </a>
            . Verified September 21, 2026. Offer cards are illustrative and
            contain no advertised rates.
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
