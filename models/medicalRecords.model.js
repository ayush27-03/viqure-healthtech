const mongoose = require('mongoose');
const { Schema } = mongoose;

const medicalRecordSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bloodGroup: {
      type: String,
      trim: true,
    },
    height: {
      type: Number,
      min: 0,
    },
    weight: {
      type: Number,
      min: 0,
    },
    medicalDocuments: [
      {
        name: {
          type: String,
          trim: true,
        },
        documentType: {
          type: String,
          trim: true,
        },
        documentURL: {
          type: String,
          trim: true,
        },
        uploadedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        doctorId: {
          type: Schema.Types.ObjectId,
          ref: 'Doctor',
        },
        appointmentId: {
          type: Schema.Types.ObjectId,
          ref: 'Appointment',
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    diagnosis:      { type: String, required: true },
    symptoms:       [{ type: String }],
    treatment:      { type: String },
    followUpDate:   { type: Date },
    attachments:    [{ type: String }], // S3/cloud URLs
    isConfidential: { type: Boolean, default: false },
  },
  { timestamps: true }
);

medicalRecordSchema.index({ patientId: 1, createdAt: -1 });
medicalRecordSchema.index({ doctorId: 1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);