# Consumer-First Motion System

A one-page system for animating this brand world. Every value lives in code: tokens in `src/remotion/motion.ts`, beat and cue frames in `src/remotion/timeline.ts`. Picture and sound both read the same timeline, so they cannot drift.

## 1. Easing: four curves, four jobs

| Token   | Curve                           | Use it for                                                                     | Feels like            |
| ------- | ------------------------------- | ------------------------------------------------------------------------------ | --------------------- |
| `enter` | `cubic-bezier(.23, 1, .32, 1)`  | Anything arriving: words, tiles, coins popping, the flood                      | Quick, then settles   |
| `move`  | `cubic-bezier(.77, 0, .175, 1)` | Anything already on screen that changes place: camera, tile shuffles, the walk | Deliberate, weighted  |
| `exit`  | `cubic-bezier(.55, 0, 1, .45)`  | Only things leaving or falling: headline exits, the fall, the flood receding   | Gravity, acceleration |
| `draw`  | `cubic-bezier(.65, 0, .35, 1)`  | Lines being drawn: underline, loop, outline, check                             | A pen stroke          |

v1 used one curve for everything, so every beat had the same energy. Pairing a quick `enter` with a weighted `move` and a falling `exit` gives the film rhythm.

## 2. Time

- **Durations (frames at 30fps):** micro 6 · short 10 · base 16 · medium 22 · long 30. Pick from the scale; don't invent new values.
- **Stagger:** words 3 frames; items 2; crowd 3. A stagger adds texture and never holds up the story.
- **Reading time:** a line stays on screen for at least `words ÷ 3.5 + 0.5s`, counted from its first word. A 9-word line needs 93 frames.
- **Pacing:** beats are intentionally uneven. The competition rounds speed up (22 → 16 → 12 frames), the climax gets the most time, and the ending holds completely still for 1.5s.

## 3. Springs

- `settle` (damping 16, mass 0.8, stiffness 160): at most 5% overshoot. Use it for landings, boxes stacking and body reactions.
- `pop` (damping 12, mass 0.6, stiffness 200): use it only for the winner.
- A spring snaps to its final value once it settles. This keeps holds pixel-identical.

## 4. Character rig: anticipate → act → settle

- There is **one hero for the whole film**, on a single layer. The hero is never re-drawn or swapped between scenes.
- The figure is articulated at the neck, shoulders, hips and feet. In the rest pose it matches v1's drawing pixel for pixel.
- **Poses:** `rest`, `walk(t)` (8-frame step with a 3px bob), `stepBack`, `slump`, `crouch`, `fall`, `adrift`, `land`, `leanIn`, `reach` and `hold`.
- Every action has three parts: **anticipate** (crouch before the fall, dip before the reach), **act** (on an arc), and **settle** (land squash at 0.95, then recover).
- Weight is shown through the body: a coin landing makes the figure slump 5px, and each coin on the stack sinks the hero 2px further.

## 5. Transition vocabulary

| Transition          | What it is                                                  | Use when                                          |
| ------------------- | ----------------------------------------------------------- | ------------------------------------------------- |
| Camera pull or push | Scale and pan the whole world on `move`; the hero stays put | The scale of the story changes (you → many → you) |
| Navy portal         | An ellipse opens under the hero and swallows the frame      | Things get worse: falling into the system         |
| Light-blue flood    | A circle sweeps out from the hero and fills the frame       | The brand turn: help arrives, starting from you   |
| Flood recede        | The same circle shrinks back into the hero                  | Return to the everyday world, changed             |
| Mask-up exit        | Words slide up out of their own masks on `exit`             | Every headline exit. Never fade text out.         |

Rules:

- **Never crossfade whole scenes.**
- If two states must overlap, peak the blur at ≤6px at the midpoint (the tile→document morph uses 4px).
- Nothing appears from nothing. Objects enter from at least scale 0.92, with opacity, and at most 16px of travel. There are two kinds of exception. The portal and flood are holes and fields opening, not objects arriving. Characters are the other: the crowd steps in with a short 90px hop on an arc, because a person arriving travels, while a box or tile only appears.
- One primary motion per beat. In beat 6, the reveal, the flatten and the walk home happen in sequence. The ground line draws through the end of the flatten, the camera only tracks the walk, and the headline starts a third of the way into the walk, and its last word lands just after the hero settles.

## 6. Typography in motion

- Headlines are Source Serif 4 at weight 600, 84px, set in blue. Each word rises out of its own mask (`enter`, 16 frames, 3-frame stagger).
- **Emphasis is a second beat.** Emphasis words land in blue, then shift to navy over 8 frames, 4 frames after they land. On navy, emphasis turns electric blue (`#009DFF`) on paper-colored text.
- **Alignment:** beats 1–5 are left-aligned at x=200, top 110. Beat 6 and the end slate are centered. Secondary lines sit on the headline's grid and never float mid-frame.
- Numbers use fixed-width digit cells, so the $3,343 count-up decelerates without jitter.
- Decorations (the loop and the underline) exit with their words.

## 7. Sound

- The music is edited to picture, not the other way round. The bass entry of "Pop Parapop" (83.8 BPM) lands on the flood at frame 388. A downbeat splice at the winner (frame 474) jumps to the track's real ending, so its last strong beat lands on the final line (frame 603).
- Effects are generated in code: quiet, warm and percussive. They sit 3–17 dB under the music, and the music dips 4 dB under key moments (coins, portal, winner).
- Sound follows motion. The count-up ticks slow down as the number decelerates, and the shuffle clicks get faster with each round.
- The mix is −16 LUFS integrated with a true peak of −3.1 dBTP. Every cue lands within 0.05 frames of its picture event, verified in `docs/v2/audio-report.json`.

## 8. Do / don't

| Do                                                                          | Don't                                        |
| --------------------------------------------------------------------------- | -------------------------------------------- |
| Move the camera, keep the hero continuous                                   | Cut or crossfade between scenes              |
| Put travel on arcs, with gravity on falls                                   | Slide objects in straight lines              |
| Give the hero's body the weight of the money                                | Show the cost only as numbers                |
| Speed up toward the climax, then hold still                                 | Give every beat the same length              |
| Keep paper and blue dominant; save purple, gold and chips for their objects | Let secondary colors spread into backgrounds |
| Delete motion that doesn't explain anything                                 | Add idle motion to the final hold            |
