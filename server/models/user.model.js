const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      unique: true,
      match: [/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin', 'staff', 'superadmin'],
      required: [true, 'Role is required'],
    },
    gender:{
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Gender is required'],
    },
    dob: {
      type: Date,
    },
    address: {
      line: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String }
    },

    isVerified: { type: Boolean, default: false },
    isActive:   { type: Boolean, default: true  },
    lastLogin:  { type: Date },
    avatar:     { type: String, default: null },
    fcmToken:   { type: String, default: null }, // for push notifications
  },
  { timestamps: true }
);

// userSchema.index({ email: 1 });
// userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);




