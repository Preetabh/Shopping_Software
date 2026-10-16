const Order = require('../models/Order');
const OrderService = require('../services/orderService');
const PaymentService = require('../services/paymentService');
const ApiResponse = require('../utils/apiResponse');
const { ORDER_STATUS, PAYMENT_STATUS } = require('../config/constants');

class OrderController {
  static async createOrder(req, res, next) {
    try {
      const { addressId, paymentMethod, couponCode } = req.body;
      const order = await OrderService.createOrder({
        userId: req.user._id,
        addressId,
        paymentMethod,
        couponCode
      });

      return ApiResponse.created(res, order, 'Order placed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getUserOrders(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.max(1, parseInt(limit, 10));
      const skip = (pageNum - 1) * limitNum;

      const [orders, total] = await Promise.all([
        Order.find({ user: req.user._id })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Order.countDocuments({ user: req.user._id })
      ]);

      return ApiResponse.success(res, orders, 'Orders retrieved successfully', 200, {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        limit: limitNum
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const query = req.user.role === 'customer' ? { _id: id, user: req.user._id } : { _id: id };
      const order = await Order.findOne(query).populate('user', 'name email phone');

      if (!order) {
        return ApiResponse.notFound(res, 'Order not found');
      }

      return ApiResponse.success(res, order);
    } catch (error) {
      next(error);
    }
  }

  static async cancelOrder(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const isAdmin = req.user.role !== 'customer';

      const order = await OrderService.cancelOrder({
        orderId: id,
        userId: req.user._id,
        reason,
        isAdmin
      });

      return ApiResponse.success(res, order, 'Order has been cancelled');
    } catch (error) {
      next(error);
    }
  }

  static async requestReturn(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const order = await OrderService.requestReturn({
        orderId: id,
        userId: req.user._id,
        reason
      });

      return ApiResponse.success(res, order, 'Return requested successfully');
    } catch (error) {
      next(error);
    }
  }

  // Admin order management endpoints
  static async getAllOrders(req, res, next) {
    try {
      const { status, paymentStatus, search, startDate, endDate, page = 1, limit = 15 } = req.query;
      const filter = {};

      if (status) filter.orderStatus = status;
      if (paymentStatus) filter['payment.status'] = paymentStatus;

      if (search) {
        filter.$or = [
          { orderNumber: { $regex: search, $options: 'i' } },
          { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
          { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
        ];
      }

      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }

      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.max(1, parseInt(limit, 10));
      const skip = (pageNum - 1) * limitNum;

      const [orders, total] = await Promise.all([
        Order.find(filter)
          .populate('user', 'name email phone')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Order.countDocuments(filter)
      ]);

      return ApiResponse.success(res, orders, 'All orders retrieved', 200, {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        limit: limitNum
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, note, location, trackingNumber, courierName } = req.body;

      const order = await Order.findById(id);
      if (!order) return ApiResponse.notFound(res, 'Order not found');

      order.orderStatus = status;

      if (trackingNumber) order.tracking.trackingNumber = trackingNumber;
      if (courierName) order.tracking.courierName = courierName;

      if (status === ORDER_STATUS.DELIVERED) {
        if (order.payment.method === 'COD') {
          order.payment.status = PAYMENT_STATUS.PAID;
          order.payment.paidAt = new Date();
        }
      }

      order.tracking.statusUpdates.push({
        status,
        timestamp: new Date(),
        location: location || 'Fulfillment Center',
        note: note || `Order updated to ${status}`
      });

      await order.save();
      return ApiResponse.success(res, order, `Order status updated to ${status}`);
    } catch (error) {
      next(error);
    }
  }

  static async handleReturnDecision(req, res, next) {
    try {
      const { id } = req.params;
      const { decision, refundAmount } = req.body; // 'APPROVE' or 'REJECT'

      const order = await Order.findById(id);
      if (!order) return ApiResponse.notFound(res, 'Order not found');

      if (decision === 'APPROVE') {
        order.orderStatus = ORDER_STATUS.RETURN_APPROVED;
        order.returnDetails.status = 'APPROVED';
        order.returnDetails.processedAt = new Date();
        order.payment.status = PAYMENT_STATUS.REFUNDED;

        // Process refund record
        await PaymentService.processRefund(order._id, refundAmount || order.pricing.totalAmount, 'Return approved');

        // Restock inventory
        const InventoryService = require('../services/inventoryService');
        await InventoryService.restockOrder(order, `Approved return for ${order.orderNumber}`, 'RETURN_RESTOCK', req.user._id);

        order.tracking.statusUpdates.push({
          status: ORDER_STATUS.RETURN_APPROVED,
          timestamp: new Date(),
          location: 'Returns Processing Facility',
          note: `Return approved. Refund of ₹${refundAmount || order.pricing.totalAmount} processed.`
        });
      } else {
        order.orderStatus = ORDER_STATUS.RETURN_REJECTED;
        order.returnDetails.status = 'REJECTED';
        order.tracking.statusUpdates.push({
          status: ORDER_STATUS.RETURN_REJECTED,
          timestamp: new Date(),
          location: 'Inspection Dept',
          note: 'Return request was rejected after review.'
        });
      }

      await order.save();
      return ApiResponse.success(res, order, `Return request ${decision.toLowerCase()}d`);
    } catch (error) {
      next(error);
    }
  }

  static async getInvoiceData(req, res, next) {
    try {
      const { id } = req.params;
      const order = await Order.findById(id).populate('user', 'name email phone');
      if (!order) return ApiResponse.notFound(res, 'Order not found');

      const invoice = {
        invoiceNumber: order.invoiceNumber || `INV-${order.orderNumber}`,
        invoiceDate: order.createdAt,
        orderNumber: order.orderNumber,
        customer: {
          name: order.shippingAddress.fullName,
          phone: order.shippingAddress.phone,
          address: `${order.shippingAddress.addressLine}, ${order.shippingAddress.locality}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`
        },
        items: order.items,
        pricing: order.pricing,
        payment: order.payment,
        store: {
          name: 'Aurelia Luxe International Ltd.',
          gstin: '29ABCDE1234F1Z5',
          address: 'Aurelia Pavilion, 42 Boulevard de la Mode, Bengaluru, 560001, Karnataka, India'
        }
      };

      return ApiResponse.success(res, invoice);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = OrderController;
