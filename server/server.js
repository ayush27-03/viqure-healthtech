const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Import only the model we need for the routes in this file.
// `Doctor` is a Mongoose model, so reads/writes happen through this object.
const { Doctor } = require("./models");

const app = express();
const PORT = process.env.PORT || 5500;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(limiter);

// Mount API route modules (implemented under server/routes)
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/doctors', require('./routes/doctors.routes'));
app.use('/api/slots', require('./routes/slots.routes'));
app.use('/api/appointments', require('./routes/appointments.routes'));
app.use('/api/products', require('./routes/products.routes'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/orders', require('./routes/orders.routes'));
app.use('/api/reviews', require('./routes/reviews.routes'));

async function connectToDatabase() {
  try {
    // `mongoose.connect()` returns a promise.
    // We `await` it so the server only continues after MongoDB is reachable.
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

app.get("/api/health", (req, res) => {
  res.status(200).send("Hello world");
});

app.get("/api/doctors/first", async (req, res) => {
  try {
    // `findOne()` returns a Mongoose Query object.
    // `await` resolves that query and gives back either:
    // 1. a doctor document, or
    // 2. null if the collection has no matching document
    //
    // We sort by `createdAt` so "first" has a predictable meaning.
    const doctor = await Doctor.findOne().sort({ createdAt: 1 });

    if (!doctor) {
      return res.status(404).json({ message: "No doctor found" });
    }

    return res.status(200).json(doctor);
  } catch (error) {
    // Any database failure during the read lands here.
    return res.status(500).json({
      message: "Failed to fetch first doctor",
      error: error.message,
    });
  }
});

app.get("/api/doctors/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Optional guard:
    // if the id format is invalid, MongoDB should not even be queried.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid doctor id" });
    }

    // `findById(id)` is the clearest way to fetch one document by MongoDB `_id`.
    // It also returns a Query object, so we `await` it.
    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    return res.status(200).json(doctor);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch doctor",
      error: error.message,
    });
  }
});

async function startServer() {
  await connectToDatabase();

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();
