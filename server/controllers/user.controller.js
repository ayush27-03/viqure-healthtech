const { User } = require('../models/index');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject ? userDoc.toObject() : userDoc;
  delete user.passwordHash;
  return user;
};

/**
 * GET /api/users/doctors
 * Public doctor discovery: search/filter approved+available doctors.
 * Query: specialty (matches qualifications/bio loosely), city, minRating, isAvailable, page, limit
 */
const listDoctors = catchAsync(async (req, res) => {
  const { city, minRating, isAvailable, page = 1, limit = 20 } = req.query;

  const filter = {
    role: 'DOCTOR',
    isActive: true,
    'detailsOfHealthCareProfessional.approvalStatus': 'APPROVED',
  };

  if (city) {
    filter['addresses.city'] = { $regex: city, $options: 'i' };
  }
  if (minRating) {
    filter['detailsOfHealthCareProfessional.averageRating'] = { $gte: Number(minRating) };
  }
  if (isAvailable !== undefined) {
    filter['detailsOfHealthCareProfessional.isAvailable'] = isAvailable === 'true';
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [doctors, total] = await Promise.all([
    User.find(filter)
      .select('-passwordHash -cart -fcmToken')
      .sort({ 'detailsOfHealthCareProfessional.averageRating': -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: doctors,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  });
});

/**
 * GET /api/users/doctors/:id
 * Public doctor detail view.
 */
const getDoctorById = catchAsync(async (req, res) => {
  const doctor = await User.findOne({
    _id: req.params.id,
    role: 'DOCTOR',
    'detailsOfHealthCareProfessional.approvalStatus': 'APPROVED',
  }).select('-passwordHash -cart -fcmToken');

  if (!doctor) throw new ApiError(404, 'Doctor not found');
  res.status(200).json({ success: true, data: doctor });
});

/**
 * POST /api/users/me/addresses
 */
const addAddress = catchAsync(async (req, res) => {
  const { type, street, city, state, pincode } = req.body;
  if (!street || !city || !state || !pincode) {
    throw new ApiError(400, 'street, city, state and pincode are required');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $push: { addresses: { type, street, city, state, pincode } } },
    { new: true, runValidators: true }
  );

  res.status(201).json({ success: true, data: sanitizeUser(user) });
});

/**
 * PATCH /api/users/me/addresses/:addressId
 */
const updateAddress = catchAsync(async (req, res) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user._id);

  const address = user.addresses.find((a) => a._id.toString() === addressId);
  if (!address) throw new ApiError(404, 'Address not found');

  const allowed = ['type', 'street', 'city', 'state', 'pincode'];
  for (const field of allowed) {
    if (req.body[field] !== undefined) address[field] = req.body[field];
  }

  await user.save();
  res.status(200).json({ success: true, data: sanitizeUser(user) });
});

/**
 * DELETE /api/users/me/addresses/:addressId
 */
const deleteAddress = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { addresses: { _id: req.params.addressId } } },
    { new: true }
  );
  res.status(200).json({ success: true, data: sanitizeUser(user) });
});

/**
 * GET /api/users/me/cart
 */
const getCart = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).populate('cart.productId');
  res.status(200).json({ success: true, data: user.cart });
});

/**
 * POST /api/users/me/cart
 * body: { productId, quantity }
 */
const addToCart = catchAsync(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) throw new ApiError(400, 'productId is required');

  const user = await User.findById(req.user._id);
  const existingItem = user.cart.find((item) => item.productId.toString() === productId);

  if (existingItem) {
    existingItem.quantity += Number(quantity);
  } else {
    user.cart.push({ productId, quantity });
  }

  await user.save();
  res.status(200).json({ success: true, data: user.cart });
});

/**
 * PATCH /api/users/me/cart/:productId
 * body: { quantity }
 */
const updateCartItem = catchAsync(async (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) throw new ApiError(400, 'quantity must be at least 1');

  const user = await User.findById(req.user._id);
  const item = user.cart.find((i) => i.productId.toString() === req.params.productId);
  if (!item) throw new ApiError(404, 'Item not found in cart');

  item.quantity = quantity;
  await user.save();
  res.status(200).json({ success: true, data: user.cart });
});

/**
 * DELETE /api/users/me/cart/:productId
 */
const removeFromCart = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { cart: { productId: req.params.productId } } },
    { new: true }
  );
  res.status(200).json({ success: true, data: user.cart });
});

/**
 * DELETE /api/users/me/cart
 * Clears the entire cart (used post-checkout).
 */
const clearCart = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, { cart: [] }, { new: true });
  res.status(200).json({ success: true, data: user.cart });
});

module.exports = {
  listDoctors,
  getDoctorById,
  addAddress,
  updateAddress,
  deleteAddress,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
