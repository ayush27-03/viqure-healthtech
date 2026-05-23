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
        brand: {
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
          default: 0,
        },
        unitPrice: {
          type: Number,
          min: 0,
          default: 0,
        },
        totalPrice: {
          type: Number,
          min: 0,
          default: 0,
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

cartSchema.pre('save', function syncTotals() {
  this.items = this.items.map((item) => {
    if (!item.unitPrice && item.price) item.unitPrice = item.price;
    if (!item.price && item.unitPrice) item.price = item.unitPrice;
    item.totalPrice = Number((item.unitPrice * item.quantity).toFixed(2));
    return item;
  });
  this.totalAmount = Number(this.items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2));
  this.updatedAt = new Date();
});

module.exports = mongoose.model('Cart', cartSchema);
