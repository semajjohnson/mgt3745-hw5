// evals/worker.test.js
// The code eval. Run with:   API=https://mgt3745-hw4.<you>.workers.dev npm test
// Each test names the EARS row it checks. Add at least one for your new feature.
//
// HW5: the starter version of this file posted {text: ...}, the shape of the
// template's schema. ADR-002 replaced that with one row per track-and-person
// pair, so the POST tests below were adapted to {track, source}. The failure
// was a real divergence between a starter test and a superseded schema, not a
// bug in the Worker; it is logged in EVALS.md.
import { test } from "node:test";
import assert from "node:assert/strict";

const API = process.env.API;
if (!API) throw new Error("Set API to your deployed Worker URL: API=https://... npm test");

test("EARS: THE SYSTEM SHALL return all entries in creation order (GET /entries is 200 + array)", async () => {
  const res = await fetch(API + "/entries");
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(Array.isArray(body));
  for (let i = 1; i < body.length; i++) assert.ok(body[i].id > body[i - 1].id, "ids ascending");
});

test("A8: IF a submitted item has no track or source, THEN THE SYSTEM SHALL reject it (POST {} is 400)", async () => {
  const res = await fetch(API + "/entries", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  assert.equal(res.status, 400);
  assert.ok((await res.text()).length > 0, "400 carries a reason");
});

test("A5: WHEN a valid entry is submitted, THE SYSTEM SHALL store it with its source name (POST then GET shows it)", async () => {
  const marker = "eval-" + Date.now();
  const post = await fetch(API + "/entries", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ track: marker, source: "eval-source" }),
  });
  assert.equal(post.status, 201);
  const list = await (await fetch(API + "/entries")).json();
  const stored = list.find(entry => entry.track === marker);
  assert.ok(stored, "posted entry appears in GET");
  assert.equal(stored.source, "eval-source", "the source name is stored with it (A5)");

  // Dismissed so repeated runs do not fill the real pool.
  await fetch(API + "/entries/" + stored.id + "/dismiss", { method: "POST" });
});