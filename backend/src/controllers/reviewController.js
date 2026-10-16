const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const ApiResponse = require('../utils/apiResponse');

class ReviewController {
  static async getProductReviews(req, res, next) {
    try {
      const { productId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.max(1, parseInt(limit, 10));
      const skip = (pageNum - 1) * limitNum;

      const [reviews, total] = await Promise.all([
        Review.find({ product: productId, status: 'APPROVED' })
          .populate('user', 'name avatar')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Review.countDocuments({ product: productId, status: 'APPROVED' })
      ]);

      return ApiResponse.success(res, reviews, 'Reviews retrieved', 200, {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
      });
    } catch (error) {
      next(error);
    }
  }

  static async addReview(req, res, next) {
    try {
      const { productId, rating, title, comment, images } = req.body;

      const product = await Product.findById(productId);
      if (!product) return ApiResponse.notFound(res, 'Product not found');

      // Check verified purchase
      const hasPurchased = await Order.findOne({
        user: req.user._id,
        'items.product': productId,
        orderStatus: 'DELIVERED'
      });

      const review = await Review.create({
        product: productId,
        user: req.user._id,
        order: hasPurchased ? hasPurchased._id : null,
        rating: Number(rating),
        title,
        comment,
        images: images || [],
        isVerifiedPurchase: !!hasPurchased,
        status: 'APPROVED' // Auto-approve or set to PENDING for strict moderation
      });

      // Recalculate product average rating
      const allReviews = await Review.find({ product: productId, status: 'APPROVED' });
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      product.rating = {
        average: parseFloat(avg.toFixed(1)),
        count: allReviews.length
      };
      await product.save();

      return ApiResponse.created(res, review, 'Review submitted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getAllReviews(req, res, next) {
    try {
      const { status, page = 1, limit = 15 } = req.query;
      const filter = status ? { status } : {};

      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.max(1, parseInt(limit, 10));
      const skip = (pageNum - 1) * limitNum;

      const [reviews, total] = await Promise.all([
        Review.find(filter)
          .populate('user', 'name email')
          .populate('product', 'title thumbnail')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Review.countDocuments(filter)
      ]);

      return ApiResponse.success(res, reviews, 'All reviews retrieved for moderation', 200, {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateReviewStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const review = await Review.findByIdAndUpdate(id, { status }, { new: true });
      if (!review) return ApiResponse.notFound(res, 'Review not found');

      // Update product rating
      const allApproved = await Review.find({ product: review.product, status: 'APPROVED' });
      const avg = allApproved.length > 0 ? allApproved.reduce((sum, r) => sum + r.rating, 0) / allApproved.length : 0;
      await Product.findByIdAndUpdate(review.product, {
        'rating.average': parseFloat(avg.toFixed(1)),
        'rating.count': allApproved.length
      });

      return ApiResponse.success(res, review, `Review marked as ${status}`);
    } catch (error) {
      next(error);
    }
  }

  static async deleteReview(req, res, next) {
    try {
      const { id } = req.params;
      const review = await Review.findByIdAndDelete(id);
      if (!review) return ApiResponse.notFound(res, 'Review not found');
      return ApiResponse.success(res, null, 'Review deleted');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReviewController;
