const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

router.get('/low-stock', protect, restrictTo('ADMIN'), productController.getLowStockProducts);

router.get('/', productController.listProducts);
router.get('/:id', productController.getProductById);

router.post('/', protect, restrictTo('ADMIN'), productController.createProduct);
router.patch('/:id', protect, restrictTo('ADMIN'), productController.updateProduct);
router.patch('/:id/stock', protect, restrictTo('ADMIN'), productController.updateStock);
router.delete('/:id', protect, restrictTo('ADMIN'), productController.deleteProduct);

module.exports = router;
