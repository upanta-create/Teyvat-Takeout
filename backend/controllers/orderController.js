import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import logger from "../utils/logger.js";
import { orderTransactionsCounter } from "../middleware/metrics.js";
import { sendOrderConfirmationEmail, sendStatusUpdateEmail } from "../utils/email.js";

const stripeApiKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_key";
const stripe = new Stripe(stripeApiKey);

// SSE client registry: Map<orderId, Set<res>>
const sseClients = new Map();

const placeOrder = async (req, res) => {
  const frontend_url = process.env.FRONTEND_URL || "http://localhost:5173";
  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });
    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });
    orderTransactionsCounter.inc({ status: "created" });
    const line_items = req.body.items.map((item) => ({
      price_data: { currency: "inr", product_data: { name: item.name }, unit_amount: Math.round(item.price * 100) },
      quantity: item.quantity,
    }));
    line_items.push({
      price_data: { currency: "inr", product_data: { name: "Standard Delivery Fee" }, unit_amount: 200 * 100 },
      quantity: 1,
    });
    let sessionUrl = `${frontend_url}/verify?success=true&orderId=${newOrder._id}`;
    if (
      process.env.STRIPE_SECRET_KEY &&
      !process.env.STRIPE_SECRET_KEY.toLowerCase().includes("placeholder") &&
      !process.env.STRIPE_SECRET_KEY.toLowerCase().includes("mock")
    ) {
      const session = await stripe.checkout.sessions.create({
        line_items,
        mode: "payment",
        success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
        cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
      });
      sessionUrl = session.url;
    }
    logger.info("Order initiated successfully", { orderId: newOrder._id, userId: req.body.userId, amount: req.body.amount });
    res.json({ success: true, session_url: sessionUrl });
  } catch (error) {
    logger.error("Error creating checkout session", { error: error.message, userId: req.body.userId });
    res.json({ success: false, message: "Failed to create order checkout session" });
  }
};

const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success === "true" || success === true) {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      orderTransactionsCounter.inc({ status: "paid" });
      // Notify SSE clients of payment confirmation
      broadcastOrderUpdate(orderId, { status: "Food Processing", payment: true });
      // Send confirmation email
      const order = await orderModel.findById(orderId);
      const user = order ? await userModel.findById(order.userId) : null;
      if (order && user && user.email) {
        sendOrderConfirmationEmail({
          to: user.email,
          name: user.name,
          orderId,
          items: order.items,
          total: order.amount,
          address: order.address
        });
      }
      logger.info("Order payment confirmed", { orderId });
      res.json({ success: true, message: "Payment Verified" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      orderTransactionsCounter.inc({ status: "cancelled" });
      logger.warn("Order payment failed or cancelled", { orderId });
      res.json({ success: false, message: "Payment Not Completed" });
    }
  } catch (error) {
    logger.error("Error during order payment verification", { error: error.message, orderId });
    res.json({ success: false, message: "Verification failed" });
  }
};

const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId }).sort({ date: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    logger.error("Error fetching user order history", { error: error.message, userId: req.body.userId });
    res.json({ success: false, message: "Error fetching orders" });
  }
};

const listOrders = async (req, res) => {
  try {
    const userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      const orders = await orderModel.find({}).sort({ date: -1 });
      res.json({ success: true, data: orders });
    } else {
      logger.warn("Unauthorized admin order list access attempt", { userId: req.body.userId });
      res.status(403).json({ success: false, message: "Admin access required" });
    }
  } catch (error) {
    logger.error("Error fetching admin order list", { error: error.message });
    res.json({ success: false, message: "Error loading orders" });
  }
};

const updateStatus = async (req, res) => {
  try {
    const userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
      // Broadcast real-time update to SSE clients
      broadcastOrderUpdate(req.body.orderId, { status: req.body.status });
      // Send status update email
      const order = await orderModel.findById(req.body.orderId);
      const customer = order ? await userModel.findById(order.userId) : null;
      if (order && customer && customer.email) {
        sendStatusUpdateEmail({ to: customer.email, name: customer.name, orderId: req.body.orderId, status: req.body.status });
      }
      logger.info("Order status updated", { orderId: req.body.orderId, status: req.body.status });
      res.json({ success: true, message: "Status updated successfully" });
    } else {
      res.status(403).json({ success: false, message: "Admin access required" });
    }
  } catch (error) {
    logger.error("Error updating order status", { error: error.message, orderId: req.body.orderId });
    res.json({ success: false, message: "Error updating status" });
  }
};

/**
 * Server-Sent Events endpoint for real-time order tracking.
 * Clients subscribe by orderId and receive status updates as they happen.
 */
const trackOrder = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.userId || req.body?.userId;
  try {
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    // SSE headers
    res.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*"
    });
    res.flushHeaders();
    // Send current state immediately
    res.write(`data: ${JSON.stringify({ status: order.status, payment: order.payment })}\n\n`);
    // Register client in SSE registry
    if (!sseClients.has(orderId)) sseClients.set(orderId, new Set());
    sseClients.get(orderId).add(res);
    logger.info("SSE client connected for order tracking", { orderId, userId });
    // Heartbeat to keep connection alive
    const heartbeat = setInterval(() => {
      res.write(": heartbeat\n\n");
    }, 30000);
    // Cleanup on disconnect
    req.on("close", () => {
      clearInterval(heartbeat);
      const clients = sseClients.get(orderId);
      if (clients) {
        clients.delete(res);
        if (clients.size === 0) sseClients.delete(orderId);
      }
      logger.info("SSE client disconnected", { orderId });
    });
  } catch (error) {
    logger.error("SSE tracking error", { error: error.message, orderId });
    res.status(500).json({ success: false, message: "Tracking unavailable" });
  }
};

/**
 * Broadcasts an order status update to all connected SSE clients for that orderId.
 */
const broadcastOrderUpdate = (orderId, data) => {
  const clients = sseClients.get(orderId.toString());
  if (clients && clients.size > 0) {
    const payload = `data: ${JSON.stringify({ ...data, timestamp: new Date().toISOString() })}\n\n`;
    for (const client of clients) {
      try { client.write(payload); } catch (_) {}
    }
    logger.info("SSE broadcast sent", { orderId, clients: clients.size, data });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus, trackOrder };
