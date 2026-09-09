import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

/**
 * OpenAPI 3.0 Specification — Teyvat Takeout REST API
 * Interactive documentation served at /api/docs
 *
 * ATS Keywords: API documentation, OpenAPI, Swagger, REST API design
 */

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Teyvat Takeout REST API",
      version: "1.0.0",
      description: `
**Production-grade food delivery REST API** built with Node.js + Express.

Features:
- JWT-based stateless authentication with RBAC (admin/user roles)
- Tiered rate limiting: 10 auth / 200 public / 30 order / 150 admin per 15 min
- Redis Cache-Aside pattern for menu catalog (5-min TTL)
- MongoDB full-text search with weighted relevance scoring
- Server-Sent Events (SSE) for real-time order tracking
- Stripe payment gateway integration
- Prometheus RED metrics at \`/metrics\`
- Kubernetes liveness/readiness probes at \`/healthz\` and \`/ready\`
      `,
      contact: {
        name: "upanta-create",
        url: "https://github.com/upanta-create"
      },
      license: {
        name: "MIT"
      }
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Local Development Server"
      },
      {
        url: "https://api.teyvattakeout.io",
        description: "Production Server (AWS EKS)"
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token obtained from /api/user/login"
        }
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Validation failed" }
          }
        },
        Food: {
          type: "object",
          properties: {
            _id: { type: "string", example: "66a3f4c1b1e2d3a4e5f67890" },
            name: { type: "string", example: "Truffle Risotto" },
            description: { type: "string", example: "Creamy Arborio rice with black truffle shavings" },
            price: { type: "number", example: 450 },
            image: { type: "string", example: "https://images.unsplash.com/..." },
            category: { type: "string", example: "Pasta" },
            rating: { type: "number", minimum: 0, maximum: 5, example: 4.8 },
            reviewsCount: { type: "number", example: 120 }
          }
        },
        Order: {
          type: "object",
          properties: {
            _id: { type: "string" },
            userId: { type: "string" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  price: { type: "number" },
                  quantity: { type: "integer" }
                }
              }
            },
            amount: { type: "number", example: 1250 },
            status: { type: "string", enum: ["Food Processing", "Out for Delivery", "Delivered"], example: "Food Processing" },
            payment: { type: "boolean", example: true },
            date: { type: "string", format: "date-time" }
          }
        },
        Category: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string", example: "Pasta" },
            description: { type: "string" },
            image: { type: "string" },
            isActive: { type: "boolean", example: true },
            dishesCount: { type: "number", example: 4 }
          }
        }
      }
    },
    tags: [
      { name: "Auth", description: "User registration and JWT authentication" },
      { name: "Food", description: "Menu catalog CRUD and full-text search" },
      { name: "Category", description: "Food category management with disable-guard" },
      { name: "Orders", description: "Order lifecycle: placement → payment → tracking → delivery" },
      { name: "Cart", description: "User cart management" },
      { name: "Reviews", description: "Dish review and rating system" },
      { name: "Health", description: "Kubernetes SRE probes and Prometheus metrics" }
    ],
    paths: {
      // ── Health ──────────────────────────────────────────────────
      "/healthz": {
        get: {
          tags: ["Health"],
          summary: "Kubernetes Liveness Probe",
          description: "Returns 200 when the process is alive. Used by K8s to restart unhealthy pods.",
          responses: {
            200: {
              description: "Service is alive",
              content: {
                "application/json": {
                  example: { status: "healthy", uptime: 3600.5, timestamp: "2026-09-09T05:00:00.000Z" }
                }
              }
            }
          }
        }
      },
      "/ready": {
        get: {
          tags: ["Health"],
          summary: "Kubernetes Readiness Probe",
          description: "Returns 200 only when MongoDB is connected. Prevents traffic to unready pods.",
          responses: {
            200: { description: "Service is ready", content: { "application/json": { example: { status: "ready", database: "connected" } } } },
            503: { description: "Not ready — MongoDB disconnected" }
          }
        }
      },

      // ── Auth ─────────────────────────────────────────────────────
      "/api/user/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          description: "Rate-limited to 10 requests/15min. Password requires uppercase + digit.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password"],
                  properties: {
                    name: { type: "string", minLength: 2, example: "Upanta Paul" },
                    email: { type: "string", format: "email", example: "upanta@teyvat.io" },
                    password: { type: "string", minLength: 8, example: "Secure@123" }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: "Registration successful with JWT token" },
            400: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
            429: { description: "Rate limit exceeded (10 req/15min)" }
          }
        }
      },
      "/api/user/login": {
        post: {
          tags: ["Auth"],
          summary: "Authenticate user, returns JWT",
          description: "Rate-limited to 10 requests/15min for brute-force protection.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string" }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: "Login successful, returns { token, role }" },
            400: { description: "Invalid credentials" },
            429: { description: "Rate limit exceeded" }
          }
        }
      },

      // ── Food ─────────────────────────────────────────────────────
      "/api/food/list": {
        get: {
          tags: ["Food"],
          summary: "Get full menu catalog",
          description: "Redis-cached (5-min TTL). Cache-Aside pattern — MongoDB fallback on miss.",
          responses: {
            200: {
              description: "List of all food items",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: { type: "array", items: { $ref: "#/components/schemas/Food" } },
                      cached: { type: "boolean", description: "true if served from Redis" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/food/search": {
        get: {
          tags: ["Food"],
          summary: "Full-text search with filters",
          description: "MongoDB text index with weighted scoring: name (3×), description (2×), category (1×).",
          parameters: [
            { in: "query", name: "q", schema: { type: "string" }, description: "Full-text search query" },
            { in: "query", name: "category", schema: { type: "string" }, description: "Filter by category" },
            { in: "query", name: "minPrice", schema: { type: "number" }, description: "Minimum price filter" },
            { in: "query", name: "maxPrice", schema: { type: "number" }, description: "Maximum price filter" },
            { in: "query", name: "minRating", schema: { type: "number" }, description: "Minimum rating (0–5)" }
          ],
          responses: {
            200: {
              description: "Relevance-ranked search results",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: { type: "array", items: { $ref: "#/components/schemas/Food" } },
                      total: { type: "integer" }
                    }
                  }
                }
              }
            }
          }
        }
      },

      // ── Orders ───────────────────────────────────────────────────
      "/api/order/place": {
        post: {
          tags: ["Orders"],
          summary: "Place an order — creates Stripe session",
          description: "Rate-limited to 30 req/15min. Validates items, address, and amount. Returns Stripe checkout URL.",
          security: [{ BearerAuth: [] }],
          responses: {
            200: { description: "Order created, session_url returned for Stripe redirect" },
            400: { description: "Validation error" },
            401: { description: "Unauthorized" },
            429: { description: "Order rate limit (30/15min)" }
          }
        }
      },
      "/api/order/track/{orderId}": {
        get: {
          tags: ["Orders"],
          summary: "Real-time order tracking via Server-Sent Events",
          description: "Opens an SSE stream. Pushes status updates instantly when admin changes fulfillment state. Heartbeats every 30s.",
          security: [{ BearerAuth: [] }],
          parameters: [{ in: "path", name: "orderId", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "SSE stream opened (text/event-stream)", content: { "text/event-stream": { schema: { type: "string" } } } },
            403: { description: "Not your order" },
            404: { description: "Order not found" }
          }
        }
      },
      "/api/order/status": {
        post: {
          tags: ["Orders"],
          summary: "Update order status (Admin only) + triggers email notification",
          security: [{ BearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    orderId: { type: "string" },
                    status: { type: "string", enum: ["Food Processing", "Out for Delivery", "Delivered"] }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: "Status updated, SSE broadcast sent, email dispatched" },
            403: { description: "Admin access required" }
          }
        }
      }
    }
  },
  apis: []
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };
