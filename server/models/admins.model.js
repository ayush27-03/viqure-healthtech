const mongoose = require('mongoose');
const { Schema } = mongoose;

const counterSchema = new Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
  },
  { timestamps: false }
);

const Counter = mongoose.model('Counter', counterSchema);

const adminSchema = new Schema(
  {
    adminId: {
      type: Number,
      unique: true,
      index: true,
    },
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
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    adminRole: {
      type: String,
      enum: ['SUPER_ADMIN', 'MODERATOR'],
      required: [true, 'Admin role is required'],
      default: 'MODERATOR',
    },
    permissions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

adminSchema.pre('save', async function assignAdminId() {
  if (!this.isNew) {
    return;
  }

  const counter = await Counter.findByIdAndUpdate(
    'adminId',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  this.adminId = counter.seq;
});

module.exports = mongoose.model('Admin', adminSchema);
