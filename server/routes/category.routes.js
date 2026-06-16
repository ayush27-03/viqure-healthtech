const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

router.get('/', categoryController.listCategories);
router.get('/:id', categoryController.getCategoryById);

router.post('/', protect, restrictTo('ADMIN'), categoryController.createCategory);
router.patch('/:id', protect, restrictTo('ADMIN'), categoryController.updateCategory);
router.delete('/:id', protect, restrictTo('ADMIN'), categoryController.deleteCategory);

module.exports = router;
