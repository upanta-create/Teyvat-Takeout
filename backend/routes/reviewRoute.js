import express from "express";
import { addReview, getUserRecommendations, getFoodReviews } from "../controllers/reviewController.js";
import authMiddleware from "../middleware/auth.js";

const reviewRouter = express.Router();

// Add or update review (Requires customer JWT authentication)
reviewRouter.post("/add", authMiddleware, addReview);

// Get personalized dish recommendations based on past customer reviews
reviewRouter.post("/recommendations", authMiddleware, getUserRecommendations);

// Publicly view reviews for a specific dish
reviewRouter.get("/food/:foodId", getFoodReviews);

export default reviewRouter;
