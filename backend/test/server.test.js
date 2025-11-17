const { test } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const { createServer } = require('../src/server');
const { DEFAULT_ISSUE } = require('../src/engine');

async function makeRequest(pathname) {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  const response = await new Promise((resolve, reject) => {
    http
      .get({ hostname: '127.0.0.1', port, path: pathname }, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({ status: res.statusCode, body: data });
        });
      })
      .on('error', reject);
  });

  server.close();
  return response;
}

test('quick advice uses default issue when none provided', async () => {
  const { status, body } = await makeRequest('/advice/quick');
  const payload = JSON.parse(body);

  assert.strictEqual(status, 200);
  assert.strictEqual(payload.issue, DEFAULT_ISSUE);
  assert.ok(payload.advice.length > 0);
});

test('quick advice respects incoming issue and normalizes it', async () => {
  const { status, body } = await makeRequest('/advice/quick?issue=Focus');
  const payload = JSON.parse(body);

  assert.strictEqual(status, 200);
  assert.strictEqual(payload.issue, 'focus');
  assert.ok(payload.advice.toLowerCase().includes('집중'));
});

