---
color-text: "#172B40"
color-muted: "#46586B"
color-surface: "#F7F9FB"
color-primary: "#123552"
color-on-primary: "#FFFFFF"
color-accent: "#B16D00"
color-error: "#922020"
color-success: "#1D4D2B"
color-chip: "#E4EBF1"
font-body: "Arial, Helvetica, sans-serif"
font-size-min: 14px
space-unit: 8px
radius: 4px
measure-max: 44rem
target-min: 44px
---

# STYLE.md

Tokens above, rationale below. Every value here appears in `styles.css` as a custom property on `:root`; the stylesheet references the names, never the hexes.

## Contrast

Measured with the WebAIM contrast checker. Body text is 16px, so the threshold is 4.5:1.

| Pair | Ratio | Verdict |
|---|---:|---|
| `color-text` on `color-surface` | 13.67:1 | Passes |
| `color-muted` on `color-surface` | 6.94:1 | Passes — used for the source name and date |
| `color-primary` on `color-surface` | 12.01:1 | Passes |
| `color-on-primary` on `color-primary` | 12.68:1 | Passes — the Add to pool button |
| `color-error` on `color-surface` | 8.12:1 | Passes |
| `color-success` on `color-surface` | 9.26:1 | Passes |
| `color-text` on `color-chip` | 11.99:1 | Passes — label chips |
| `color-accent` on `color-surface` | 3.93:1 | **Below 4.5:1, so restricted to accents.** Used only for focus outlines, which are not text. It never carries meaning on its own and never renders a word. |

## Rationale

- **color-text**: dark enough on the surface at 13.67:1 that the pool stays readable on a phone in daylight, which is where Profile A listens.
- **color-muted**: the source name and date sit one step back from the track title, still at 6.94:1, so the hierarchy is visual rather than a contrast sacrifice.
- **color-surface**: a near-white with a cool cast, so white form inputs read as separate surfaces without a border on everything.
- **color-primary**: the only saturated color in the interface, reserved for the button that adds to the pool, so the single action this page exists for is the one thing that draws the eye.
- **color-on-primary**: plain white on the primary button at 12.68:1, because a button that is hard to read is a button that gets mis-tapped.
- **color-accent**: a warm ochre used only for focus outlines, deliberately unlike every other color here so a keyboard user always knows where they are.
- **color-error** and **color-success**: paired at similar darkness so a rejection and a confirmation carry equal weight; being told why an entry was refused is information, not an alarm.
- **color-chip**: a pale tint behind mood labels, light enough to keep `color-text` at 11.99:1, so a label reads as an attribute of the item rather than a second action.
- **font-body**: a system stack with no web font, so the page renders identically from a Codespace, a phone, and a grader's browser with no network dependency for type.
- **font-size-min**: nothing drops below 14px, because the source name — the whole point of an item — is the smallest text on the page.
- **space-unit**: all padding and margins are multiples of 8px, so nothing is eyeballed.
- **radius**: one corner radius everywhere, because a second one would be a decision with nothing behind it.
- **measure-max**: content caps near 75 characters per line, since the pool is a reading list before it is a tool.
- **target-min**: the smallest tappable height, because Dismiss sits beside text and a mis-tap permanently removes something a friend recommended.

## Refusals

**1. No color-only signaling.** Every error and confirmation carries words. Enforced because the page's core behavior is telling you *why* something was refused, and a red border alone says only *that* it was. Breaks the **Doherty Threshold** in spirit — the user is left waiting on their own interpretation — and more directly fails WCAG 1.4.1, which this project treats as a design law rather than a compliance item.

**2. No icon-only destructive buttons.** Dismiss says "Dismiss" and label removal carries an `aria-label` naming both the label and the track. Breaks **Fitts's Law** when shrunk to an icon, and breaks **Jakob's Law** in reverse: Apple Music's familiar ellipsis menu makes a destructive action look identical to harmless ones, using familiarity to hide consequence.

**3. No stylesheets, fonts, or scripts from another origin.** Presentation stays in `styles.css`. Every additional origin becomes a row in [TOOLS.md](TOOLS.md), and a typeface is not worth a Trust Boundary crossing. This refusal was violated by the HW5 delegated build, which returned Google Fonts links in `index.html`; the violation was caught in `docs/JUDGMENT.md` question 12 and the markup was not copied.

## Sources

- **Admired: Bandcamp.** One accent color, generous line length, and nothing between you and the thing you came for. The restraint above is borrowed from it.
- **Resented: Apple Music.** The service my Profile B interviewee abandoned for discovery, and the source of refusals 2 and 3.