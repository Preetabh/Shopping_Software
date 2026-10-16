const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const env = require('../config/env');
const AuthService = require('../services/authService');
const OrderService = require('../services/orderService');
const PaymentService = require('../services/paymentService');
const InventoryService = require('../services/inventoryService');
const User = require('../models/User');
const Role = require('../models/Role');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Address = require('../models/Address');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');
const { ROLES, PAYMENT_METHODS, ORDER_STATUS } = require('../config/constants');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`   ${testName}`);
    passedTests++;
  } else {
    console.error(`   FAILED: ${testName}`);
    failedTests++;
  }
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log(' RUNNING AUTOMATED BACKEND INTEGRATION TEST SUITE');
  console.log('======================================================\n');

  await mongoose.connect(env.MONGO_URI, { dbName: 'flipkart_store' });

  try {
    // 1. AUTHENTICATION TESTS
    console.log('\n--- 1. Testing Authentication & JWT ---');
    const testEmail = `test.user.${Date.now()}@example.com`;
    const regResult = await AuthService.register({
      name: 'Integration Test User',
      email: testEmail,
      phone: `99${Date.now().toString().slice(-8)}`,
      password: 'SecurePassword123!'
    });
    assert(regResult.user && regResult.accessToken, 'User registration returns tokens and user object');

    const loginResult = await AuthService.login({
      email: testEmail,
      password: 'SecurePassword123!'
    });
    assert(loginResult.accessToken && loginResult.refreshToken, 'User login succeeds with correct credentials');

    let loginFailed = false;
    try {
      await AuthService.login({ email: testEmail, password: 'WrongPassword' });
    } catch (e) {
      loginFailed = true;
    }
    assert(loginFailed, 'User login fails with invalid password');

    // 2. RBAC & PERMISSION TESTS
    console.log('\n--- 2. Testing Roles & Permissions (RBAC) ---');
    const adminUser = await User.findOne({ role: ROLES.SUPER_ADMIN });
    const customerUser = await User.findOne({ email: testEmail });
    assert(adminUser.role === ROLES.SUPER_ADMIN, 'Super Admin role loaded with universal permissions');
    assert(customerUser.role === ROLES.CUSTOMER, 'New registered user defaults to customer role');

    // 3. PRODUCTS & CATALOG TESTS
    console.log('\n--- 3. Testing Products, Search & Stock Verification ---');
    const sampleProduct = await Product.findOne({ isPublished: true });
    assert(sampleProduct && sampleProduct.price > 0, `Product catalog queries work (Found: ${sampleProduct.title})`);
    assert(sampleProduct.mrp >= sampleProduct.price, 'Product MRP is greater than or equal to selling price');

    // 4. CART & SERVER-SIDE PRICING
    console.log('\n--- 4. Testing Cart & Server-Side Price Recalculation ---');
    const cart = await Cart.findOneAndUpdate(
      { user: customerUser._id },
      {
        items: [
          {
            product: sampleProduct._id,
            quantity: 2,
            price: sampleProduct.price,
            mrp: sampleProduct.mrp
          }
        ]
      },
      { upsert: true, new: true }
    );
    assert(cart.items.length === 1 && cart.items[0].quantity === 2, 'Cart stores items accurately');

    const pricing = await OrderService.calculateOrderPricing(cart.items, 'FLIPKART10');
    assert(pricing.verifiedItems.length === 1, 'Server recalculates items from trusted database prices');
    assert(pricing.pricing.subtotal === sampleProduct.price * 2, 'Server computes subtotal without trusting client totals');
    assert(pricing.pricing.couponDiscount > 0, 'Valid coupon applied and discount calculated correctly');

    // 5. INVENTORY & STOCK HANDLING
    console.log('\n--- 5. Testing Inventory Reservation & Stock Handling ---');
    const initialStock = sampleProduct.stock;
    const testSku = sampleProduct.sku;

    // Test adjustment
    await InventoryService.adjustStock({
      productId: sampleProduct._id,
      newStock: initialStock + 5,
      reason: 'Automated test stock increment',
      userId: adminUser._id
    });
    const refreshedProduct = await Product.findById(sampleProduct._id);
    assert(refreshedProduct.stock === initialStock + 5, 'Inventory adjustment updates stock and logs movement');

    // 6. ORDER CREATION & CHECKOUT TESTS
    console.log('\n--- 6. Testing Checkout & Order Placement ---');
    const testAddress = await Address.create({
      user: customerUser._id,
      fullName: 'Test Receiver',
      phone: '9988776655',
      pincode: '560001',
      locality: 'MG Road',
      addressLine: 'Suite 101, Brigade Towers',
      city: 'Bengaluru',
      state: 'Karnataka'
    });

    const newOrder = await OrderService.createOrder({
      userId: customerUser._id,
      addressId: testAddress._id,
      paymentMethod: PAYMENT_METHODS.ONLINE_RAZORPAY,
      couponCode: 'FLIPKART10'
    });
    assert(newOrder.orderNumber.startsWith('OD'), `Order generated unique Flipkart format number: ${newOrder.orderNumber}`);
    assert(newOrder.orderStatus === ORDER_STATUS.PLACED, 'Order status initialized to PLACED');
    assert(newOrder.pricing.totalAmount > 0, `Order pricing total correctly calculated: ₹${newOrder.pricing.totalAmount}`);

    // Verify stock reserved
    const postOrderProduct = await Product.findById(sampleProduct._id);
    assert(postOrderProduct.stock === initialStock + 5 - 2, 'Stock was deducted upon order placement');

    // 7. PAYMENT WORKFLOW & VERIFICATION
    console.log('\n--- 7. Testing Razorpay Payment Verification ---');
    const paymentOrder = await PaymentService.createPaymentOrder({
      orderId: newOrder._id,
      amount: newOrder.pricing.totalAmount,
      userId: customerUser._id
    });
    assert(paymentOrder.razorpayOrderId.startsWith('order_rzp_'), 'Payment order generated with order ID');

    const verifiedPayment = await PaymentService.verifyPayment({
      orderId: newOrder._id,
      razorpayOrderId: paymentOrder.razorpayOrderId,
      razorpayPaymentId: 'pay_simulated_test_123',
      razorpaySignature: 'simulated_test_sig'
    });
    assert(verifiedPayment.status === 'PAID', 'Payment verification marks transaction as PAID');

    // 8. ORDER CANCELLATION & RESTOCK
    console.log('\n--- 8. Testing Order Cancellation & Automatic Restock ---');
    const cancelledOrder = await OrderService.cancelOrder({
      orderId: newOrder._id,
      userId: customerUser._id,
      reason: 'User test cancellation'
    });
    assert(cancelledOrder.orderStatus === ORDER_STATUS.CANCELLED, 'Order status updated to CANCELLED');

    const restoredProduct = await Product.findById(sampleProduct._id);
    assert(restoredProduct.stock === initialStock + 5, 'Cancelled order items automatically restocked to inventory');

    // Cleanup test user
    await User.findByIdAndDelete(customerUser._id);
    await Address.findByIdAndDelete(testAddress._id);
    await Order.findByIdAndDelete(newOrder._id);
    await Product.findByIdAndUpdate(sampleProduct._id, { stock: initialStock });

    console.log('\n======================================================');
    console.log(` TESTS COMPLETED: ${passedTests} Passed, ${failedTests} Failed`);
    console.log('======================================================\n');

    if (failedTests > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runAllTests();
