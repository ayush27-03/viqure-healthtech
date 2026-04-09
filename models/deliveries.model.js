const mongoose = require('mongoose');
const { Schema } = mongoose;

const deliverySchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'dispatched', 'out_for_delivery', 'delivered', 'failed', 'returned'],
      default: 'pending',
    },
    deliveryAddress: {
      fullName: { type: String, trim: true },
      phone: { type: String, trim: true },
      addressLine: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },
    deliveryCharge: {
      type: Number,
      min: 0,
      default: 0,
    },
    otp: {
      type: String,
      trim: true,
    },
    verificationStatus: {
      type: String,
      enum: ['verified', 'unverified'],
      default: 'unverified',
    },
    estimatedDeliveryDate: {
      type: Date,
    },
    actualDeliveryDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Delivery', deliverySchema);
