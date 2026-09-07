import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  userName: { type: String, default: "Food Enthusiast" },
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: "food", required: true },
  foodName: { type: String, required: true },
  category: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

// Compound index to quickly fetch reviews per food item and per user
reviewSchema.index({ foodId: 1, userId: 1 });

const reviewModel = mongoose.models.review || mongoose.model("review", reviewSchema);

export default reviewModel;
