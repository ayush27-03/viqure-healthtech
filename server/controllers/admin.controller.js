const { User, Appointment, Order, Product, Review } = require('../models/index');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { sanitizeUser } = require('../utils/helpers');

/**
 * GET /api/admin/doctors/pending
 * List doctors awaiting approval.
 */
const listPendingDoctors = catchAsync(async (req, res) => {
  const doctors = await User.find({
    role: 'DOCTOR',
    'detailsOfHealthCareProfessional.approvalStatus': 'PENDING',
  }).select('-passwordHash');

  res.status(200).json({ success: true, data: doctors });
});

/**
 * PATCH /api/admin/doctors/:id/approve
 */
const approveDoctor = catchAsync(async (req, res) => {
  const doctor = await User.findOne({ _id: req.params.id, role: 'DOCTOR' });
  if (!doctor) throw new ApiError(404, 'Doctor not found');
  if (doctor.detailsOfHealthCareProfessional.approvalStatus === 'APPROVED') {
    throw new ApiError(400, 'Doctor is already approved');
  }

  doctor.detailsOfHealthCareProfessional.approvalStatus = 'APPROVED';
  doctor.detailsOfHealthCareProfessional.isAvailable = true;
  doctor.isVerified = true;
  doctor.isActive = true;
  await doctor.save();

  res.status(200).json({ success: true, data: sanitizeUser(doctor) });
});

/**
 * PATCH /api/admin/doctors/:id/reject
 * body: { reason }
 */
const rejectDoctor = catchAsync(async (req, res) => {
  const doctor = await User.findOne({ _id: req.params.id, role: 'DOCTOR' });
  if (!doctor) throw new ApiError(404, 'Doctor not found');

  doctor.detailsOfHealthCareProfessional.approvalStatus = 'REJECTED';
  doctor.detailsOfHealthCareProfessional.isAvailable = false;
  doctor.isActive = false;
  await doctor.save();

  res.status(200).json({ success: true, data: sanitizeUser(doctor), reason: req.body.reason });
});

/**
 * GET /api/admin/users
 * Query: role, isActive, q (email search), page, limit
 */
const listUsers = catchAsync(async (req, res) => {
  const { role, isActive, q, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (q) filter.email = { $regex: q, $options: 'i' };

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: users,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  });
});

/**
 * PATCH /api/admin/users/:id/status
 * Activate/deactivate any user account. body: { isActive }
 */
const setUserStatus = catchAsync(async (req, res) => {
  const { isActive } = req.body;
  if (isActive === undefined) throw new ApiError(400, 'isActive is required');

  const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select('-passwordHash');
  if (!user) throw new ApiError(404, 'User not found');

  res.status(200).json({ success: true, data: user });
});

/**
 * GET /api/admin/analytics
 * High-level platform metrics for the admin dashboard.
 */
const getAnalytics = catchAsync(async (req, res) => {
  const [
    totalUsers,
    totalCustomers,
    totalDoctors,
    activeUsers,
    totalAppointments,
    completedAppointments,
    totalOrders,
    revenueAgg,
    appointmentRevenueAgg,
    totalProducts,
    pendingDoctorCount,
    openIssuesCount,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: 'CUSTOMER' }),
    User.countDocuments({ role: 'DOCTOR' }),
    User.countDocuments({ isActive: true }),
    Appointment.countDocuments({}),
    Appointment.countDocuments({ appointmentStatus: 'COMPLETED' }),
    Order.countDocuments({}),
    Order.aggregate([
      { $match: { status: { $in: ['delivered', 'shipped', 'confirmed'] } } },
      { $group: { _id: null, total: { $sum: '$pricing.finalAmount' } } },
    ]),
    Appointment.aggregate([
      { $match: { 'paymentDetails.status': 'PAID' } },
      { $group: { _id: null, total: { $sum: '$financials.totalAmount' } } },
    ]),
    Product.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'DOCTOR', 'detailsOfHealthCareProfessional.approvalStatus': 'PENDING' }),
    Appointment.countDocuments({ 'reportedIssue.status': 'OPEN' }),
  ]);

  const productRevenue = revenueAgg[0]?.total || 0;
  const appointmentRevenue = appointmentRevenueAgg[0]?.total || 0;

  res.status(200).json({
    success: true,
    data: {
      users: { total: totalUsers, customers: totalCustomers, doctors: totalDoctors, active: activeUsers },
      bookings: { totalAppointments, completedAppointments, totalOrders },
      revenue: {
        productRevenue,
        appointmentRevenue,
        totalRevenue: productRevenue + appointmentRevenue,
      },
      catalog: { activeProducts: totalProducts },
      pendingApprovals: pendingDoctorCount,
      openIssues: openIssuesCount,
    },
  });
});

/**
 * GET /api/admin/payments
 * Consolidated view of order and appointment payment records.
 */
const getPaymentRecords = catchAsync(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [orderPayments, appointmentPayments] = await Promise.all([
    Order.find({ 'paymentDetails.status': { $in: ['SUCCESS', 'PENDING', 'FAILED'] } })
      .select('userId paymentDetails pricing.finalAmount createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Appointment.find({})
      .select('patientId doctorId paymentDetails financials.totalAmount createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
  ]);

  res.status(200).json({
    success: true,
    data: { orderPayments, appointmentPayments },
  });
});

/**
 * GET /api/admin/issues
 * List reported issues across appointments. Query: status (OPEN|RESOLVED)
 */
const listReportedIssues = catchAsync(async (req, res) => {
  const { status } = req.query;
  const filter = { reportedIssue: { $ne: null } };
  if (status) filter['reportedIssue.status'] = status;

  const appointments = await Appointment.find(filter)
    .select('patientId doctorId reportedIssue schedule.scheduledAt')
    .populate('patientId', 'profile email')
    .populate('doctorId', 'profile email')
    .sort({ 'reportedIssue.reportedAt': -1 });

  res.status(200).json({ success: true, data: appointments });
});

module.exports = {
  listPendingDoctors,
  approveDoctor,
  rejectDoctor,
  listUsers,
  setUserStatus,
  getAnalytics,
  getPaymentRecords,
  listReportedIssues,
};
