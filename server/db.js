const mongoose = require("mongoose");

// Get the URI from environment variables (MONGO_URI)
const MONGO_URI = process.env.MONGO_URI;

async function connectDB() {
  try {
    // ⭐ FIX: Use the cloud-based MONGO_URI from the environment variables
    await mongoose.connect(MONGO_URI, { 
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Setting server selection timeout can help catch connection issues faster
      serverSelectionTimeoutMS: 5000, 
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    // Throwing the error here will ensure Vercel sees the failure
    throw new Error("Failed to connect to MongoDB. Check Vercel environment variables.");
  }
}

module.exports = connectDB;
