const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middlewares/auth.middleware');

// All payment actions require an authenticated user; ownership is checked per-doc.
router.use(protect);

router.post('/order', paymentController.createGatewayOrder);
router.post('/verify', paymentController.verifyPayment);

module.exports = router;
