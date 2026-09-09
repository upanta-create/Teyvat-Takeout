import express from "express";
import authMiddleware from "../middleware/auth.js";
import { listOrders, placeOrder, updateStatus, userOrders, verifyOrder, trackOrder } from "../controllers/orderController.js";
import { orderLimiter, adminLimiter, publicApiLimiter } from "../middleware/rateLimiter.js";
import { validatePlaceOrder } from "../middleware/validate.js";

const orderRouter = express.Router();

orderRouter.post("/place", orderLimiter, authMiddleware, validatePlaceOrder, placeOrder);
orderRouter.post("/verify", publicApiLimiter, verifyOrder);
orderRouter.post("/status", adminLimiter, authMiddleware, updateStatus);
orderRouter.post("/userorders", publicApiLimiter, authMiddleware, userOrders);
orderRouter.get("/list", adminLimiter, authMiddleware, listOrders);

// Server-Sent Events — real-time order tracking stream
orderRouter.get("/track/:orderId", authMiddleware, trackOrder);

export default orderRouter;