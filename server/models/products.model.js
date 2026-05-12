const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    category: {
      categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
      name: {
        type: String,
        trim: true,
      },
    },
    images: [{ type: String, trim: true }],
    baseCost: {
      type: Number,
      min: 0,
      default: 0,
    },
    discountFactor: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },
    inventory: {
      stockQty: {
        type: Number,
        min: 0,
        default: 0,
      },
      sku: {
        type: String,
        trim: true,
      },
      lowStockThreshold: {
        type: Number,
        min: 0,
        default: 0,
      },
    },
    ratings: {
      average: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      totalReviews: {
        type: Number,
        min: 0,
        default: 0,
      },
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    estimatedDeliveryDays: {
      type: Number,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
