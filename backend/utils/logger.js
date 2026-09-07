import winston from "winston";

/**
 * Enterprise structured logger for Teyvat Takeout Backend.
 * Standardizes stdout format for Promtail and Loki ingestion in Kubernetes.
 */
const { combine, timestamp, printf, json, colorize } = winston.format;

const isProduction = process.env.NODE_ENV === "production";

// Human-readable dev format vs structured JSON for production / K8s Loki
const devFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  defaultMeta: { service: "teyvat-backend-api" },
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    isProduction ? json() : combine(colorize(), devFormat)
  ),
  transports: [
    new winston.transports.Console()
  ]
});

export default logger;
