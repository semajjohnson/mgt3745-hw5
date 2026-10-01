# Judgment Eval: F4, mood and occasion labels

Twelve binary questions against the raw bolt.new output in `delegated/bolt-001.zip`, judged before integration. Grader 2 is a model; its prompt is at the bottom. Disagreements are marked and logged in EVALS.md.

| # | Question (yes/no) | You | Grader 2 | Agree? |
|---|---|---|---|---|
| 1 | Only index.html, styles.css, app.js changed? | No | No | Yes |
| 2 | No innerHTML with user input anywhere in the diff? | Yes | Yes | Yes |
| 3 | No string-concatenated SQL in worker.js? | Yes | No | **No** |
| 4 | Every text color is a STYLE.md token? | No | No | Yes |
| 5 | Every font is a STYLE.md token? | Yes | Yes | Yes |
| 6 | No new dependency in package.json? | No | No | Yes |
| 7 | Data goes through the Worker, not local state alone? | No | Yes | **No** |
| 8 | When the Worker returns 400, the reason is shown on the page? | Yes | Yes | Yes |
| 9 | Are mood labels only ones the user typed, with none suggested or pre-filled (A13)? | Yes | Yes | Yes |
| 10 | Is a label rejected when it exceeds 30 characters (A12)? | Yes | *(no answer)* | **No** |
| 11 | While a filter is active, does the page name the label and offer a way to clear it (A14)? | Yes | Yes | Yes |
| 12 | Does the page avoid loading stylesheets or fonts from another origin, per the STYLE.md refusal? | No | No | Yes |

Agreement: 9 of 12 (75%)

## Disagreements, and what they say about the rubric

Agreement fell below 80 percent, which under the Session B rule is a finding about the rubric rather than about the build. All three failures are mine, and they are the same mistake in three forms: questions written against my whole repository, handed to a grader who only had bolt's output.

**Q3 — string-concatenated SQL.** bolt never touched `worker.js`, so the file was not in the grader's packet. My prompt told it to answer No when a question could not be answered from the files given, which it correctly did. The question does not belong in a rubric scoped to the delegated output; it belongs in a review of the integrated repository.

**Q7 — data through the Worker.** The real disagreement, and the most useful one. The grader answered Yes because entries do go through the Worker; I answered No because labels, the thing actually being delegated, went to `localStorage`. The question says "data" without saying which data, so both answers are defensible against the wording. Rewritten for next time: *"Does the new feature's state go through the Worker rather than browser storage?"*

**Q10 — the 30-character limit.** Left blank. bolt enforced the limit in `app.js`, so the answer was available, but the question reads as being about server behavior while the evidence was client-side. Ambiguous scope again, and a blank counts against the rubric rather than for it.

The pattern across all three: a binary question is only binary if the grader and I are looking at the same artifact. Two of the twelve asked about files I never sent.

## Notes on my answers

**Q1 — No.** bolt produced a Vite project: `package.json`, `tsconfig.*`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `eslint.config.js`, and a `src/` layout whose `index.html` points at `/src/app.js`.

**Q4 — No, and the failure runs both ways.** bolt used `#051E39` and `#B39051`, which are the template's placeholder tokens from my own STYLE.md, not the values in my `styles.css` (`#123552`, `#B16D00`). It also introduced eight colors in no token list at all: `#FBEAEA`, `#F5EDDA`, `#D9C893`, `#8B1A1A`, `#6B6B6B`, `#E2DFD8`, `#F7F6F3`, `#041627`. bolt followed my STYLE.md faithfully; my STYLE.md did not describe my own stylesheet.

**Q5 — Yes, technically.** Roboto and Roboto Slab are the fonts my STYLE.md names. It got them by loading Google Fonts, which is Q12's problem rather than Q5's.

**Q6 — No.** React, React DOM, Supabase, Lucide, Tailwind, Vite, TypeScript, ESLint and PostCSS, none of which the generated `app.js` imports. They come from bolt's starter template, visible in `.bolt/prompt`.

**Q7 — No, and this is the main finding.** Entries correctly use my Worker, including the dismiss route and the `?apiDown` hook. Mood labels went to `localStorage`, with the comment "Labels persist in localStorage because the Cloudflare Worker does not store them." Fixed in integration by adding a `labels` table and two endpoints.

**Q8 — Yes** for entry errors, which bolt preserved from my `app.js`. Label validation was client-side only, so there was no 400 to show; that moved to the server during integration.

**Q12 — No.** `index.html` preconnects to `fonts.googleapis.com` and `fonts.gstatic.com` and loads a stylesheet from the first. That is a live network call on every page load and a Trust Boundary crossing my TOOLS.md did not have a row for.

## Grader 2 prompt (if a model)

```
You are grading an AI-generated code change against a specification. I will give you four files: FEATURES.md, STANDARDS.md, STYLE.md, and the generated output (index.html, styles.css, app.js, package.json).

Answer each of the twelve questions below with exactly "Yes" or "No" and one sentence of evidence citing a specific line or file. Do not hedge, do not use "partially", and do not score anything numerically. If a question cannot be answered from the files given, answer "No" and say what was missing.

[paste the twelve questions]

[paste FEATURES.md, STANDARDS.md, STYLE.md, and the contents of delegated/bolt-001.zip]
```