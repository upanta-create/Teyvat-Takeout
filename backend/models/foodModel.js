import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewsCount: { type: Number, default: 0 },
});

// Compound text index for full-text search with relevance scoring.
// Weighted: name (3x) > description (2x) > category (1x)
foodSchema.index(
  { name: "text", description: "text", category: "text" },
  { weights: { name: 3, description: 2, category: 1 }, name: "food_text_search" }
);

// Performance index for category-based filtering
foodSchema.index({ category: 1, rating: -1 });

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);

export default foodModel;
