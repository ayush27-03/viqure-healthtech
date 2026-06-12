const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    images: [{ type: String, trim: true }],
    pricing: {
      basePrice: {
        type: Number,
        min: 0,
        default: 0,
      },
      discountPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      taxRate: {
        type: Number,
        min: 0,
        default: 0,
      },
      finalPrice: {
        type: Number,
        min: 0,
        default: 0,
      },
    },
    inventory: {
      warehouse: {
        type: String,
        trim: true,
      },
      stockCount: {
        type: Number,
        min: 0,
        default: 0,
      },
    },
    specifications: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
