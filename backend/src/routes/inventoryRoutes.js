const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/inventoryController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');
const { logAdminAction } = require('../middleware/auditMiddleware');
const { ROLES } = require('../config/constants');

router.use(authenticate);
router.use(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRODUCT_MANAGER));

router.get('/', InventoryController.getInventory);
router.post('/adjust', logAdminAction('ADJUST_INVENTORY', 'Inventory'), InventoryController.adjustStock);
router.get('/movements', InventoryController.getMovements);

module.exports = router;
