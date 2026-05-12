const express = require('express');
const router = express.Router();
const reviewCtrl = require('../controllers/review.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/', auth, reviewCtrl.createReview);
router.get('/:targetEntity/:targetId', reviewCtrl.getReviews);

module.exports = router;
