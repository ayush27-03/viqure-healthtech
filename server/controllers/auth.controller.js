const bcrypt = require("bcryptjs");
const { User } = require("../models/index");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const { signToken } = require("../utils/jwt.util");
const { sanitizeUser } = require("../utils/helpers");

/**
 * GET /api/auth/jsonData
 * Gets sample MongoDB Data for testing API run 
 */

const testData = async (req, res) => {
  //# The following is an array of document objects which we receive using mongoose from MongoDB
  const completeData = await User.find();
  res.status(200).send({
    success: true,
    count: completeData.length,
    data: completeData,
  });
};

/**
 * POST /api/auth/register
 * Registers a CUSTOMER or DOCTOR. Doctors start with approvalStatus PENDING.
 */
const register = catchAsync(async (req, res) => {
  const {
    email,
    phone,
    password,
    role,
    gender,
    dob,
    profile,
    detailsOfHealthCareProfessional,
  } = req.body;
  console.log(req.body);
  if (!email || !password || !role) {
    throw new ApiError(400, "email, password and role are required");
  }
  if (!["CUSTOMER", "DOCTOR"].includes(role)) {
    throw new ApiError(
      400,
      "role must be CUSTOMER or DOCTOR for self-registration",
    );
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "A user with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const userPayload = {
    email,
    phone,
    passwordHash,
    role,
    gender,
    dob,
    profile,
  };

  if (role === "DOCTOR") {
    userPayload.detailsOfHealthCareProfessional = {
      ...detailsOfHealthCareProfessional,
      approvalStatus: "PENDING",
      isAvailable: false,
    };
    userPayload.isVerified = false;
  }

  const newUser = await User.create(userPayload);
  const token = signToken(newUser);

  res.status(201).json({
    success: true,
    message:
      role === "DOCTOR"
        ? "Registration submitted. Awaiting admin approval."
        : "Registration successful.",
    data: { user: sanitizeUser(newUser), token },
  });
});

/**
 * POST /api/auth/login
 */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "email and password are required");
  }

  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(403, "This account has been deactivated");
  }

  if (
    user.role === "DOCTOR" &&
    user.detailsOfHealthCareProfessional?.approvalStatus !== "APPROVED"
  ) {
    throw new ApiError(
      403,
      `Your doctor account is ${user.detailsOfHealthCareProfessional?.approvalStatus}. You cannot log in until approved.`,
    );
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken(user);
  res.status(200).json({
    success: true,
    data: { user: sanitizeUser(user), token },
  });
});

/**
 * GET /api/auth/me
 */
const getMe = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, data: sanitizeUser(req.user) });
});

/**
 * PATCH /api/auth/me
 * Update own profile (not role, password, or doctor approval fields).
 */
const updateMe = catchAsync(async (req, res) => {
  const allowedFields = [
    "phone",
    "gender",
    "dob",
    "profile",
    "addresses",
    "avatar",
    "fcmToken",
  ];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: sanitizeUser(updatedUser) });
});

/**
 * PATCH /api/auth/change-password
 */
const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "currentPassword and newPassword are required");
  }

  const user = await User.findById(req.user._id).select("+passwordHash");
  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();

  res
    .status(200)
    .json({ success: true, message: "Password updated successfully" });
});

module.exports = { testData, register, login, getMe, updateMe, changePassword };
