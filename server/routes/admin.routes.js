const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

router.use(protect, restrictTo('ADMIN'));

router.get('/doctors/pending', adminController.listPendingDoctors);
router.patch('/doctors/:id/approve', adminController.approveDoctor);
router.patch('/doctors/:id/reject', adminController.rejectDoctor);

router.get('/users', adminController.listUsers);
router.patch('/users/:id/status', adminController.setUserStatus);

router.get('/analytics', adminController.getAnalytics);
router.get('/payments', adminController.getPaymentRecords);
router.get('/issues', adminController.listReportedIssues);

module.exports = router;
