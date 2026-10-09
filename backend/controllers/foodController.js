import foodModel from "../models/foodModel.js";
import userModel from "../models/userModel.js";
import fs from "fs";
import logger from "../utils/logger.js";
import { saveBufferToGridFS, getGridFSBucket } from "../utils/gridfs.js";
import { cacheGet, cacheSet, cacheInvalidatePattern, CACHE_KEYS } from "../utils/cache.js";

const addFood = async (req, res) => {
  try {
    const userData = await userModel.findById(req.body.userId);
    if (!userData || userData.role !== "admin") {
      logger.warn("Unauthorized addFood request", { userId: req.body.userId });
      return res.status(403).json({ success: false, message: "Admin access required" });
    }
    let imageFilename = "default_food.png";
    if (req.file) {
      const buffer = fs.readFileSync(req.file.path);
      const gridFsName = `gridfs_${Date.now()}_${req.file.originalname}`;
      await saveBufferToGridFS(buffer, gridFsName, req.file.mimetype);
      imageFilename = gridFsName;
    } else if (req.body.imageUrl && req.body.imageUrl.trim()) {
      imageFilename = req.body.imageUrl.trim();
    }
    const food = new foodModel({
      name: req.body.name,
      description: req.body.description,
      price: Number(req.body.price),
      category: req.body.category,
      image: imageFilename,
      rating: req.body.rating ? Number(req.body.rating) : 0,
      reviewsCount: req.body.reviewsCount ? Number(req.body.reviewsCount) : 0,
    });
    await food.save();
    await cacheInvalidatePattern("food:*");
    logger.info("New food item added to catalog", { foodId: food._id, name: food.name, image: food.image });
    res.json({ success: true, message: "Dish added to catalog successfully!", data: food });
  } catch (error) {
    logger.error("Error adding food item", { error: error.message });
    res.status(500).json({ success: false, message: "Failed to add food item" });
  }
};

const updateFood = async (req, res) => {
  try {
    const userData = await userModel.findById(req.body.userId);
    if (!userData || userData.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }
    const { id, name, description, price, category, rating, imageUrl } = req.body;
    const food = await foodModel.findById(id);
    if (!food) {
      return res.status(404).json({ success: false, message: "Dish not found" });
    }
    if (name) food.name = name.trim();
    if (description !== undefined) food.description = description.trim();
    if (price !== undefined) food.price = Number(price);
    if (category) food.category = category.trim();
    if (rating !== undefined) food.rating = Number(rating);
    if (req.file) {
      const buffer = fs.readFileSync(req.file.path);
      const gridFsName = `gridfs_${Date.now()}_${req.file.originalname}`;
      await saveBufferToGridFS(buffer, gridFsName, req.file.mimetype);
      food.image = gridFsName;
    } else if (imageUrl && imageUrl.trim()) {
      food.image = imageUrl.trim();
    }
    await food.save();
    await cacheInvalidatePattern("food:*");
    logger.info("Dish updated successfully", { foodId: food._id, name: food.name });
    res.json({ success: true, message: `Dish "${food.name}" updated successfully!`, data: food });
  } catch (error) {
    logger.error("Error updating food item", { error: error.message });
    res.status(500).json({ success: false, message: "Failed to update dish" });
  }
};

const listFood = async (req, res) => {
  try {
    const cacheKey = CACHE_KEYS.FOOD_LIST;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      logger.info("Food list served from Redis cache", { count: cached.length });
      return res.json({ success: true, data: cached, cached: true });
    }
    const foods = await foodModel.find({}).lean();
    await cacheSet(cacheKey, foods, 300);
    res.json({ success: true, data: foods, cached: false });
  } catch (error) {
    logger.error("Error listing food items", { error: error.message });
    res.status(500).json({ success: false, message: "Failed to load menu items" });
  }
};

const searchFood = async (req, res) => {
  const { q, category, minPrice, maxPrice, minRating } = req.query;
  try {
    const filter = {};
    if (q && q.trim()) filter.$text = { $search: q.trim() };
    if (category && category !== "All") filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (minRating) filter.rating = { $gte: Number(minRating) };
    const projection = q && q.trim() ? { score: { $meta: "textScore" } } : {};
    const sort = q && q.trim() ? { score: { $meta: "textScore" } } : { rating: -1 };
    const results = await foodModel.find(filter, projection).sort(sort).limit(50).lean();
    logger.info("Food search executed", { query: q, category, resultsCount: results.length });
    res.json({ success: true, data: results, total: results.length, query: { q, category, minPrice, maxPrice, minRating } });
  } catch (error) {
    logger.error("Error searching food items", { error: error.message, query: req.query });
    res.status(500).json({ success: false, message: "Search failed" });
  }
};

const removeFood = async (req, res) => {
  try {
    const userData = await userModel.findById(req.body.userId);
    if (!userData || userData.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }
    const food = await foodModel.findById(req.body.id);
    if (!food) {
      return res.status(404).json({ success: false, message: "Food item not found" });
    }
    if (food.image && food.image.startsWith("gridfs_")) {
      try {
        const bucket = getGridFSBucket();
        if (bucket) {
          const files = await bucket.find({ filename: food.image }).toArray();
          for (const file of files) { await bucket.delete(file._id); }
        }
      } catch (gridErr) {
        logger.warn("Could not delete from GridFS", { error: gridErr.message, image: food.image });
      }
    } else if (food.image && fs.existsSync(`uploads/${food.image}`)) {
      fs.unlink(`uploads/${food.image}`, () => {});
    }
    await foodModel.findByIdAndDelete(req.body.id);
    await cacheInvalidatePattern("food:*");
    logger.info("Food item removed from catalog", { foodId: req.body.id });
    res.json({ success: true, message: "Food item removed successfully" });
  } catch (error) {
    logger.error("Error removing food item", { error: error.message, foodId: req.body.id });
    res.status(500).json({ success: false, message: "Failed to remove food item" });
  }
};

export { addFood, updateFood, listFood, searchFood, removeFood };
