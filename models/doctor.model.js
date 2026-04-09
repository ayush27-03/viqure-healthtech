const mongoose = require('mongoose');
const { Schema } = mongoose;

const doctorSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
      unique: true,   // ← unique index on license number
      trim: true,
    },
    specializations: {
      type: [String],
      required: [true, 'Specializations are required'],
    },
    qualifications: [{ type: String }],
    experience:     { type: Number, min: 0, default: 0 }, // years
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    consultationFee:  { type: Number, min: 0, default: 0 },
    availableSlots: [
      {
        day:       { type: String, enum: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
        startTime: { type: String }, // "09:00"
        endTime:   { type: String }, // "17:00"
      },
    ],
    stats: {
      rating: { type: Number, min: 0, max: 5, default: 0 },
      totalRatings: { type: Number, default: 0 },
      totalAppointments: { type: Number, default: 0 }
    },
    isAvailable: { type: Boolean, default: true },
    bio:         { type: String, maxlength: 1000 },
    city:        { type: String },
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

// Text index for doctor search by name/specialization (resolved via User.name)
doctorSchema.index({ specializations: 'text', bio: 'text' });
// doctorSchema.index({ licenseNumber: 1 }, { unique: true });
doctorSchema.index({ hospitalId: 1, departmentId: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
