const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Address = require('../models/Address');
const Cart = require('../models/Cart');
const StoreSetting = require('../models/StoreSetting');
const InventoryService = require('./inventoryService');
const { ORDER_STATUS, PAYMENT_METHODS, PAYMENT_STATUS } = require('../config/constants');

class OrderService {
  /**
   * Calculate verified server-side totals for a set of items and optional coupon
   */
  static async calculateOrderPricing(cartItems, couponCode = null) {
    if (!cartItems || cartItems.length === 0) {
      throw new Error('Order cannot be empty');
    }

    let subtotal = 0;
    let mrpTotal = 0;
    const verifiedItems = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.product || item.productId);
      if (!product || !product.isPublished || product.isArchived) {
        throw new Error(`Product "${item.title || 'Unknown'}" is currently unavailable`);
      }

      let price = product.price;
      let mrp = product.mrp;
      let variantName = '';

      if (item.variantId) {
        const variant = product.variants.id(item.variantId);
        if (!variant) {
          throw new Error(`Variant no longer exists for "${product.title}"`);
        }
        price = variant.price;
        mrp = variant.mrp;
        variantName = variant.name;
      }

      const quantity = parseInt(item.quantity, 10) || 1;
      const itemTotal = price * quantity;
      const itemMrpTotal = mrp * quantity;

      subtotal += itemTotal;
      mrpTotal += itemMrpTotal;

      verifiedItems.push({
        product: product._id,
        title: product.title,
        image: product.thumbnail || product.images[0],
        price,
        mrp,
        quantity,
        variantId: item.variantId || null,
        variantName,
        itemTotal
      });
    }

    const totalDiscount = Math.max(0, mrpTotal - subtotal);

    // Fetch store settings for delivery and taxes
    const settings = (await StoreSetting.findOne()) || {
      freeShippingThreshold: 500,
      standardDeliveryCharge: 40,
      taxRatePercent: 0 // Prices in India are typically GST-inclusive
    };

    let deliveryCharge = subtotal >= settings.freeShippingThreshold ? 0 : settings.standardDeliveryCharge;

    // Apply Coupon if valid
    let couponDiscount = 0;
    let appliedCouponCode = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        endDate: { $gte: new Date() }
      });

      if (coupon) {
        if (subtotal >= coupon.minOrderAmount) {
          if (coupon.discountType === 'PERCENTAGE') {
            couponDiscount = Math.round((subtotal * coupon.discountValue) / 100);
            if (coupon.maxDiscount && couponDiscount > coupon.maxDiscount) {
              couponDiscount = coupon.maxDiscount;
            }
          } else {
            couponDiscount = Math.min(coupon.discountValue, subtotal);
          }
          appliedCouponCode = coupon.code;
        }
      }
    }

    const taxableAmount = Math.max(0, subtotal - couponDiscount);
    const tax = settings.taxRatePercent > 0 ? Math.round((taxableAmount * settings.taxRatePercent) / 100) : 0;
    const totalAmount = taxableAmount + deliveryCharge + tax;

    return {
      verifiedItems,
      pricing: {
        subtotal,
        mrpTotal,
        totalDiscount,
        couponDiscount,
        couponCode: appliedCouponCode,
        deliveryCharge,
        tax,
        totalAmount
      }
    };
  }

  /**
   * Create order with verified pricing, address snapshot, and inventory reservation
   */
  static async createOrder({ userId, addressId, paymentMethod, couponCode = null }) {
    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) {
      throw new Error('Selected delivery address was not found');
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      throw new Error('Your cart is empty');
    }

    const activeCoupon = couponCode || cart.coupon?.code;

    // Server-side recalculation of everything
    const { verifiedItems, pricing } = await this.calculateOrderPricing(cart.items, activeCoupon);

    // Reserve inventory
    await InventoryService.reserveStock(verifiedItems, null, userId);

    // Generate Flipkart-style unique order number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderNumber = `OD${dateStr}${randomHex}`;

    // Estimated delivery date (3 to 5 days)
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 4);

    const order = await Order.create({
      orderNumber,
      user: userId,
      items: verifiedItems,
      shippingAddress: {
        fullName: address.fullName,
        phone: address.phone,
        alternatePhone: address.alternatePhone,
        pincode: address.pincode,
        locality: address.locality,
        addressLine: address.addressLine,
        city: address.city,
        state: address.state,
        landmark: address.landmark,
        addressType: address.addressType
      },
      pricing,
      payment: {
        method: paymentMethod,
        status: paymentMethod === PAYMENT_METHODS.COD ? PAYMENT_STATUS.PENDING : PAYMENT_STATUS.PENDING,
        paidAt: null
      },
      orderStatus: ORDER_STATUS.PLACED,
      tracking: {
        courierName: 'Ekart Logistics',
        trackingNumber: `EKT${Date.now()}`,
        estimatedDeliveryDate,
        statusUpdates: [
          {
            status: ORDER_STATUS.PLACED,
            timestamp: new Date(),
            location: 'Order Management Center',
            note: 'Your order has been placed successfully.'
          }
        ]
      },
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`
    });

    // Clear cart after order creation
    cart.items = [];
    cart.coupon = { code: null, discountAmount: 0 };
    await cart.save();

    // Increment coupon usage if used
    if (pricing.couponCode) {
      await Coupon.updateOne({ code: pricing.couponCode }, { $inc: { usageCount: 1 } });
    }

    return order;
  }

  /**
   * Cancel order and restock inventory
   */
  static async cancelOrder({ orderId, userId, reason, isAdmin = false }) {
    const query = isAdmin ? { _id: orderId } : { _id: orderId, user: userId };
    const order = await Order.findOne(query);

    if (!order) {
      throw new Error('Order not found');
    }

    const nonCancellable = [ORDER_STATUS.SHIPPED, ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED, ORDER_STATUS.RETURNED];
    if (nonCancellable.includes(order.orderStatus) && !isAdmin) {
      throw new Error(`Order cannot be cancelled in state: ${order.orderStatus}`);
    }

    order.orderStatus = ORDER_STATUS.CANCELLED;
    order.cancellationReason = reason || 'Cancelled by user';
    order.cancelledAt = new Date();
    order.tracking.statusUpdates.push({
      status: ORDER_STATUS.CANCELLED,
      timestamp: new Date(),
      location: 'Hub',
      note: `Order cancelled. Reason: ${order.cancellationReason}`
    });

    await order.save();

    // Restock items
    await InventoryService.restockOrder(order, `Cancelled order ${order.orderNumber}`, 'ORDER_CANCELLED_RESTOCK', userId);

    return order;
  }

  /**
   * Request return for delivered order
   */
  static async requestReturn({ orderId, userId, reason }) {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) throw new Error('Order not found');

    if (order.orderStatus !== ORDER_STATUS.DELIVERED) {
      throw new Error('Only delivered orders can be returned');
    }

    order.orderStatus = ORDER_STATUS.RETURN_REQUESTED;
    order.returnDetails = {
      reason,
      status: 'PENDING_APPROVAL',
      refundAmount: order.pricing.totalAmount,
      requestedAt: new Date()
    };
    order.tracking.statusUpdates.push({
      status: ORDER_STATUS.RETURN_REQUESTED,
      timestamp: new Date(),
      location: 'Customer Service',
      note: `Return request submitted: ${reason}`
    });

    await order.save();
    return order;
  }
}

module.exports = OrderService;
