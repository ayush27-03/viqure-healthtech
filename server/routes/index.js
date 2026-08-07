const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/doctors', require('./doctor.routes'));
router.use('/categories', require('./category.routes'));
router.use('/products', require('./product.routes'));
router.use('/appointments', require('./appointment.routes'));
router.use('/orders', require('./order.routes'));
router.use('/reviews', require('./review.routes'));
router.use('/medical-records', require('./medicalRecord.routes'));
router.use('/payments', require('./payment.routes'));
router.use('/admin', require('./admin.routes'));

module.exports = router;
