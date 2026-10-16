export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
  status: 'active' | 'suspended' | 'blocked';
  totalOrders?: number;
  totalSpent?: number;
  createdAt: string;
}

export interface ProductVariant {
  _id?: string;
  name: string;
  sku: string;
  price: number;
  mrp: number;
  stock: number;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  brand: { _id: string; name: string; logo?: string } | any;
  category: { _id: string; name: string } | any;
  subCategory?: { _id: string; name: string } | any;
  description: string;
  highlights: string[];
  specs: { group: string; name: string; value: string }[];
  images: string[];
  thumbnail: string;
  price: number;
  mrp: number;
  discountPercent: number;
  stock: number;
  lowStockThreshold: number;
  sku: string;
  variants: ProductVariant[];
  rating: { average: number; count: number };
  isPublished: boolean;
  isArchived: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isDealOfDay: boolean;
  tags: string[];
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  parent?: { _id: string; name: string } | null;
  description?: string;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  children?: Category[];
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo: string;
  description?: string;
  isActive: boolean;
}

export interface OrderItem {
  _id: string;
  product: string;
  title: string;
  image: string;
  price: number;
  mrp: number;
  quantity: number;
  variantName?: string;
  itemTotal: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: { _id: string; name: string; email: string; phone: string } | any;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    alternatePhone?: string;
    pincode: string;
    locality: string;
    addressLine: string;
    city: string;
    state: string;
    landmark?: string;
    addressType: string;
  };
  pricing: {
    subtotal: number;
    mrpTotal: number;
    totalDiscount: number;
    couponDiscount: number;
    couponCode?: string;
    deliveryCharge: number;
    tax: number;
    totalAmount: number;
  };
  payment: {
    method: 'COD' | 'ONLINE_RAZORPAY';
    status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    transactionId?: string;
    paidAt?: string;
  };
  orderStatus:
    | 'PLACED'
    | 'CONFIRMED'
    | 'PACKED'
    | 'SHIPPED'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'RETURN_REQUESTED'
    | 'RETURN_APPROVED'
    | 'RETURN_REJECTED'
    | 'RETURNED';
  tracking: {
    courierName: string;
    trackingNumber?: string;
    estimatedDeliveryDate?: string;
    statusUpdates: { status: string; timestamp: string; location: string; note: string }[];
  };
  returnDetails?: {
    reason?: string;
    status?: string;
    refundAmount?: number;
    requestedAt?: string;
  };
  invoiceNumber?: string;
  createdAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  endDate: string;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
}

export interface Banner {
  _id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  targetType: 'CATEGORY' | 'PRODUCT' | 'URL' | 'DEAL';
  targetValue: string;
  position: 'HERO' | 'MIDDLE' | 'BOTTOM';
  displayOrder: number;
  isActive: boolean;
}

export interface Review {
  _id: string;
  product: { _id: string; title: string; thumbnail: string } | any;
  user: { _id: string; name: string; email: string } | any;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface SupportTicket {
  _id: string;
  ticketNumber: string;
  user: { _id: string; name: string; email: string; phone: string } | any;
  order?: { _id: string; orderNumber: string; orderStatus: string; pricing: { totalAmount: number } } | any;
  subject: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  messages: {
    _id?: string;
    sender: { _id: string; name: string; role: string } | any;
    senderRole: string;
    message: string;
    attachments?: string[];
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovement {
  _id: string;
  product: { _id: string; title: string; thumbnail: string } | any;
  sku: string;
  type: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceOrder?: { _id: string; orderNumber: string } | any;
  reason: string;
  performedBy?: { _id: string; name: string; email: string } | any;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  actor: { _id: string; name: string; role: string } | any;
  actorRole: string;
  action: string;
  module: string;
  targetModel?: string;
  changes?: any;
  ipAddress?: string;
  createdAt: string;
}

export interface StoreSetting {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  taxRatePercent: number;
  freeShippingThreshold: number;
  standardDeliveryCharge: number;
  codEnabled: boolean;
  razorpayKeyId: string;
  maintenanceMode: boolean;
  announcementBanner: {
    enabled: boolean;
    text: string;
  };
}
