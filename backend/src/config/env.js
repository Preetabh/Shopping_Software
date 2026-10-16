require('dotenv').config();

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MOBILE_URL: process.env.MOBILE_URL || 'http://localhost:8081',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flipkart_store',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'flipkart_super_secure_access_secret_key_2026_xyz_!@#',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'flipkart_super_secure_refresh_secret_key_2026_xyz_!@#',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '1d',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_flipkart_demo_key',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_demo_flipkart_secret',
  PAYMENT_MODE: process.env.PAYMENT_MODE || 'SIMULATED',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '1000', 10)
};

module.exports = env;
