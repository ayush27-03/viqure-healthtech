const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      enum: ['DOCTOR', 'PRODUCT'],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    reviewText: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    likes: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ reviewerId: 1, targetType: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
