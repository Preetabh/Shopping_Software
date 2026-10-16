const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');
const { logAdminAction } = require('../middleware/auditMiddleware');
const { ROLES } = require('../config/constants');

// Public: get reviews for product
router.get('/product/:productId', ReviewController.getProductReviews);

// Customer: add review
router.post('/', authenticate, ReviewController.addReview);

// Admin / Support Agent: review moderation
router.get(
  '/admin/all',
  authenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SUPPORT_AGENT),
  ReviewController.getAllReviews
);

router.put(
  '/admin/:id/status',
  authenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SUPPORT_AGENT),
  logAdminAction('MODERATE_REVIEW', 'Review'),
  ReviewController.updateReviewStatus
);

router.delete(
  '/admin/:id',
  authenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  logAdminAction('DELETE_REVIEW', 'Review'),
  ReviewController.deleteReview
);

module.exports = router;
