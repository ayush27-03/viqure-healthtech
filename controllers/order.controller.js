const mongoose = require("mongoose");
const Order   = require("../server/models/Order.model");
const Cart    = require("../server/models/Cart.model");
const Product = require("../server/models/Product.model");
const { sendSuccess, sendError, sendCreated } = require("../server/utils/response.util");
const { createNotification } = require("../server/utils/notification.util");

const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { shippingAddress } = req.body;
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId }).populate("items.productId").session(session);
    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      return sendError(res, "Cart is empty", 400);
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = item.productId;
      if (!product || !product.isAvailable) {
        await session.abortTransaction();
        return sendError(res, `Product ${product?.name || item.productId} is no longer available`, 400);
      }
      if (product.inventory.stockQty < item.quantity) {
        await session.abortTransaction();
        return sendError(res, `Insufficient stock for ${product.name}`, 400);
      }

      const sellingPrice = parseFloat(
        (product.baseCost * (1 - (product.discountFactor || 0))).toFixed(2)
      );
      const itemTotal = sellingPrice * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        productSnapshot: {
          name:  product.name,
          brand: product.brand,
          image: product.images?.[0] || "",
          mrp:   product.baseCost,
          sellingPrice,
        },
        quantity:   item.quantity,
        unitPrice:  sellingPrice,
        totalPrice: itemTotal,
        discount:   (product.discountFactor || 0) * 100,
      });

      await Product.updateOne(
        { _id: product._id },
        { $inc: { "inventory.stockQty": -item.quantity } },
        { session }
      );
    }

    const deliveryCharge = subtotal >= 500 ? 0 : 49;
    const finalAmount    = subtotal + deliveryCharge;

    const order = await Order.create(
      [
        {
          userId,
          items: orderItems,
          pricing: { subtotal, deliveryCharge, discount: 0, finalAmount, currency: "INR" },
          status: "pending",
          shippingAddress,
        },
      ],
      { session }
    );

    await Cart.deleteOne({ userId }, { session });

    await session.commitTransaction();

    createNotification({
      userId, userModel: "User",
      title: "Order Placed",
      message: `Your order #${order[0]._id} has been placed successfully.`,
      type: "order", refId: order[0]._id, refModel: "Order",
    });

    return sendCreated(res, { order: order[0] }, "Order placed successfully");
  } catch (err) {
    await session.abortTransaction();
    console.error("createOrder:", err);
    return sendError(res, "Failed to place order", 500);
  } finally {
    session.endSession();
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return sendError(res, "Order not found", 404);

    if (req.user.role === "patient" && order.userId.toString() !== req.user.id) {
      return sendError(res, "Not authorized", 403);
    }

    return sendSuccess(res, { order });
  } catch (err) {
    console.error("getOrderById:", err);
    return sendError(res, "Failed to fetch order", 500);
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled", "returned"];
    if (!validStatuses.includes(status)) {
      return sendError(res, `Valid statuses: ${validStatuses.join(", ")}`, 400);
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return sendError(res, "Order not found", 404);

    createNotification({
      userId: order.userId, userModel: "User",
      title: "Order Status Updated",
      message: `Your order has been ${status}.`,
      type: "order", refId: order._id, refModel: "Order",
    });

    return sendSuccess(res, { order }, "Order status updated");
  } catch (err) {
    console.error("updateOrderStatus:", err);
    return sendError(res, "Failed to update order", 500);
  }
};

module.exports = { createOrder, getOrderById, updateOrderStatus };
