# SKILLS.md

Status: ACTIVE in Module 5.

## 1. Fetch with on-page error display

A reusable pattern for any call to the Worker. Every path that can fail tells the user on the page, and nothing updates the visible state until the server confirms.

```js
async function callApi(path, options) {
  try {
    const response = await fetch(apiBase + path, options);
    if (!response.ok) {
      // The Worker's 400 messages name the problem, so they are shown as written.
      showError(await response.text());
      return null;
    }
    return response;
  } catch {
    showError('Could not reach the server. Nothing was saved.');
    return null;
  }
}
```

Three rules it encodes: a failed network call and a failed response are different cases and need different messages; the server's own message is shown verbatim rather than replaced with a generic one; and the caller checks the return value before touching what the user sees. To apply it, write the server's validation first so there is a message worth displaying.

## 2. Delegation guidance: state the prohibitions, not just the goal

What to put in the prompt: the acceptance rows with their IDs, the standards file, the style file, and the existing source files. Tools follow numbered rules well — bolt cited acceptance row A13 by number in a comment it wrote itself.

What to check first, in this order: where new state is stored, what came back in `package.json`, and what external origins the HTML now calls. All three are findable in under five minutes and all three are where the real problems were.

What a tool reliably gets wrong: anything a file never forbade. bolt put new state in `localStorage` because no file said new state must live in D1; it loaded Google Fonts because the font names were in STYLE.md and the refusal against external origins was in a prose section it did not treat as binding; it returned nine unused dependencies because its own starter template defaults to React and Tailwind regardless of the task.

The lesson for next time: a specification that says what to build transmits well, and a specification that assumes what not to build does not transmit at all. Before the next delegation, STANDARDS.md gets an explicit prohibition list — no new storage mechanisms, no external origins, no dependencies — because the tool will follow it and will not infer it.