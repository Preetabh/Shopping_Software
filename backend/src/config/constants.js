const ROLES = {
  SUPER_ADMIN: 'superadmin',
  ADMIN: 'admin',
  PRODUCT_MANAGER: 'product_manager',
  ORDER_MANAGER: 'order_manager',
  SUPPORT_AGENT: 'support_agent',
  CUSTOMER: 'customer'
};

const ORDER_STATUS = {
  PLACED: 'PLACED',
  CONFIRMED: 'CONFIRMED',
  PACKED: 'PACKED',
  SHIPPED: 'SHIPPED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  RETURN_REQUESTED: 'RETURN_REQUESTED',
  RETURN_APPROVED: 'RETURN_APPROVED',
  RETURN_REJECTED: 'RETURN_REJECTED',
  RETURNED: 'RETURNED'
};

const PAYMENT_METHODS = {
  COD: 'COD',
  ONLINE_RAZORPAY: 'ONLINE_RAZORPAY'
};

const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
};

const SUPPORT_STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED'
};

const PERMISSIONS = {
  ALL: '*',
  PRODUCTS_READ: 'products:read',
  PRODUCTS_WRITE: 'products:write',
  PRODUCTS_DELETE: 'products:delete',
  CATEGORIES_MANAGE: 'categories:manage',
  ORDERS_READ: 'orders:read',
  ORDERS_MANAGE: 'orders:manage',
  CUSTOMERS_READ: 'customers:read',
  CUSTOMERS_MANAGE: 'customers:manage',
  INVENTORY_MANAGE: 'inventory:manage',
  COUPONS_MANAGE: 'coupons:manage',
  REVIEWS_MANAGE: 'reviews:manage',
  SUPPORT_MANAGE: 'support:manage',
  BANNERS_MANAGE: 'banners:manage',
  REPORTS_READ: 'reports:read',
  SETTINGS_MANAGE: 'settings:manage',
  LOGS_READ: 'logs:read'
};

module.exports = {
  ROLES,
  ORDER_STATUS,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  SUPPORT_STATUS,
  PERMISSIONS
};
