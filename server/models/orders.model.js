const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        productSnapshot: {
          name: { type: String, trim: true },
          brand: { type: String, trim: true },
          image: { type: String, trim: true },
          mrp: { type: Number, min: 0 },
          sellingPrice: { type: Number, min: 0 },
        },
        quantity: {
          type: Number,
          min: 1,
          default: 1,
        },
        unitPrice: {
          type: Number,
          min: 0,
          required: true,
        },
        totalPrice: {
          type: Number,
          min: 0,
          required: true,
        },
        discount: {
          type: Number,
          min: 0,
          default: 0,
        },
      },
    ],
    pricing: {
      subtotal: {
        type: Number,
        min: 0,
        default: 0,
      },
      deliveryCharge: {
        type: Number,
        min: 0,
        default: 0,
      },
      discount: {
        type: Number,
        min: 0,
        default: 0,
      },
      finalAmount: {
        type: Number,
        min: 0,
        required: true,
      },
      currency: {
        type: String,
        default: 'INR',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },
    deliveryId: {
      type: Schema.Types.ObjectId,
      ref: 'Delivery',
    },
    shippingAddress: {
      fullName: { type: String, trim: true },
      phone: { type: String, trim: true },
      addressLine: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
