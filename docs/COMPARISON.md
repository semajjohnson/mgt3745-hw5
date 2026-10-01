# COMPARISON.md

The same context files and the same instruction line, given to bolt.new and to Google AI Studio's Build tab on 10/01/2026. Neither output was corrected or iterated; both are first drafts.

## Where they agreed

Both respected A13. Neither invented a mood vocabulary, offered a dropdown of pre-written moods, or seeded any label. This is the clearest result of the week: the rule was written plainly in FEATURES.md, and two tools built from different starting points both honored it without being reminded.

Both kept my existing entry flow intact — the track and source fields, the validation messages, and the merge of a track recommended by two people. Neither treated the feature as license to rewrite the page around it.

## Where they differed

**When a label can be applied.** AI Studio made the label a field on the add-a-track form, so a label is chosen at the moment an entry is created. bolt made labelling a separate action on an item already in the pool. A10 says "WHEN a user adds a mood label to a pool item," which reads as bolt's interpretation, but no row in my spec says *when* labelling may happen — so AI Studio's version is not contradicted by anything I wrote. The disagreement is a gap in the spec, found by giving the same sentence to two readers.

**Structure and dependencies.** AI Studio returned plain HTML, CSS and JavaScript with no dependencies. bolt returned a Vite project with React, Tailwind, Supabase, Lucide and five build tools in `package.json`, none of which its generated code imports, plus Google Fonts loaded from two external origins. bolt's own `.bolt/prompt` instructs it to default to React and Tailwind, so the scaffold came from the tool's configuration rather than from my instruction.

**Storage.** AI Studio called my Worker's `/entries` endpoint. bolt called it too for entries, but put mood labels in `localStorage`, writing a comment explaining that the Worker does not store them.

## Which prediction this resolved

The Loose prediction — that the tool would add dependencies I did not ask for — resolved TRUE for bolt and FALSE for AI Studio. Running both is what makes that resolution interpretable: a single run would have told me the prediction was right without telling me the cause was bolt's starter template rather than anything in my files.

## What the agreement says about my spec

The parts of my spec that both tools honored are the parts written as explicit rules with IDs attached. A13 names a prohibition in a single sentence and both followed it. The parts they diverged on are the parts where my spec described an outcome and left the procedure implicit — A10 says a label is stored and displayed but never says at what moment it may be added. Agreement tracked specificity, not tool quality, and where my writing was silent each tool filled the silence from its own defaults.

No conclusion is drawn here about which tool is better. Two runs on one feature by one person is not a sample.