# Architecture

Status: ACTIVE in Module 3.

## Gate

**Feature under decision:** the pool — a list where every track carries the name of the person it came from, and the list survives a reload. Acceptance criterion A5 in [FEATURES.md](FEATURES.md).

### Hard constraints

An option failing either is rejected before scoring. All three options passed.

1. **No new spending.** Originally "zero budget." Reworded because Spotify's Web API now requires the app owner to hold an active Premium subscription. I already pay for Premium personally, so the marginal cost is zero — but that subscription becomes a dependency of the app, which is recorded as a consequence in ADR-001 rather than hidden here.
2. **Runs from a fresh Codespace with Live Server.** Every grader and reviewer sees the same environment.

Serving both Spotify and Apple Music users was considered as a hard constraint and deliberately demoted. As a constraint it would have rejected both Spotify-based options before scoring and left the comparison with nothing to compare. It is scored instead, through switching cost and fit to spec.

### Options

- **Hand-built option (Build):** hand-written HTML, CSS and JavaScript with `localStorage`. Tracks and source names are entered by hand. No platform dependency.
- **Existing-service option (Buy — Spotify Web API):** tracks are selected from Spotify's catalog, and the pool stores real Spotify track IDs with a source name attached. Apple MusicKit was tested as the alternative platform; see the switching cost note.
- **AI-assisted build (Delegate):** Copilot or a coding agent builds the Spotify integration, and I inspect the result.

### Anchors
| Criterion | Weight | 1 | 3 | 5 |
|---|---:|---|---|---|
| Cost to start | 3 | New spending required | No new spending, but accounts or setup | Nothing to sign up for |
| Cost to maintain | 2 | A third party can break it unilaterally | Occasional dependency updates | Nothing external to break |
| Time to working | 3 | Weeks, or gated on outside approval | Days | Hours |
| Inspectability | 4 | I can't read it | I can read it with real effort | I wrote it and can explain every line |
| Switching cost | 4 | Leaving means redesign | Portable with rework | Plain data, no lock-in |
| Fit to spec | 5 | Doesn't meet A5 | Meets A5 with gaps | Meets A5 and respects the spec's non-goals |
| Criterion | Weight | Hand-built option | Existing-service option | AI-assisted build |


### Weighted comparison

| Criterion | Weight | Hand-built option | Existing-service option | AI-assisted build |
|---|---:|---:|---:|---:|
| Cost to start | 3 | 5 (15) | 3 (9) | 3 (9) |
| Cost to maintain | 2 | 5 (10) | 1 (2) | 1 (2) |
| Time to working | 3 | 5 (15) | 2 (6) | 3 (9) |
| Inspectability | 4 | 4 (16) | 1 (4) | 1 (4) |
| Switching cost | 4 | 5 (20) | 1 (4) | 1 (4) |
| Fit to spec | 5 | 3 (15) | 4 (20) | 3 (15) |
| **Total** (max 105) | | **91** | **45** | **43** |

## The Gate: HW4 rerun

Where should entries live now that they must survive a cleared cache?

| Criterion | Weight | Build (Worker + D1) | Buy (hosted BaaS) | Delegate (AI builder hosts it) |
|---|---|---|---|---|
| Cost to start | | | | |
| Cost to maintain | | | | |
| Time to working | | | | |
| Inspectability | | | | |
| Switching cost | | *scored from Session B experience* | | |
| Fit to spec | | | | |
| **Weighted total** | | | | |

## ADR-002: Entries move from localStorage to Cloudflare D1

**Status:** Proposed
**Supersedes:** ADR-001

### Context
What data leaves the browser, to which vendor, under what terms, and who is accountable.

### Decision

### Alternatives considered

### Consequences
At least one thing that got harder.

### Revisit trigger


## ADR-001

Title and date: ADR-001 — Build the pool as a hand-written browser page instead of on a streaming platform's API. September 22, 2026.

Status: Superseded.

Door / concrete acquisition and execution choice: Build. Hand-written index.html, styles.css and app.js, saving to localStorage, run from a Codespace with Live Server.

Context: The pool must show a source name on every item (A5), and the spec says it holds playable tracks only. HW2 assumed Spotify, but one of my two interviewees uses Apple Music, and the two platforms store incompatible track IDs. Spotify's 2026 terms require Premium, cap apps at five users, and have removed endpoints twice this year. The budget is zero; I reworded it to "no new spending" because I already pay for Premium. I cannot yet comfortably read client or server code, and the deadline is one week. The gate scored Build 91, Spotify 45, and Delegate 43.

Decision: I will build the pool by hand as three static files saving to localStorage, with a source name required before any item is saved. This slice reads no listening data, so it needs no platform API; automatic capture (F1, F3) will need one later, and Spotify is the likely candidate, though it offers no public access to shared listening sessions.

Consequences and revisit trigger: This gives me a working page I can read and verify this week, works for users on any platform, and stores plain JSON that is easy to move later. It fails to guarantee playable tracks, since typed text accepts typos, which breaks a spec non-goal. It does not implement F1, automatic capture, the Must-be feature. Manual entry asks Profile A to do admin work they won't do, and data stays in one browser with no sync. Revisit when a streaming platform opens shared-listening data to small developers, or when Module 4 introduces a database. Here the gate and the required hand build agree; had the gate chosen Delegate, the hand build would still be required so I can inspect delegated code later.

Keep superseded ADRs. The pedagogical browser build can coexist with a different architecture recommendation; explain the distinction.

## ADR-002

Title and date: ADR-002 — Move pool entries from browser storage to a Cloudflare Worker and D1 database. September 30, 2026.

Status: Accepted. Supersedes ADR-001.

Door / concrete acquisition and execution choice: Build. My own Worker in `worker.js`, deployed with wrangler to `https://mgt3745-hw4.semajjohnson.workers.dev`, backed by a D1 database named `mgt3745-entries`.

Context: ADR-001 chose `localStorage` and named the trigger that would end it — the pool needing to exist on more than one device, or a database arriving in Module 4. Both are now true. The gate rerun above scored Build 87, Buy 54, Delegate 40, with switching cost scored from the move I actually made rather than a guess.

**The crossing.** What crosses: every track name and, more importantly, the name of a real person a user was recommended music by, plus a dismissal flag and a timestamp. Cloudflare also receives request metadata I did not choose to send — IP address, user agent, timing, and the paths called. To whom: Cloudflare, through Workers and D1. Under what terms: a free personal account with no contract and no data-processing agreement; Cloudflare is accountable only for running the code I deployed. Who is accountable: me, for everything that gets sent. The people named in the table never consented to being recorded, and there is no mechanism for them to ask to be removed. Every row is in [TOOLS.md](TOOLS.md).

Decision: I moved pool storage out of the browser and into a D1 database reached through a Worker I deploy, with `GET /entries` returning undismissed rows, `POST /entries` validating and inserting one row per track-and-person pair, and `POST /entries/:id/dismiss` marking a row so it cannot return.

Consequences and revisit trigger: The pool now survives a cleared cache and appears in any browser, which is the behavior the spec always implied and `localStorage` could never give. Validation moved to the server, where it cannot be bypassed, and A7 became implementable and testable for the first time.

What got harder: the page no longer works offline at all, where before it worked entirely offline — a listener on a subway now sees an error instead of their pool. Testing got harder in the same way: the 500 path exists but I cannot trigger it on a deployed Worker without shipping broken code, which is why that verification row reads CANNOT TEST YET. And the table now holds the names of real people on a vendor's machine under a free account, which is a responsibility `localStorage` never created.

What this decision fails to do: it does not make the pool multi-user. One D1 table is shared by every page that calls the Worker, so two people using it would see each other's entries with no notion of ownership. The pool is single-user by design and by accident at the same time, which is a bad combination. Revisit when a second person uses it, when the free tier's limits are reached, or when anyone named in the table asks to be removed — the last of which I currently have no way to handle.