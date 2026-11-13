# Consumer-First Motion Study: v2 Tasks

Executor: Claude Opus 5.5, in a fresh session. Owner: Raj Shah (raj@rssdesign.org).
Project root: `bankrate-motion-study/` (this folder). Read this whole file before touching anything.

---

## 0. Context you need

**What this is.** A 21-second silent Remotion brand film (v1), made in about 2 hours as a speculative piece for a final-round Senior Product Designer, Brand interview at Bankrate. It is published at https://raj-shah-consumer-first-motion.netlify.app/. Raj is now applying for Senior and Staff roles and wants a v2 strong enough to lead a portfolio. The audience is recruiters, hiring managers and design leaders, and the bar is "a Creative Director would sign off on this."

**Raj's background.** Senior Product Designer with little motion-design experience. Explain motion decisions in plain language in your summaries.

**What a Creative Director's review found in v1** (fix all of these):

1. **No continuity across cuts.** Each scene is its own `<Sequence>`, and whole scenes crossfade (`src/remotion/scenes/StyleFrames.tsx:52`, `:240`; overlapping sequences in `src/remotion/Root.tsx:41-56`). This double-exposes the hero at about 2.5s and kills the match cut the code was attempting (`StyleFrames.tsx:81-104`).
2. **The hero beat (competition) is the weakest scene.** It shows empty "%." cards and a single one-slot reorder. "Best rate" pops on with a hard boolean (`RemainingScenes.tsx:191`). The return arrow reads like a flowchart (`RemainingScenes.tsx:290`).
3. **Show-don't-tell gaps.**
   - "Already complicated" is shown with a calm person and a calm house.
   - The overpay glyph (≡%, `Primitives.tsx:157`) reads as a hamburger-menu icon.
   - $3,343 just fades in (`RemainingScenes.tsx:144`).
4. **One easing curve for everything** (`bezier(0.22,1,0.36,1)` at `StyleFrames.tsx:23` and `RemainingScenes.tsx:17`). With no rhythmic contrast, the energy stays flat.
5. **Figures are static mannequins.** There is no anticipation, follow-through, arcs or secondary action.
6. **Even, slide-like pacing** (six beats of about 3.5s each), and a bloated static end card that mixes the brand line with the portfolio credit.

**Decisions Raj has locked:**

- Keep the illustration style (hand-cut geometric figures, two body families, six hairstyles), the paper and blue base, and the serif and sans pairing.
- Target about **22.5s** (±1s is fine), **16:9 only**, 1920×1080, 30fps.
- **Light copy edits are allowed.** Sourced claims keep their meaning and wording (see §3).
- **Add audio.** The site player gets a clear sound on/off control.
- **Music source:** a royalty-free track (option b), with an original code-generated score as the fallback (option c). See §6.
- **v2 replaces v1** on the existing Netlify site. Archive v1 locally for the portfolio before/after.
- **One hero character** (the viewer, "you"), not the reference's couple.
- **No Bankrate logo or wordmark artwork.** Keep the "inspired by" disclaimer.

**Skills to load:**

- `remotion-best-practices`: before writing any Remotion code.
- Emil Kowalski's review-animations skill: https://github.com/emilkowalski/skill/tree/main/skills/review-animations. Fetch `SKILL.md` and `STANDARDS.md` from raw.githubusercontent.com and use them for the self-review in §8. It is written for UI, so apply the rules that carry over to linear film: easing choice, nothing from scale(0), stagger, blur-masked crossfades, staging and cohesion, and "delete the animation." Rules about sub-300ms timing, interruptibility and hover gating apply only to the landing-page player.

---

## 1. Safety and process rules (non-negotiable)

- **Ask before any download** (state the file name, source, size and license) and **before any deploy or publish**. Raj's approval in earlier sessions does not carry over.
- **Never deploy to Netlify yourself without an explicit "yes" in chat.** The default ending of this task is a built `dist/` plus a ZIP, then a stop.
- **Git:** the parent folder is a git repo with no commits. Do not commit, push or create remotes unless Raj asks. If he does, his GitHub username is **RSSDesign9** (not RSSDesign69).
- **Provenance:** all figures, boxes, tiles, coins and houses must be newly authored SVG. Do not trace, bundle or extract frames or assets from the reference video. Do not use Bankrate's logo, logo mark or fonts.
- **Fonts:** stay on Source Serif 4 and Instrument Sans (OFL, loaded via `@remotion/google-fonts`).
- **`node_modules`:** contains Finder-duplicate folders (`cli 2`, `renderer 2`, …). Ignore them. If module resolution breaks, `rm -rf node_modules && npm ci` is fine; tell Raj you did it.
- **Iterate visually.** Render contact sheets, look at them, critique and fix. Do at least two full review passes before calling anything done (§8).

---

## 2. Reference video: what to study and what to borrow

File: `references/output_progressive_434313b4-072a-4bde-8e04-bd672381fe30.mp4` (1138×640, 30fps, 65s, has audio). This is a Bankrate brand film. Study it with `ffmpeg` contact sheets (`-vf "fps=2,scale=380:-1,tile=6x4"`) and single frames.

**Timestamp index:**

| Time | What happens | Borrow |
|---|---|---|
| 0–3s | "Our story starts with a journalist," built word by word | Word-by-word headline build |
| 3–4s | Giant "journal" type pushes through camera | Scale and blur as a transition (use sparingly) |
| 4–7s | Full-bleed blue flood, "Dedicated to helping people" | **Full-bleed color flood** to mark a turn |
| 7–11s | "Understand a complicated **financial system**," duo idle | **Blue text with navy emphasis words** |
| 12–13s | "Finding the **lowest** rates," with rows of $ tags | Emphasis rhythm |
| 14–22s | "We are **not** a bank. But we know **all** their **tricks**." Bank, gold coin drop | **Gold coin dropping at the figure's feet** = money lost |
| 23s | Navy ellipse opens, figures fall into the dark | **Navy portal transition** |
| 26–35s | Figures climb and jump purple % boxes: "The financial system wasn't built for the people navigating it" | **Purple % boxes as obstacles**, active character animation |
| 38–44s | Light-blue field, white rate tiles with colored "BANK" chips, rates tick and shuffle, **hand-drawn loop circles the lowest rate** | **Rate tiles, ticking rates, loop on the winner** |
| 44–52s | Umbrella float over a neighborhood | (not needed) |
| 53–65s | Logo lockup with rotating taglines | Not used: no logo. Keep the end-slate restraint. |

**Colors sampled from the reference** (use these as the secondary palette; keep v1's tokens as primary):

| Role | Hex |
|---|---|
| Figure blue / headline blue | `#005FFC` / `#005BE6` (v1 `--br-blue-600` `#0061FE` is close enough; keep v1's) |
| Navy (emphasis, portal, ink) | `#132034` (v1 `--br-navy-900` `#13223B`; keep v1's) |
| Paper | `#F6F4F3` (v1 `#FAF8F5`; keep v1's) |
| Light-blue flood | `#C6E4FD` |
| % box front / top | `#908DC1` |
| % box side (shade) | `#817DBA` |
| Coin gold | `#EBBE37` |
| Lender chip: yellow / gray / purple / sky / blue / green | `#FCC33C` / `#BCB6B5` / `#9691DF` / `#6FBBFC` / `#5692FA` / `#7CE19A` |
| Rate tile | `#FDFDFD` |

Add these to `src/remotion/constants.ts` as named tokens (e.g. `--br-flood`, `--br-box`, `--br-box-shade`, `--br-coin`, `--br-chip-*`). Use them with restraint. Paper and blue stay dominant, and the secondary colors appear only on boxes, coins, chips and the flood.

---

## 3. Script (final copy)

The navy emphasis words are in **bold**. Base headline color is blue, matching the reference's two-tone pattern; v1 did the inverse. Sourced claims (beats 2, 3 and 5) must keep their meaning. Verify them against the sources listed in `README.md` ("Sources and asset provenance"). Do not conflate "homebuyers" (beat 2) with "homeowners" (beat 3).

| # | Frames (30fps) | Time | On-screen copy |
|---|---|---|---|
| 1 | 0–75 | 0.0–2.5s | Buying a home is already **complicated.** |
| 2 | 75–174 | 2.5–5.8s | **9 out of 10** homebuyers **overpay** for their mortgage. |
| 3 | 174–270 | 5.8–9.0s | Small line: "American homeowners overpay" · Display: **$3,343** · Line: "on their mortgage, **every year.**" |
| 4 | 270–360 | 9.0–12.0s | Good rates exist. Lenders just aren't **made to compete.** |
| 5 | 360–525 | 12.0–17.5s | Bankrate makes lenders **compete** for your loan. Then the secondary line: "Until the best rate wins." |
| 6 | 525–630 | 17.5–21.0s | You don't have to **overpay.** |
| 7 | 630–675 | 21.0–22.5s | End slate: "A consumer-first motion study inspired by Bankrate." / "Concept, design and direction by Raj Shah" / "Independent exploration. Not affiliated with or commissioned by Bankrate." |

Keep the small source and compliance labels:

- Beats 2–3: "Source: Bankrate · The Hidden Homeownership Tax"
- Beats 4–5: "Illustrative rates. Not actual offers."

Update `src/remotion/narrative.ts` (copy and `sceneTiming`) and regenerate the captions as `public/renders/narrative-v2.vtt`.

---

## 4. Beat-by-beat direction

The camera is a top-level transform: scale and translate on a wrapper, using the **move** easing. The hero is **one persistent layer** across the whole film (see §5.2). Never crossfade whole scenes.

**Beat 1 (0–75): "already complicated."**

- **Frame 0 must be a finished composition:** hero and house fully drawn, a few boxes already present. It doubles as the thumbnail. Do not open on a blank or half-drawn frame.
- **Frames 0–40:** the hero walks left to right toward the house (walk cycle). Purple % boxes (newly drawn 2.5D cubes with a % mark, in the reference box style) rise in a staggered stack between hero and house, each with a spring settle.
- **About frame 45:** the hero stops short with an anticipatory half-step back and a slight head tilt.
- **Headline:** builds word by word starting around frame 6. "complicated." lands last, in navy.

**Beat 2 (75–174): "9 out of 10 overpay."**

- **Transition:** the camera pulls back (scale about 1.0→0.62, move ease, roughly 18 frames). The hero becomes figure #4 of ten; place the hero off-center, not first in line.
- **Crowd entrance:** the other nine step in from the sides on a 2–3 frame stagger, using short walk steps or hops that land on arcs. Boxes and house slide out or fade during the pull-back; they don't vanish.
- **Overpaying:** on nine figures, including the hero, a gold coin pops from the figure, arcs and drops to its feet (gravity: ease-in fall, small bounce). Each figure slumps on impact (torso dips 4–6px, arms drop). Stagger 3 frames. The one figure that doesn't overpay stays upright.
- **Delete the ≡% PaymentMark entirely.**

**Beat 3 (174–270): "$3,343 every year."**

- **Transition:** the camera pushes in on the hero while the crowd tints toward paper (opacity about 0.12), the same idea as v1 but as a camera move, not a fade.
- **Number:** **$3,343 counts up** from $0 over about 30 frames with a strong ease-out, so it decelerates into the final digits. Use tabular numerals (`font-variant-numeric: tabular-nums`) so the width doesn't jitter.
- **Coins:** as it counts, coins stream from the hero into a growing stack. The hero sinks slightly each time the stack grows.
- **Loop:** on landing, the hand-drawn loop circles "every year." quickly, in 10–12 frames, not v1's 24.

**Beat 4 (270–360): "Lenders aren't made to compete."**

- **Transition:** a **navy ellipse opens under the hero** (portal, as in the reference at 23s). The hero drops in with anticipation (crouch), then falls with an ease-in. The ellipse expands to a full navy field.
- **In the dark:** five or six white rate tiles drift idle at different depths and rotations, each turned slightly away, with no alignment and no movement toward the hero. The headline sets in paper-colored text with the navy emphasis treated as electric blue (`#009DFF`) for contrast.
- **v1's brush wipe:** retire it as an entrance. It may come back as beat 5's exit (§4 beat 5), but only if it reads cleanly. Otherwise delete it.

**Beat 5 (360–525): the hero beat. Give it the most craft.**

- **Flood (about 360–375):** a light-blue flood (`#C6E4FD`) sweeps in from the hero's position, the brand turn. The hero lands upright in the center (spring settle).
- **Tiles snap in (375–400):** tiles snap into a two-column arrangement flanking the hero, as in the reference at 38–44s, with a 3-frame stagger and enter easing from the flood edge. Each tile has a white body (`#FDFDFD`), an illustrative rate in tabular sans (e.g. `6.48%`), and a colored chip below that reads **"LENDER"**, not "BANK".
- **Competition rounds (about 400–470):** three rounds that **speed up**: about 22, 16, then 12 frames each. In each round every rate ticks down by a few hundredths (an odometer-style digit roll), and tiles re-sort by rate on **arcs** using move easing; lower rates move toward the hero. Each round has an audible tick (§6).
- **Winner (about 470–490):** the lowest tile rises (scale 0.97→1.04→1.0 with a spring, slight lift). Then, in sequence, never at once: blue outline draws, check draws, hand-drawn loop circles the rate (reference at 43s).
- **Hero reaction (about 475–495):** the hero anticipates (small dip), then leans in and reaches toward the winning tile.
- **Handoff (about 490–525):** **the winning tile flies to the hero's hand on an arc and morphs into the document** the hero holds through beat 6. Morph: scale down, corner radius changes, rate text cross-dissolves into document lines and a check, ≤4px blur at the midpoint. This is the film's key story-through-motion moment.
- **Secondary line:** "Until the best rate wins." builds in under the headline around frame 470.
- **Clean up:** delete v1's return arrow, the Burst lines and the corner brackets.

**Beat 6 (525–630): "You don't have to overpay."**

- **Transition:** the flood recedes back to paper, either retracting toward the hero or exiting as the old brush edge (pick whichever reads cleaner and justify it in the motion spec).
- **Bookend payoff:** beat 1's boxes are now **flattened into the ground line**, which draws across as the blue brand underline. The hero walks to the house, holding the document, on a slight arc. The house redraws or is already standing.
- **Headline:** centered below the scene, built word by word, with "overpay." in navy and the underline under it.
- **Final hold:** at least 1.5s of total stillness (frames about 585–630). No breathing or idle motion; the poster frame comes from here.

**Beat 7 (630–675): end slate.** Paper background, three small centered lines with a gentle stagger, no illustration. Hold still for at least the last 15 frames.

---

## 5. Engineering tasks

### 5.1 Motion system (do first)

Create `src/remotion/motion.ts` as the single source of motion truth:

```ts
export const EASE = {
  enter: [0.23, 1, 0.32, 1],      // strong ease-out (Emil)
  move: [0.77, 0, 0.175, 1],      // strong ease-in-out for on-screen moves and the camera
  exit: [0.55, 0, 1, 0.45],       // ease-in, ONLY for things leaving frame or falling
  draw: [0.65, 0, 0.35, 1],       // line and stroke draws
} as const;
export const DUR = { micro: 6, short: 10, base: 16, medium: 22, long: 30 } as const; // frames @30fps
export const STAGGER = { word: 3, item: 2, crowd: 3 } as const;
export const SPRING = {
  settle: { damping: 16, mass: 0.8, stiffness: 160 },   // ≤5% overshoot
  pop: { damping: 12, mass: 0.6, stiffness: 200 },
} as const;
```

- Helpers: `tween(frame, start, dur, ease)`, `springAt(frame, start, config)`, `along(arc, t)` for arc motion (quadratic Bézier between two points with a lifted control point), and `readFrames(text)` (headline hold = words ÷ 3.5 words/s + 0.5s, in frames).
- Every animation in every scene must use these tokens. Grep for raw `Easing.bezier(` afterward; there should be none outside `motion.ts`.
- **Rules, enforced in code review:**
  - Nothing appears from nothing: scale ≥0.92 plus opacity plus ≤16px offset, never `scale(0)`.
  - Objects travel on arcs.
  - One primary motion per beat (staging).
  - Any crossfade gets ≤6px blur at the midpoint.
  - The exit ease is only for exits and falls.

Put all beat and cue frame numbers in `src/remotion/timeline.ts`. Scenes and the audio script both import from it, so picture and sound cannot drift apart.

### 5.2 Architecture: persistent hero and camera

- **`Root.tsx`:** replace the overlapping `<Sequence>` crossfade structure. Use:
  - a `<Camera>` wrapper (scale and translate keyframed from `timeline.ts`);
  - a background and flood layer (paper, navy portal, light-blue flood);
  - scene prop layers (boxes, crowd, tiles, house; they can still be Sequences, but no whole-scene opacity fades);
  - **one `<Hero>` layer** whose position, scale and pose are keyframed across the whole film;
  - a text layer (word builds).
- Bump the composition to the new duration (675 frames, or whatever the final timeline totals). Update `VIDEO` in `constants.ts`.
- Keep the `Still` compositions (style frames and poster) working. Point the poster at a final-hold frame.

### 5.3 Character rig

Refactor `DrawnPerson` in `src/remotion/components/Primitives.tsx` into articulated parts without changing the rest-pose silhouette:

- **Groups:** head (with hair), torso, armL, armR, legL, legR, each with a pivot (shoulders about (34,62)/(94,62), hips about (51,137)/(75,137) in the 130×230 viewBox; tune visually).
- **Props:** `pose` (angles per limb, `bodyY`, `squash`), plus existing `variant` and `seed`.
- **Pose library** (`src/remotion/components/poses.ts`): `rest`, `walk(t)` (8-frame step cycle with contact and pass positions plus a 3px vertical bob), `stepBack`, `slump`, `crouch`, `fall`, `land` (squash 0.95 and recover), `leanIn`, `reach`, `hold` (arm bent to carry the document).
- **Regression check:** render the rest pose side by side with v1's figure (`npm run render:styles` before you change anything; outputs live under `docs/`). Silhouettes must match.
- **New primitives:**
  - `PercentBox` (2.5D cube, front `#908DC1`, side `#817DBA`, white % mark);
  - `Coin` (gold `#EBBE37`, simple ridged edge);
  - `RateTile` (white tile, tabular rate, colored `LENDER` chip with a small building icon);
  - `Document` (the beat-6 prop; reuse v1's resolution document look);
  - `WordBuild` (see §5.4).
- Delete `PaymentMark` and `Burst` if they are unused.

### 5.4 Typography in motion

- **`WordBuild`:** each word sits in an `overflow:hidden` mask and enters with translateY 100%→0 plus opacity, using the `enter` ease over `DUR.base`, staggered by `STAGGER.word`. Emphasis words enter in base blue, then shift color to navy over 8 frames, about 4 frames after they land, so the emphasis reads as a second beat.
- **Headline system:** top-aligned, at most 2 lines, 72–96px Source Serif 4 at weight 600 for headlines. Pick one alignment system (left at x=200 for beats 1–5, centered for 6–7) and document it in the motion spec.
- **Layout:** no sans text floating mid-frame (v1's "Until the best rate wins." problem). Secondary lines sit on the headline's grid.
- **Exits:** headlines leave by masking up (translateY 0→−100% with the `exit` ease, `DUR.short`), not by fading.

---

## 6. Audio

### 6.1 Music: option b first, option c as fallback

**Option b (royalty-free track):**

1. Search for 3 candidate tracks. Good sources that don't need a login: **Mixkit** (mixkit.co free license), **Pixabay Music** (Pixabay Content License), **Free Music Archive** (only CC0 or CC-BY). YouTube Audio Library needs a Google sign-in, so give Raj links instead of downloading from there.
2. **Brief:** about 25–40s usable, 90–110 BPM, light editorial or indie-pop with felt piano, plucks and soft percussion. Sparse first half, a clear lift around 40–55% through. Optimistic but not corporate-cheesy. No vocals.
3. **Present the shortlist to Raj:** title, artist, URL, license name and link, duration, and whether attribution is required. Get an explicit choice and approval before downloading. Before the download itself, state the file name, source and size.
4. Download into a **new empty folder** `references/audio/`. Treat it as untrusted data and inspect it only with `ffprobe` and `ffmpeg`.
5. **Edit to picture with ffmpeg:**
   - trim, with fades;
   - align the lift or downbeat to **frame 360** (the beat-5 flood);
   - land a clean ending on or just after frame 630, with a short tail into the end slate.
   - If the track can't be bent to the picture, nudge the timeline by up to ±6 frames (keep `timeline.ts` authoritative) rather than forcing an ugly edit.
6. Record the track, license and attribution in the README provenance section, and in an end-slate credit if the license requires it.

**Fallback option c** (use if no track passes, or if Raj declines all three):

- Write `scripts/build-score.mjs`: deterministic PCM synthesis in Node, with no dependencies beyond what is installed. A 48kHz stereo WAV built from soft sine/triangle plucks, a warm pad and a light kick/shaker pattern at about 100 BPM.
- Keep it in C major. Sparse in beats 1–4, add the pad and pulse at frame 360, resolve on the final line.
- Tell Raj plainly that it is a generated score and may sound simpler than a licensed track.

### 6.2 Sound effects (always generated in code; no downloads)

`scripts/build-sfx.mjs` builds short WAVs (synthesized or filtered noise, deterministic) and a mix script places them at the cue frames from `timeline.ts`:

| Cue | Sound |
|---|---|
| Box stacks (beat 1) | soft wooden taps, slightly varied pitch |
| Word builds | none, or an extremely subtle tick on the emphasis word only; don't tick every word |
| Coin drops (beat 2) | small metallic clink, randomized pitch ±2 semitones (seeded) |
| Count-up (beat 3) | soft accelerating ticker that stops when the number lands, with a gentle "settle" tone |
| Portal (beat 4) | low filtered whoomp plus a short airy fall |
| Flood (beat 5) | bright upward swell, synced to the music lift |
| Rate rounds (beat 5) | three short shuffle-clicks, one per round, getting quicker |
| Winner (beat 5) | outline-draw shimmer, then a check "pop" |
| Tile → document (beat 5) | paper swish |
| Underline draw (beat 6) | pencil scribble |
| Final line | one soft chime |

All sound effects should be quiet, warm and editorial: closer to Apple or Headspace than to a cartoon.

### 6.3 Mix and encode

- Mix music plus effects to `public/audio/mix-v2.wav` (48kHz stereo). Duck the music about 4dB under key effects (coin, portal, winner).
- **Loudness:** integrated **−16 LUFS ±1**, true peak **≤ −1.5 dBTP** (ffmpeg `loudnorm` two-pass; verify with `ebur128`).
- **Into the composition:** add the mix with `<Audio>` (via `remotion` or `@remotion/media`; follow the remotion-best-practices skill) so `renderMedia` muxes it.
- **Update `scripts/render-final.mjs`:**
  - output **new filenames**: `public/renders/bankrate-motion-study-v2.mp4`, `public/renders/bankrate-motion-study-v2.webm`, `public/poster/bankrate-motion-study-poster-v2.jpg`, `public/og/bankrate-motion-study-v2.jpg`. `/renders/*` is cached `immutable` (`netlify.toml`), so reusing v1 names would serve stale files;
  - MP4: H.264 yuv420p plus **AAC 192k 48kHz stereo**, `+faststart`;
  - WebM: VP9 plus **Opus 128k**. The current script passes `-an`; remove that;
  - new QA frame list: every beat boundary ±1 frame, each beat's midpoint, the 3 competition rounds, the handoff midpoint, and the final hold;
  - determinism and final-hold checks updated to the new frame numbers;
  - write `docs/final-qa/checks.json` with duration, frames, loudness readings and cue list.
- Delete the v1 files from `public/renders/`, `public/poster/` and `public/og/` only **after** they are archived (§7.1).

---

## 7. Landing page and shipping

### 7.1 Archive v1 first (before any code change)

Copy into `archive/v1/` (outside `public/`, so it never ships):

- `public/renders/*`, `public/poster/*`, `public/og/*`;
- `docs/final-qa/`;
- a snapshot of `src/` and `scripts/`;
- `README.md` (as `README-v1.md`).

Verify the copies with `ls -la` and file sizes.

### 7.2 Site changes (`src/site/main.tsx`, `src/site/styles.css`, `index.html`)

- **Sources:** point `<source>`, `poster`, captions and OG/meta to the v2 filenames. Update the duration text, the description and the `aria-label` (e.g. "22-second motion study with optional sound; transcript below").
- **Remove the silent-film framing:** the "A silent motion study" note (`main.tsx:191`), `aria-describedby="silent-note"` (`main.tsx:183`), and "(silent film)" in the title (`main.tsx:184`).
- **Sound toggle:**
  - visible **icon plus text label** ("Sound off" / "Sound on"), at least 44×44px, `aria-pressed`;
  - starts **muted** (playback stays user-initiated);
  - remember the choice in `localStorage`, wrapped in try/catch so it still works if storage throws;
  - keep the M shortcut.
- **Motion on the page:** follow Emil's UI rules. Button press `scale(0.97)` over 160ms with ease-out, hover motion gated behind `(hover: hover) and (pointer: fine)`, `prefers-reduced-motion` respected, transitions only on `transform` and `opacity`.
- **Transcript:** update it to the new script.

### 7.3 Verification (all must pass)

- `npm run typecheck`, `npm run format:check`, `npm run build`.
- `ffprobe` on both renders confirms: 1920×1080, 30fps, the expected frame count, an audio stream present (AAC or Opus, 48kHz stereo).
- `ebur128` readings are within spec.
- **Audio sync:** every cue onset in `checks.json` falls within ±1 frame of its visual event.
- axe audit: `npm run dev`, open `/?audit=1`, read the `ACCESSIBILITY_AUDIT` console entry. Zero violations.
- **Responsive:** 1440×900, 1280×720, 1024×768, 768×1024, 390×844 and 320×568, with no horizontal scroll.
- **Keyboard:** Space toggles play, M toggles sound, arrows seek; the transcript disclosure works.
- **Playback:** the video plays to the end in the in-app browser, both with sound on and with sound off.

### 7.4 Deploy gate

1. Build `dist/`, and confirm it has no `archive/`, no `public/review/` and no " 2" duplicate files.
2. ZIP the **contents** of `dist/` to `bankrate-motion-study-v2-dist.zip` at the project root.
3. **Stop and ask Raj** to choose between:
   - (a) he uploads the ZIP himself via Netlify → `raj-shah-consumer-first-motion` → Production deploys (the established workflow), or
   - (b) you deploy with the Netlify CLI, if it is already authenticated.
4. After a deploy, verify the live page (screenshot, DOM check, video plays, sound toggle works, OG tags point to v2) and update the README "Delivery status".

---

## 8. Self-review loop (at least two passes)

After each full render:

1. **Contact sheets:** `ffmpeg -i public/renders/bankrate-motion-study-v2.mp4 -vf "fps=4,scale=480:-1,tile=6x4" docs/v2/review/sheet_%02d.png`. Read every sheet.
2. **Transitions in slow motion:** extract every frame of each transition window (±10 frames around each beat boundary).
3. **Score each beat against this checklist,** and fix every failure before the next pass:
   - [ ] No double exposure or ghosting at any cut.
   - [ ] The hero is the same continuous character from frame 0 to the end slate.
   - [ ] Each beat has exactly one primary motion; the eye always knows where to look.
   - [ ] Every on-screen move travels on an arc and uses `EASE.move`; every entrance uses `EASE.enter`; no `scale(0)`.
   - [ ] Every character action has anticipation and settle.
   - [ ] Headlines are readable: hold time ≥ `readFrames(text)` after the last word lands.
   - [ ] The count-up decelerates and lands; digits don't jitter.
   - [ ] The competition visibly speeds up over its three rounds, and the winner is unambiguous.
   - [ ] The tile→document handoff reads in one viewing, without explanation.
   - [ ] The bookend pays off: boxes from beat 1 become beat 6's ground and underline.
   - [ ] Frame 0 works as a thumbnail.
   - [ ] The final hold is pixel-identical for at least 1.5s.
   - [ ] Secondary colors stay restrained; paper and blue dominate.
   - [ ] Sound effects sit under the music; nothing is cartoonish; the music lift lands on the flood.
4. **Kowalski-style findings table:** run the review-animations method on `src/remotion/` and `src/site/`. Write the Before | After | Why table and the verdict to `docs/v2/animation-review.md`. Iterate until the verdict is **Approve**.

---

## 9. Portfolio deliverables (`docs/v2/`)

1. **`motion-spec.md`:** a one-page brand motion system that someone else could animate from:
   - easing tokens, with what each is for;
   - duration scale and stagger rules;
   - the reading-time formula;
   - character rig rules (anticipate → act → settle);
   - transition vocabulary (camera pull or push, navy portal, light-blue flood, mask-up exits), with when to use each;
   - typography-in-motion rules (word build, emphasis color beat);
   - sound principles;
   - do's and don'ts.
   Plain language; Raj is not a motion specialist and will present this.
2. **`v1-vs-v2.md`:** four annotated before/after pairs (stills from `archive/v1/` and the v2 render):
   - the continuity cut (beat 1→2);
   - the $3,343 moment;
   - the competition and handoff;
   - the bookend ending.
   Each pair gets 2–3 sentences: what changed and which principle drove it.
3. **`v1-vs-v2-side-by-side.mp4`:** v1 and v2 stacked with `ffmpeg hstack`, scaled to 960 wide each, both labeled. v1 is 21s and v2 about 22.5s: pad v1 with its last frame.
4. **`process-note.md`:** a draft portfolio blurb (about 150 words) for Raj to edit.
   - **Framing:** "Created during a final-round process for a Senior Product Designer, Brand role. v1 was a 2-hour sprint directing GPT-6 Astra in Codex; v2 is a directed revision built around a brand motion system, executed with Claude."
   - Lead with the idea and the system, not the speed.
   - Do not mention the hiring outcome.

---

## 10. Definition of done

- [ ] v1 is archived in `archive/v1/`.
- [ ] A v2 render of about 22.5s, 1920×1080 at 30fps, with audio, exists as MP4 and WebM under new filenames, along with the v2 poster, OG image and VTT.
- [ ] All §7.3 verification passes; the §8 checklist is all green after at least two passes; `animation-review.md` verdict is Approve.
- [ ] The music license is recorded (or the fallback score is disclosed); sound effects are noted as generated.
- [ ] The site has the sound on/off toggle and no silent-film framing.
- [ ] `docs/v2/` contains the motion spec, before/after write-up, side-by-side video and process note.
- [ ] README is updated: v2 delivery status, run and render commands (including the audio scripts), deliverables, verification and provenance.
- [ ] `dist/` is built and zipped, and you **stopped for Raj's deploy approval**.
- [ ] Final message to Raj: a short plain-language summary, links to the key files, anything you could not verify, and any judgment calls you made where this file was silent.
