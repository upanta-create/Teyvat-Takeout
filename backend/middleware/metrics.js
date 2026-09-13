import client from "prom-client";

/**
 * Prometheus RED (Rate, Errors, Duration) Metrics Middleware.
 * Instruments Express routes for scraping by Prometheus Operator.
 */

// Enable collection of default Node.js runtime metrics (GC, event loop, memory, CPU)
const register = new client.Registry();
register.setDefaultLabels({
  app: "teyvat-takeout",
  component: "backend-api"
});

client.collectDefaultMetrics({ register });

// 1. Rate & Count: Total HTTP Requests
export const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests handled by Teyvat API",
  labelNames: ["method", "route", "status_code"],
  registers: [register]
});

// 2. Duration: Request Latency Histogram in seconds
export const httpRequestDurationMicroseconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10], // Latency buckets
  registers: [register]
});

// 3. Errors: Total 4xx and 5xx responses
export const httpErrorCounter = new client.Counter({
  name: "http_request_errors_total",
  help: "Total count of failed HTTP requests (status >= 400)",
  labelNames: ["method", "route", "status_code"],
  registers: [register]
});

// 4. In-flight requests gauge
export const activeRequestsGauge = new client.Gauge({
  name: "http_active_requests",
  help: "Number of currently active in-flight HTTP requests",
  registers: [register]
});

// 5. Business Domain Metric: Orders placed & verified
export const orderTransactionsCounter = new client.Counter({
  name: "teyvat_orders_total",
  help: "Total business orders processed",
  labelNames: ["status"], // e.g., 'created', 'paid', 'cancelled'
  registers: [register]
});

/**
 * Express Middleware tracking request duration, status codes, and RED metrics
 */
export const metricsMiddleware = (req, res, next) => {
  // Ignore Prometheus scraping endpoint and health probes from inflating user metrics
  if (req.path === "/metrics" || req.path === "/healthz" || req.path === "/ready") {
    return next();
  }

  const start = process.hrtime();
  activeRequestsGauge.inc();

  res.on("finish", () => {
    activeRequestsGauge.dec();
    const diff = process.hrtime(start);
    const durationInSeconds = diff[0] + diff[1] / 1e9;

    // Normalize parameterized routes (e.g. /images/:id) to avoid high cardinality
    const route = req.baseUrl + (req.route ? req.route.path : req.path);
    const statusCode = res.statusCode ? res.statusCode.toString() : "500";

    httpRequestCounter.inc({
      method: req.method,
      route,
      status_code: statusCode
    });

    httpRequestDurationMicroseconds.observe(
      {
        method: req.method,
        route,
        status_code: statusCode
      },
      durationInSeconds
    );

    if (res.statusCode >= 400) {
      httpErrorCounter.inc({
        method: req.method,
        route,
        status_code: statusCode
      });
    }
  });

  next();
};

export { register };
