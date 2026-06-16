const { Appointment, User } = require('../models/index');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

const TAX_RATE = 0.18; // 18% applied on consultation fee for MVP simplicity

/**
 * POST /api/appointments
 * Patient books an appointment against a doctor's open time slot.
 * body: { doctorId, slotId, reason, consultationType }
 */
const bookAppointment = catchAsync(async (req, res) => {
  if (req.user.role !== 'CUSTOMER') throw new ApiError(403, 'Only patients can book appointments');

  const { doctorId, slotId, reason, consultationType = 'VIDEO' } = req.body;
  if (!doctorId || !slotId) throw new ApiError(400, 'doctorId and slotId are required');

  const doctor = await User.findOne({
    _id: doctorId,
    role: 'DOCTOR',
    'detailsOfHealthCareProfessional.approvalStatus': 'APPROVED',
  });
  if (!doctor) throw new ApiError(404, 'Doctor not found or not approved');

  const slot = doctor.detailsOfHealthCareProfessional.timeSlots.find(
    (s) => s._id.toString() === slotId
  );
  if (!slot) throw new ApiError(404, 'Slot not found');
  if (slot.isBooked) throw new ApiError(409, 'This slot is already booked');

  const fee = doctor.detailsOfHealthCareProfessional.consultationFee || 0;
  const taxAmount = Math.round(fee * TAX_RATE);
  const totalAmount = fee + taxAmount;

  const [startH, startM] = (slot.startTime || '00:00').split(':').map(Number);
  const [endH, endM] = (slot.endTime || '00:00').split(':').map(Number);
  const startDateTime = new Date(slot.date);
  startDateTime.setHours(startH, startM, 0, 0);
  const endDateTime = new Date(slot.date);
  endDateTime.setHours(endH, endM, 0, 0);

  const appointment = await Appointment.create({
    patientId: req.user._id,
    doctorId: doctor._id,
    schedule: {
      scheduledAt: slot.date,
      slotTime: `${slot.startTime} - ${slot.endTime}`,
      startDateTime,
      endDateTime,
    },
    meeting: { consultationType },
    financials: {
      consultationFee: fee,
      taxAmount,
      totalAmount,
      refundableAmount: totalAmount,
    },
    paymentDetails: { status: 'PENDING', currency: 'INR' },
    appointmentStatus: 'BOOKED',
    reason,
  });

  slot.isBooked = true;
  await doctor.save();

  res.status(201).json({ success: true, data: appointment });
});

/**
 * GET /api/appointments
 * Role-aware listing: customer sees own, doctor sees own, admin sees all (with filters).
 */
const listAppointments = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (req.user.role === 'CUSTOMER') filter.patientId = req.user._id;
  else if (req.user.role === 'DOCTOR') filter.doctorId = req.user._id;
  // ADMIN: no identity restriction

  if (status) filter.appointmentStatus = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .populate('patientId', 'profile email phone')
      .populate('doctorId', 'profile email detailsOfHealthCareProfessional.consultationFee')
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
 * GET /api/appointments/:id
 */
const getAppointmentById = catchAsync(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patientId', 'profile email phone')
    .populate('doctorId', 'profile email detailsOfHealthCareProfessional.consultationFee');

  if (!appointment) throw new ApiError(404, 'Appointment not found');

  const isOwner =
    appointment.patientId._id.toString() === req.user._id.toString() ||
    appointment.doctorId._id.toString() === req.user._id.toString();
  if (req.user.role !== 'ADMIN' && !isOwner) {
    throw new ApiError(403, 'You do not have access to this appointment');
  }

  res.status(200).json({ success: true, data: appointment });
});

/**
 * PATCH /api/appointments/:id/confirm
 * Doctor confirms a BOOKED appointment (typically after payment captured).
 */
const confirmAppointment = catchAsync(async (req, res) => {
  if (req.user.role !== 'DOCTOR') throw new ApiError(403, 'Only the doctor can confirm an appointment');

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new ApiError(404, 'Appointment not found');
  if (appointment.doctorId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only confirm your own appointments');
  }
  if (appointment.appointmentStatus !== 'BOOKED') {
    throw new ApiError(400, `Cannot confirm an appointment in ${appointment.appointmentStatus} status`);
  }

  appointment.appointmentStatus = 'CONFIRMED';
  appointment.financials.refundableAmount = 0;
  await appointment.save();

  res.status(200).json({ success: true, data: appointment });
});

/**
 * PATCH /api/appointments/:id/reject
 * Doctor rejects a BOOKED appointment. body: { reason }
 */
const rejectAppointment = catchAsync(async (req, res) => {
  if (req.user.role !== 'DOCTOR') throw new ApiError(403, 'Only the doctor can reject an appointment');

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new ApiError(404, 'Appointment not found');
  if (appointment.doctorId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only reject your own appointments');
  }
  if (appointment.appointmentStatus !== 'BOOKED') {
    throw new ApiError(400, `Cannot reject an appointment in ${appointment.appointmentStatus} status`);
  }

  appointment.appointmentStatus = 'REJECTED';
  appointment.doctorRemarks = { text: req.body.reason || 'Appointment rejected by doctor', mode: 'Text' };
  if (appointment.paymentDetails.status === 'PAID') {
    appointment.paymentDetails.status = 'REFUNDED';
  }
  await appointment.save();

  await freeUpSlot(appointment);

  res.status(200).json({ success: true, data: appointment });
});

/**
 * PATCH /api/appointments/:id/cancel
 * Patient or doctor cancels a BOOKED/CONFIRMED appointment. body: { cancelReason }
 */
const cancelAppointment = catchAsync(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new ApiError(404, 'Appointment not found');

  const isPatient = appointment.patientId.toString() === req.user._id.toString();
  const isDoctor = appointment.doctorId.toString() === req.user._id.toString();
  if (req.user.role !== 'ADMIN' && !isPatient && !isDoctor) {
    throw new ApiError(403, 'You do not have permission to cancel this appointment');
  }

  if (!['BOOKED', 'CONFIRMED'].includes(appointment.appointmentStatus)) {
    throw new ApiError(400, `Cannot cancel an appointment in ${appointment.appointmentStatus} status`);
  }

  appointment.appointmentStatus = 'CANCELLED';
  appointment.cancellation = {
    cancelledBy: req.user._id,
    cancelReason: req.body.cancelReason || 'No reason provided',
    cancelledAt: new Date(),
  };
  if (appointment.paymentDetails.status === 'PAID') {
    appointment.paymentDetails.status = 'REFUNDED';
  }
  await appointment.save();

  await freeUpSlot(appointment);

  res.status(200).json({ success: true, data: appointment });
});

/**
 * Internal helper: re-open the doctor's time slot tied to a cancelled/rejected appointment.
 */
async function freeUpSlot(appointment) {
  const doctor = await User.findById(appointment.doctorId);
  if (!doctor) return;
  const slot = doctor.detailsOfHealthCareProfessional.timeSlots.find(
    (s) =>
      new Date(s.date).getTime() === new Date(appointment.schedule.scheduledAt).getTime() &&
      appointment.schedule.slotTime?.startsWith(s.startTime)
  );
  if (slot) {
    slot.isBooked = false;
    await doctor.save();
  }
}

/**
 * PATCH /api/appointments/:id/complete
 * Doctor marks a CONFIRMED appointment complete and adds remarks.
 * body: { doctorRemarks: { text, mode } }
 */
const completeAppointment = catchAsync(async (req, res) => {
  if (req.user.role !== 'DOCTOR') throw new ApiError(403, 'Only the doctor can complete an appointment');

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new ApiError(404, 'Appointment not found');
  if (appointment.doctorId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only complete your own appointments');
  }
  if (appointment.appointmentStatus !== 'CONFIRMED') {
    throw new ApiError(400, `Cannot complete an appointment in ${appointment.appointmentStatus} status`);
  }

  appointment.appointmentStatus = 'COMPLETED';
  if (req.body.doctorRemarks) appointment.doctorRemarks = req.body.doctorRemarks;
  if (req.body.notes) appointment.notes = req.body.notes;
  await appointment.save();

  await User.findByIdAndUpdate(req.user._id, {
    $inc: { 'detailsOfHealthCareProfessional.stats.totalAppointments': 1 },
  });

  res.status(200).json({ success: true, data: appointment });
});

/**
 * POST /api/appointments/:id/documents
 * Patient or doctor shares a document on the appointment.
 * body: { documentURL, documentType }
 */
const shareDocument = catchAsync(async (req, res) => {
  const { documentURL, documentType } = req.body;
  if (!documentURL) throw new ApiError(400, 'documentURL is required');

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new ApiError(404, 'Appointment not found');

  const isPatient = appointment.patientId.toString() === req.user._id.toString();
  const isDoctor = appointment.doctorId.toString() === req.user._id.toString();
  if (!isPatient && !isDoctor) throw new ApiError(403, 'You do not have access to this appointment');

  appointment.documentsShared.push({
    uploadedBy: req.user._id,
    documentURL,
    documentType,
  });
  await appointment.save();

  res.status(201).json({ success: true, data: appointment.documentsShared });
});

/**
 * POST /api/appointments/:id/feedback
 * Patient leaves feedback on a COMPLETED appointment.
 * body: { rating, comment }
 */
const leaveFeedback = catchAsync(async (req, res) => {
  if (req.user.role !== 'CUSTOMER') throw new ApiError(403, 'Only the patient can leave feedback');

  const { rating, comment } = req.body;
  if (rating === undefined) throw new ApiError(400, 'rating is required');

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new ApiError(404, 'Appointment not found');
  if (appointment.patientId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only leave feedback on your own appointments');
  }
  if (appointment.appointmentStatus !== 'COMPLETED') {
    throw new ApiError(400, 'Feedback can only be left on completed appointments');
  }

  appointment.feedback = { rating, comment };
  await appointment.save();

  // Recompute doctor's average rating across all rated, completed appointments
  const stats = await Appointment.aggregate([
    { $match: { doctorId: appointment.doctorId, 'feedback.rating': { $gte: 1 } } },
    { $group: { _id: null, avgRating: { $avg: '$feedback.rating' }, count: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await User.findByIdAndUpdate(appointment.doctorId, {
      'detailsOfHealthCareProfessional.averageRating': Math.round(stats[0].avgRating * 10) / 10,
      'detailsOfHealthCareProfessional.stats.rating': Math.round(stats[0].avgRating * 10) / 10,
      'detailsOfHealthCareProfessional.stats.totalRatings': stats[0].count,
    });
  }

  res.status(200).json({ success: true, data: appointment });
});

/**
 * POST /api/appointments/:id/report-issue
 * body: { issue }
 */
const reportIssue = catchAsync(async (req, res) => {
  const { issue } = req.body;
  if (!issue) throw new ApiError(400, 'issue description is required');

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new ApiError(404, 'Appointment not found');

  const isPatient = appointment.patientId.toString() === req.user._id.toString();
  const isDoctor = appointment.doctorId.toString() === req.user._id.toString();
  if (!isPatient && !isDoctor) throw new ApiError(403, 'You do not have access to this appointment');

  appointment.reportedIssue = { issue, reportedAt: new Date(), status: 'OPEN' };
  await appointment.save();

  res.status(201).json({ success: true, data: appointment.reportedIssue });
});

/**
 * PATCH /api/appointments/:id/resolve-issue
 * Admin only. body: { resolution }
 */
const resolveIssue = catchAsync(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new ApiError(404, 'Appointment not found');
  if (!appointment.reportedIssue) throw new ApiError(400, 'No issue reported on this appointment');

  appointment.reportedIssue.status = 'RESOLVED';
  appointment.reportedIssue.resolution = req.body.resolution || 'Resolved by admin';
  await appointment.save();

  res.status(200).json({ success: true, data: appointment.reportedIssue });
});

/**
 * PATCH /api/appointments/:id/payment
 * Records payment success for a BOOKED appointment (called post payment-gateway callback).
 * body: { transactionId }
 */
const recordPayment = catchAsync(async (req, res) => {
  const { transactionId } = req.body;
  if (!transactionId) throw new ApiError(400, 'transactionId is required');

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new ApiError(404, 'Appointment not found');
  if (appointment.patientId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only pay for your own appointments');
  }

  appointment.paymentDetails = {
    transactionId,
    status: 'PAID',
    currency: appointment.paymentDetails.currency,
    paidAt: new Date(),
  };
  appointment.financials.refundableAmount = 0;
  await appointment.save();

  res.status(200).json({ success: true, data: appointment });
});

module.exports = {
  bookAppointment,
  listAppointments,
  getAppointmentById,
  confirmAppointment,
  rejectAppointment,
  cancelAppointment,
  completeAppointment,
  shareDocument,
  leaveFeedback,
  reportIssue,
  resolveIssue,
  recordPayment,
};
