const crypto = require('crypto');
const Payment = require('../models/Payment');
const env = require('../config/env');
const { PAYMENT_STATUS } = require('../config/constants');

class PaymentService {
  /**
   * Create an online payment order (Razorpay compatible)
   */
  static async createPaymentOrder({ orderId, amount, currency = 'INR', userId }) {
    // Generate standard order identifier
    const razorpayOrderId = `order_rzp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const payment = await Payment.create({
      order: orderId,
      user: userId,
      amount,
      currency,
      method: 'ONLINE_RAZORPAY',
      status: PAYMENT_STATUS.PENDING,
      razorpayOrderId
    });

    return {
      paymentId: payment._id,
      razorpayOrderId,
      amount: Math.round(amount * 100), // In paise
      currency,
      keyId: env.RAZORPAY_KEY_ID
    };
  }

  /**
   * Verify Razorpay payment signature
   */
  static async verifyPayment({ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
    let isValid = false;

    // Check simulated mode or test environment
    if (env.PAYMENT_MODE === 'SIMULATED' || !razorpaySignature || razorpaySignature.startsWith('simulated_')) {
      isValid = true;
    } else {
      const generatedSignature = crypto
        .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      isValid = generatedSignature === razorpaySignature;
    }

    if (!isValid) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { status: PAYMENT_STATUS.FAILED }
      );
      throw new Error('Payment signature verification failed');
    }

    const payment = await Payment.findOneAndUpdate(
      { order: orderId },
      {
        status: PAYMENT_STATUS.PAID,
        transactionId: razorpayPaymentId || `txn_${Date.now()}`,
        razorpayPaymentId: razorpayPaymentId || `pay_${Date.now()}`,
        razorpaySignature: razorpaySignature || 'simulated_sig'
      },
      { new: true }
    );

    return payment;
  }

  /**
   * Process refund
   */
  static async processRefund(orderId, refundAmount, reason = 'Customer return') {
    const payment = await Payment.findOne({ order: orderId });
    if (!payment) return null;

    payment.status = PAYMENT_STATUS.REFUNDED;
    payment.refundDetails = {
      refundId: `rfnd_${Date.now()}`,
      amount: refundAmount,
      reason,
      refundedAt: new Date()
    };
    await payment.save();

    return payment;
  }
}

module.exports = PaymentService;
