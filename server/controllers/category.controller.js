const { Category, Product } = require('../models/index');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

/**
 * GET /api/categories
 * Public: list active categories (admin can pass ?includeInactive=true)
 */
const listCategories = catchAsync(async (req, res) => {
  const filter = {};
  if (!(req.user && req.user.role === 'ADMIN' && req.query.includeInactive === 'true')) {
    filter.isActive = true;
  }
  const categories = await Category.find(filter).sort({ name: 1 });
  res.status(200).json({ success: true, data: categories });
});

/**
 * GET /api/categories/:id
 */
const getCategoryById = catchAsync(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');
  res.status(200).json({ success: true, data: category });
});

/**
 * POST /api/categories
 * Admin only
 */
const createCategory = catchAsync(async (req, res) => {
  const { name, icon, description, isActive } = req.body;
  if (!name) throw new ApiError(400, 'name is required');

  const existing = await Category.findOne({ name });
  if (existing) throw new ApiError(409, 'A category with this name already exists');

  const category = await Category.create({ name, icon, description, isActive });
  res.status(201).json({ success: true, data: category });
});

/**
 * PATCH /api/categories/:id
 * Admin only
 */
const updateCategory = catchAsync(async (req, res) => {
  const { name, icon, description, isActive } = req.body;
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (icon !== undefined) updates.icon = icon;
  if (description !== undefined) updates.description = description;
  if (isActive !== undefined) updates.isActive = isActive;

  const category = await Category.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!category) throw new ApiError(404, 'Category not found');

  res.status(200).json({ success: true, data: category });
});

/**
 * DELETE /api/categories/:id
 * Admin only — soft-deactivate if products reference it, hard-delete otherwise.
 */
const deleteCategory = catchAsync(async (req, res) => {
  const productCount = await Product.countDocuments({ categoryId: req.params.id });

  if (productCount > 0) {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!category) throw new ApiError(404, 'Category not found');
    return res.status(200).json({
      success: true,
      message: 'Category has linked products; deactivated instead of deleted.',
      data: category,
    });
  }

  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');

  res.status(200).json({ success: true, message: 'Category deleted' });
});

module.exports = {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
