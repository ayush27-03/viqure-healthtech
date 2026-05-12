const mongoose = require('mongoose');
const { Schema } = mongoose;

const appointmentSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    consultationId: {
      type: Schema.Types.ObjectId,
      ref: 'Consultation',
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    consultationFees: {
      type: Number,
      min: 0,
      default: 0,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentStartDateTime: {
      type: Date,
    },
    appointmentEndDateTime: {
      type: Date,
    },
    slotTime: {
      type: String,
      required: true,
    },
    consultationType: {
      type: String,
      enum: ['VIDEO'],
      default: 'VIDEO',
    },
    appointmentStatus: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED'],
      default: 'PENDING',
    },
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
    },
    reason: {
      type: String,
      maxlength: 500,
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    cancelReason: {
      type: String,
    },
    meetingId: {
      type: String,
      trim: true,
    },
    documentsShared: [
      {
        uploadedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        documentURL: {
          type: String,
          trim: true,
        },
        documentType: {
          type: String,
          trim: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    doctorRemarks: {
      type: String,
      maxlength: 2000,
    },
    doctorRemarksMode: {
      type: String,
      enum: ['File', 'Text'],
    },
    feedback: {
      rating: {
        type: Number,
        min: 0,
        max: 5,
      },
      comment: {
        type: String,
        maxlength: 1000,
      },
    },
  },
  { timestamps: true }
);

appointmentSchema.index({ patientId: 1, appointmentDate: -1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ appointmentStatus: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);