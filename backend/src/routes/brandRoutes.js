const express = require('express');
const router = express.Router();
const BrandController = require('../controllers/brandController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');
const { logAdminAction } = require('../middleware/auditMiddleware');
const { ROLES } = require('../config/constants');

router.get('/', BrandController.getBrands);

router.post(
  '/',
  authenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRODUCT_MANAGER),
  logAdminAction('CREATE_BRAND', 'Brand'),
  BrandController.createBrand
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRODUCT_MANAGER),
  logAdminAction('UPDATE_BRAND', 'Brand'),
  BrandController.updateBrand
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRODUCT_MANAGER),
  logAdminAction('DELETE_BRAND', 'Brand'),
  BrandController.deleteBrand
);

module.exports = router;
