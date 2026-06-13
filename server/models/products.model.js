const mongoose = require("mongoose");

/**
 * $ Below line employs variable based object destructuring to pull out the constructor Schema from the mongoose object. 
 */
const { Schema } = mongoose;

const PricingSubSchema = new Schema(
  {
    mrp: {
      // NEW: Printed price
      type: Number,
      min: 0,
      default: 0,
    },
    purchasePrice: {
      // NEW: Admin's cost
      type: Number,
      min: 0,
      default: 0,
    },
    basePrice: {
      // selling price before discount
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
    }
  },
  { _id: false }
);

const InventorySubSchema = new Schema(
  {
    sku: {
      // NEW
      type: String,
      trim: true,
      unique: true, // SKUs must be unique
      sparse: true,
    },
    supplier: {
      // NEW
      type: String,
      trim: true,
    },
    warehouse: {
      type: String,
      trim: true,
    },
    stockCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    reorderLevel: {
      // Alerst admin when stock falls below this
      type: Number,
      min: 0,
      default: 10,
    },
    batches: [
      // Embedded array for pharma-specific tracking
      {
        batchNumber: { type: String, trim: true },
        expiryDate: { type: Date },
        quantity: { type: Number, min: 0 },
      },
    ]
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    description: {
      type: String,
      trim: true,
    },
    images: [{ type: String, trim: true }],
    pricing: { type: PricingSubSchema, default:{}},
    inventory: {type: InventorySubSchema, default:{}},
    specifications: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
