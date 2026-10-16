const PaymentService = require('../services/paymentService');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const ApiResponse = require('../utils/apiResponse');
const { ORDER_STATUS, PAYMENT_STATUS } = require('../config/constants');

class PaymentController {
  static async initiatePayment(req, res, next) {
    try {
      const { orderId } = req.body;
      const order = await Order.findOne({ _id: orderId, user: req.user._id });

      if (!order) {
        return ApiResponse.notFound(res, 'Order not found');
      }

      if (order.payment.status === PAYMENT_STATUS.PAID) {
        return ApiResponse.badRequest(res, 'Order is already paid');
      }

      const paymentOrder = await PaymentService.createPaymentOrder({
        orderId: order._id,
        amount: order.pricing.totalAmount,
        currency: 'INR',
        userId: req.user._id
      });

      return ApiResponse.success(res, paymentOrder, 'Payment order initiated');
    } catch (error) {
      next(error);
    }
  }

  static async verifyPayment(req, res, next) {
    try {
      const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

      const order = await Order.findOne({ _id: orderId, user: req.user._id });
      if (!order) {
        return ApiResponse.notFound(res, 'Order not found');
      }

      const payment = await PaymentService.verifyPayment({
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      });

      // Update Order Payment and Status
      order.payment.status = PAYMENT_STATUS.PAID;
      order.payment.transactionId = razorpayPaymentId || `TXN_${Date.now()}`;
      order.payment.razorpayOrderId = razorpayOrderId;
      order.payment.razorpayPaymentId = razorpayPaymentId;
      order.payment.paidAt = new Date();
      order.orderStatus = ORDER_STATUS.CONFIRMED;

      order.tracking.statusUpdates.push({
        status: ORDER_STATUS.CONFIRMED,
        timestamp: new Date(),
        location: 'Payment Gateway',
        note: `Online payment of ₹${order.pricing.totalAmount} verified successfully.`
      });

      await order.save();

      return ApiResponse.success(res, { order, payment }, 'Payment verified and order confirmed');
    } catch (error) {
      next(error);
    }
  }

  static async getTransactions(req, res, next) {
    try {
      const { status, page = 1, limit = 15 } = req.query;
      const filter = status ? { status } : {};

      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.max(1, parseInt(limit, 10));
      const skip = (pageNum - 1) * limitNum;

      const [transactions, total] = await Promise.all([
        Payment.find(filter)
          .populate('user', 'name email phone')
          .populate('order', 'orderNumber pricing orderStatus')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Payment.countDocuments(filter)
      ]);

      return ApiResponse.success(res, transactions, 'Transactions retrieved', 200, {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        limit: limitNum
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PaymentController;
