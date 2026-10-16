const AuthService = require('../services/authService');
const ApiResponse = require('../utils/apiResponse');
const User = require('../models/User');

class AuthController {
  static async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body);
      return ApiResponse.created(res, result, 'Registration successful');
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const result = await AuthService.login(req.body);
      return ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  static async requestOtp(req, res, next) {
    try {
      const { phone } = req.body;
      const result = await AuthService.requestOtp(phone);
      return ApiResponse.success(res, result, 'OTP sent successfully');
    } catch (error) {
      next(error);
    }
  }

  static async verifyOtp(req, res, next) {
    try {
      const { phone, otp } = req.body;
      const result = await AuthService.verifyOtp(phone, otp);
      return ApiResponse.success(res, result, 'OTP verified successfully');
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return ApiResponse.badRequest(res, 'Refresh token required');
      }
      const result = await AuthService.refreshAccessToken(refreshToken);
      return ApiResponse.success(res, result, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req, res, next) {
    try {
      const user = await User.findById(req.user._id).populate('roleRef');
      return ApiResponse.success(res, {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        status: user.status,
        permissions: user.roleRef?.permissions || []
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const { name, avatar, phone } = req.body;
      const user = await User.findById(req.user._id);
      if (name) user.name = name;
      if (avatar) user.avatar = avatar;
      if (phone) user.phone = phone;
      await user.save();

      return ApiResponse.success(res, {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      }, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
