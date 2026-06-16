const express = require('express');
const router = express.Router();

router.use('/auth', require('../controllers/auth.routes'));
router.use('/users', require('../controllers/user.routes'));
router.use('/doctors', require('../controllers/doctor.routes'));
router.use('/categories', require('../controllers/category.routes'));
router.use('/products', require('../controllers/product.routes'));
router.use('/appointments', require('../controllers/appointment.routes'));
router.use('/orders', require('./order.routes'));
router.use('/reviews', require('../controllers/review.routes'));
router.use('/medical-records', require('../controllers/medicalRecord.routes'));
router.use('/admin', require('../controllers/admin.routes'));

module.exports = router;
