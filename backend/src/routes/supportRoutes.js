const express = require('express');
const router = express.Router();
const SupportController = require('../controllers/supportController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');
const { logAdminAction } = require('../middleware/auditMiddleware');
const { ROLES } = require('../config/constants');

router.use(authenticate);

// Customer endpoints
router.post('/', SupportController.createTicket);
router.get('/my-tickets', SupportController.getUserTickets);
router.get('/:id', SupportController.getTicketById);
router.post('/:id/messages', SupportController.addMessage);

// Admin & Support Agent endpoints
router.get(
  '/admin/all',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SUPPORT_AGENT),
  SupportController.getAllTickets
);

router.put(
  '/admin/:id/status',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SUPPORT_AGENT),
  logAdminAction('UPDATE_SUPPORT_STATUS', 'SupportTicket'),
  SupportController.updateStatus
);

module.exports = router;
