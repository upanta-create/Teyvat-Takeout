import categoryModel from "../models/categoryModel.js";
import foodModel from "../models/foodModel.js";
import userModel from "../models/userModel.js";
import fs from "fs";
import logger from "../utils/logger.js";
import { saveBufferToGridFS, saveUrlToGridFS } from "../utils/gridfs.js";

/**
 * Add a new category (Admin only).
 */
const addCategory = async (req, res) => {
  try {
    const userData = await userModel.findById(req.body.userId);
    if (!userData || userData.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    const { name, description, imageUrl } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    // Check for existing category with same name (case-insensitive)
    const existing = await categoryModel.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Category '${name.trim()}' already exists.`,
      });
    }

    let finalImage = "";

    if (req.file) {
      const buffer = fs.readFileSync(req.file.path);
      const gridFsName = `gridfs_cat_${Date.now()}_${req.file.originalname}`;
      await saveBufferToGridFS(buffer, gridFsName, req.file.mimetype);
      finalImage = gridFsName;
    } else if (imageUrl && imageUrl.trim()) {
      finalImage = imageUrl.trim();
    } else {
      return res.status(400).json({ success: false, message: "Category image is required" });
    }

    const category = new categoryModel({
      name: name.trim(),
      description: (description || "").trim(),
      image: finalImage,
      isActive: true,
    });

    await category.save();
    logger.info("New category created", {
      categoryId: category._id,
      name: category.name,
      image: category.image,
    });

    res.json({
      success: true,
      message: `Category '${category.name}' created successfully!`,
      data: category,
    });
  } catch (error) {
    logger.error("Error creating category", { error: error.message });
    res.status(500).json({ success: false, message: "Failed to create category" });
  }
};

/**
 * Updates an existing category (Admin only).
 */
const updateCategory = async (req, res) => {
  try {
    const userData = await userModel.findById(req.body.userId);
    if (!userData || userData.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    const { id, name, description, imageUrl } = req.body;
    const category = await categoryModel.findById(id);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const oldName = category.name;
    const newName = name ? name.trim() : oldName;

    category.name = newName;
    if (description !== undefined) category.description = description.trim();

    if (req.file) {
      const buffer = fs.readFileSync(req.file.path);
      const gridFsName = `gridfs_cat_${Date.now()}_${req.file.originalname}`;
      await saveBufferToGridFS(buffer, gridFsName, req.file.mimetype);
      category.image = gridFsName;
    } else if (imageUrl && imageUrl.trim()) {
      category.image = imageUrl.trim();
    }

    await category.save();

    // If category name was renamed, update all associated dishes in foodModel
    if (oldName !== newName) {
      await foodModel.updateMany(
        { category: { $regex: new RegExp(`^${oldName}$`, "i") } },
        { $set: { category: newName } }
      );
      logger.info("Updated category name across assigned dishes", { oldName, newName });
    }

    logger.info("Category updated successfully", { categoryId: category._id, name: category.name });
    res.json({
      success: true,
      message: `Category "${category.name}" updated successfully!`,
      data: category,
    });
  } catch (error) {
    logger.error("Error updating category", { error: error.message });
    res.status(500).json({ success: false, message: "Failed to update category" });
  }
};

/**
 * List active categories for customer frontend
 */
const listCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find({ isActive: true }).sort({ createdAt: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    logger.error("Error fetching categories", { error: error.message });
    res.status(500).json({ success: false, message: "Failed to load categories" });
  }
};

/**
 * List all categories with dish counts for Admin panel
 */
const adminListCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find({}).sort({ createdAt: 1 });

    // Calculate real-time dish count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const dishesCount = await foodModel.countDocuments({
          category: { $regex: new RegExp(`^${cat.name}$`, "i") },
        });
        return {
          ...cat.toObject(),
          dishesCount,
        };
      })
    );

    res.json({ success: true, data: categoriesWithCount });
  } catch (error) {
    logger.error("Error fetching admin category list", { error: error.message });
    res.status(500).json({ success: false, message: "Failed to load admin categories" });
  }
};

/**
 * Toggle category active/disabled status (Admin only)
 * Business Rule: Categories cannot be disabled if dishes are allotted to them.
 */
const toggleCategoryStatus = async (req, res) => {
  try {
    const userData = await userModel.findById(req.body.userId);
    if (!userData || userData.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    const { id, isActive } = req.body;
    const category = await categoryModel.findById(id);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // If attempting to disable (isActive === false), check if any dishes are assigned
    if (isActive === false) {
      const dishesCount = await foodModel.countDocuments({
        category: { $regex: new RegExp(`^${category.name}$`, "i") },
      });

      if (dishesCount > 0) {
        return res.status(400).json({
          success: false,
          dishesCount,
          message: `Cannot disable category '${category.name}' because ${dishesCount} dish(es) are currently assigned to it. Please reassign or delete those dishes first.`,
        });
      }
    }

    category.isActive = Boolean(isActive);
    await category.save();

    logger.info("Category status updated", {
      categoryId: category._id,
      name: category.name,
      isActive: category.isActive,
    });

    res.json({
      success: true,
      message: `Category '${category.name}' has been ${category.isActive ? "enabled" : "disabled"}.`,
      data: category,
    });
  } catch (error) {
    logger.error("Error toggling category status", { error: error.message });
    res.status(500).json({ success: false, message: "Failed to update category status" });
  }
};

export {
  addCategory,
  updateCategory,
  listCategories,
  adminListCategories,
  toggleCategoryStatus,
};
