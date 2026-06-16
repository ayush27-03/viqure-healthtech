const { User, Appointment } = require('../models/index');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject ? userDoc.toObject() : userDoc;
  delete user.passwordHash;
  return user;
};

/**
 * PATCH /api/doctors/me/profile
 * Doctor self-service profile/details update (not approvalStatus/fee-sensitive abuse fields).
 */
const updateDoctorProfile = catchAsync(async (req, res) => {
  if (req.user.role !== 'DOCTOR') throw new ApiError(403, 'Only doctors can access this resource');

  const { bio, qualifications, yearsOfExperience, consultationFee, isAvailable } = req.body;
  const updates = {};
  if (bio !== undefined) updates['detailsOfHealthCareProfessional.bio'] = bio;
  if (qualifications !== undefined) updates['detailsOfHealthCareProfessional.qualifications'] = qualifications;
  if (yearsOfExperience !== undefined) updates['detailsOfHealthCareProfessional.yearsOfExperience'] = yearsOfExperience;
  if (consultationFee !== undefined) updates['detailsOfHealthCareProfessional.consultationFee'] = consultationFee;
  if (isAvailable !== undefined) updates['detailsOfHealthCareProfessional.isAvailable'] = isAvailable;

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: sanitizeUser(user) });
});

/**
 * POST /api/doctors/me/slots
 * Add new time slots. body: { slots: [{ date, startTime, endTime }] }
 */
const addTimeSlots = catchAsync(async (req, res) => {
  if (req.user.role !== 'DOCTOR') throw new ApiError(403, 'Only doctors can access this resource');

  const { slots } = req.body;
  if (!Array.isArray(slots) || slots.length === 0) {
    throw new ApiError(400, 'slots must be a non-empty array');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $push: { 'detailsOfHealthCareProfessional.timeSlots': { $each: slots } } },
    { new: true, runValidators: true }
  );

  res.status(201).json({ success: true, data: user.detailsOfHealthCareProfessional.timeSlots });
});

/**
 * DELETE /api/doctors/me/slots/:slotId
 * Remove a slot that hasn't been booked.
 */
const removeTimeSlot = catchAsync(async (req, res) => {
  if (req.user.role !== 'DOCTOR') throw new ApiError(403, 'Only doctors can access this resource');

  const user = await User.findById(req.user._id);
  const slot = user.detailsOfHealthCareProfessional.timeSlots.find(
    (s) => s._id.toString() === req.params.slotId
  );
  if (!slot) throw new ApiError(404, 'Slot not found');
  if (slot.isBooked) throw new ApiError(400, 'Cannot remove a slot that is already booked');

  slot.deleteOne();
  await user.save();
  res.status(200).json({ success: true, data: user.detailsOfHealthCareProfessional.timeSlots });
});

/**
 * GET /api/doctors/me/slots
 */
const getMySlots = catchAsync(async (req, res) => {
  if (req.user.role !== 'DOCTOR') throw new ApiError(403, 'Only doctors can access this resource');
  res.status(200).json({ success: true, data: req.user.detailsOfHealthCareProfessional.timeSlots });
});

/**
 * GET /api/doctors/me/appointments
 * Doctor's own appointment history/list with optional status filter.
 */
const getMyAppointments = catchAsync(async (req, res) => {
  if (req.user.role !== 'DOCTOR') throw new ApiError(403, 'Only doctors can access this resource');

  const { status, page = 1, limit = 20 } = req.query;
  const filter = { doctorId: req.user._id };
  if (status) filter.appointmentStatus = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .populate('patientId', 'profile email phone')
      .sort({ 'schedule.scheduledAt': -1 })
      .skip(skip)
      .limit(Number(limit)),
    Appointment.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: appointments,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  });
});

/**
 * GET /api/doctors/me/earnings
 * Simple earnings dashboard aggregated from PAID/COMPLETED appointments.
 */
const getEarningsDashboard = catchAsync(async (req, res) => {
  if (req.user.role !== 'DOCTOR') throw new ApiError(403, 'Only doctors can access this resource');

  const result = await Appointment.aggregate([
    {
      $match: {
        doctorId: req.user._id,
        'paymentDetails.status': 'PAID',
      },
    },
    {
      $group: {
        _id: '$appointmentStatus',
        totalEarnings: { $sum: '$financials.consultationFee' },
        totalTax: { $sum: '$financials.taxAmount' },
        count: { $sum: 1 },
      },
    },
  ]);

  const totalEarnings = result.reduce((sum, r) => sum + r.totalEarnings, 0);
  const totalAppointments = result.reduce((sum, r) => sum + r.count, 0);

  res.status(200).json({
    success: true,
    data: {
      totalEarnings,
      totalAppointments,
      breakdownByStatus: result,
    },
  });
});

module.exports = {
  updateDoctorProfile,
  addTimeSlots,
  removeTimeSlot,
  getMySlots,
  getMyAppointments,
  getEarningsDashboard,
};
