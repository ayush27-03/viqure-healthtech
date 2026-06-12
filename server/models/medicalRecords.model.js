const mongoose = require('mongoose');
const { Schema } = mongoose;

const medicalRecordSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    documentType: {
      type: String,
      enum: ['PRESCRIPTION', 'LAB_REPORT', 'OTHER'],
      required: true,
    },
    fileUrl: {
      type: String,
      trim: true,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
    isConfidential: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
