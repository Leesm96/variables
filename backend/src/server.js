const http = require('http');
const { URL } = require('url');
const { DEFAULT_ISSUE, fetchQuickAdvice } = require('./engine');
const { handleFeedbackPost } = require('./routes/feedback');
const { metrics, startMetricLogger } = require('./metrics');

const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

function createServer() {
  startMetricLogger();

  return http.createServer((req, res) => {
    const start = process.hrtime.bigint();
    const url = new URL(req.url, `http://${req.headers.host}`);

    const finalize = () => {
      const durationNs = process.hrtime.bigint() - start;
      const durationMs = Number(durationNs) / 1e6;
      const isError = res.statusCode >= 500;
      metrics.record(durationMs, isError);
    };

    res.on('finish', finalize);

    try {
      if (req.method === 'OPTIONS' && url.pathname === '/feedback') {
        setCorsHeaders(res);
        res.writeHead(204);
        res.end();
        return;
      }

      if (req.method === 'GET' && url.pathname === '/advice/quick') {
        const incomingIssue = url.searchParams.get('issue') || DEFAULT_ISSUE;
        const { issue, advice } = fetchQuickAdvice(incomingIssue);
        const payload = JSON.stringify({ issue, advice });

        setCorsHeaders(res);
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
        });
        res.end(payload);
        return;
      }

      if (req.method === 'POST' && url.pathname === '/feedback') {
        setCorsHeaders(res);
        handleFeedbackPost(req, res);
        return;
      }

      if (req.method === 'GET' && url.pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ status: 'ok' }));
        return;
      }

      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Not Found' }));
    } catch (error) {
      console.error('Unhandled error in request handler', error);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      }
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
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
