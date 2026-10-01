# EVALS.md

## RAT Statement

Written 09/30/2026, before bolt.new saw any context file.

**Assumption:** my context files — FEATURES.md, STANDARDS.md, STYLE.md, ARCHITECTURE.md — are specific enough that a tool can build feature F4 to spec without me in the room.

**Why it is the riskiest:** if it is false, delegation produces something I have to rewrite rather than review, and the whole premise of a context scaffold collapses. Every other risk this week is downstream of this one.

**What would show it is false:** bolt.new's output violating a requirement that is written plainly in a file it was given. A13 is the clearest case: FEATURES.md says labels are user-created and the system supplies none, and F6 classifies machine suggestions as Reverse. If bolt ships a dropdown of pre-written moods, the files were in the room and the rule still did not survive.

## Prediction Stake

Written 09/30/2026, before the build. **Prediction text is never edited.** Resolutions are added underneath, dated.

**Tight — bolt.new will pre-populate mood labels, violating A13.** It will offer suggested moods such as Chill, Hype, or Focus, either as a dropdown, as placeholder text, or as seeded chips, rather than letting labels come only from what the user types.

*Resolution (dated, after the build):*

**Loose — bolt.new will add dependencies I did not ask for.** My three files currently have zero dependencies, and I expect the output to introduce at least one package, framework, or CDN script that I will have to remove or justify.

*Resolution (dated, after the build):*

**Open — what will bolt.new do about the Worker?** My context files describe a D1-backed Worker with specific endpoints, but no file says "do not invent your own storage." I do not know whether it will call `GET /entries`, invent a new endpoint it assumes exists, fall back to `localStorage`, or hold everything in memory. Whatever it does is a direct read on how much of the architecture survives a handoff.

*Resolution (dated, after the build):*

## 3. Success criteria
| EARS row (feature) | Checked by | Where |
|---|---|---|
| WHEN ..., THE SYSTEM SHALL ... | test | evals/worker.test.js, "..." |
| IF ..., THEN THE SYSTEM SHALL ... | judgment | docs/JUDGMENT.md #8 |
| THE SYSTEM SHALL ... | human | README, See It Work |

## 4. Error-analysis log
<!-- Every failure observed, a few words each, counted, sorted by count. -->
| Failure (a few words) | Count | Source | Category |
|---|---|---|---|
| Buttons used its own blue, not color-primary | 2 | bolt, AI Studio | STYLE |
| | | | |

## 5. Evals
- **Code:** `npm test` with `API=<worker url>`; _ tests, _ passing. Screenshot in README.
- **Judgment:** docs/JUDGMENT.md, _ questions, two graders, agreement _%.

## Verification table (carried from HW4)
<!-- Paste your HW4 verification table here; it is the ancestor of section 3. -->
