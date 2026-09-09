import express from "express";
import { loginUser, registerUser } from "../controllers/userController.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { validateRegister, validateLogin } from "../middleware/validate.js";

const userRouter = express.Router();

// Strict brute-force protection on auth endpoints
userRouter.post("/register", authLimiter, validateRegister, registerUser);
userRouter.post("/login", authLimiter, validateLogin, loginUser);

export default userRouter;

