const mongoose = require('mongoose');
const { ORDER_STATUS, PAYMENT_METHODS, PAYMENT_STATUS } = require('../config/constants');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    title: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    variantId: { type: mongoose.Schema.Types.ObjectId, default: null },
    variantName: { type: String, default: '' },
    itemTotal: { type: Number, required: true }
  },
  { _id: true }
);

const statusUpdateSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    location: { type: String, default: 'Warehouse Hub' },
    note: { type: String, default: '' }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      alternatePhone: { type: String, default: '' },
      pincode: { type: String, required: true },
      locality: { type: String, required: true },
      addressLine: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      landmark: { type: String, default: '' },
      addressType: { type: String, default: 'HOME' }
    },
    pricing: {
      subtotal: { type: Number, required: true },
      mrpTotal: { type: Number, required: true },
      totalDiscount: { type: Number, default: 0 },
      couponDiscount: { type: Number, default: 0 },
      couponCode: { type: String, default: null },
      deliveryCharge: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true }
    },
    payment: {
      method: {
        type: String,
        enum: Object.values(PAYMENT_METHODS),
        required: true
      },
      status: {
        type: String,
        enum: Object.values(PAYMENT_STATUS),
        default: PAYMENT_STATUS.PENDING,
        index: true
      },
      transactionId: { type: String, default: null },
      razorpayOrderId: { type: String, default: null },
      razorpayPaymentId: { type: String, default: null },
      paidAt: { type: Date, default: null }
    },
    orderStatus: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PLACED,
      index: true
    },
    tracking: {
      courierName: { type: String, default: 'Ekart Logistics' },
      trackingNumber: { type: String, default: null },
      estimatedDeliveryDate: { type: Date, default: null },
      statusUpdates: [statusUpdateSchema]
    },
    cancellationReason: { type: String, default: null },
    cancelledAt: { type: Date, default: null },
    returnDetails: {
      reason: { type: String, default: null },
      status: { type: String, default: null },
      refundAmount: { type: Number, default: 0 },
      requestedAt: { type: Date, default: null },
      processedAt: { type: Date, default: null }
    },
    invoiceNumber: { type: String, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
