const http = require('http');
const { URL } = require('url');
const { DEFAULT_ISSUE, fetchQuickAdvice } = require('./engine');

function createServer() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'GET' && url.pathname === '/advice/quick') {
      const incomingIssue = url.searchParams.get('issue') || DEFAULT_ISSUE;
      const { issue, advice } = fetchQuickAdvice(incomingIssue);
      const payload = JSON.stringify({ issue, advice });

      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(payload);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  });
}

if (require.main === module) {
  const port = process.env.PORT || 3000;
  const server = createServer();
  server.listen(port, () => {
    console.log(`Advice backend listening on http://localhost:${port}`);
  });
}

module.exports = { createServer };
