const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const Appointment = require("../models/Appointment.model");
const Slot        = require("../models/Slot.model");
const Doctor      = require("../models/Doctor.model");
const { sendSuccess, sendError, sendCreated } = require("../utils/response.util");
const { createNotification } = require("../utils/notification.util");

// ─── POST /api/appointments ───────────────────────────────────────────────────
// Patient only. Books an appointment by reserving a slot.
const createAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { doctorId, slotId } = req.body;
    const patientId = req.user.id;

    // 1. Find & lock the slot
    const slot = await Slot.findById(slotId).session(session);
    if (!slot || slot.isBooked) {
      await session.abortTransaction();
      return sendError(res, "Slot not available", 400);
    }
    if (slot.doctorId.toString() !== doctorId) {
      await session.abortTransaction();
      return sendError(res, "Slot does not belong to the specified doctor", 400);
    }

    // 2. Fetch doctor for fee snapshot
    const doctor = await Doctor.findById(doctorId).session(session);
    if (!doctor || doctor.status !== "approved") {
      await session.abortTransaction();
      return sendError(res, "Doctor not found or not approved", 404);
    }

    // 3. Mark slot as booked
    slot.isBooked = true;
    await slot.save({ session });

    // 4. Create appointment
    const appointment = await Appointment.create(
      [
        {
          patientId,
          doctorId,
          consultationFees:         doctor.consultationFees,
          appointmentStartDateTime: new Date(`${slot.date}T${slot.startTime}`),
          appointmentEndDateTime:   new Date(`${slot.date}T${slot.endTime}`),
          consultationType:         "VIDEO",
          appointmentStatus:        "PENDING",
          paymentStatus:            "PENDING",
          meetingId:                uuidv4(),
        },
      ],
      { session }
    );

    await session.commitTransaction();

    // Non-blocking notification
    createNotification({
      userId: doctorId, userModel: "Doctor",
      title: "New Appointment Booked",
      message: `A patient booked a consultation on ${slot.date} at ${slot.startTime}.`,
      type: "appointment", refId: appointment[0]._id, refModel: "Appointment",
    });

    return sendCreated(res, { appointment: appointment[0] }, "Appointment booked successfully");
  } catch (err) {
    await session.abortTransaction();
    console.error("createAppointment:", err);
    return sendError(res, "Failed to book appointment", 500);
  } finally {
    session.endSession();
  }
};

// ─── GET /api/appointments/patient ───────────────────────────────────────────
// Patient only. Get their own appointments.
const getPatientAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { patientId: req.user.id };
    if (status) filter.appointmentStatus = status.toUpperCase();

    const skip = (Math.max(parseInt(page), 1) - 1) * Math.min(parseInt(limit), 50);

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate("doctorId", "doctorName profileIcon specializations city consultationFees")
        .sort({ appointmentStartDateTime: -1 })
        .skip(skip)
        .limit(Math.min(parseInt(limit), 50))
        .lean(),
      Appointment.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      appointments,
      pagination: { total, page: parseInt(page), limit: Math.min(parseInt(limit), 50), pages: Math.ceil(total / Math.min(parseInt(limit), 50)) },
    });
  } catch (err) {
    console.error("getPatientAppointments:", err);
    return sendError(res, "Failed to fetch appointments", 500);
  }
};

// ─── GET /api/appointments/doctor ────────────────────────────────────────────
// Doctor only. Get their own appointments.
const getDoctorAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { doctorId: req.user.id };
    if (status) filter.appointmentStatus = status.toUpperCase();

    const skip = (Math.max(parseInt(page), 1) - 1) * Math.min(parseInt(limit), 50);
    const limitNum = Math.min(parseInt(limit), 50);

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate("patientId", "name email phone avatar")
        .sort({ appointmentStartDateTime: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Appointment.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      appointments,
      pagination: { total, page: parseInt(page), limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error("getDoctorAppointments:", err);
    return sendError(res, "Failed to fetch appointments", 500);
  }
};

// ─── GET /api/appointments/:id ────────────────────────────────────────────────
// Patient or Doctor (must be owner of this appointment).
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patientId", "name email phone avatar")
      .populate("doctorId", "doctorName profileIcon specializations consultationFees")
      .lean();

    if (!appointment) return sendError(res, "Appointment not found", 404);

    // Auth check
    const userId = req.user.id;
    const role   = req.user.role;
    if (
      role === "patient" && appointment.patientId._id.toString() !== userId &&
      role === "doctor"  && appointment.doctorId._id.toString() !== userId
    ) {
      return sendError(res, "Not authorized", 403);
    }

    return sendSuccess(res, { appointment });
  } catch (err) {
    console.error("getAppointmentById:", err);
    return sendError(res, "Failed to fetch appointment", 500);
  }
};

// ─── PATCH /api/appointments/:id/status ───────────────────────────────────────
// Doctor can CONFIRM / REJECT / COMPLETE. Patient can CANCEL.
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const role = req.user.role;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return sendError(res, "Appointment not found", 404);

    // Authorization per role
    if (role === "doctor") {
      if (appointment.doctorId.toString() !== req.user.id) return sendError(res, "Not authorized", 403);
      const allowed = ["CONFIRMED", "REJECTED", "COMPLETED"];
      if (!allowed.includes(status)) return sendError(res, `Doctor can set: ${allowed.join(", ")}`, 400);
    } else if (role === "patient") {
      if (appointment.patientId.toString() !== req.user.id) return sendError(res, "Not authorized", 403);
      if (status !== "CANCELLED") return sendError(res, "Patient can only cancel", 400);
    } else if (role === "admin") {
      // Admin can set any status
    }

    appointment.appointmentStatus = status;
    await appointment.save();

    // Notify the other party
    const notifyId    = role === "doctor" ? appointment.patientId : appointment.doctorId;
    const notifyModel = role === "doctor" ? "User" : "Doctor";
    createNotification({
      userId: notifyId, userModel: notifyModel,
      title: "Appointment Status Updated",
      message: `Your appointment has been ${status.toLowerCase()}.`,
      type: "appointment", refId: appointment._id, refModel: "Appointment",
    });

    return sendSuccess(res, { appointment }, "Status updated");
  } catch (err) {
    console.error("updateAppointmentStatus:", err);
    return sendError(res, "Failed to update status", 500);
  }
};

// ─── PATCH /api/appointments/:id/remarks ──────────────────────────────────────
// Doctor only. Add post-consultation remarks.
const addDoctorRemarks = async (req, res) => {
  try {
    const { remarks, remarksMode } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return sendError(res, "Appointment not found", 404);
    if (appointment.doctorId.toString() !== req.user.id) return sendError(res, "Not authorized", 403);
    if (appointment.appointmentStatus !== "COMPLETED") {
      return sendError(res, "Remarks can only be added to completed appointments", 400);
    }

    appointment.doctorRemarks     = remarks;
    appointment.doctorRemarksMode = remarksMode || "Text";
    await appointment.save();

    return sendSuccess(res, { appointment }, "Remarks added");
  } catch (err) {
    console.error("addDoctorRemarks:", err);
    return sendError(res, "Failed to add remarks", 500);
  }
};

// ─── GET /api/doctor/earnings ─────────────────────────────────────────────────
// Doctor only. Earnings summary.
const getDoctorEarnings = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const result = await Appointment.aggregate([
      {
        $match: {
          doctorId: new mongoose.Types.ObjectId(doctorId),
          appointmentStatus: "COMPLETED",
          paymentStatus: "PAID",
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings:      { $sum: "$consultationFees" },
          totalAppointments:  { $sum: 1 },
          avgFee:             { $avg: "$consultationFees" },
        },
      },
    ]);

    // Monthly breakdown
    const monthly = await Appointment.aggregate([
      {
        $match: {
          doctorId: new mongoose.Types.ObjectId(doctorId),
          appointmentStatus: "COMPLETED",
          paymentStatus: "PAID",
        },
      },
      {
        $group: {
          _id: {
            year:  { $year: "$appointmentStartDateTime" },
            month: { $month: "$appointmentStartDateTime" },
          },
          earnings: { $sum: "$consultationFees" },
          count:    { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]);

    return sendSuccess(res, {
      summary: result[0] || { totalEarnings: 0, totalAppointments: 0, avgFee: 0 },
      monthly,
    });
  } catch (err) {
    console.error("getDoctorEarnings:", err);
    return sendError(res, "Failed to fetch earnings", 500);
  }
};

module.exports = {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  addDoctorRemarks,
  getDoctorEarnings,
};
