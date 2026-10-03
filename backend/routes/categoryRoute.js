import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/auth.js";
import {
  addCategory,
  updateCategory,
  listCategories,
  adminListCategories,
  toggleCategoryStatus,
} from "../controllers/categoryController.js";

const categoryRouter = express.Router();

// Multer Storage Engine for Category Image Uploads
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    return cb(null, `cat_${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Routes
categoryRouter.post("/add", upload.single("image"), authMiddleware, addCategory);
categoryRouter.post("/update", upload.single("image"), authMiddleware, updateCategory);
categoryRouter.get("/list", listCategories);
categoryRouter.get("/admin-list", adminListCategories);
categoryRouter.post("/toggle", authMiddleware, toggleCategoryStatus);

export default categoryRouter;
