const mongoose = require('mongoose');
const { Schema } = mongoose;

const doctorSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      sparse: true,
    },
    doctorName: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
      maxlength: [120, 'Doctor name cannot exceed 120 characters'],
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
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      match: [/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    dob: {
      type: Date,
    },
    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
      unique: true,
      trim: true,
    },
    specializations: {
      type: [String],
      required: [true, 'Specializations are required'],
    },
    qualifications: [{ type: String }],
    yearsOfExperience: { type: Number, min: 0, default: 0 },
    experience:        { type: Number, min: 0, default: 0 },
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    consultationFees: { type: Number, min: 0, default: 0 },
    consultationFee:  { type: Number, min: 0, default: 0 },
    availableSlots: [
      {
        day:       { type: String, enum: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
        startTime: { type: String }, 
        endTime:   { type: String }, 
      },
    ],
    stats: {
      rating: { type: Number, min: 0, max: 5, default: 0 },
      totalRatings: { type: Number, default: 0 },
      totalAppointments: { type: Number, default: 0 }
    },
    isAvailable: { type: Boolean, default: true },
    bio:         { type: String, maxlength: 1000 },
    description: { type: String, maxlength: 1000 },
    city:        { type: String },
    profileIcon: { type: String, default: null },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    approvalStatus: { type: String, default: 'pending' },
    documents: [{
      name: { type: String },
      url: { type: String },
      type: { type: String }
    }],
  },
  { timestamps: true }
);

doctorSchema.pre('validate', function syncLegacyFields() {
  if (!this.experience && this.yearsOfExperience) {
    this.experience = this.yearsOfExperience;
  }
  if (!this.yearsOfExperience && this.experience) {
    this.yearsOfExperience = this.experience;
  }
  if (!this.consultationFee && this.consultationFees) {
    this.consultationFee = this.consultationFees;
  }
  if (!this.consultationFees && this.consultationFee) {
    this.consultationFees = this.consultationFee;
  }
  if (!this.bio && this.description) {
    this.bio = this.description;
  }
  if (!this.description && this.bio) {
    this.description = this.bio;
  }
});

doctorSchema.index({ doctorName: 'text', specializations: 'text', bio: 'text', city: 'text' });
doctorSchema.index({ hospitalId: 1, departmentId: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
