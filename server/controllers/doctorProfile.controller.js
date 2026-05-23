const { Doctor } = require("../models");
const { uploadToCloudinary } = require("../middlewares/upload.middleware");
const { sendSuccess, sendError } = require("../utils/response.util");

const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id).select("-passwordHash").lean();
    if (!doctor) return sendError(res, "Doctor not found", 404);
    return sendSuccess(res, { doctor });
  } catch (err) {
    return sendError(res, "Failed to fetch profile", 500);
  }
};

const updateDoctorProfile = async (req, res) => {
  try {
    const allowed = [
      "doctorName", "mobileNumber", "city", "description",
      "yearsOfExperience", "consultationFees", "specializations",
      "gender", "dob",
    ];

    const update = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    });

    if (req.file) {
      const { url } = await uploadToCloudinary(req.file.buffer, "viqure/doctor-profiles");
      update.profileIcon = url;
    }

    const doctor = await Doctor.findByIdAndUpdate(
      req.user.id,
      { $set: update },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    return sendSuccess(res, { doctor }, "Profile updated");
  } catch (err) {
    console.error("updateDoctorProfile:", err);
    return sendError(res, "Failed to update profile", 500);
  }
};

module.exports = { getDoctorProfile, updateDoctorProfile };
