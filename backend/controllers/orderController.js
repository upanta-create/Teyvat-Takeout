import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import logger from "../utils/logger.js";
import { orderTransactionsCounter } from "../middleware/metrics.js";

// Initialize Stripe gateway with fallback key for dev environments
const stripeApiKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_key";
const stripe = new Stripe(stripeApiKey);

/**
 * Creates an order, clears the active user cart, and initiates Stripe checkout session.
 */
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

    // Track order creation telemetry
    orderTransactionsCounter.inc({ status: "created" });

    // Format line items for Stripe Checkout
    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Add standard fixed delivery fee
    line_items.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Standard Delivery Fee",
        },
        unit_amount: 2 * 100,
      },
      quantity: 1,
    });

    let sessionUrl = `${frontend_url}/verify?success=true&orderId=${newOrder._id}`;

    // Generate real checkout session if valid Stripe key exists
    if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes("placeholder")) {
      const session = await stripe.checkout.sessions.create({
        line_items: line_items,
        mode: "payment",
        success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
        cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
      });
      sessionUrl = session.url;
    }

    logger.info("Order initiated successfully", {
      orderId: newOrder._id,
      userId: req.body.userId,
      amount: req.body.amount
    });

    res.json({ success: true, session_url: sessionUrl });
  } catch (error) {
    logger.error("Error creating checkout session", { error: error.message, userId: req.body.userId });
    res.json({ success: false, message: "Failed to create order checkout session" });
  }
};

/**
 * Verifies transaction payment state upon Stripe webhook/redirect callback.
 */
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success === "true" || success === true) {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      orderTransactionsCounter.inc({ status: "paid" });
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

/**
 * Fetches order history for the authenticated user.
 */
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId }).sort({ date: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    logger.error("Error fetching user order history", { error: error.message, userId: req.body.userId });
    res.json({ success: false, message: "Error fetching orders" });
  }
};

/**
 * Admin portal endpoint to list all customer orders across the platform.
 */
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

/**
 * Admin endpoint to update the fulfillment status of an order.
 */
const updateStatus = async (req, res) => {
  try {
    const userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      await orderModel.findByIdAndUpdate(req.body.orderId, {
        status: req.body.status,
      });
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

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };

