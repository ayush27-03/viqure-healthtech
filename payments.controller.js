const crypto = require('crypto');
const Razorpay = require('razorpay');
const { Order, Appointment } = require('../models/index');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

const rzp = () =>
  new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });

/**
 * POST /api/payments/order   body: { context: 'ORDER'|'APPOINTMENT', id }
 * Amount is ALWAYS taken from the DB — never from the client.
 */
const createGatewayOrder = catchAsync(async (req, res) => {
  const { context, id } = req.body;
  if (!['ORDER', 'APPOINTMENT'].includes(context) || !id) {
    throw new ApiError(400, "context ('ORDER'|'APPOINTMENT') and id are required");
  }

  let amount, doc;
  if (context === 'ORDER') {
    doc = await Order.findById(id);
    if (!doc) throw new ApiError(404, 'Order not found');
    if (doc.userId.toString() !== req.user._id.toString()) throw new ApiError(403, 'Not your order');
    if (doc.paymentDetails.method === 'COD') throw new ApiError(400, 'COD orders are paid on delivery');
    if (doc.paymentDetails.status === 'SUCCESS') throw new ApiError(409, 'Order already paid');
    amount = doc.pricing.finalAmount;
  } else {
    doc = await Appointment.findById(id);
    if (!doc) throw new ApiError(404, 'Appointment not found');
    if (doc.patientId.toString() !== req.user._id.toString()) throw new ApiError(403, 'Not your appointment');
    if (!['BOOKED', 'CONFIRMED'].includes(doc.appointmentStatus)) {
      throw new ApiError(400, `Cannot pay for a ${doc.appointmentStatus} appointment`);
    }
    if (doc.paymentDetails.status === 'PAID') throw new ApiError(409, 'Appointment already paid');
    amount = doc.financials.totalAmount;
  }
  if (!amount || amount <= 0) throw new ApiError(400, 'Nothing to pay');

  const gatewayOrder = await rzp().orders.create({
    amount: Math.round(amount * 100),       // paise
    currency: 'INR',
    receipt: `${context}_${id}`.slice(0, 40),
  });

  doc.paymentDetails.gatewayOrderId = gatewayOrder.id;
  await doc.save();

  res.status(201).json({
    success: true,
    data: { keyId: process.env.RAZORPAY_KEY_ID, gatewayOrderId: gatewayOrder.id, amount: gatewayOrder.amount, currency: 'INR' },
  });
});

/**
 * POST /api/payments/verify
 * body: { context, id, razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
const verifyPayment = catchAsync(async (req, res) => {
  const { context, id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!context || !id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, 'context, id and all razorpay_* fields are required');
  }

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  const valid =
    expected.length === razorpay_signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature));
  if (!valid) throw new ApiError(400, 'Payment signature verification failed');

  if (context === 'ORDER') {
    const order = await Order.findOne({ _id: id, 'paymentDetails.gatewayOrderId': razorpay_order_id });
    if (!order) throw new ApiError(404, 'Order not found for this payment');
    order.paymentDetails.status = 'SUCCESS';
    order.paymentDetails.transactionId = razorpay_payment_id;
    order.paymentDetails.paymentDate = new Date();
    await order.save();
    return res.status(200).json({ success: true, data: order });
  }

  const appt = await Appointment.findOne({ _id: id, 'paymentDetails.gatewayOrderId': razorpay_order_id });
  if (!appt) throw new ApiError(404, 'Appointment not found for this payment');
  appt.paymentDetails.status = 'PAID';
  appt.paymentDetails.transactionId = razorpay_payment_id;
  appt.paymentDetails.paidAt = new Date();
  appt.financials.refundableAmount = 0;
  await appt.save();
  res.status(200).json({ success: true, data: appt });
});

module.exports = { createGatewayOrder, verifyPayment };