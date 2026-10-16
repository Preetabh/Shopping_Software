const ApiResponse = require('../utils/apiResponse');
const { ROLES, PERMISSIONS } = require('../config/constants');

/**
 * Authorize based on allowed roles
 * Example: authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRODUCT_MANAGER)
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'User not authenticated');
    }

    // Super Admin has universal access
    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ApiResponse.forbidden(
        res,
        `Access denied. Role '${req.user.role}' is not authorized for this action.`
      );
    }

    next();
  };
};

/**
 * Authorize based on granular permission string
 * Checks role permissions in populated roleRef or fallback role defaults
 */
const authorizePermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'User not authenticated');
    }

    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next();
    }

    // Map default role permissions
    const roleDefaultPermissions = {
      [ROLES.ADMIN]: [PERMISSIONS.ALL],
      [ROLES.PRODUCT_MANAGER]: [
        PERMISSIONS.PRODUCTS_READ,
        PERMISSIONS.PRODUCTS_WRITE,
        PERMISSIONS.PRODUCTS_DELETE,
        PERMISSIONS.CATEGORIES_MANAGE,
        PERMISSIONS.INVENTORY_MANAGE,
        PERMISSIONS.REPORTS_READ
      ],
      [ROLES.ORDER_MANAGER]: [
        PERMISSIONS.ORDERS_READ,
        PERMISSIONS.ORDERS_MANAGE,
        PERMISSIONS.CUSTOMERS_READ,
        PERMISSIONS.REPORTS_READ
      ],
      [ROLES.SUPPORT_AGENT]: [
        PERMISSIONS.SUPPORT_MANAGE,
        PERMISSIONS.REVIEWS_MANAGE,
        PERMISSIONS.CUSTOMERS_READ,
        PERMISSIONS.ORDERS_READ
      ],
      [ROLES.CUSTOMER]: []
    };

    let userPermissions = roleDefaultPermissions[req.user.role] || [];
    if (req.user.roleRef && req.user.roleRef.permissions) {
      userPermissions = [...new Set([...userPermissions, ...req.user.roleRef.permissions])];
    }

    if (
      userPermissions.includes(PERMISSIONS.ALL) ||
      userPermissions.includes(requiredPermission)
    ) {
      return next();
    }

    return ApiResponse.forbidden(
      res,
      `Permission denied: Missing '${requiredPermission}' required for this operation.`
    );
  };
};

module.exports = {
  authorizeRoles,
  authorizePermission
};
