import rateLimit from "express-rate-limit";

/**
 * API Rate Limiting Middleware — Tiered protection by endpoint sensitivity.
 *
 * Tier 1 — Public API (food catalog, categories): 200 req / 15 min
 * Tier 2 — Auth (login, register): 10 req / 15 min (brute-force protection)
 * Tier 3 — Admin operations: 150 req / 15 min
 * Tier 4 — Order placement: 30 req / 15 min (fraud mitigation)
 */

const createLimiter = (max, windowMs, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message,
      retryAfter: `${Math.ceil(windowMs / 60000)} minutes`
    },
    handler: (req, res, _next, options) => {
      res.status(429).json(options.message);
    }
  });

// Public menu and catalog browsing
export const publicApiLimiter = createLimiter(
  200,
  15 * 60 * 1000,
  "Too many requests. Please wait 15 minutes and try again."
);

// Authentication endpoints — strict brute-force protection
export const authLimiter = createLimiter(
  10,
  15 * 60 * 1000,
  "Too many login attempts. Your IP has been temporarily blocked for 15 minutes."
);

// Order placement — prevent fraud / accidental spam
export const orderLimiter = createLimiter(
  30,
  15 * 60 * 1000,
  "Order rate limit exceeded. Please wait 15 minutes before placing more orders."
);

// Admin portal operations
export const adminLimiter = createLimiter(
  150,
  15 * 60 * 1000,
  "Admin API rate limit reached. Please wait 15 minutes."
);
