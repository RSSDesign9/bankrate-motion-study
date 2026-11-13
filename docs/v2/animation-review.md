# Animation review (Emil Kowalski's review-animations method)

**Scope:** `src/remotion/` (the film) and `src/site/` (the player page).

**Method:** Kowalski's standards (`SKILL.md` and `STANDARDS.md`), adapted for linear film:

- easing choice;
- nothing scales from 0;
- stagger;
- blur-masked crossfades;
- staging and cohesion;
- "delete the animation".

The rules on sub-300ms timing, interruptibility and hover gating apply only to the page.

The film was reviewed four times, first visually and then in code. Each code review was run by an independent reviewer that could only read the code, followed by a verification pass on the fixes.

## Pass 1: visual (contact sheets and frame-by-frame strips)

| Before                                                                                 | After                                                                   | Why                                                       |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------- |
| Hero, props and crowd at their first-draft scale; beats 1, 2 and 6 felt empty          | Hero at 460px, wider crowd spacing, larger props                        | Staging: the subject should own the frame                 |
| The "adrift" figure had its arms up and read as cheering                               | A new `adrift` pose: arms loose and out, head bowed                     | The pose has to carry the story beat (lost in the system) |
| Round-1 shuffle tiles crossed in front of the hero and covered each other              | Re-ranked slots, so rounds 2 and 3 stay in the hero's right-hand column | One clear competition, close to the hand                  |
| Crowd hopped in through the fading box wall (double exposure)                          | Props leave before the crowd arrives                                    | No ghosting at a cut                                      |
| Portal and flood filled the frame in about 2 frames (radius 3000 on a strong ease-out) | Radius sized to just cover the frame                                    | A transition has to be seen                               |
| Beat 6: the flatten, camera tilt, walk, line and headline all moved at once            | Tilt moved into the recede; the rest sequenced                          | Staging: one primary motion at a time                     |
| Beat 4 headline turned navy before the flood reached it, so words vanished on navy     | A navy copy clipped to the flood circle, changing word by word          | Legibility on both grounds                                |
| Count-up digits jittered by about ±6px                                                 | Fixed-width digit cells sized to the widest glyph                       | The number must decelerate and land, not wobble           |
| The winner tile passed in front of the hero during the shuffle                         | Winner stays behind the hero until it wins                              | Depth and z-order tell the story                          |
| The underline and loop stayed on screen after their words left                         | Decorations exit with their words                                       | No orphan marks                                           |

## Pass 2: code review (independent reviewer). Verdict: Block

| #   | Before                                                                       | After                                                                                    | Why                                                                                    |
| --- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1   | Flood used `move`, so the radius was 79px four frames after the music lift   | Flood uses `enter`, recede uses `exit`, portal fill uses `enter`                         | The climax must land with the bass entry; this also matches the spec                   |
| 2   | Round-1 crossing tiles met mid-frame over the hero's head                    | The improving tile leaps high (bend 560); the losing crossing tile leaves 4 frames later | No collision in the hero beat                                                          |
| 3   | "Until the best rate wins." was on screen for 44 frames (it needs 58)        | Secondary line moved to 468, exit to 526                                                 | Meets the reading-time rule                                                            |
| 4   | Beat-6 comment claimed strict one-at-a-time sequencing                       | Retimed, and the comment now states the overlap that remains                             | Code and docs agree                                                                    |
| 5   | Crowd hopped 300px and faded in mid-air                                      | 90px hop, scale 0.92→1, opacity over `DUR.short`                                         | Arrive close by, not from nowhere                                                      |
| 6   | House slid 40px sideways while fading out                                    | Opacity only                                                                             | A 40px slide is neither an exit nor a tidy move                                        |
| 7   | Source and rates labels faded out                                            | They mask up, like headlines                                                             | One text grammar                                                                       |
| 8   | Loop and underline faded with their words                                    | They undraw on the exit curve                                                            | A drawn mark leaves the way it came in                                                 |
| 9   | Recede curve disagreed with the spec                                         | Recede uses `exit`                                                                       | Code and spec agree                                                                    |
| 10  | Tile snap uses `enter`                                                       | Kept as an accepted exception                                                            | The brief asks for enter easing from the flood edge; the tiles are arriving into slots |
| 11  | h1, h2 and h4 were each 1 frame under `readFrames`                           | 67, 93 and 93 frames                                                                     | Rounding honesty                                                                       |
| 12  | `springAt` snapped on a threshold check that oscillating springs could cross | Latches after the `measureSpring` settle time                                            | Holds stay pixel-identical for a stated reason                                         |
| 13  | Page progress bar updated on `timeupdate` (~4×/s), so it stepped             | Updates every animation frame while playing                                              | Smooth feedback                                                                        |
| 14  | Raw `cubic-bezier` in page CSS                                               | `var(--ease-enter)` from the shared, dependency-free `ease.ts`                           | One source of curve truth; Remotion stays out of the page bundle (73 KB gzip)          |

## Pass 3: verification of the fixes. Verdict: Block

13 of 14 fixes were resolved and #10 was accepted. The verifier also confirmed that frames 610–654 are completely still. It found three new issues:

| #   | Before                                                                                                                                         | After                                                                                                        | Why                                                |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| N1  | The 4-frame delay for the losing tile applied to every swap, so rounds 2 and 3 stacked tiles and round 3's loser had 4 frames for a 175px move | Delay only on crossings; same-column swaps pass on opposite arcs together, with a ±0.03 scale hump for depth | No stacking and no teleport before the winner beat |
| N2  | The crowd's 90px hop broke the spec's "≤16px travel" rule                                                                                      | The spec now names character entrances as an exception, next to the portal and flood                         | A person arriving travels; a tile only appears     |
| N3  | The beat-6 doc said "one at a time", but the headline starts a third of the way into the walk                                                  | Docs describe the real overlap. `h6.in` stays at 570 because 584 would push the film past 23.5s              | Honest docs, within the length budget              |

## Pass 4: final verification (independent reviewer)

| #   | Status   | Evidence                                                                                                                                                                                                                                                  |
| --- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| N1  | Resolved | Re-simulated. Round 1's crossing never overlaps. In round 2 the closest pass is a 135px/65px offset, with the winner in front and larger. In round 3 the losing tile travels over 8 frames, with about 10px of overlap. See `review/pass4-rounds2-3.png`. |
| N2  | Resolved | `motion-spec.md` lists the character-entrance exception.                                                                                                                                                                                                  |
| N3  | Resolved | The wording is corrected to "starts a third of the way into the walk; its last word lands just after the hero settles". The film is 703 frames (23.43s), under the 23.5s ceiling.                                                                         |

The final hold (610–654) is fully still.

## Verdict: **Approve**

Nothing feel-breaking remains. Non-blocking notes:

- Beat 6's headline overlaps the walk's final two-thirds by design. Delaying it would push the film past the length budget.
- The tile snap keeps `enter`, as the brief specifies.
