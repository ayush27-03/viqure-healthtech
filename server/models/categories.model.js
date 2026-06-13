const mongoose = require('mongoose');
const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    icon: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);


/**
IMPORTANT:
The uploaded schemas are the source of truth.
Never invent fields.
Never rename fields.
Never create properties not present in the schema.
If a field is required by the schema, populate it.
If a relationship exists in the schema, maintain referential integrity.
 */