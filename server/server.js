const mongoose = require("mongoose");
const app = require("./app");
require("dotenv").config();

const PORT = process.env.PORT || 5500;

async function connectToDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✔ MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

async function startServer() {
  try {
    await connectToDb();
    app.listen(PORT, () => {
      console.log(`🚀 Viqure Healthtech Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
