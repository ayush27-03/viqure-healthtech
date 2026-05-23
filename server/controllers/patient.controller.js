const { User, MedicalRecord: PatientMedicalRecord } = require("../models");
const { uploadToCloudinary } = require("../middlewares/upload.middleware");
const { sendSuccess, sendError } = require("../utils/response.util");

const getPatientProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash").lean();
    if (!user) return sendError(res, "User not found", 404);
    return sendSuccess(res, { user });
  } catch (err) {
    return sendError(res, "Failed to fetch profile", 500);
  }
};

const updatePatientProfile = async (req, res) => {
  try {
    const { name, phone, gender, dob, address } = req.body;
    const update = {};

    if (name)    update.name    = name;
    if (phone)   update.phone   = phone;
    if (gender)  update.gender  = gender;
    if (dob)     update.dob     = dob;
    if (address) update.address = address;

    if (req.file) {
      const { url } = await uploadToCloudinary(req.file.buffer, "viqure/avatars");
      update.avatar = url;
    }

    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true, runValidators: true })
      .select("-passwordHash");

    return sendSuccess(res, { user }, "Profile updated");
  } catch (err) {
    console.error("updatePatientProfile:", err);
    return sendError(res, "Failed to update profile", 500);
  }
};

const getMedicalRecords = async (req, res) => {
  try {
    const record = await PatientMedicalRecord.findOne({ patientId: req.user.id }).lean();
    return sendSuccess(res, { record: record || null });
  } catch (err) {
    return sendError(res, "Failed to fetch medical records", 500);
  }
};

const updateMedicalRecords = async (req, res) => {
  try {
    const { bloodGroup, height, weight } = req.body;

    const record = await PatientMedicalRecord.findOneAndUpdate(
      { patientId: req.user.id },
      {
        $set: {
          bloodGroup,
          height,
          weight,
          doctorId: req.body.doctorId || null,
          appointmentId: req.body.appointmentId || null,
          diagnosis: req.body.diagnosis || "General checkup",
          symptoms: req.body.symptoms || [],
          treatment: req.body.treatment || "",
          followUpDate: req.body.followUpDate || null,
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    return sendSuccess(res, { record }, "Medical records updated");
  } catch (err) {
    console.error("updateMedicalRecords:", err);
    return sendError(res, "Failed to update medical records", 500);
  }
};

const uploadMedicalDocument = async (req, res) => {
  try {
    if (!req.file) return sendError(res, "No file uploaded", 400);

    const { name, documentType } = req.body;
    const isPdf = req.file.mimetype === "application/pdf";
    const { url } = await uploadToCloudinary(
      req.file.buffer,
      "viqure/medical-records",
      isPdf ? "raw" : "image"
    );

    const doc = {
      name:         name || req.file.originalname,
      documentType: documentType || "OTHER",
      documentURL:  url,
      uploadedBy:   req.user.id,
      uploadedAt:   new Date(),
    };

    const record = await PatientMedicalRecord.findOneAndUpdate(
      { patientId: req.user.id },
      { $push: { medicalDocuments: doc } },
      { new: true, upsert: true }
    );

    return sendSuccess(res, { record, document: doc }, "Document uploaded");
  } catch (err) {
    console.error("uploadMedicalDocument:", err);
    return sendError(res, "Failed to upload document", 500);
  }
};

module.exports = {
  getPatientProfile,
  updatePatientProfile,
  getMedicalRecords,
  updateMedicalRecords,
  uploadMedicalDocument,
};
