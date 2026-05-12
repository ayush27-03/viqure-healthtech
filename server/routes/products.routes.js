const express = require('express');
const router = express.Router();
const prodCtrl = require('../../controllers/product.controller');
const auth = require('../utils/auth.middleware');
const role = require('../utils/role.middleware');

router.get('/', prodCtrl.getProducts);
router.get('/:idOrSlug', prodCtrl.getProductByIdOrSlug);
router.post('/', auth, role('admin'), prodCtrl.createProduct);
router.patch('/:id', auth, role('admin'), prodCtrl.updateProduct);
router.patch('/:id/deactivate', auth, role('admin'), prodCtrl.deactivateProduct);

module.exports = router;
