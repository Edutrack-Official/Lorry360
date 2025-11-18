// src/utils/db.js
const mongoose = require('mongoose');

let isConnected = false; // Global connection state

const connectDB = async () => {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(process.env.COSMOS_MONGO_URI);

    isConnected = true;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn.connection;

  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    isConnected = false;
    throw err;
  }
};

// Handle process termination gracefully
process.on("SIGINT", async () => {
  if (isConnected) {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed on app termination");
  }
  process.exit(0);
});

module.exports = connectDB;
