const User = require('../models/User');
const Role = require('../models/Role');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { ROLES } = require('../config/constants');

class AuthService {
  static async register({ name, email, phone, password, role = ROLES.CUSTOMER }) {
    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });
    if (existing) {
      throw new Error(existing.email === email.toLowerCase() ? 'Email is already registered' : 'Phone number is already registered');
    }

    const roleDoc = await Role.findOne({ code: role });

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role,
      roleRef: roleDoc ? roleDoc._id : null,
      isVerified: true
    });

    const accessToken = generateAccessToken({ userId: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user._id });

    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      },
      accessToken,
      refreshToken
    };
  }

  static async login({ email, password }) {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password').populate('roleRef');
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.status !== 'active') {
      throw new Error(`Your account is ${user.status}. Please contact support.`);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const accessToken = generateAccessToken({ userId: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user._id });

    user.refreshTokens.push({ token: refreshToken });
    if (user.refreshTokens.length > 5) {
      user.refreshTokens.shift();
    }
    await user.save();

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        permissions: user.roleRef?.permissions || []
      },
      accessToken,
      refreshToken
    };
  }

  static async requestOtp(phone) {
    let user = await User.findOne({ phone });
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (!user) {
      user = await User.create({
        name: `User ${phone.slice(-4)}`,
        email: `${phone}@aurelia-temp.com`,
        phone,
        password: `otp_${Date.now()}`,
        role: ROLES.CUSTOMER,
        otp: { code: otpCode, expiresAt }
      });
    } else {
      user.otp = { code: otpCode, expiresAt };
      await user.save();
    }

    // In production, integrate SMS gateway (Twilio, Gupshup, etc.)
    return { phone, otp: otpCode, expiresAt, message: 'OTP sent successfully (Simulated for dev/demo)' };
  }

  static async verifyOtp(phone, otp) {
    const user = await User.findOne({ phone }).populate('roleRef');
    if (!user || !user.otp || !user.otp.code) {
      throw new Error('No OTP request found for this phone');
    }

    if (new Date() > new Date(user.otp.expiresAt)) {
      throw new Error('OTP has expired');
    }

    // Allow '123456' as standard fallback test OTP or match generated OTP
    if (user.otp.code !== otp && otp !== '123456') {
      throw new Error('Invalid OTP entered');
    }

    user.isVerified = true;
    user.otp = undefined;

    const accessToken = generateAccessToken({ userId: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user._id });

    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        permissions: user.roleRef?.permissions || []
      },
      accessToken,
      refreshToken
    };
  }

  static async refreshAccessToken(refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded || !decoded.userId) {
      throw new Error('Invalid or expired refresh token');
    }

    const user = await User.findById(decoded.userId).populate('roleRef');
    if (!user) {
      throw new Error('User not found');
    }

    const tokenExists = user.refreshTokens.some((t) => t.token === refreshToken);
    if (!tokenExists) {
      throw new Error('Refresh token revoked');
    }

    const newAccessToken = generateAccessToken({ userId: user._id, role: user.role });
    return { accessToken: newAccessToken };
  }
}

module.exports = AuthService;
