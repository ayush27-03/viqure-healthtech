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

/**
IMPORTANT:
The uploaded schemas are the source of truth.
Never invent fields.
Never rename fields.
Never create properties not present in the schema.
If a field is required by the schema, populate it.
If a relationship exists in the schema, maintain referential integrity.
 */