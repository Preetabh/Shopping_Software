export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: string;
}

export interface ProductVariant {
  _id?: string;
  name: string;
  sku: string;
  price: number;
  mrp: number;
  stock: number;
  attributes?: Record<string, string>;
  image?: string;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  brand: { _id: string; name: string; logo?: string } | any;
  category: { _id: string; name: string; slug: string } | any;
  subCategory?: { _id: string; name: string; slug: string } | any;
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
  isDealOfDay: boolean;
  isTrending: boolean;
  isFeatured: boolean;
  tags: string[];
  warranty?: string;
  returnPolicy?: string;
}

export interface CartItem {
  _id: string;
  product: Product;
  variantId?: string | null;
  variantName?: string;
  quantity: number;
  price: number;
  mrp: number;
}

export interface PricingSummary {
  subtotal: number;
  mrpTotal: number;
  totalDiscount: number;
  couponDiscount: number;
  couponCode?: string | null;
  deliveryCharge: number;
  tax: number;
  totalAmount: number;
}

export interface Address {
  _id: string;
  fullName: string;
  phone: string;
  alternatePhone?: string;
  pincode: string;
  locality: string;
  addressLine: string;
  city: string;
  state: string;
  landmark?: string;
  addressType: 'HOME' | 'WORK' | 'OTHER';
  isDefault: boolean;
}

export interface Order {
  _id: string;
  orderNumber: string;
  items: {
    product: string;
    title: string;
    image: string;
    price: number;
    mrp: number;
    quantity: number;
    variantName?: string;
    itemTotal: number;
  }[];
  shippingAddress: {
    fullName: string;
    phone: string;
    pincode: string;
    locality: string;
    addressLine: string;
    city: string;
    state: string;
  };
  pricing: PricingSummary;
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

export interface Review {
  _id: string;
  user: { _id: string; name: string; avatar?: string } | any;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface Banner {
  _id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  targetType: string;
  targetValue: string;
  position: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  isFeatured?: boolean;
}
