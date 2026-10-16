const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerSchema,
  loginSchema,
  otpRequestSchema,
  otpVerifySchema
} = require('../validators/authValidator');

router.post('/register', authLimiter, validate(registerSchema), AuthController.register);
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);
router.post('/otp/request', authLimiter, validate(otpRequestSchema), AuthController.requestOtp);
router.post('/otp/verify', authLimiter, validate(otpVerifySchema), AuthController.verifyOtp);
router.post('/refresh-token', AuthController.refreshToken);
router.get('/me', authenticate, AuthController.getMe);
router.put('/profile', authenticate, AuthController.updateProfile);

module.exports = router;
