const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/settingsController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');
const { logAdminAction } = require('../middleware/auditMiddleware');
const { ROLES } = require('../config/constants');

// Public: get store settings (shipping threshold, announcement banner)
router.get('/', SettingsController.getSettings);

// Admin: update store settings
router.put(
  '/',
  authenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  logAdminAction('UPDATE_STORE_SETTINGS', 'StoreSetting'),
  SettingsController.updateSettings
);

module.exports = router;
