import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import reviewRouter from "./routes/reviewRoute.js";
import categoryRouter from "./routes/categoryRoute.js";
import { streamGridFSImage } from "./utils/gridfs.js";
import logger from "./utils/logger.js";
import { metricsMiddleware, register } from "./middleware/metrics.js";

// Initialize Express server
const app = express();
const port = process.env.PORT || 4000;

// Core Middleware
app.use(express.json());
app.use(cors());

// Prometheus RED Metrics Instrumentation Middleware
app.use(metricsMiddleware);

// Connect to MongoDB
connectDB();

// -------------------------------------------------------------
// SRE & Observability Probes
// -------------------------------------------------------------

// Kubernetes Liveness Probe: Verifies process is alive and responsive
app.get("/healthz", (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Kubernetes Readiness Probe: Verifies MongoDB connectivity before receiving traffic
app.get("/ready", (req, res) => {
  const isDbReady = mongoose.connection.readyState === 1;
  if (isDbReady) {
    res.status(200).json({
      status: "ready",
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      status: "unready",
      database: "disconnected",
      timestamp: new Date().toISOString()
    });
  }
});

// Prometheus Scraping Endpoint for Prometheus Operator / ServiceMonitor
app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    logger.error("Error scraping prometheus metrics", { error: ex.message });
    res.status(500).end(ex);
  }
});

// -------------------------------------------------------------
// Application REST API Routes
// -------------------------------------------------------------
// GridFS and Local Image Streamer
app.get("/images/:filename", streamGridFSImage);
app.use("/images", express.static("uploads"));

app.use("/api/food", foodRouter);
app.use("/api/category", categoryRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/review", reviewRouter);

app.get("/", (req, res) => {
  res.send({
    service: "Teyvat Takeout REST API",
    status: "running",
    version: "1.0.0",
    docs: "/api/food/list"
  });
});

// Start Express Listener
const server = app.listen(port, () => {
  logger.info(`Teyvat Takeout API Server running on port ${port}`, {
    environment: process.env.NODE_ENV || "development",
    port
  });
});

// -------------------------------------------------------------
// Graceful Shutdown Handlers (Zero-downtime K8s rolling updates)
// -------------------------------------------------------------
const handleShutdown = (signal) => {
  logger.info(`${signal} signal received. Initiating graceful shutdown...`);
  server.close(async () => {
    logger.info("HTTP server closed. Terminating database connections...");
    try {
      await mongoose.connection.close(false);
      logger.info("MongoDB connection closed cleanly. Process exiting.");
      process.exit(0);
    } catch (err) {
      logger.error("Error closing MongoDB connection during shutdown", { error: err.message });
      process.exit(1);
    }
  });

  // Force close after 10 seconds timeout
  setTimeout(() => {
    logger.error("Forcefully shutting down after timeout expiration.");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

export default app;

