const mongoose = require("mongoose");
const { Schema } = mongoose;


const orderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
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
        default: "INR",
      },
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
        "failed",
        "returned",
      ],
      default: "pending",
    },
    paymentDetails: {
      transactionId: String,
      gatewayOrderId: String, // Razorpay order id (order_...) — links our order to the gateway order
      method: String,
      status: { type: String, enum: ["PENDING", "SUCCESS", "FAILED"] },
      paymentDate: Date,
    },
    shipmentDetails: {
      status: {
        type: String,
        enum: ['PENDING', 'DISPATCHED', 'DELIVERED', 'FAILED', 'RETURNED'],
        default: 'PENDING',
      },
      courier: {
        name: { type: String, trim: true },
        trackingNumber: { type: String, trim: true },
        contact: { type: String, trim: true },
      },
      deliveryAddress: {
        fullName: { type: String, trim: true },
        phone: { type: String, trim: true },
        addressLine: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        pincode: { type: String, trim: true },
      },
      otp: {
        type: String,
        trim: true,
      },
      otpVerification: {
        status: {
          type: String,
          enum: ['VERIFIED', 'UNVERIFIED'],
          default: 'UNVERIFIED',
        },
        verifiedAt: {
          type: Date,
          default: null,
        },
      },
      estimatedDeliveryDate: {
        type: Date,
      },
      actualDeliveryDate: {
        type: Date,
        default: null,
      },
      lastUpdatedAt: {
        type: Date,
        default: Date.now,
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);


/**
IMPORTANT:
The uploaded schemas are the source of truth.
Never invent fields.
Never rename fields.
Never create properties not present in the schema.
If a field is required by the schema, populate it.
If a relationship exists in the schema, maintain referential integrity.
 */