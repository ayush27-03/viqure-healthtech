const mongoose = require('mongoose');
const { Schema } = mongoose;

const cartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: {
          type: String,
          trim: true,
        },
        image: {
          type: String,
          trim: true,
        },
        price: {
          type: Number,
          min: 0,
          required: true,
        },
        quantity: {
          type: Number,
          min: 1,
          default: 1,
        },
      },
    ],
    totalAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  }
);

module.exports = mongoose.model('Cart', cartSchema);
