import userModel from "../models/userModel.js";
import logger from "../utils/logger.js";

/**
 * Adds or increments an item in the user's active shopping cart.
 */
const addToCart = async (req, res) => {
  try {
    const userData = await userModel.findById(req.body.userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cartData = userData.cartData || {};
    if (!cartData[req.body.itemId]) {
      cartData[req.body.itemId] = 1;
    } else {
      cartData[req.body.itemId] += 1;
    }

    await userModel.findByIdAndUpdate(req.body.userId, { cartData });
    res.json({ success: true, message: "Item added to cart" });
  } catch (error) {
    logger.error("Error adding item to cart", { error: error.message, userId: req.body.userId });
    res.json({ success: false, message: "Failed to update cart" });
  }
};

/**
 * Decrements or removes an item from the user's shopping cart.
 */
const removeFromCart = async (req, res) => {
  try {
    const userData = await userModel.findById(req.body.userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cartData = userData.cartData || {};
    if (cartData[req.body.itemId] > 1) {
      cartData[req.body.itemId] -= 1;
    } else {
      delete cartData[req.body.itemId];
    }

    await userModel.findByIdAndUpdate(req.body.userId, { cartData });
    res.json({ success: true, message: "Item removed from cart" });
  } catch (error) {
    logger.error("Error removing item from cart", { error: error.message, userId: req.body.userId });
    res.json({ success: false, message: "Failed to update cart" });
  }
};

/**
 * Retrieves the current cart state for the authenticated user.
 */
const getCart = async (req, res) => {
  try {
    const userData = await userModel.findById(req.body.userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cartData = userData.cartData || {};
    res.json({ success: true, cartData });
  } catch (error) {
    logger.error("Error fetching cart data", { error: error.message, userId: req.body.userId });
    res.json({ success: false, message: "Failed to load cart" });
  }
};

export { addToCart, removeFromCart, getCart };
