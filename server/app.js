const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const routes = require("./routes/index");
const errorHandler = require("./middlewares/error.middleware");
const ApiError = require("./utils/ApiError");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error("Origin not allowed by CORS"));
    },
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

// Example-1
app.get("/health", (req, res) =>
  res.status(200).json({ success: true, status: "OK" }),
);

// Example-2
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

app.use("/api", require('./routes/any.route.js'));

// $ Repeat above quite a few times. 2 examples are given above.

// Unmatched routes - Following is the newer version
app.use((req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
});

/**
 * Lack of appropriate understanding on how to develop the ApiError and catchAsync utility files. Below is the earlier version being used to use the app object.
 */

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

app.use(errorHandler);

module.exports = app;
