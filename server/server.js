const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5500;
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Origin not allowed by CORS"));
  },
}));
app.use(express.json());
app.use(morgan("dev"));
app.use(limiter);

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/doctor', require('./routes/doctor.routes'));
app.use('/api/doctors', require('./routes/doctors.routes'));
app.use('/api/patients', require('./routes/patients.routes'));
app.use('/api/slots', require('./routes/slots.routes'));
app.use('/api/appointments', require('./routes/appointments.routes'));
app.use('/api/products', require('./routes/products.routes'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/orders', require('./routes/orders.routes'));
app.use('/api/reviews', require('./routes/reviews.routes'));
app.use('/api/categories', require('./routes/categories.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
    },
  });
});

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
    data: { path: req.originalUrl },
  });
});

app.use((error, req, res, next) => {
  if (error?.message === "Origin not allowed by CORS") {
    return res.status(403).json({ success: false, message: error.message, data: {} });
  }

  console.error("Unhandled server error:", error);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    data: {},
  });
});

async function startServer() {
  await connectToDatabase();

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();
