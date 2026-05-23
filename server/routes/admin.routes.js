const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/admin.controller');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');

router.get('/doctors', auth, role('admin'), adminCtrl.getAdminDoctors);
router.patch('/doctors/:id/approve', auth, role('admin'), adminCtrl.approveDoctor);
router.patch('/doctors/:id/reject', auth, role('admin'), adminCtrl.rejectDoctor);

router.get('/patients', auth, role('admin'), adminCtrl.getAdminPatients);
router.get('/analytics', auth, role('admin'), adminCtrl.getAnalytics);
router.get('/payments', auth, role('admin'), adminCtrl.getAdminPayments);
router.get('/appointments', auth, role('admin'), adminCtrl.getAdminAppointments);
router.get('/orders', auth, role('admin'), adminCtrl.getAdminOrders);
router.patch('/orders/:id/status', auth, role('admin'), require('../controllers/order.controller').updateOrderStatus);
router.post('/categories', auth, role('admin'), adminCtrl.createCategory);
router.patch('/categories/:id/deactivate', auth, role('admin'), adminCtrl.deleteCategory);

module.exports = router;
