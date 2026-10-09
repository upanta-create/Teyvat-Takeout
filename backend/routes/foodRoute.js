import express from "express";
import { addFood, updateFood, listFood, searchFood, removeFood } from "../controllers/foodController.js";
import multer from "multer";
import authMiddleware from "../middleware/auth.js";
import { publicApiLimiter, adminLimiter } from "../middleware/rateLimiter.js";
import { validateAddFood } from "../middleware/validate.js";

const foodRouter = express.Router();

// Image Storage Engine
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}${file.originalname}`);
  }
});

const upload = multer({ storage });

// Admin write routes — protected with auth and admin rate limit
foodRouter.post("/add", adminLimiter, upload.single("image"), authMiddleware, addFood);
foodRouter.post("/update", adminLimiter, upload.single("image"), authMiddleware, updateFood);
foodRouter.post("/remove", adminLimiter, authMiddleware, removeFood);

// Public read routes — rate limited
foodRouter.get("/list", publicApiLimiter, listFood);

// Full-text search with filters — public, rate limited
foodRouter.get("/search", publicApiLimiter, searchFood);

export default foodRouter;

