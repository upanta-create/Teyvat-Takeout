import reviewModel from "../models/reviewModel.js";
import foodModel from "../models/foodModel.js";
import userModel from "../models/userModel.js";
import logger from "../utils/logger.js";

/**
 * Adds or updates a customer review and rating for a dish.
 * Automatically updates the food item's average rating and total review count.
 */
const addReview = async (req, res) => {
  try {
    const { foodId, rating, comment } = req.body;
    const userId = req.body.userId; // Provided by authMiddleware

    if (!foodId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Valid rating (1-5) and dish ID required" });
    }

    const food = await foodModel.findById(foodId);
    if (!food) {
      return res.status(404).json({ success: false, message: "Dish not found" });
    }

    const user = await userModel.findById(userId);
    const userName = user ? user.name : "Verified Customer";

    // Upsert user's review for this dish
    await reviewModel.findOneAndUpdate(
      { userId, foodId },
      {
        userId,
        userName,
        foodId,
        foodName: food.name,
        category: food.category,
        rating: Number(rating),
        comment: comment || "",
        createdAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Recalculate average rating & review count for this food item
    const allReviews = await reviewModel.find({ foodId });
    const count = allReviews.length;
    const avgRating = count > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;

    food.rating = Math.round(avgRating * 10) / 10;
    food.reviewsCount = count;
    await food.save();

    logger.info("Customer dish review submitted", {
      userId,
      foodId,
      foodName: food.name,
      rating,
      newAvgRating: food.rating,
      totalReviews: food.reviewsCount,
    });

    res.json({
      success: true,
      message: "Thank you! Your rating has been recorded.",
      data: {
        foodId,
        rating: food.rating,
        reviewsCount: food.reviewsCount,
      },
    });
  } catch (error) {
    logger.error("Error adding dish review", { error: error.message });
    res.status(500).json({ success: false, message: "Failed to submit review" });
  }
};

/**
 * Returns personalized dish recommendations based on categories & styles the user rated highly.
 */
const getUserRecommendations = async (req, res) => {
  try {
    const userId = req.body.userId; // From authMiddleware
    const userReviews = await reviewModel.find({ userId });

    if (!userReviews || userReviews.length === 0) {
      return res.json({
        success: true,
        data: [],
        hasPreferences: false,
        message: "No reviews yet. Rate dishes to unlock tailored recommendations!",
      });
    }

    // Identify categories with positive ratings (>= 3 stars)
    const positiveReviews = userReviews.filter((r) => r.rating >= 3);
    const preferredCategories = Array.from(new Set(positiveReviews.map((r) => r.category)));

    if (preferredCategories.length === 0) {
      return res.json({ success: true, data: [], hasPreferences: false });
    }

    // Find dishes in the user's preferred categories
    const recommendedDishes = await foodModel.find({
      category: { $in: preferredCategories },
    });

    res.json({
      success: true,
      data: recommendedDishes,
      preferredCategories,
      hasPreferences: true,
    });
  } catch (error) {
    logger.error("Error fetching recommendations", { error: error.message });
    res.status(500).json({ success: false, message: "Failed to load recommendations" });
  }
};

/**
 * Retrieves all customer reviews for a specific dish.
 */
const getFoodReviews = async (req, res) => {
  try {
    const { foodId } = req.params;
    const reviews = await reviewModel.find({ foodId }).sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) {
    logger.error("Error fetching food reviews", { error: error.message });
    res.status(500).json({ success: false, message: "Failed to load reviews" });
  }
};

export { addReview, getUserRecommendations, getFoodReviews };
