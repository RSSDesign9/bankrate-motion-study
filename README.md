# Consumer-First Motion Study

Independent design exploration by Raj Shah. Not affiliated with or commissioned by Bankrate.

## Delivery status

**v2 is live** at https://raj-shah-consumer-first-motion.netlify.app/. Raj uploaded `bankrate-motion-study-v2-dist.zip` through Netlify Production deploys on October 13, 2026; it replaces v1.

Verified on the live page that day:

- the page serves the v2 MP4, WebM, captions and poster;
- OG and canonical tags use the public domain and the v2 image;
- `/renders/*` is served `immutable`, and v1's old URL returns 404;
- the Sound off / Sound on toggle is present and there is no silent-film text;
- the film plays and seeks to the end with sound on, with no media errors.

v2 is a 23.4-second, 1920×1080, 30fps film with sound, built around a brand motion system:

- one continuous hero;
- a camera instead of cuts;
- four easing curves;
- a rigged character;
- a navy portal and a light-blue flood as the transitions;
- music edited to picture, with generated sound effects.

v1 (September 21, 2026: 21 seconds, silent) is archived in `archive/v1/` for the portfolio before/after.

## Run, render, build

Node 24.11.1 and npm 11.6.2 were used. Remotion packages are pinned together at 4.0.526; TypeScript is 5.9.3. Use the included npm lockfile. The Node scripts import `src/remotion/timeline.ts` directly (Node type stripping), so picture and sound share one timeline.

```sh
npm ci
npm run dev             # landing page, localhost:4174
npm run studio          # editable Remotion composition
npm run typecheck
npm run format:check
npm run audio           # build SFX (scripts/build-sfx.mjs) + mix to picture (scripts/build-mix.mjs)
npm run captions        # public/renders/narrative-v2.vtt from the film's copy and timeline
npm run render:video    # audio + captions + final render, encodes, poster, OG and QA (scripts/render-final.mjs)
npm run render:styles   # style frames, drawing-system sheet, rig regression → docs/v2/style-frames/
npm run render:preview -- /tmp/preview.mp4 0.5   # fast half-resolution review render
node scripts/build-compare.mjs                   # v1-vs-v2 stills and side-by-side video (docs/v2)
npm run build           # production dist/
npm run preview         # production preview, localhost:4175
```

The final render uses system FFmpeg (set `FFMPEG_PATH` to override); it needs libx264, libvpx-vp9, AAC and libopus. Chrome Headless Shell and the approved Google Fonts download on the first render, so rendering needs network access. macOS 14.4 triggers a Remotion compatibility warning; stills and full renders pass on this machine.

## Where things live

- `src/remotion/motion.ts` and `ease.ts`: the motion tokens (easing, durations, stagger, springs, arc helpers, reading time).
- `src/remotion/timeline.ts`: every beat, cue and music edit point. The scenes and the audio scripts both import it.
- `src/remotion/film/`: the single film composition (`Film.tsx`) and its choreography (`layout.ts`).
- `src/remotion/components/`: the articulated figure (`rig.ts`, `poses.ts`), primitives (`PercentBox`, `Coin`, `RateTile`, document, loop, underline) and the word build.
- `src/site/`: the landing page. Remotion is not bundled into the page (73 KB gzip JS).
- `docs/v2/`: the motion spec, the review, before/after material and the process note (see Deliverables).

## Deliverables

- `public/renders/bankrate-motion-study-v2.mp4`: 1920×1080, H.264 yuv420p, 30fps, 703 frames, 23.4s, AAC 192 kbps 48 kHz stereo, fast-start.
- `public/renders/bankrate-motion-study-v2.webm`: VP9 + Opus 128 kbps 48 kHz stereo.
- `public/renders/narrative-v2.vtt`: timed English captions.
- `public/renders/bankrate-motion-study-v1.{mp4,webm}`, `narrative-v1.vtt` and `public/poster/bankrate-motion-study-poster-v1.jpg`: the original v1, served by the version switch.
- `public/renders/bankrate-motion-study-v1-vs-v2.mp4`: the side-by-side comparison linked from the player.
- `public/poster/bankrate-motion-study-poster-v2.jpg` (1600×900) and `public/og/bankrate-motion-study-v2.jpg` (1200×675), both taken from the final hold.
- `docs/v2/motion-spec.md`: the one-page brand motion system.
- `docs/v2/animation-review.md`: review findings (Before | After | Why) and verdict.
- `docs/v2/v1-vs-v2.md`, plus `docs/v2/compare/`: four annotated before/after pairs.
- `docs/v2/v1-vs-v2-side-by-side.mp4`: v1 and v2 stacked with labels; v1 holds its last frame to match length.
- `docs/v2/process-note.md`: a draft portfolio blurb.
- `docs/v2/review/`: contact sheets and slow-motion transition strips from the review passes.

**v1/v2 switch:** the player defaults to v2 and has a two-button version switch (`v2 · current` / `v1 · original`, `aria-pressed`). Switching swaps the sources, poster, captions, length and sound control in the same player. `?v=1` deep-links to v1. v1 is silent, so the sound toggle is replaced by a "Silent cut" label.

- A "Side by side ↗" link opens the synced comparison video (`public/renders/bankrate-motion-study-v1-vs-v2.mp4`).
- Why a switch rather than a side-by-side layout: side by side halves the size of the current work and isn't readable on phones. The switch keeps v2 as the hero and puts the before one click away.
- v1 ships under new file names (`-v1`), copied byte-for-byte from `archive/v1/`.

The page starts muted and has a visible **Sound off / Sound on** toggle (icon and label, `aria-pressed`, 44px minimum). The choice is remembered in `localStorage`, guarded so the page still works if storage throws. Playback is always user-initiated.

Keyboard:

- Space plays and pauses when the player region is focused.
- M toggles sound.
- The arrow keys seek on the progress slider.
- The transcript disclosure is keyboard operable.

Buttons press to `scale(0.97)` over 160ms on the film's own `enter` curve. Hover is gated to fine pointers, and reduced motion removes the press movement.

## Verification

- **Composition:** 703 frames, 1920×1080, 30fps, 23.4s. FFprobe confirms both encodes, each with a 48 kHz stereo audio stream. See `docs/final-qa/checks.json`.
- **Determinism:** the same frame renders identically twice.
- **Final hold:** frames 610–654 (1.5s) are pixel-identical, checked every 4 frames and at both ends.
- **Loudness:**
  - The mix is −16 LUFS integrated with a true peak of −3.1 dBTP (two-pass `loudnorm`, linear mode). A gentle limiter comes first because the source track peaks above 0 dBFS.
  - The encodes measure −16.0 LUFS (MP4) and −15.9 LUFS (WebM).
- **Audio sync:** every sound cue lands within 0.05 frames of its picture event (`docs/v2/audio-report.json`). Effects sit 3–17 dB under the music.
- **Figures:** the rig's rest pose is pixel-identical to v1's figures (`docs/v2/baseline/rig-regression-v1-top-v2-bottom.png`).
- **Review:** four passes: two visual (contact sheets and frame-by-frame transition strips in `docs/v2/review/`), then an independent code review using Kowalski's method and a verification of the fixes. The final verdict is Approve (`docs/v2/animation-review.md`).
- **Accessibility:** axe-core (WCAG 2 A/AA, 2.1 AA) finds 0 violations, 21 passes and 0 incomplete checks (`npm run dev`, open `/?audit=1`, read `ACCESSIBILITY_AUDIT`).
- **Responsive:** checked at 1440×900, 1280×720, 1024×768, 768×1024, 390×844 and 320×568. There is no horizontal scrolling, and every button and summary is at least 44×44.
- **Keyboard:** Space, M (toggles and persists), arrow-key seeking and the transcript disclosure were all tested in the in-app browser.
- **Playback:** with sound on, the film played to the end in the in-app browser (703 frames decoded, audio decoded, no media errors). See "Not yet verified" for sound off.
- **Build:** TypeScript, Prettier and the production build pass.

**Not yet verified:**

- Safari and Firefox playback.
- A throttled-network LCP audit.
- External share-preview validation.
- Muted playback in a visible browser pane. Chrome pauses muted, video-only media while the pane is hidden; this is an environment behavior, not a page bug.

## Sources and asset provenance

**Claims**, re-checked October 12, 2026:

- "9 out of 10 homebuyers overpay for their mortgage" and "We make lenders compete for your loan until the best rate wins": https://www.bankrate.com/.
- $3,343 a year: https://www.bankrate.com/mortgages/the-hidden-homeownership-tax/ (published June 24, 2026), which gives it as the figure "for the typical borrower".
- Homebuyer (beat 2) and homeowner (beat 3) claims are kept distinct.
- Rates in the film are illustrative, not actual offers, and are labelled as such.

**Music:** "Pop Parapop" by Michael Ramir C., from Mixkit (https://mixkit.co/free-stock-music/), under the Mixkit Stock Music Free License (https://mixkit.co/license/#musicFree).

- No attribution is required; it is credited on the page anyway.
- License terms (checked October 12, 2026): commercial or non-commercial use, including web video. Not allowed: CDs and DVDs, TV and radio, video games, remixing the music or putting it in a music-only track, claiming it as your own, or registering it with any rights-management service (such as Content ID).
- In v2 the music is only trimmed and spliced on the beat to fit the picture inside the video. That is ordinary sync editing, not a remix or a standalone music release.
- The source MP3 lives in `references/audio/` (not shipped). Only the mixed soundtrack inside the video ships; `public/audio/` is excluded from `dist/`.

**Sound effects** are synthesized deterministically in code (`scripts/build-sfx.mjs`). No samples are downloaded.

**Illustration:** all figures, boxes, coins, tiles, houses and lines are newly authored SVG. The supplied reference video was studied for structure and palette (colors are sampled into `constants.ts` as a restrained secondary palette). No frame, logo, illustration file or font from it is bundled or traced. No Bankrate logo, wordmark or font is used.

**Fonts:** Source Serif 4 and Instrument Sans, both SIL Open Font License, loaded through `@remotion/google-fonts` in the film and official Google Fonts on the page.

- https://github.com/google/fonts/blob/main/ofl/sourceserif4/OFL.txt
- https://github.com/google/fonts/blob/main/ofl/instrumentsans/OFL.txt

There are no photographs, AI-generated people, analytics, advertising pixels, forms or visitor-data collection. The only browser storage is the sound preference in `localStorage`.

## Netlify deployment

The existing site is `raj-shah-consumer-first-motion`. `.env.production` supplies its public URL for canonical and Open Graph metadata. `netlify.toml` configures `npm run build` and `dist`; `public/_headers` also supplies headers for manual uploads.

v2 media uses new file names (`-v2`), because `/renders/*` is cached as `immutable`. Deploy with one of these:

- (a) Upload `bankrate-motion-study-v2-dist.zip` (the contents of `dist/`) through the project's Production deploys area, as with v1.
- (b) Use the Netlify CLI, if it is authenticated.

Don't upload the source directory.
