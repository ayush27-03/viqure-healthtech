const { Product, Category } = require('../models/index');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

/**
 * GET /api/products
 * Public listing with search, category filter, price range, pagination.
 * Query: q, categoryId, minPrice, maxPrice, inStock, page, limit, sort
 */
const listProducts = catchAsync(async (req, res) => {
  const { q, categoryId, minPrice, maxPrice, inStock, page = 1, limit = 20, sort } = req.query;

  const filter = { isActive: true };
  if (categoryId) filter.categoryId = categoryId;
  if (q) filter.name = { $regex: q, $options: 'i' };
  if (minPrice || maxPrice) {
    filter['pricing.finalPrice'] = {};
    if (minPrice) filter['pricing.finalPrice'].$gte = Number(minPrice);
    if (maxPrice) filter['pricing.finalPrice'].$lte = Number(maxPrice);
  }
  if (inStock === 'true') filter['inventory.stockCount'] = { $gt: 0 };

  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { 'pricing.finalPrice': 1 };
  if (sort === 'price_desc') sortOption = { 'pricing.finalPrice': -1 };
  if (sort === 'name_asc') sortOption = { name: 1 };

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(filter).populate('categoryId', 'name icon').sort(sortOption).skip(skip).limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: products,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  });
});

/**
 * GET /api/products/:id
 * Public product detail.
 */
const getProductById = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('categoryId', 'name icon');
  if (!product || !product.isActive) throw new ApiError(404, 'Product not found');
  res.status(200).json({ success: true, data: product });
});

/**
 * POST /api/products
 * Admin only
 */
const createProduct = catchAsync(async (req, res) => {
  const { name, categoryId, description, images, pricing, inventory, specifications, isActive } = req.body;

  if (!name) throw new ApiError(400, 'name is required');
  if (!categoryId) throw new ApiError(400, 'categoryId is required');

  const category = await Category.findById(categoryId);
  if (!category) throw new ApiError(404, 'Referenced category does not exist');

  const product = await Product.create({
    name,
    categoryId,
    description,
    images,
    pricing,
    inventory,
    specifications,
    isActive,
  });

  res.status(201).json({ success: true, data: product });
});

/**
 * PATCH /api/products/:id
 * Admin only — general field update.
 */
const updateProduct = catchAsync(async (req, res) => {
  const allowed = ['name', 'categoryId', 'description', 'images', 'pricing', 'inventory', 'specifications', 'isActive'];
  const updates = {};
  for (const field of allowed) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  if (updates.categoryId) {
    const category = await Category.findById(updates.categoryId);
    if (!category) throw new ApiError(404, 'Referenced category does not exist');
  }

  const product = await Product.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new ApiError(404, 'Product not found');

  res.status(200).json({ success: true, data: product });
});

/**
 * PATCH /api/products/:id/stock
 * Admin / Product Manager — basic inventory adjustment.
 * body: { stockCount } (absolute) or { adjustBy } (relative, +/-)
 */
const updateStock = catchAsync(async (req, res) => {
  const { stockCount, adjustBy } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');

  if (stockCount !== undefined) {
    if (stockCount < 0) throw new ApiError(400, 'stockCount cannot be negative');
    product.inventory.stockCount = stockCount;
  } else if (adjustBy !== undefined) {
    const newCount = product.inventory.stockCount + Number(adjustBy);
    if (newCount < 0) throw new ApiError(400, 'Resulting stock count cannot be negative');
    product.inventory.stockCount = newCount;
  } else {
    throw new ApiError(400, 'Provide either stockCount or adjustBy');
  }

  await product.save();

  const lowStock = product.inventory.stockCount <= product.inventory.reorderLevel;
  res.status(200).json({
    success: true,
    data: product,
    lowStockAlert: lowStock,
  });
});

/**
 * GET /api/products/low-stock
 * Admin / Product Manager — products at or below reorder level.
 */
const getLowStockProducts = catchAsync(async (req, res) => {
  const products = await Product.find({
    isActive: true,
    $expr: { $lte: ['$inventory.stockCount', '$inventory.reorderLevel'] },
  }).populate('categoryId', 'name');

  res.status(200).json({ success: true, data: products });
});

/**
 * DELETE /api/products/:id
 * Admin only — soft delete via isActive flag.
 */
const deleteProduct = catchAsync(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) throw new ApiError(404, 'Product not found');
  res.status(200).json({ success: true, message: 'Product deactivated', data: product });
});

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateStock,
  getLowStockProducts,
  deleteProduct,
};
