import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

/**
 * Express middleware to authenticate JWT bearer tokens from request headers.
 */
const authMiddleware = async (req, res, next) => {
  const token = req.headers.token || req.headers.authorization?.replace("Bearer ", "") || req.query.token;
  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication required. Please log in." });
  }
  try {
    const secret = process.env.JWT_SECRET || "teyvat_default_dev_jwt_secret_key";
    const token_decode = jwt.verify(token, secret);
    if (!req.body) req.body = {};
    req.body.userId = token_decode.id;
    req.userId = token_decode.id;
    next();
  } catch (error) {
    logger.warn("JWT verification failed", { error: error.message });
    res.status(401).json({ success: false, message: "Session expired or invalid token" });
  }
};

export default authMiddleware;
