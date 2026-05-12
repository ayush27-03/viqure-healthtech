const express = require('express');
const router = express.Router();
const orderCtrl = require('../../controllers/order.controller');
const auth = require('../utils/auth.middleware');
const role = require('../utils/role.middleware');

router.post('/', auth, orderCtrl.createOrder);
router.get('/:id', auth, orderCtrl.getOrderById);
router.patch('/:id/status', auth, role('admin'), orderCtrl.updateOrderStatus);

module.exports = router;
