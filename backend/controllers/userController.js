import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import logger from "../utils/logger.js";

// JWT token generation with expiration
const createToken = (id) => {
  const secret = process.env.JWT_SECRET || "teyvat_default_dev_jwt_secret_key";
  return jwt.sign({ id }, secret, { expiresIn: "7d" });
};

/**
 * Authenticates user credentials and returns JWT bearer token.
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      logger.warn("Login failed: User not found", { email });
      return res.json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn("Login failed: Incorrect password", { email });
      return res.json({ success: false, message: "Invalid email or password" });
    }

    const token = createToken(user._id);
    logger.info("User authenticated successfully", { userId: user._id, role: user.role });
    res.json({ success: true, token, role: user.role });
  } catch (error) {
    logger.error("Error during user login", { error: error.message, email });
    res.json({ success: false, message: "Authentication service error" });
  }
};

/**
 * Registers new customer account with bcrypt salted password hashing.
 */
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "An account with this email already exists" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please provide a valid email address" });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    const saltRounds = Number(process.env.SALT) || 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    const token = createToken(user._id);
    logger.info("New user registered", { userId: user._id, email });
    res.json({ success: true, token, role: user.role });
  } catch (error) {
    logger.error("Error during user registration", { error: error.message, email });
    res.json({ success: false, message: "Registration service error" });
  }
};

export { loginUser, registerUser };
