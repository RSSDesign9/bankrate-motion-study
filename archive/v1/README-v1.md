# Consumer-First Motion Study

Independent design exploration by Raj Shah. Not affiliated with or commissioned by Bankrate.

## Delivery status

Final 21-second video and landing page are published at https://raj-shah-consumer-first-motion.netlify.app/. Raj authorized publication. The September 21, 2026, 10:55 AM production deployment (`6ab16f8e00c7e657c4cc17d9`) removes the decorative header circle. Verified on the public page by screenshot and DOM inspection; canonical and Open Graph URLs use the public domain.

The latest direction incorporates Raj's reference: two original geometric body families with six hairstyles, independently varied posture, balanced percent symbols, and a slower opening. The first statement now holds for 2.4 seconds; the transition unfolds over 0.8–1.2 seconds. The final composition remains still for at least one second, and total duration remains 21 seconds.

## Run, render, build

Node 24.11.1 and npm 11.6.2 were used. Remotion packages are pinned together at 4.0.526; TypeScript is 5.9.3. Use the included npm lockfile.

```sh
npm ci
npm run dev             # landing page, localhost:4174
npm run studio          # editable Remotion composition
npm run typecheck
npm run format:check
npm run render:styles   # illustration sheet and three style frames
npm run render:video    # final master, WebM, poster, OG and render QA
npm run build           # production dist/ folder
npm run preview         # production preview, localhost:4175
```

The final-render script uses bundled FFmpeg on this Mac. Other hosts can set `FFMPEG_PATH` to their compatible FFmpeg executable. Chrome and approved Google Fonts are downloaded on the first render, so rendering requires network access. macOS 14.4 triggers a Remotion compatibility warning; both still and full H.264 renders passed on this machine.

Earlier review scripts remain available as `render:rough`, `encode:review`, and `review`. Their outputs under `public/review/` are historical drafts. The production build copies only the final `renders/`, `poster/`, `og/`, and favicon assets; historical reviews and QA images are excluded.

## Deliverables

- `public/renders/bankrate-motion-study.mp4`: 1920×1080, H.264, yuv420p, 30fps, 630 frames, 21 seconds, 1,500,327 bytes, fast-start metadata.
- `public/renders/bankrate-motion-study.webm`: alternative browser source.
- `public/renders/narrative.vtt`: timed English narrative captions.
- `public/poster/bankrate-motion-study-poster.jpg`: deliberate resolution frame, 1600×900, approximately 64 KB.
- `public/og/bankrate-motion-study.jpg`: share image, 1200×675, approximately 43 KB.
- `src/remotion/`: original SVG drawing system and six frame-driven scenes.
- `src/site/`: responsive React presentation page. Remotion's renderer/editor is not imported into the public bundle.

The film is intentionally silent. Mute controls still behave normally; the visible silent-film label prevents ambiguity. Playback is user initiated, including under reduced-motion preferences. Space toggles playback and M toggles mute when the player region itself is focused. Buttons, seek slider, and transcript are independently keyboard accessible.

## Verification

- Final composition: 630 frames, 1920×1080, 30fps, 21 seconds; yuv420p H.264 verified with FFprobe.
- Nineteen sampled frames include opening, transition, all scene boundaries, and settled compositions. The same frame renders identically; frames 599 and 629 are pixel-identical. See `docs/final-qa/checks.json`.
- Ten figures and exactly nine payment marks in the prevalence scene. Placeholder offers contain no numeric APRs. Selection includes position, text, checkmark, and outline.
- Responsive layouts checked at 1440×900, 1280×720, 1024×768, 768×1024, 390×844, and 320×568. No horizontal scrolling. All buttons are at least 44×44 CSS pixels.
- Mobile headline fits at most three lines. It scales down to 28px on the narrowest viewport to preserve that limit; this deliberately departs from the brief's suggested 38–46px range.
- Keyboard Space, M, arrow-key seeking, and transcript disclosure tested. A 720px-wide reflow check covers the layout equivalent of 200% zoom on a 1440px viewport; native browser zoom and OS reduced-motion toggling were not independently exercised.
- axe-core WCAG 2 A/AA and 2.1 AA audit: zero violations, 21 passing checks, zero incomplete checks. Run the dev page with `?audit=1` and inspect the `ACCESSIBILITY_AUDIT` console entry to reproduce. Audit code is excluded from production.
- Production JS is approximately 72 KB gzip; CSS approximately 2.1 KB gzip. The initial page requests the poster but does not preload video data. Google Fonts uses `display=swap` and system fallbacks.
- TypeScript, formatting, production build, and npm dependency audit pass.
- Final player successfully played to completion in Chrome and the in-app browser without media errors. Earlier native-control draft pages crashed there; the final custom-control page does not use that draft player.
- Safari/Firefox playback, a throttled-network LCP audit, and external share-preview validation remain independent release checks. Do not treat local timings as a broadband performance score.

## Sources and asset provenance

Homepage claims were checked on September 21, 2026 at https://www.bankrate.com/. Research: https://www.bankrate.com/mortgages/the-hidden-homeownership-tax/. Homepage wording is preserved; the study's distinct homebuyer and overall homeowner claims are not conflated with the research's overall borrower percentage.

The supplied local reference video was inspected at six points. The initial direction borrowed editorial restraint, paper/blue color relationships, and simple figures. Raj subsequently requested two body families and varied hairstyles based on the supplied still. All delivered figure, house, brush, and accent paths are newly authored SVG; no source video frame, proprietary logo, illustration file, or font file is bundled.

**Source Serif 4** is the deliberate, legally reusable editorial substitute; typographic pixel accuracy is not claimed. **Instrument Sans** supplies interface text. Remotion loads both through `@remotion/google-fonts`; the page uses official Google Fonts delivery. No RecifeText font or Bankrate-hosted font URL is used.

Both font families use the SIL Open Font License. Official source/license information:

- Source Serif: https://github.com/google/fonts/blob/main/ofl/sourceserif4/OFL.txt
- Instrument Sans: https://github.com/google/fonts/blob/main/ofl/instrumentsans/OFL.txt

No photographs, AI-generated people, downloaded illustration assets, advertising pixels, analytics, forms, or visitor-data collection are included. No audio license is required for this silent film.

## Netlify deployment

The existing site is `raj-shah-consumer-first-motion`. `.env.production` supplies its public URL for canonical and Open Graph metadata. `netlify.toml` configures `npm run build` and `dist`; `public/_headers` also supplies headers for manual uploads.

Build with `npm run build`, then upload a ZIP of the contents of `dist` through the existing project's Production deploys area. The September 21 update used this workflow successfully. Do not upload the source directory.

For subsequent media changes, version immutable media URLs to avoid stale caches. External link-preview debugger and media byte-range checks remain unaudited.
