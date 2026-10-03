import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import logger from "./logger.js";

let gridFSBucket = null;

/**
 * Initializes and returns the MongoDB GridFSBucket instance.
 */
export const getGridFSBucket = () => {
  if (!gridFSBucket && mongoose.connection.readyState === 1) {
    gridFSBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "images",
    });
  }
  return gridFSBucket;
};

/**
 * Saves a binary Buffer directly into MongoDB GridFS.
 */
export const saveBufferToGridFS = async (buffer, filename, contentType = "image/jpeg") => {
  const bucket = getGridFSBucket();
  if (!bucket) {
    throw new Error("MongoDB GridFSBucket is not initialized. Ensure DB is connected.");
  }

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: contentType || "image/jpeg",
      metadata: { uploadedAt: new Date() },
    });

    uploadStream.on("error", (err) => {
      logger.error("GridFS buffer upload error", { error: err.message, filename });
      reject(err);
    });

    uploadStream.on("finish", () => {
      logger.info("GridFS image stored successfully", { filename, fileId: uploadStream.id });
      resolve(filename);
    });

    uploadStream.end(buffer);
  });
};

/**
 * Downloads an external image from a URL and persists it in MongoDB GridFS.
 * Ensures images remain 100% available even if the external host goes down.
 */
export const saveUrlToGridFS = async (imageUrl, suggestedName = "image") => {
  try {
    const safeName = (suggestedName || "image")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .slice(0, 30);
    const filename = `gridfs_${Date.now()}_${safeName}.jpg`;

    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download image from URL: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get("content-type") || "image/jpeg";

    await saveBufferToGridFS(buffer, filename, contentType);
    return filename;
  } catch (error) {
    logger.warn("Could not save external URL to GridFS, falling back to original URL", {
      error: error.message,
      imageUrl,
    });
    // Fallback: return original URL if fetch fails
    return imageUrl;
  }
};

/**
 * Streams an image directly from MongoDB GridFS or fallback disk storage to the client.
 */
export const streamGridFSImage = async (req, res) => {
  const { filename } = req.params;

  try {
    const bucket = getGridFSBucket();
    if (bucket) {
      const files = await bucket.find({ filename }).toArray();
      if (files && files.length > 0) {
        const file = files[0];
        res.set("Content-Type", file.contentType || "image/jpeg");
        res.set("Cache-Control", "public, max-age=31536000, immutable");
        return bucket.openDownloadStreamByName(filename).pipe(res);
      }
    }

    // Disk fallback if file exists in uploads/
    const diskPath = path.resolve(`uploads/${filename}`);
    if (fs.existsSync(diskPath)) {
      return res.sendFile(diskPath);
    }

    // Default fallback redirect to placeholder
    res.status(404).json({ success: false, message: "Image not found" });
  } catch (error) {
    logger.error("Error streaming GridFS image", { error: error.message, filename });
    res.status(500).json({ success: false, message: "Error loading image" });
  }
};
