const Product = require("../models/Product.model");
const { sendSuccess, sendError, sendCreated } = require("../utils/response.util");

// ─── GET /api/products ────────────────────────────────────────────────────────
// Public. Supports filters: category, minPrice, maxPrice, brand, q, sort, page, limit
const getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, brand, q, sort, page = 1, limit = 12 } = req.query;

    const filter = { isAvailable: true };
    if (category)  filter["category.name"] = new RegExp(category, "i");
    if (brand)     filter.brand = new RegExp(brand, "i");
    if (q)         filter.name  = new RegExp(q, "i");
    if (minPrice || maxPrice) {
      filter.baseCost = {};
      if (minPrice) filter.baseCost.$gte = parseFloat(minPrice);
      if (maxPrice) filter.baseCost.$lte = parseFloat(maxPrice);
    }

    let sortObj = {};
    switch (sort) {
      case "price_asc":  sortObj = { baseCost: 1 };             break;
      case "price_desc": sortObj = { baseCost: -1 };            break;
      case "rating":     sortObj = { "ratings.average": -1 };   break;
      case "newest":     sortObj = { createdAt: -1 };           break;
      default:           sortObj = { createdAt: -1 };
    }

    const pageNum  = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(parseInt(limit) || 12, 50);
    const skip     = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      products,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error("getProducts:", err);
    return sendError(res, "Failed to fetch products", 500);
  }
};

// ─── GET /api/products/:idOrSlug ──────────────────────────────────────────────
// Public. Accepts MongoDB ObjectId OR slug string.
const getProductByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isObjectId   = /^[a-f\d]{24}$/i.test(idOrSlug);

    const product = await Product.findOne(
      isObjectId ? { _id: idOrSlug } : { slug: idOrSlug }
    ).lean();

    if (!product) return sendError(res, "Product not found", 404);
    return sendSuccess(res, { product });
  } catch (err) {
    console.error("getProductByIdOrSlug:", err);
    return sendError(res, "Failed to fetch product", 500);
  }
};

// ─── POST /api/products ───────────────────────────────────────────────────────
// Admin only. Create a new product.
const createProduct = async (req, res) => {
  try {
    const { name, description, brand, category, images, baseCost, discountFactor,
            inventory, estimatedDeliveryDays } = req.body;

    // Auto-generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const product = await Product.create({
      name, slug, description, brand, category, images,
      baseCost, discountFactor: discountFactor || 0,
      inventory, estimatedDeliveryDays,
      isAvailable: true,
      ratings: { average: 0, totalReviews: 0 },
    });

    return sendCreated(res, { product }, "Product created");
  } catch (err) {
    if (err.code === 11000) return sendError(res, "Product with this name/slug already exists", 409);
    console.error("createProduct:", err);
    return sendError(res, "Failed to create product", 500);
  }
};

// ─── PUT /api/products/:id ────────────────────────────────────────────────────
// Admin only. Full product update.
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!product) return sendError(res, "Product not found", 404);
    return sendSuccess(res, { product }, "Product updated");
  } catch (err) {
    console.error("updateProduct:", err);
    return sendError(res, "Failed to update product", 500);
  }
};

// ─── PATCH /api/products/:id/deactivate ───────────────────────────────────────
// Admin only. Soft-deactivate a product.
const deactivateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isAvailable: false },
      { new: true }
    );
    if (!product) return sendError(res, "Product not found", 404);
    return sendSuccess(res, { product }, "Product deactivated");
  } catch (err) {
    console.error("deactivateProduct:", err);
    return sendError(res, "Failed to deactivate product", 500);
  }
};

module.exports = { getProducts, getProductByIdOrSlug, createProduct, updateProduct, deactivateProduct };
