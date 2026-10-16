const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');
const { logAdminAction } = require('../middleware/auditMiddleware');
const validate = require('../middleware/validateMiddleware');
const { createOrderSchema, updateOrderStatusSchema } = require('../validators/orderValidator');
const { ROLES } = require('../config/constants');

router.use(authenticate);

// Customer endpoints
router.post('/', validate(createOrderSchema), OrderController.createOrder);
router.get('/my-orders', OrderController.getUserOrders);
router.get('/:id', OrderController.getOrderById);
router.post('/:id/cancel', OrderController.cancelOrder);
router.post('/:id/return', OrderController.requestReturn);
router.get('/:id/invoice', OrderController.getInvoiceData);

// Admin / Order Manager endpoints
router.get(
  '/admin/all',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ORDER_MANAGER),
  OrderController.getAllOrders
);

router.put(
  '/admin/:id/status',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ORDER_MANAGER),
  logAdminAction('UPDATE_ORDER_STATUS', 'Order'),
  validate(updateOrderStatusSchema),
  OrderController.updateOrderStatus
);

router.post(
  '/admin/:id/return-decision',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ORDER_MANAGER),
  logAdminAction('PROCESS_RETURN', 'Order'),
  OrderController.handleReturnDecision
);

module.exports = router;
