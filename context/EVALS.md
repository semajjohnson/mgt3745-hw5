# EVALS.md

**Name:** Semaj Johnson II
**Assignment:** HW5, MGT 3745 O

The verification table from HW3, grown up. Sections 1 and 2 were written and committed before any tool saw the spec.

## 1. RAT statement

Written 09/30/2026, before bolt.new saw any context file.

**Assumption:** my context files — FEATURES.md, STANDARDS.md, STYLE.md, ARCHITECTURE.md — are specific enough that a tool can build feature F4 to spec without me in the room.

**Why it is the riskiest:** if it is false, delegation produces something I have to rewrite rather than review, and the whole premise of a context scaffold collapses. Every other risk this week is downstream of this one.

**What would show it is false:** bolt.new's output violating a requirement that is written plainly in a file it was given. A13 is the clearest case: FEATURES.md says labels are user-created and the system supplies none, and F6 classifies machine suggestions as Reverse. If bolt ships a dropdown of pre-written moods, the files were in the room and the rule still did not survive.

## 2. Prediction Stake (before build, 09/30/2026)

**Prediction text is never edited.** Resolutions are added underneath, dated.

**Tight — bolt.new will pre-populate mood labels, violating A13.** It will offer suggested moods such as Chill, Hype, or Focus, either as a dropdown, as placeholder text, or as seeded chips, rather than letting labels come only from what the user types.

*Resolution 09/30/2026: FALSE. bolt.new pre-populated nothing. `getAvailableLabels()` builds the filter list only from labels the user has placed, and bolt wrote the comment "never suggested or pre-populated (A13)" above it, citing my acceptance row by number. The rule was in FEATURES.md and it survived the handoff.*

**Loose — bolt.new will add dependencies I did not ask for.** My three files currently have zero dependencies, and I expect the output to introduce at least one package, framework, or CDN script that I will have to remove or justify.

*Resolution 09/30/2026: TRUE, with a qualification. `package.json` lists React, React DOM, Supabase, Lucide, Tailwind, Vite, TypeScript, ESLint and PostCSS. None appear in the generated `app.js`, which is plain JavaScript in an IIFE with no imports — they come from bolt's starter template, visible in `.bolt/prompt`, which instructs it to default to React and Tailwind. The dependency that actually matters is one my package list would not have caught: `index.html` loads Google Fonts from `fonts.googleapis.com` and `fonts.gstatic.com`, which is a live network call on every page load, a new Trust Boundary crossing, and a direct violation of my own STYLE.md refusal against stylesheets from another origin.*

**Open — what will bolt.new do about the Worker?** My context files describe a D1-backed Worker with specific endpoints, but no file says "do not invent your own storage." I do not know whether it will call `GET /entries`, invent a new endpoint it assumes exists, fall back to `localStorage`, or hold everything in memory. Whatever it does is a direct read on how much of the architecture survives a handoff.

*Resolution 09/30/2026: It split the difference, and the split is the finding. Entries kept using my Worker correctly — `GET /entries`, `POST /entries`, the dismiss route, and even my `?apiDown` test hook survived untouched. Mood labels went to `localStorage`, with the comment "Labels persist in localStorage because the Cloudflare Worker does not store them." That is an architectural decision made silently, and it is defensible from what it was given: my files described the Worker's existing endpoints and no file said that new state must also live in D1. The scaffold carried the architecture that was written down and could not carry the principle behind it. Fixed during integration by adding a labels table and two endpoints; recorded as the primary finding in DDR-001.*

## 3. Success criteria

| EARS row (feature) | Checked by | Where |
|---|---|---|
| A10 — WHEN a user adds a mood label to a pool item, THE SYSTEM SHALL store and display it | test | `evals/pool.test.mjs`, "A10: a label added to an entry is stored and returned with that entry" |
| A11 — WHEN a user filters by a label, THE SYSTEM SHALL display only items carrying it | human | Clicked each filter button on the running page; only matching items rendered |
| A12 — IF a label is empty or over 30 characters, THEN THE SYSTEM SHALL reject it | test | `evals/pool.test.mjs`, "A12: a label longer than 30 characters is rejected with 400" |
| A13 — THE SYSTEM SHALL offer only labels the user has created | test, judgment | `evals/pool.test.mjs`, "A13: a newly created entry carries no labels until the user adds one"; docs/JUDGMENT.md #9 |
| A14 — WHILE a filter is active, THE SYSTEM SHALL name it and offer a way to clear it | judgment, human | docs/JUDGMENT.md #11; confirmed on the running page |

A11 is the weakest row: it is the only one with no automated check, because filtering happens entirely in the page rather than at an endpoint the tests can call. The next eval to write is a DOM-level test of `renderPool` with a filter active. A12 was also judgment question #10, but the second grader left that one blank, so the test is its only working check.

## 4. Error-analysis log

| Failure (a few words) | Count | Source | Category |
|---|---:|---|---|
| Ambiguous wording let two readers differ | 4 | JUDGMENT Q3, Q7, Q10; bolt vs AI Studio on A10 | SPEC |
| Added what no file forbade | 4 | bolt | ARCH / STYLE |
| Deployed code did not match the edited file | 2 | wrangler, editor | TOOLING |
| Test runner could not find the tests | 2 | node --test, file naming | TOOLING |
| Starter test encoded a superseded schema | 1 | evals/worker.test.js | SPEC |
| STYLE.md tokens absent from styles.css | 1 | bolt, my STYLE.md | STYLE |
| State keyed to track text, not row id | 1 | bolt | ARCH |

**The most frequent failure is ambiguity in my own writing, not error in the tools.** Three of the four rubric disagreements and the one spec disagreement all trace to a sentence that admitted two readings. Four of the generated-code failures trace to the same root in a different form: my files said what to do and never said what not to do. The next fix is not a better prompt; it is writing the prohibition down.

## 5. Evals

- **Code:** `npm test` with `API=https://mgt3745-hw4.semajjohnson.workers.dev`; 7 tests, 7 passing. Screenshot in README.
- **Judgment:** docs/JUDGMENT.md, 12 questions, two graders, agreement 75%. Below the 80 percent threshold, which is a finding about the rubric and is logged above as SPEC.

## Stake resolution

Tight: **false.** Loose: **true**, though the dependency that mattered was the font origin rather than the package list. Open: **split** — entries kept the Worker, labels did not.

**RAT verdict: the assumption survives, with a condition.** My context files were specific enough to carry every rule they stated. A13 was written down and bolt not only followed it but cited the row number in a comment it wrote itself. Every failure came from something the files did not say: no file forbade browser storage for new state, no file forbade external font origins, and no file said when a label may be applied. The scaffold transmits what it contains, and nothing else. What makes a delegation safe is not how well a tool reads; it is whether the prohibition exists in writing before the tool runs.

## Verification table (carried from HW4, extended for HW5)

| Criterion | Steps and input | Expected result | Observed result | Status | Evidence |
|---|---|---|---|---|---|
| A5 (normal action) | Enter a track and a source name, submit. | The item appears with "from [name]" and the date. | The item appeared with its source name and date. | PASS | `evals/worker.test.js` A5 test |
| A5 (invalid input) | Enter a track, leave the source empty, submit. | Rejected with a message; nothing added. | The page rejected it and added nothing. | PASS | `evals/pool.test.mjs` A8 test |
| A5 (persistence across clients) | Add an entry, then open the page in a second browser. | The entry appears there too. | The entry appeared in the second browser. | PASS | See It Work GIF |
| A6 | Add a track from one person, then the same track from a second. | One entry listing both names. | The two rows merged into one entry with both names. | PASS | Running page |
| A7 | Dismiss an item, then try adding that track from that person. | The re-add is refused. | Refused with "that track was dismissed from that person." | PASS — was CANNOT TEST YET in HW3 | `worker.js` dismissal branch |
| A8 (server 400) | POST a body with no source name. | 400 with a message naming the missing field. | 400 "source required", displayed on the page. | PASS | `evals/pool.test.mjs` |
| A9 (server 400) | Add the same track from the same person twice. | The second submission is refused. | Refused with "that track is already in the pool from that person." | PASS | `worker.js` validation |
| A10 | Add a label to an item, then reload and check a second browser. | The label is stored server-side and returned with the entry. | The label persisted across reload and appeared in a second browser. | PASS | `evals/pool.test.mjs` |
| A11 | Click a filter button. | Only items carrying that label are shown. | Only matching items rendered. | PASS | Human check; no automated test yet |
| A12 | Submit a 31-character label. | Rejected with a message naming the limit. | 400 "label must be 30 characters or fewer". | PASS | `evals/pool.test.mjs` |
| A13 | Create an entry and inspect its labels. | No labels until the user adds one. | `labels` came back empty. | PASS | `evals/pool.test.mjs` |
| A14 | Activate a filter. | The page names the active label and offers a way to clear it. | The active filter was named with a working Clear button. | PASS | Human check; docs/JUDGMENT.md #11 |
| Network failure | Load with `?apiDown`. | The page states the problem and throws nothing uncaught. | The page displayed "Could not load the pool. The server returned 404." | PASS | Browser console |
| Server returns 500 | Force the Worker's error branch. | The page shows a server-error message. | Not tested. The branch only fires on an unexpected exception, which I cannot trigger on a deployed Worker without shipping broken code. | CANNOT TEST YET | — |
| Two clients write to the same table | Two browsers add entries at once. | Both survive; neither overwrites the other. | Not tested. ADR-002 states the pool is single-user by design. | DEFERRED | ADR-002 |
| A1, A2, A3, A4 | Not triggerable. | — | No streaming-platform capture exists in this build. | DEFERRED | ADR-001, still deferred by ADR-002 |