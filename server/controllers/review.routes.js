const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/', reviewController.listReviews);
router.post('/', protect, reviewController.createReview);
router.patch('/:id', protect, reviewController.updateReview);
router.delete('/:id', protect, reviewController.deleteReview);
router.patch('/:id/like', protect, reviewController.likeReview);

module.exports = router;
