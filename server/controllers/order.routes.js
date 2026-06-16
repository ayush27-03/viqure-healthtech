const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

router.use(protect);

router.post('/checkout', orderController.checkout);
router.get('/', orderController.listOrders);
router.get('/:id', orderController.getOrderById);
router.get('/:id/track', orderController.trackOrder);

router.patch('/:id/cancel', orderController.cancelOrder);
router.patch('/:id/return', orderController.returnOrder);

router.patch('/:id/confirm', restrictTo('ADMIN'), orderController.confirmOrder);
router.patch('/:id/ship', restrictTo('ADMIN'), orderController.shipOrder);
router.patch('/:id/deliver', restrictTo('ADMIN'), orderController.deliverOrder);

module.exports = router;
