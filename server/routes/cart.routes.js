const express = require('express');
const router = express.Router();
const cartCtrl = require('../controllers/cart.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/', auth, cartCtrl.addToCart);
router.post('/add', auth, cartCtrl.addToCart);
router.get('/', auth, cartCtrl.getCart);
router.delete('/:productId', auth, cartCtrl.removeFromCart);

module.exports = router;
