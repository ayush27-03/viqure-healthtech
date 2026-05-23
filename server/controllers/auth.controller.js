const bcrypt = require("bcryptjs");
const { signToken } = require("../utils/jwt.util");
const { sendSuccess, sendError, sendCreated } = require("../utils/response.util");

const { User, Doctor, Admin } = require("../models");

const registerPatient = async (req, res) => {
  try {
    const { name, email, password, phone, gender, dob } = req.body;

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return sendError(res, "Email already registered", 409);

    const hashed = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash: hashed,
      phone,
      gender,
      dob,
      role: "patient",
    });

    const token = signToken({ id: user._id, role: "patient", email: user.email });

    return sendCreated(res, {
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
        phone: user.phone,
      },
    }, "Patient registered successfully");
  } catch (err) {
    console.error("registerPatient:", err);
    return sendError(res, "Registration failed", 500);
  }
};

const registerDoctor = async (req, res) => {
  try {
    const {
      doctorName, email, password, mobileNumber, dob, gender,
      city, description, licenseNo, yearsOfExperience,
      consultationFees, specializations,
    } = req.body;

    const exists = await Doctor.findOne({ email: email.toLowerCase() });
    if (exists) return sendError(res, "Email already registered", 409);

    const licExists = await Doctor.findOne({ licenseNo });
    if (licExists) return sendError(res, "License number already registered", 409);

    const hashed = await bcrypt.hash(password, 12);

    const doctor = await Doctor.create({
      doctorName,
      email: email.toLowerCase(),
      passwordHash: hashed,
      mobileNumber,
      dob,
      gender,
      city,
      description,
      licenseNo,
      yearsOfExperience,
      consultationFees,
      specializations: Array.isArray(specializations) ? specializations : [specializations],
      status: "pending",
    });

    const token = signToken({ id: doctor._id, role: "doctor", email: doctor.email });

    return sendCreated(res, {
      token,
      doctor: {
        id:         doctor._id,
        doctorName: doctor.doctorName,
        email:      doctor.email,
        status:     doctor.status,
      },
    }, "Doctor registered. Pending admin approval.");
  } catch (err) {
    console.error("registerDoctor:", err);
    return sendError(res, "Registration failed", 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    let account = null;
    let tokenRole = role;

    if (role === "patient") {
      account = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
    } else if (role === "doctor") {
      account = await Doctor.findOne({ email: email.toLowerCase() }).select("+passwordHash");
    } else if (role === "admin") {
      account = await Admin.findOne({ email: email.toLowerCase() }).select("+passwordHash");
    } else {
      return sendError(res, "Invalid role. Must be patient, doctor, or admin", 400);
    }

    if (!account) return sendError(res, "Invalid email or password", 401);

    const isMatch = await bcrypt.compare(password, account.passwordHash);
    if (!isMatch) return sendError(res, "Invalid email or password", 401);

    if (role === "doctor" && account.status !== "approved") {
      return sendError(res, `Account not approved. Status: ${account.status}`, 403);
    }

    if ((role === "patient") && account.isActive === false) {
      return sendError(res, "Account has been deactivated. Contact support.", 403);
    }

    const token = signToken({ id: account._id, role: tokenRole, email: account.email });

    const userData =
      role === "patient"
        ? { id: account._id, name: account.name,       email: account.email, role: "patient", avatar: account.avatar }
        : role === "doctor"
        ? { id: account._id, name: account.doctorName, email: account.email, role: "doctor",  status: account.status }
        : { id: account._id, name: account.name,       email: account.email, role: "admin",   adminRole: account.adminRole };

    return sendSuccess(res, { token, user: userData }, "Login successful");
  } catch (err) {
    console.error("login:", err);
    return sendError(res, "Login failed", 500);
  }
};

const getMe = async (req, res) => {
  try {
    const { id, role } = req.user;
    let account;

    if (role === "patient") {
      account = await User.findById(id).select("-passwordHash");
    } else if (role === "doctor") {
      account = await Doctor.findById(id).select("-passwordHash");
    } else if (role === "admin") {
      account = await Admin.findById(id).select("-passwordHash");
    }

    if (!account) return sendError(res, "User not found", 404);

    return sendSuccess(res, { user: account });
  } catch (err) {
    console.error("getMe:", err);
    return sendError(res, "Failed to fetch profile", 500);
  }
};

const logout = (req, res) => {
  return sendSuccess(res, {}, "Logged out successfully");
};

module.exports = { registerPatient, registerDoctor, login, getMe, logout };
