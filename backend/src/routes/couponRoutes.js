const express = require('express');
const router = express.Router();
const CouponController = require('../controllers/couponController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');
const { logAdminAction } = require('../middleware/auditMiddleware');
const validate = require('../middleware/validateMiddleware');
const { couponSchema } = require('../validators/couponValidator');
const { ROLES } = require('../config/constants');

router.get('/', optionalAuth, CouponController.getCoupons);
router.post('/validate', authenticate, CouponController.validateCoupon);

router.post(
  '/',
  authenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  logAdminAction('CREATE_COUPON', 'Coupon'),
  validate(couponSchema),
  CouponController.createCoupon
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  logAdminAction('UPDATE_COUPON', 'Coupon'),
  CouponController.updateCoupon
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  logAdminAction('DELETE_COUPON', 'Coupon'),
  CouponController.deleteCoupon
);

module.exports = router;
