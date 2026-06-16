const { Review, Appointment, Order, User, Product } = require('../models/index');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

/**
 * GET /api/reviews
 * Public: list reviews for a given target.
 * Query: targetType (DOCTOR|PRODUCT), targetId, page, limit
 */
const listReviews = catchAsync(async (req, res) => {
  const { targetType, targetId, page = 1, limit = 20 } = req.query;
  if (!targetType || !targetId) throw new ApiError(400, 'targetType and targetId are required');

  const filter = { targetType, targetId };
  const skip = (Number(page) - 1) * Number(limit);

  const [reviews, total, ratingAgg] = await Promise.all([
    Review.find(filter)
      .populate('reviewerId', 'profile avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Review.countDocuments(filter),
    Review.aggregate([
      { $match: filter },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    data: reviews,
    summary: ratingAgg[0]
      ? { averageRating: Math.round(ratingAgg[0].avgRating * 10) / 10, totalReviews: ratingAgg[0].count }
      : { averageRating: 0, totalReviews: 0 },
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  });
});

/**
 * POST /api/reviews
 * Customer leaves a review on a DOCTOR (after a completed appointment) or PRODUCT
 * (after a delivered order containing it). isVerified is set automatically.
 * body: { targetType, targetId, rating, reviewText }
 */
const createReview = catchAsync(async (req, res) => {
  if (req.user.role !== 'CUSTOMER') throw new ApiError(403, 'Only customers can leave reviews');

  const { targetType, targetId, rating, reviewText } = req.body;
  if (!targetType || !targetId || !rating) {
    throw new ApiError(400, 'targetType, targetId and rating are required');
  }
  if (!['DOCTOR', 'PRODUCT'].includes(targetType)) {
    throw new ApiError(400, 'targetType must be DOCTOR or PRODUCT');
  }

  const existing = await Review.findOne({ reviewerId: req.user._id, targetType, targetId });
  if (existing) throw new ApiError(409, 'You have already reviewed this item');

  let isVerified = false;

  if (targetType === 'DOCTOR') {
    const doctor = await User.findOne({ _id: targetId, role: 'DOCTOR' });
    if (!doctor) throw new ApiError(404, 'Doctor not found');

    const completedAppt = await Appointment.findOne({
      patientId: req.user._id,
      doctorId: targetId,
      appointmentStatus: 'COMPLETED',
    });
    isVerified = !!completedAppt;
  } else {
    const product = await Product.findById(targetId);
    if (!product) throw new ApiError(404, 'Product not found');

    const deliveredOrder = await Order.findOne({
      userId: req.user._id,
      status: 'delivered',
      'items.productId': targetId,
    });
    isVerified = !!deliveredOrder;
  }

  const review = await Review.create({
    reviewerId: req.user._id,
    targetType,
    targetId,
    rating,
    reviewText,
    isVerified,
  });

  res.status(201).json({ success: true, data: review });
});

/**
 * PATCH /api/reviews/:id
 * Reviewer can edit their own rating/text.
 */
const updateReview = catchAsync(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found');
  if (review.reviewerId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only edit your own reviews');
  }

  const { rating, reviewText } = req.body;
  if (rating !== undefined) review.rating = rating;
  if (reviewText !== undefined) review.reviewText = reviewText;
  await review.save();

  res.status(200).json({ success: true, data: review });
});

/**
 * DELETE /api/reviews/:id
 * Reviewer or admin can delete.
 */
const deleteReview = catchAsync(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found');

  if (req.user.role !== 'ADMIN' && review.reviewerId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You do not have permission to delete this review');
  }

  await review.deleteOne();
  res.status(200).json({ success: true, message: 'Review deleted' });
});

/**
 * PATCH /api/reviews/:id/like
 * Increment likes counter on a review.
 */
const likeReview = catchAsync(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { $inc: { likes: 1 } },
    { new: true }
  );
  if (!review) throw new ApiError(404, 'Review not found');

  res.status(200).json({ success: true, data: review });
});

module.exports = { listReviews, createReview, updateReview, deleteReview, likeReview };
