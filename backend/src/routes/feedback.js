const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const STORAGE_PATH = path.resolve(__dirname, '../data/feedback.json');

const ensureStorage = () => {
  fs.mkdirSync(path.dirname(STORAGE_PATH), { recursive: true });
  if (!fs.existsSync(STORAGE_PATH)) {
    fs.writeFileSync(STORAGE_PATH, '[]', 'utf-8');
  }
};

const loadFeedback = () => {
  ensureStorage();
  try {
    const raw = fs.readFileSync(STORAGE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.error('Failed to read feedback store', error);
  }
  return [];
};

const persistFeedback = (records) => {
  ensureStorage();
  fs.writeFileSync(STORAGE_PATH, JSON.stringify(records, null, 2), 'utf-8');
};

const normalizeTimestamp = (value) => {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

const validatePayload = (payload) => {
  if (!payload || typeof payload !== 'object') return '요청 본문이 비어 있습니다.';
  if (!payload.issue || typeof payload.issue !== 'string') return 'issue 필드는 필수입니다.';
  if (payload.rating === undefined || payload.rating === null) return 'rating 필드는 필수입니다.';
  const ratingNumber = Number(payload.rating);
  if (!Number.isFinite(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
    return 'rating은 1~5 사이의 숫자여야 합니다.';
  }
  return null;
};

const buildRecord = (payload) => {
  return {
    id: randomUUID(),
    issue: payload.issue,
    input_snapshot: payload.input_snapshot || {},
    advice_snapshot: payload.advice_snapshot || {},
    rating: Number(payload.rating),
    reason: payload.reason,
    timestamp: normalizeTimestamp(payload.timestamp),
    user_actions: payload.user_actions || [],
  };
};

const groupTasteDecline = (records) => {
  const summary = {};

  records.forEach((record) => {
    const bucket = summary[record.issue] || { total: 0, bad: 0, reasons: {} };
    bucket.total += 1;
    if (record.rating <= 2) {
      bucket.bad += 1;
    }
    if (record.reason) {
      bucket.reasons[record.reason] = (bucket.reasons[record.reason] || 0) + 1;
    }
    summary[record.issue] = bucket;
  });

  return Object.entries(summary)
    .map(([issue, stats]) => {
      const sortedReasons = Object.entries(stats.reasons).sort((a, b) => b[1] - a[1]);
      return {
        issue,
        total_count: stats.total,
        negative_count: stats.bad,
        negative_ratio: stats.total ? stats.bad / stats.total : 0,
        top_reasons: sortedReasons.slice(0, 3).map(([reason]) => reason),
      };
    })
    .sort((a, b) => {
      if (b.negative_ratio !== a.negative_ratio) return b.negative_ratio - a.negative_ratio;
      if (b.negative_count !== a.negative_count) return b.negative_count - a.negative_count;
      return a.issue.localeCompare(b.issue);
    });
};

const DASHBOARD_QUERIES = {
  tasteDeclineLeaders: `
    -- 맛이 나빠졌다고 평가한 비율이 높은 이슈 TOP10
    SELECT
      issue,
      COUNT(*) AS total_count,
      SUM(CASE WHEN rating <= 2 THEN 1 ELSE 0 END) AS negative_count,
      ROUND(SUM(CASE WHEN rating <= 2 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS negative_ratio,
      JSON_GROUP_ARRAY(DISTINCT reason) AS reasons
    FROM feedback
    GROUP BY issue
    HAVING COUNT(*) >= 5
    ORDER BY negative_ratio DESC, negative_count DESC
    LIMIT 10;
  `,
  actionEffectiveness: `
    -- 유저 행동(버튼/탭)별 만족도와 빈도 집계
    SELECT
      action,
      COUNT(*) AS total_count,
      AVG(rating) AS avg_rating,
      SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) AS positive_count
    FROM feedback, json_each(feedback.user_actions)
    WHERE json_type(feedback.user_actions) = 'array'
    GROUP BY action
    HAVING total_count >= 3
    ORDER BY avg_rating DESC, total_count DESC;
  `,
};

function handleFeedbackPost(req, res) {
  let body = '';

  req
    .on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
      }
    })
    .on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const validationError = validatePayload(payload);
        if (validationError) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: validationError }));
          return;
        }

        const record = buildRecord(payload);
        const records = loadFeedback();
        records.push(record);
        persistFeedback(records);

        const aggregates = groupTasteDecline(records);

        res.writeHead(201, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(
          JSON.stringify({
            status: 'ok',
            record,
            aggregates,
          }),
        );
      } catch (error) {
        console.error('Failed to save feedback', error);
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: '잘못된 JSON 본문입니다.' }));
      }
    });
}

module.exports = { handleFeedbackPost, DASHBOARD_QUERIES };
