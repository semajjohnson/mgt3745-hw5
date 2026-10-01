import { test, after } from 'node:test';
import assert from 'node:assert/strict';

const api = process.env.API;
if (!api) throw new Error('Set API to your Worker URL, e.g. API=https://... npm test');

// Each run uses a unique track name so tests never collide with real pool data
// or with a previous run left in the table.
const runId = Date.now();
const testTrack = `eval-track-${runId}`;
const testSource = `eval-source-${runId}`;
const createdIds = [];

async function post(path, body) {
  return fetch(api + path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
}

async function entries() {
  const response = await fetch(api + '/entries');
  assert.equal(response.status, 200, 'GET /entries should return 200');
  return response.json();
}

async function findTestEntry() {
  const all = await entries();
  return all.find(row => row.track === testTrack);
}

test('A8: POST /entries with no source name is rejected with 400', async () => {
  const response = await post('/entries', { track: testTrack + '-nosource', source: '' });
  assert.equal(response.status, 400);
  const message = await response.text();
  assert.match(message, /source/i, 'the 400 message should name the missing field');
});

test('A13: a newly created entry carries no labels until the user adds one', async () => {
  const created = await post('/entries', { track: testTrack, source: testSource });
  assert.equal(created.status, 201);

  const row = await findTestEntry();
  assert.ok(row, 'the new entry should appear in GET /entries');
  createdIds.push(row.id);
  assert.deepEqual(row.labels, [], 'labels must not be suggested, generated, or pre-populated');
});

test('A12: a label longer than 30 characters is rejected with 400', async () => {
  const row = await findTestEntry();
  assert.ok(row, 'the test entry must exist before labelling it');

  const response = await post(`/entries/${row.id}/labels`, { label: 'x'.repeat(31) });
  assert.equal(response.status, 400);
  const message = await response.text();
  assert.match(message, /30 characters/i, 'the 400 message should name the limit');
});

test('A10: a label added to an entry is stored and returned with that entry', async () => {
  const row = await findTestEntry();
  assert.ok(row, 'the test entry must exist before labelling it');

  const label = `late night ${runId}`;
  const response = await post(`/entries/${row.id}/labels`, { label });
  assert.equal(response.status, 201);

  const updated = await findTestEntry();
  assert.ok(updated.labels.includes(label), 'GET /entries should return the stored label');
});

// Dismissing hides the test rows so repeated runs do not fill the real pool.
after(async () => {
  const all = await entries();
  const leftovers = all.filter(row => row.track.startsWith(`eval-track-${runId}`));
  for (const row of leftovers) {
    await fetch(api + `/entries/${row.id}/dismiss`, { method: 'POST' });
  }
});
