const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert');
const { test } = require('node:test');

const normalizeMarkup = (value) => value.replace(/\s+/g, ' ').trim();

test('home screen markup matches snapshot', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const snapshot = fs.readFileSync(
    path.join(__dirname, '__snapshots__', 'home.snapshot.txt'),
    'utf8'
  );

  assert.strictEqual(normalizeMarkup(html), normalizeMarkup(snapshot));
});
