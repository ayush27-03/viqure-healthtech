const { MedicalRecord, Appointment } = require('../models/index');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

/**
 * POST /api/medical-records
 * Doctor uploads a record for a patient (typically tied to an appointment),
 * or a patient uploads their own standalone record.
 * body: { patientId, doctorId, appointmentId, documentType, fileUrl, notes, isConfidential }
 */
const createRecord = catchAsync(async (req, res) => {
  const { patientId, doctorId, appointmentId, documentType, fileUrl, notes, isConfidential } = req.body;

  if (!documentType || !fileUrl) throw new ApiError(400, 'documentType and fileUrl are required');

  let resolvedPatientId = patientId;
  let resolvedDoctorId = doctorId;

  if (req.user.role === 'CUSTOMER') {
    resolvedPatientId = req.user._id; // patients can only upload for themselves
  } else if (req.user.role === 'DOCTOR') {
    resolvedDoctorId = req.user._id;
    if (!resolvedPatientId) throw new ApiError(400, 'patientId is required when a doctor uploads a record');
  }

  if (appointmentId) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) throw new ApiError(404, 'Referenced appointment not found');
    resolvedPatientId = resolvedPatientId || appointment.patientId;
    resolvedDoctorId = resolvedDoctorId || appointment.doctorId;
  }

  if (!resolvedPatientId) throw new ApiError(400, 'patientId could not be resolved');

  const record = await MedicalRecord.create({
    patientId: resolvedPatientId,
    doctorId: resolvedDoctorId,
    appointmentId,
    documentType,
    fileUrl,
    notes,
    isConfidential,
  });

  res.status(201).json({ success: true, data: record });
});

/**
 * GET /api/medical-records
 * Patient sees own records; doctor sees records they authored or for their appointments;
 * admin sees all. Query: patientId (admin/doctor only), documentType, page, limit
 */
const listRecords = catchAsync(async (req, res) => {
  const { patientId, documentType, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (req.user.role === 'CUSTOMER') {
    filter.patientId = req.user._id;
  } else if (req.user.role === 'DOCTOR') {
    filter.doctorId = req.user._id;
    if (patientId) filter.patientId = patientId;
  } else if (req.user.role === 'ADMIN' && patientId) {
    filter.patientId = patientId;
  }

  if (documentType) filter.documentType = documentType;

  const skip = (Number(page) - 1) * Number(limit);
  const [records, total] = await Promise.all([
    MedicalRecord.find(filter)
      .populate('doctorId', 'profile email')
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    MedicalRecord.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: records,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  });
});

/**
 * GET /api/medical-records/:id
 */
const getRecordById = catchAsync(async (req, res) => {
  const record = await MedicalRecord.findById(req.params.id).populate('doctorId', 'profile email');
  if (!record) throw new ApiError(404, 'Medical record not found');

  const isPatient = record.patientId.toString() === req.user._id.toString();
  const isDoctor = record.doctorId && record.doctorId._id.toString() === req.user._id.toString();
  if (req.user.role !== 'ADMIN' && !isPatient && !isDoctor) {
    throw new ApiError(403, 'You do not have access to this record');
  }

  res.status(200).json({ success: true, data: record });
});

/**
 * PATCH /api/medical-records/:id
 * Uploading doctor or admin can update notes/confidentiality.
 */
const updateRecord = catchAsync(async (req, res) => {
  const record = await MedicalRecord.findById(req.params.id);
  if (!record) throw new ApiError(404, 'Medical record not found');

  const isDoctor = record.doctorId && record.doctorId.toString() === req.user._id.toString();
  if (req.user.role !== 'ADMIN' && !isDoctor) {
    throw new ApiError(403, 'You do not have permission to update this record');
  }

  const { notes, isConfidential, documentType } = req.body;
  if (notes !== undefined) record.notes = notes;
  if (isConfidential !== undefined) record.isConfidential = isConfidential;
  if (documentType !== undefined) record.documentType = documentType;
  await record.save();

  res.status(200).json({ success: true, data: record });
});

/**
 * DELETE /api/medical-records/:id
 * Patient (own standalone uploads), uploading doctor, or admin.
 */
const deleteRecord = catchAsync(async (req, res) => {
  const record = await MedicalRecord.findById(req.params.id);
  if (!record) throw new ApiError(404, 'Medical record not found');

  const isPatient = record.patientId.toString() === req.user._id.toString();
  const isDoctor = record.doctorId && record.doctorId.toString() === req.user._id.toString();
  if (req.user.role !== 'ADMIN' && !isPatient && !isDoctor) {
    throw new ApiError(403, 'You do not have permission to delete this record');
  }

  await record.deleteOne();
  res.status(200).json({ success: true, message: 'Medical record deleted' });
});

module.exports = { createRecord, listRecords, getRecordById, updateRecord, deleteRecord };
