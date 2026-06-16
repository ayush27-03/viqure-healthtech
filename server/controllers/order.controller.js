const { Order, Product, User } = require('../models/index');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

const DELIVERY_CHARGE_THRESHOLD = 500; // free delivery above this subtotal
const DELIVERY_CHARGE = 49;

/**
 * POST /api/orders/checkout
 * Builds an order from the customer's current cart (or explicit items),
 * decrements stock, snapshots product data, and clears the cart.
 * body: { deliveryAddress: { fullName, phone, addressLine, city, state, pincode }, paymentMethod }
 */
const checkout = catchAsync(async (req, res) => {
  if (req.user.role !== 'CUSTOMER') throw new ApiError(403, 'Only customers can place orders');

  const { deliveryAddress, paymentMethod = 'COD' } = req.body;
  if (!deliveryAddress || !deliveryAddress.addressLine || !deliveryAddress.city || !deliveryAddress.pincode) {
    throw new ApiError(400, 'A complete deliveryAddress is required');
  }

  const user = await User.findById(req.user._id).populate('cart.productId');
  if (!user.cart || user.cart.length === 0) throw new ApiError(400, 'Your cart is empty');

  const items = [];
  let subtotal = 0;

  for (const cartItem of user.cart) {
    const product = cartItem.productId;
    if (!product || !product.isActive) {
      throw new ApiError(400, `Product no longer available in cart`);
    }
    if (product.inventory.stockCount < cartItem.quantity) {
      throw new ApiError(409, `Insufficient stock for ${product.name}. Available: ${product.inventory.stockCount}`);
    }

    const unitPrice = product.pricing.finalPrice;
    const totalPrice = +(unitPrice * cartItem.quantity).toFixed(2);
    subtotal += totalPrice;

    items.push({
      productId: product._id,
      productSnapshot: {
        name: product.name,
        brand: product.inventory.supplier,
        image: product.images?.[0],
        mrp: product.pricing.mrp,
        sellingPrice: product.pricing.finalPrice,
      },
      quantity: cartItem.quantity,
      unitPrice,
      totalPrice,
      discount: 0,
    });
  }

  const deliveryCharge = subtotal >= DELIVERY_CHARGE_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const finalAmount = subtotal + deliveryCharge;

  const estimatedDeliveryDate = new Date();
  estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 5);

  const order = await Order.create({
    userId: req.user._id,
    items,
    pricing: {
      subtotal,
      deliveryCharge,
      discount: 0,
      finalAmount,
      currency: 'INR',
    },
    status: 'pending',
    paymentDetails: {
      method: paymentMethod,
      status: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
    },
    shipmentDetails: {
      status: 'PENDING',
      deliveryAddress,
      estimatedDeliveryDate,
    },
  });

  // Decrement stock for each purchased product
  for (const item of items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { 'inventory.stockCount': -item.quantity },
    });
  }

  // Clear the cart
  user.cart = [];
  await user.save();

  res.status(201).json({ success: true, data: order });
});

/**
 * GET /api/orders
 * Customer sees own orders; admin sees all (with filters).
 */
const listOrders = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (req.user.role === 'CUSTOMER') filter.userId = req.user._id;
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: orders,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  });
});

/**
 * GET /api/orders/:id
 */
const getOrderById = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  if (req.user.role !== 'ADMIN' && order.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You do not have access to this order');
  }

  res.status(200).json({ success: true, data: order });
});

/**
 * PATCH /api/orders/:id/confirm
 * Admin confirms a pending order (post payment verification for non-COD).
 */
const confirmOrder = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');
  if (order.status !== 'pending') throw new ApiError(400, `Cannot confirm an order in ${order.status} status`);

  order.status = 'confirmed';
  if (order.paymentDetails.method !== 'COD') {
    order.paymentDetails.status = 'SUCCESS';
    order.paymentDetails.paymentDate = new Date();
  }
  await order.save();

  res.status(200).json({ success: true, data: order });
});

/**
 * PATCH /api/orders/:id/ship
 * Admin dispatches a confirmed order. body: { courier: { name, trackingNumber, contact } }
 */
const shipOrder = catchAsync(async (req, res) => {
  const { courier } = req.body;
  if (!courier || !courier.name) throw new ApiError(400, 'courier.name is required');

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');
  if (order.status !== 'confirmed') throw new ApiError(400, `Cannot ship an order in ${order.status} status`);

  // Generate a simple 6-digit OTP for delivery verification
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  order.status = 'shipped';
  order.shipmentDetails.status = 'DISPATCHED';
  order.shipmentDetails.courier = courier;
  order.shipmentDetails.otp = otp;
  order.shipmentDetails.lastUpdatedAt = new Date();
  await order.save();

  res.status(200).json({ success: true, data: order });
});

/**
 * PATCH /api/orders/:id/deliver
 * Admin or delivery partner marks order delivered after OTP verification.
 * body: { otp }
 */
const deliverOrder = catchAsync(async (req, res) => {
  const { otp } = req.body;
  if (!otp) throw new ApiError(400, 'otp is required to confirm delivery');

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');
  if (order.status !== 'shipped') throw new ApiError(400, `Cannot deliver an order in ${order.status} status`);

  if (order.shipmentDetails.otp !== otp) {
    throw new ApiError(400, 'Invalid OTP');
  }

  order.status = 'delivered';
  order.shipmentDetails.status = 'DELIVERED';
  order.shipmentDetails.otpVerification = { status: 'VERIFIED', verifiedAt: new Date() };
  order.shipmentDetails.actualDeliveryDate = new Date();
  order.shipmentDetails.lastUpdatedAt = new Date();

  if (order.paymentDetails.method === 'COD') {
    order.paymentDetails.status = 'SUCCESS';
    order.paymentDetails.paymentDate = new Date();
  }
  await order.save();

  res.status(200).json({ success: true, data: order });
});

/**
 * PATCH /api/orders/:id/cancel
 * Customer cancels a pending/confirmed order; restocks inventory.
 */
const cancelOrder = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  if (req.user.role !== 'ADMIN' && order.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You do not have access to this order');
  }
  if (!['pending', 'confirmed'].includes(order.status)) {
    throw new ApiError(400, `Cannot cancel an order in ${order.status} status`);
  }

  order.status = 'cancelled';
  order.shipmentDetails.status = 'FAILED';
  await order.save();

  // Restock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { 'inventory.stockCount': item.quantity },
    });
  }

  res.status(200).json({ success: true, data: order });
});

/**
 * PATCH /api/orders/:id/return
 * Customer requests return on a delivered order.
 */
const returnOrder = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  if (req.user.role !== 'ADMIN' && order.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You do not have access to this order');
  }
  if (order.status !== 'delivered') {
    throw new ApiError(400, 'Only delivered orders can be returned');
  }

  order.status = 'returned';
  order.shipmentDetails.status = 'RETURNED';
  await order.save();

  res.status(200).json({ success: true, data: order });
});

/**
 * GET /api/orders/:id/track
 * Lightweight tracking view.
 */
const trackOrder = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id).select('status shipmentDetails pricing.finalAmount createdAt');
  if (!order) throw new ApiError(404, 'Order not found');

  if (req.user.role !== 'ADMIN' && order.userId && order.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You do not have access to this order');
  }

  res.status(200).json({
    success: true,
    data: {
      status: order.status,
      shipment: order.shipmentDetails,
      placedAt: order.createdAt,
    },
  });
});

module.exports = {
  checkout,
  listOrders,
  getOrderById,
  confirmOrder,
  shipOrder,
  deliverOrder,
  cancelOrder,
  returnOrder,
  trackOrder,
};
