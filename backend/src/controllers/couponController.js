const Coupon = require('../models/Coupon');
const ApiResponse = require('../utils/apiResponse');

class CouponController {
  static async getCoupons(req, res, next) {
    try {
      const isAdmin = req.user && req.user.role !== 'customer';
      const filter = isAdmin ? {} : { isActive: true, endDate: { $gte: new Date() } };

      const coupons = await Coupon.find(filter).sort({ createdAt: -1 }).lean();
      return ApiResponse.success(res, coupons);
    } catch (error) {
      next(error);
    }
  }

  static async validateCoupon(req, res, next) {
    try {
      const { code, orderAmount } = req.body;
      const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        isActive: true,
        endDate: { $gte: new Date() }
      });

      if (!coupon) {
        return ApiResponse.badRequest(res, 'Invalid or expired coupon code');
      }

      const amount = Number(orderAmount) || 0;
      if (amount < coupon.minOrderAmount) {
        return ApiResponse.badRequest(res, `Minimum order amount of ₹${coupon.minOrderAmount} required`);
      }

      let discount = 0;
      if (coupon.discountType === 'PERCENTAGE') {
        discount = Math.round((amount * coupon.discountValue) / 100);
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else {
        discount = Math.min(coupon.discountValue, amount);
      }

      return ApiResponse.success(res, {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discount,
        description: coupon.description
      }, `Coupon applied! You save ₹${discount}`);
    } catch (error) {
      next(error);
    }
  }

  static async createCoupon(req, res, next) {
    try {
      const coupon = await Coupon.create(req.body);
      return ApiResponse.created(res, coupon, 'Coupon created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateCoupon(req, res, next) {
    try {
      const { id } = req.params;
      const coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
      if (!coupon) return ApiResponse.notFound(res, 'Coupon not found');
      return ApiResponse.success(res, coupon, 'Coupon updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteCoupon(req, res, next) {
    try {
      const { id } = req.params;
      const coupon = await Coupon.findByIdAndDelete(id);
      if (!coupon) return ApiResponse.notFound(res, 'Coupon not found');
      return ApiResponse.success(res, null, 'Coupon deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CouponController;
