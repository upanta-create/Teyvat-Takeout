import foodModel from "../models/foodModel.js";
import userModel from "../models/userModel.js";
import fs from "fs";
import logger from "../utils/logger.js";

/**
 * Adds a new food item to the catalog (Admin only).
 */
const addFood = async (req, res) => {
  const image_filename = req.file ? `${req.file.filename}` : "default_food.png";
  const food = new foodModel({
    name: req.body.name,
    description: req.body.description,
    price: Number(req.body.price),
    category: req.body.category,
    image: image_filename,
    rating: req.body.rating ? Number(req.body.rating) : (4.5 + Math.round(Math.random() * 5) / 10),
    reviewsCount: req.body.reviewsCount ? Number(req.body.reviewsCount) : (80 + Math.floor(Math.random() * 150)),
  });

  try {
    const userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      await food.save();
      logger.info("New food item added to catalog", { foodId: food._id, name: food.name, rating: food.rating });
      res.json({ success: true, message: "Food item added successfully" });
    } else {
      logger.warn("Unauthorized addFood request", { userId: req.body.userId });
      res.status(403).json({ success: false, message: "Admin access required" });
    }
  } catch (error) {
    logger.error("Error adding food item", { error: error.message });
    res.json({ success: false, message: "Failed to add food item" });
  }
};

/**
 * Retrieves the full food menu catalog for frontend display.
 */
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    res.json({ success: true, data: foods });
  } catch (error) {
    logger.error("Error listing food items", { error: error.message });
    res.json({ success: false, message: "Failed to load menu items" });
  }
};

/**
 * Removes a food item and deletes associated image from disk (Admin only).
 */
const removeFood = async (req, res) => {
  try {
    const userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      const food = await foodModel.findById(req.body.id);
      if (food) {
        if (food.image && fs.existsSync(`uploads/${food.image}`)) {
          fs.unlink(`uploads/${food.image}`, () => {});
        }
        await foodModel.findByIdAndDelete(req.body.id);
        logger.info("Food item removed from catalog", { foodId: req.body.id });
        res.json({ success: true, message: "Food item removed successfully" });
      } else {
        res.status(404).json({ success: false, message: "Food item not found" });
      }
    } else {
      res.status(403).json({ success: false, message: "Admin access required" });
    }
  } catch (error) {
    logger.error("Error removing food item", { error: error.message, foodId: req.body.id });
    res.json({ success: false, message: "Failed to remove food item" });
  }
};

export { addFood, listFood, removeFood };
