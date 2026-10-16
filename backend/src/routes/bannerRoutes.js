const express = require('express');
const router = express.Router();
const BannerController = require('../controllers/bannerController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');
const { logAdminAction } = require('../middleware/auditMiddleware');
const { ROLES } = require('../config/constants');

router.get('/', BannerController.getBanners);

router.post(
  '/',
  authenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  logAdminAction('CREATE_BANNER', 'Banner'),
  BannerController.createBanner
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  logAdminAction('UPDATE_BANNER', 'Banner'),
  BannerController.updateBanner
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  logAdminAction('DELETE_BANNER', 'Banner'),
  BannerController.deleteBanner
);

module.exports = router;
