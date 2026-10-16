const { verifyAccessToken } = require('../utils/jwt');
const ApiResponse = require('../utils/apiResponse');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.unauthorized(res, 'Authorization token missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (!decoded || !decoded.userId) {
      return ApiResponse.unauthorized(res, 'Access token is expired or invalid');
    }

    const user = await User.findById(decoded.userId).populate('roleRef');
    if (!user) {
      return ApiResponse.unauthorized(res, 'User no longer exists');
    }

    if (user.status !== 'active') {
      return ApiResponse.forbidden(res, `Account is ${user.status}. Please contact support.`);
    }

    req.user = user;
    next();
  } catch (error) {
    return ApiResponse.unauthorized(res, 'Authentication failed');
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      if (decoded && decoded.userId) {
        const user = await User.findById(decoded.userId);
        if (user && user.status === 'active') {
          req.user = user;
        }
      }
    }
  } catch (err) {
    // optional auth continues
  }
  next();
};

module.exports = {
  authenticate,
  optionalAuth
};
