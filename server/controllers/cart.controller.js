const { Cart, Product } = require("../models");
const { sendSuccess, sendError, sendCreated } = require("../utils/response.util");

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;
    const quantityNum = Math.max(parseInt(quantity, 10) || 1, 1);

    const product = await Product.findById(productId);
    if (!product || !product.isAvailable) return sendError(res, "Product not available", 404);

    const sellingPrice = parseFloat(
      (product.baseCost * (1 - (product.discountFactor || 0))).toFixed(2)
    );

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [{
          productId,
          name: product.name,
          brand: product.brand,
          image: product.images?.[0] || "",
          price: sellingPrice,
          unitPrice: sellingPrice,
          quantity: quantityNum,
          totalPrice: sellingPrice * quantityNum,
        }],
      });
      return sendCreated(res, { cart }, "Item added to cart");
    }

    const itemIdx = cart.items.findIndex((i) => i.productId.toString() === productId);
    if (itemIdx > -1) {
      const nextQuantity = cart.items[itemIdx].quantity + quantityNum;
      if (product.inventory.stockQty < nextQuantity) {
        return sendError(res, `Only ${product.inventory.stockQty} in stock`, 400);
      }
      cart.items[itemIdx].name = product.name;
      cart.items[itemIdx].brand = product.brand;
      cart.items[itemIdx].image = product.images?.[0] || "";
      cart.items[itemIdx].price = sellingPrice;
      cart.items[itemIdx].unitPrice = sellingPrice;
      cart.items[itemIdx].quantity = nextQuantity;
      cart.items[itemIdx].totalPrice  = cart.items[itemIdx].quantity * sellingPrice;
    } else {
      if (product.inventory.stockQty < quantityNum) {
        return sendError(res, `Only ${product.inventory.stockQty} in stock`, 400);
      }
      cart.items.push({
        productId,
        name: product.name,
        brand: product.brand,
        image: product.images?.[0] || "",
        price: sellingPrice,
        unitPrice: sellingPrice,
        quantity: quantityNum,
        totalPrice: sellingPrice * quantityNum,
      });
    }

    await cart.save();
    return sendSuccess(res, { cart }, "Cart updated");
  } catch (err) {
    console.error("addToCart:", err);
    return sendError(res, "Failed to add to cart", 500);
  }
};

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id })
      .populate("items.productId", "name brand images baseCost discountFactor isAvailable inventory")
      .lean();

    if (!cart) return sendSuccess(res, { cart: { items: [], total: 0 } });

    const total = cart.items.reduce((sum, i) => sum + i.totalPrice, 0);
    return sendSuccess(res, { cart: { ...cart, total } });
  } catch (err) {
    console.error("getCart:", err);
    return sendError(res, "Failed to fetch cart", 500);
  }
};

const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return sendError(res, "Cart not found", 404);

    cart.items = cart.items.filter((i) => i.productId.toString() !== req.params.productId);
    await cart.save();

    return sendSuccess(res, { cart }, "Item removed");
  } catch (err) {
    console.error("removeFromCart:", err);
    return sendError(res, "Failed to remove item", 500);
  }
};

module.exports = { addToCart, getCart, removeFromCart };
