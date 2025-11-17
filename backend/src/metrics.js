const METRIC_LOG_INTERVAL_MS = Number(process.env.METRIC_LOG_INTERVAL_MS || 60000);
const MAX_DURATION_SAMPLES = Number(process.env.METRIC_MAX_SAMPLES || 500);

let loggerStarted = false;

class Metrics {
  constructor() {
    this.durations = [];
    this.totalRequests = 0;
    this.errorCount = 0;
  }

  record(durationMs, isError) {
    this.durations.push(durationMs);
    if (this.durations.length > MAX_DURATION_SAMPLES) {
      this.durations.shift();
    }
    this.totalRequests += 1;
    if (isError) {
      this.errorCount += 1;
    }
  }

  getP95() {
    if (this.durations.length === 0) return 0;
    const sorted = [...this.durations].sort((a, b) => a - b);
    const index = Math.floor(0.95 * (sorted.length - 1));
    return sorted[index];
  }

  getErrorRate() {
    if (this.totalRequests === 0) return 0;
    return this.errorCount / this.totalRequests;
  }

  snapshot() {
    return {
      p95Ms: Number(this.getP95().toFixed(2)),
      errorRate: Number(this.getErrorRate().toFixed(4)),
      sampleSize: this.durations.length,
      totalRequests: this.totalRequests,
      errorCount: this.errorCount,
    };
  }
}

const metrics = new Metrics();

function startMetricLogger() {
  if (loggerStarted) return;
  loggerStarted = true;

  setInterval(() => {
    const { p95Ms, errorRate, sampleSize, totalRequests, errorCount } = metrics.snapshot();
    console.log(
      JSON.stringify({
        event: 'metrics',
        p95_ms: p95Ms,
        error_rate: errorRate,
        sample_size: sampleSize,
        total_requests: totalRequests,
        error_count: errorCount,
        timestamp: new Date().toISOString(),
      }),
    );
  }, METRIC_LOG_INTERVAL_MS).unref();
}

module.exports = { metrics, startMetricLogger };
