const mongoose = require("mongoose");
const Review      = require("../models/Review.model");
const Doctor      = require("../models/Doctor.model");
const Product     = require("../models/Product.model");
const Appointment = require("../models/Appointment.model");
const { sendSuccess, sendError, sendCreated } = require("../utils/response.util");

// ─── POST /api/reviews ────────────────────────────────────────────────────────
// Patient only. Polymorphic — targetEntity: "doctor" | "product"
const createReview = async (req, res) => {
  try {
    const { targetEntity, targetId, rating, comment, appointmentId } = req.body;
    const patientId = req.user.id;

    if (!["doctor", "product"].includes(targetEntity)) {
      return sendError(res, "targetEntity must be 'doctor' or 'product'", 400);
    }
    if (rating < 1 || rating > 5) {
      return sendError(res, "Rating must be between 1 and 5", 400);
    }

    // Prevent duplicate review
    const exists = await Review.findOne({ patientId, targetEntity, targetId });
    if (exists) return sendError(res, "You have already reviewed this", 409);

    // For doctor reviews: verify completed appointment
    if (targetEntity === "doctor" && appointmentId) {
      const appt = await Appointment.findOne({
        _id: appointmentId,
        patientId,
        doctorId: targetId,
        appointmentStatus: "COMPLETED",
      });
      if (!appt) return sendError(res, "Can only review after a completed appointment", 400);
    }

    const review = await Review.create({ patientId, targetEntity, targetId, rating, comment, appointmentId });

    // Update denormalized stats atomically
    if (targetEntity === "doctor") {
      await updateDoctorStats(targetId);
    } else {
      await updateProductStats(targetId);
    }

    return sendCreated(res, { review }, "Review submitted");
  } catch (err) {
    console.error("createReview:", err);
    return sendError(res, "Failed to submit review", 500);
  }
};

// ─── GET /api/reviews/:targetEntity/:targetId ─────────────────────────────────
// Public.
const getReviews = async (req, res) => {
  try {
    const { targetEntity, targetId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum  = Math.max(parseInt(page), 1);
    const limitNum = Math.min(parseInt(limit), 50);

    const [reviews, total] = await Promise.all([
      Review.find({ targetEntity, targetId })
        .populate("patientId", "name avatar")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Review.countDocuments({ targetEntity, targetId }),
    ]);

    return sendSuccess(res, {
      reviews,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error("getReviews:", err);
    return sendError(res, "Failed to fetch reviews", 500);
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const updateDoctorStats = async (doctorId) => {
  const result = await Review.aggregate([
    { $match: { targetEntity: "doctor", targetId: new mongoose.Types.ObjectId(doctorId) } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  if (result.length) {
    await Doctor.findByIdAndUpdate(doctorId, {
      "stats.rating":       parseFloat(result[0].avg.toFixed(1)),
      "stats.totalRatings": result[0].count,
    });
  }
};

const updateProductStats = async (productId) => {
  const result = await Review.aggregate([
    { $match: { targetEntity: "product", targetId: new mongoose.Types.ObjectId(productId) } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  if (result.length) {
    await Product.findByIdAndUpdate(productId, {
      "ratings.average":      parseFloat(result[0].avg.toFixed(1)),
      "ratings.totalReviews": result[0].count,
    });
  }
};

module.exports = { createReview, getReviews };
