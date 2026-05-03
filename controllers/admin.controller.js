const mongoose = require("mongoose");
const Doctor      = require("../models/Doctor.model");
const User        = require("../models/User.model");
const Appointment = require("../models/Appointment.model");
const Order       = require("../models/Order.model");
const Category    = require("../models/Category.model");
const Payment     = require("../models/Payment.model");
const { sendSuccess, sendError, sendCreated } = require("../utils/response.util");
const { createNotification } = require("../utils/notification.util");

const getAdminDoctors = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const pageNum  = Math.max(parseInt(page), 1);
    const limitNum = Math.min(parseInt(limit), 100);

    const [doctors, total] = await Promise.all([
      Doctor.find(filter).select("-password").skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
      Doctor.countDocuments(filter),
    ]);

    return sendSuccess(res, { doctors, pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) } });
  } catch (err) {
    return sendError(res, "Failed to fetch doctors", 500);
  }
};

const approveDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { status: "approved", approvalStatus: "approved" },
      { new: true }
    ).select("-password");

    if (!doctor) return sendError(res, "Doctor not found", 404);

    createNotification({
      userId: doctor._id, userModel: "Doctor",
      title: "Account Approved",
      message: "Congratulations! Your ViQure doctor account has been approved. You can now log in.",
      type: "doctor_approval", refId: doctor._id, refModel: "Doctor",
    });

    return sendSuccess(res, { doctor }, "Doctor approved");
  } catch (err) {
    return sendError(res, "Failed to approve doctor", 500);
  }
};

const rejectDoctor = async (req, res) => {
  try {
    const { reason } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { status: "rejected", approvalStatus: reason || "Rejected by admin" },
      { new: true }
    ).select("-password");

    if (!doctor) return sendError(res, "Doctor not found", 404);

    createNotification({
      userId: doctor._id, userModel: "Doctor",
      title: "Account Application Rejected",
      message: reason || "Your application has been reviewed and rejected. Please contact support.",
      type: "doctor_approval", refId: doctor._id, refModel: "Doctor",
    });

    return sendSuccess(res, { doctor }, "Doctor rejected");
  } catch (err) {
    return sendError(res, "Failed to reject doctor", 500);
  }
};

const getAdminPatients = async (req, res) => {
  try {
    const { page = 1, limit = 20, q } = req.query;
    const filter = { role: "patient" };
    if (q) filter.$or = [{ name: new RegExp(q, "i") }, { email: new RegExp(q, "i") }];

    const pageNum  = Math.max(parseInt(page), 1);
    const limitNum = Math.min(parseInt(limit), 100);

    const [patients, total] = await Promise.all([
      User.find(filter).select("-password").skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
      User.countDocuments(filter),
    ]);

    return sendSuccess(res, { patients, pagination: { total, page: pageNum, limit: limitNum } });
  } catch (err) {
    return sendError(res, "Failed to fetch patients", 500);
  }
};

const getAnalytics = async (req, res) => {
  try {
    const [
      totalPatients,
      totalDoctors,
      pendingDoctors,
      totalAppointments,
      completedAppointments,
      totalOrders,
      revenueResult,
    ] = await Promise.all([
      User.countDocuments({ role: "patient" }),
      Doctor.countDocuments({ status: "approved" }),
      Doctor.countDocuments({ status: "pending" }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ appointmentStatus: "COMPLETED" }),
      Order.countDocuments(),
      Appointment.aggregate([
        { $match: { appointmentStatus: "COMPLETED", paymentStatus: "PAID" } },
        { $group: { _id: null, total: { $sum: "$consultationFees" } } },
      ]),
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Appointment.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    return sendSuccess(res, {
      analytics: {
        totalPatients,
        totalDoctors,
        pendingDoctors,
        totalAppointments,
        completedAppointments,
        totalOrders,
        totalRevenue: revenueResult[0]?.total || 0,
        monthlyTrend,
      },
    });
  } catch (err) {
    console.error("getAnalytics:", err);
    return sendError(res, "Failed to fetch analytics", 500);
  }
};

const getAdminPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const filter = {};
    if (type) filter.paymentType = type;

    const pageNum  = Math.max(parseInt(page), 1);
    const limitNum = Math.min(parseInt(limit), 100);

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Payment.countDocuments(filter),
    ]);

    return sendSuccess(res, { payments, pagination: { total, page: pageNum, limit: limitNum } });
  } catch (err) {
    return sendError(res, "Failed to fetch payments", 500);
  }
};

const getAdminAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.appointmentStatus = status.toUpperCase();

    const pageNum  = Math.max(parseInt(page), 1);
    const limitNum = Math.min(parseInt(limit), 100);

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate("patientId", "name email")
        .populate("doctorId", "doctorName email")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Appointment.countDocuments(filter),
    ]);

    return sendSuccess(res, { appointments, pagination: { total, page: pageNum, limit: limitNum } });
  } catch (err) {
    return sendError(res, "Failed to fetch appointments", 500);
  }
};

const getAdminOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const pageNum  = Math.max(parseInt(page), 1);
    const limitNum = Math.min(parseInt(limit), 100);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return sendSuccess(res, { orders, pagination: { total, page: pageNum, limit: limitNum } });
  } catch (err) {
    return sendError(res, "Failed to fetch orders", 500);
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, slug, icon, description, type } = req.body;
    const category = await Category.create({ name, slug, icon, description, type, isActive: true });
    return sendCreated(res, { category }, "Category created");
  } catch (err) {
    if (err.code === 11000) return sendError(res, "Category already exists", 409);
    return sendError(res, "Failed to create category", 500);
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!category) return sendError(res, "Category not found", 404);
    return sendSuccess(res, {}, "Category deactivated");
  } catch (err) {
    return sendError(res, "Failed to delete category", 500);
  }
};

module.exports = {
  getAdminDoctors, approveDoctor, rejectDoctor,
  getAdminPatients, getAnalytics, getAdminPayments,
  getAdminAppointments, getAdminOrders,
  createCategory, deleteCategory,
};
