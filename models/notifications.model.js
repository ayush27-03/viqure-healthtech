const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'appointment_booked',
        'appointment_confirmed',
        'appointment_rejected',
        'doctor_approved',
        'order_placed',
        'order_shipped',
        'order_delivered',
        'payment_success',
      ],
      required: true,
    },
    refId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    isRead:    { type: Boolean, default: false },
    link:      { type: String },   // deep link / route
    metadata:  { type: Schema.Types.Mixed },
    // TTL index — auto-delete after 30 days
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // ← TTL index

module.exports = mongoose.model('Notification', notificationSchema);