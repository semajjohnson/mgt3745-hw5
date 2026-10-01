# EVALS.md

## RAT Statement

Written 09/30/2026, before bolt.new saw any context file.

**Assumption:** my context files — FEATURES.md, STANDARDS.md, STYLE.md, ARCHITECTURE.md — are specific enough that a tool can build feature F4 to spec without me in the room.

**Why it is the riskiest:** if it is false, delegation produces something I have to rewrite rather than review, and the whole premise of a context scaffold collapses. Every other risk this week is downstream of this one.

**What would show it is false:** bolt.new's output violating a requirement that is written plainly in a file it was given. A13 is the clearest case: FEATURES.md says labels are user-created and the system supplies none, and F6 classifies machine suggestions as Reverse. If bolt ships a dropdown of pre-written moods, the files were in the room and the rule still did not survive.

## Prediction Stake

Written 09/30/2026, before the build. **Prediction text is never edited.** Resolutions are added underneath, dated.

**Tight — bolt.new will pre-populate mood labels, violating A13.** It will offer suggested moods such as Chill, Hype, or Focus, either as a dropdown, as placeholder text, or as seeded chips, rather than letting labels come only from what the user types.

*Resolution 09/30/2026: FALSE. bolt.new pre-populated nothing. `getAvailableLabels()` builds the filter list only from labels the user has placed, and bolt wrote the comment "never suggested or pre-populated (A13)" above it, citing my acceptance row by number. The rule was in FEATURES.md and it survived the handoff.*

**Loose — bolt.new will add dependencies I did not ask for.** My three files currently have zero dependencies, and I expect the output to introduce at least one package, framework, or CDN script that I will have to remove or justify.

*Resolution 09/30/2026: TRUE, with a qualification. `package.json` lists React, React DOM, Supabase, Lucide, Tailwind, Vite, TypeScript, ESLint and PostCSS. None appear in the generated `app.js`, which is plain JavaScript in an IIFE with no imports — they come from bolt's starter template, visible in `.bolt/prompt`, which instructs it to default to React and Tailwind. The dependency that actually matters is one my package list would not have caught: `index.html` loads Google Fonts from `fonts.googleapis.com` and `fonts.gstatic.com`, which is a live network call on every page load, a new Trust Boundary crossing, and a direct violation of my own STYLE.md refusal against stylesheets from another origin.*

**Open — what will bolt.new do about the Worker?** My context files describe a D1-backed Worker with specific endpoints, but no file says "do not invent your own storage." I do not know whether it will call `GET /entries`, invent a new endpoint it assumes exists, fall back to `localStorage`, or hold everything in memory. Whatever it does is a direct read on how much of the architecture survives a handoff.

*Resolution 09/30/2026: It split the difference, and the split is the finding. Entries kept using my Worker correctly — `GET /entries`, `POST /entries`, the dismiss route, and even my `?apiDown` test hook survived untouched. Mood labels went to `localStorage`, with the comment "Labels persist in localStorage because the Cloudflare Worker does not store them." That is an architectural decision made silently, and it is defensible from what it was given: my files described the Worker's existing endpoints and no file said that new state must also live in D1. The scaffold carried the architecture that was written down and could not carry the principle behind it. Fixed during integration by adding a labels table and two endpoints; recorded as the primary finding in DDR-001.*

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
