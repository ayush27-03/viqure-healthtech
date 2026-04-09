const mongoose = require('mongoose');
const { Schema } = mongoose;

const consultationSchema = new Schema(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    sessionStatus: {
      type: String,
      enum: ['WAITING', 'ACTIVE', 'COMPLETED'],
      default: 'WAITING',
    },
    startedAt: {
      type: Date,
    },
    endedAt: {
      type: Date,
    },
    meetingId: {
      type: String,
      trim: true,
    },
    chatMessages: [
      {
        sender: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        message: {
          type: String,
          trim: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        isRead: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Consultation', consultationSchema);
