import mongoose from "mongoose";
import logger from "../utils/logger.js";

/**
 * Initializes persistent connection to MongoDB with connection error handling.
 */
export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/teyvat_takeout";

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info("MongoDB connection established successfully", {
      host: mongoose.connection.host,
      name: mongoose.connection.name
    });
  } catch (error) {
    logger.error("Failed to connect to MongoDB", {
      error: error.message,
      uri: mongoUri.replace(/\/\/.*@/, "//<credentials>@") // Obfuscate password if present
    });
    // In dev / standalone mode, don't immediately crash so routes/metrics can still be tested
  }
};

