const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');
const { logAdminAction } = require('../middleware/auditMiddleware');
const { ROLES } = require('../config/constants');

router.use(authenticate);

// Dashboard Metrics (accessible by all staff roles)
router.get(
  '/dashboard',
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.PRODUCT_MANAGER,
    ROLES.ORDER_MANAGER,
    ROLES.SUPPORT_AGENT
  ),
  AdminController.getDashboardMetrics
);

// Customer Management
router.get(
  '/customers',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ORDER_MANAGER, ROLES.SUPPORT_AGENT),
  AdminController.getCustomers
);

router.get(
  '/customers/:id',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ORDER_MANAGER, ROLES.SUPPORT_AGENT),
  AdminController.getCustomerDetail
);

router.put(
  '/customers/:id/status',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  logAdminAction('UPDATE_CUSTOMER_STATUS', 'User'),
  AdminController.updateCustomerStatus
);

// Reports & Analytics
router.get(
  '/reports',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  AdminController.getReports
);

// Activity Logs
router.get(
  '/logs',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  AdminController.getActivityLogs
);

// Roles & Staff Permissions
router.get(
  '/roles',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  AdminController.getRoles
);

router.get(
  '/staff',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  AdminController.getStaffUsers
);

router.put(
  '/staff/:id/role',
  authorizeRoles(ROLES.SUPER_ADMIN),
  logAdminAction('UPDATE_STAFF_ROLE', 'User'),
  AdminController.updateStaffRole
);

module.exports = router;
