const { Slot } = require("../models");
const { sendSuccess, sendError, sendCreated } = require("../utils/response.util");

const createSlot = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { slots } = req.body; 

    if (!Array.isArray(slots) || slots.length === 0) {
      return sendError(res, "slots array is required", 400);
    }
    if (slots.length > 50) {
      return sendError(res, "Cannot create more than 50 slots at once", 400);
    }

    const toInsert = slots.map((s) => ({
      doctorId,
      date:      s.date,
      startTime: s.startTime,
      endTime:   s.endTime,
      isBooked:  false,
    }));

    const created = await Slot.insertMany(toInsert, { ordered: false });
    return sendCreated(res, { slots: created }, `${created.length} slot(s) created`);
  } catch (err) {
    if (err.code === 11000) {
      return sendError(res, "One or more slots already exist for that time", 409);
    }
    console.error("createSlot:", err);
    return sendError(res, "Failed to create slots", 500);
  }
};

const getSlotsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query; 

    const filter = { doctorId, isBooked: false, date: { $gte: new Date().toISOString().split("T")[0] } };
    if (date) filter.date = date;

    const slots = await Slot.find(filter).sort({ date: 1, startTime: 1 }).lean();
    return sendSuccess(res, { slots });
  } catch (err) {
    console.error("getSlotsByDoctor:", err);
    return sendError(res, "Failed to fetch slots", 500);
  }
};

const deleteSlot = async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);
    if (!slot) return sendError(res, "Slot not found", 404);

    if (slot.doctorId.toString() !== req.user.id) {
      return sendError(res, "Not authorized to delete this slot", 403);
    }
    if (slot.isBooked) {
      return sendError(res, "Cannot delete a booked slot", 400);
    }

    await slot.deleteOne();
    return sendSuccess(res, {}, "Slot deleted");
  } catch (err) {
    console.error("deleteSlot:", err);
    return sendError(res, "Failed to delete slot", 500);
  }
};

module.exports = { createSlot, getSlotsByDoctor, deleteSlot };
