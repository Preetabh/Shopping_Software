const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../config/constants');

router.use(authenticate);

router.post('/initiate', PaymentController.initiatePayment);
router.post('/verify', PaymentController.verifyPayment);

router.get(
  '/admin/transactions',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ORDER_MANAGER),
  PaymentController.getTransactions
);

module.exports = router;
