const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');
const { logAdminAction } = require('../middleware/auditMiddleware');
const validate = require('../middleware/validateMiddleware');
const { productSchema } = require('../validators/productValidator');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/', ProductController.getProducts);
router.get('/home-sections', ProductController.getHomePageSections);
router.get('/:idOrSlug', ProductController.getProductBySlugOrId);

// Admin & Product Manager management routes
router.post(
  '/',
  authenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRODUCT_MANAGER),
  logAdminAction('CREATE_PRODUCT', 'Product'),
  validate(productSchema),
  ProductController.createProduct
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRODUCT_MANAGER),
  logAdminAction('UPDATE_PRODUCT', 'Product'),
  ProductController.updateProduct
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRODUCT_MANAGER),
  logAdminAction('DELETE_PRODUCT', 'Product'),
  ProductController.deleteProduct
);

module.exports = router;
