const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');
const { logAdminAction } = require('../middleware/auditMiddleware');
const { ROLES } = require('../config/constants');

router.get('/', CategoryController.getCategories);
router.get('/tree', CategoryController.getCategoryTree);

router.post(
  '/',
  authenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRODUCT_MANAGER),
  logAdminAction('CREATE_CATEGORY', 'Category'),
  CategoryController.createCategory
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRODUCT_MANAGER),
  logAdminAction('UPDATE_CATEGORY', 'Category'),
  CategoryController.updateCategory
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRODUCT_MANAGER),
  logAdminAction('DELETE_CATEGORY', 'Category'),
  CategoryController.deleteCategory
);

module.exports = router;
