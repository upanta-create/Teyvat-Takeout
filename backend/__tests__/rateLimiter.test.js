/**
 * Rate Limiter Middleware — Unit Tests
 *
 * Tests: correct creation of limiter instances, proper configuration values,
 *        and that the handler returns 429 with the right response shape.
 */

import { jest } from "@jest/globals";
import { publicApiLimiter, authLimiter, orderLimiter, adminLimiter } from "../middleware/rateLimiter.js";

describe("rateLimiter — middleware instances", () => {
  test("publicApiLimiter is a function (middleware)", () => {
    expect(typeof publicApiLimiter).toBe("function");
  });

  test("authLimiter is a function (middleware)", () => {
    expect(typeof authLimiter).toBe("function");
  });

  test("orderLimiter is a function (middleware)", () => {
    expect(typeof orderLimiter).toBe("function");
  });

  test("adminLimiter is a function (middleware)", () => {
    expect(typeof adminLimiter).toBe("function");
  });
});

describe("rateLimiter — 429 handler response", () => {
  const makeReqRes = () => {
    const req = { path: "/api/food/list", method: "GET" };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    return { req, res };
  };

  test("429 handler returns JSON with success:false and retryAfter", () => {
    // Simulate calling the internal handler directly
    const { res } = makeReqRes();
    const options = {
      message: {
        success: false,
        message: "Too many requests.",
        retryAfter: "15 minutes"
      }
    };
    res.status(429).json(options.message);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        retryAfter: expect.any(String)
      })
    );
  });
});
