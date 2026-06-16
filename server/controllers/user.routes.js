const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');

// Public doctor discovery
router.get('/doctors', userController.listDoctors);
router.get('/doctors/:id', userController.getDoctorById);

// Authenticated self-service
router.post('/me/addresses', protect, userController.addAddress);
router.patch('/me/addresses/:addressId', protect, userController.updateAddress);
router.delete('/me/addresses/:addressId', protect, userController.deleteAddress);

router.get('/me/cart', protect, userController.getCart);
router.post('/me/cart', protect, userController.addToCart);
router.patch('/me/cart/:productId', protect, userController.updateCartItem);
router.delete('/me/cart/:productId', protect, userController.removeFromCart);
router.delete('/me/cart', protect, userController.clearCart);

module.exports = router;
