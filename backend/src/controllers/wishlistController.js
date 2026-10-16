const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const ApiResponse = require('../utils/apiResponse');

class WishlistController {
  static async getWishlist(req, res, next) {
    try {
      let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
        path: 'products',
        select: 'title slug thumbnail images price mrp discountPercent stock rating isPublished isArchived'
      });

      if (!wishlist) {
        wishlist = await Wishlist.create({ user: req.user._id, products: [] });
      }

      // Filter out deleted/unpublished
      wishlist.products = wishlist.products.filter((p) => p && p.isPublished && !p.isArchived);

      return ApiResponse.success(res, wishlist.products);
    } catch (error) {
      next(error);
    }
  }

  static async toggleWishlist(req, res, next) {
    try {
      const { productId } = req.body;
      const product = await Product.findById(productId);
      if (!product) return ApiResponse.notFound(res, 'Product not found');

      let wishlist = await Wishlist.findOne({ user: req.user._id });
      if (!wishlist) {
        wishlist = await Wishlist.create({ user: req.user._id, products: [] });
      }

      const exists = wishlist.products.some((id) => String(id) === String(productId));
      if (exists) {
        wishlist.products = wishlist.products.filter((id) => String(id) !== String(productId));
        await wishlist.save();
        return ApiResponse.success(res, { inWishlist: false }, 'Removed from Wishlist');
      } else {
        wishlist.products.push(productId);
        await wishlist.save();
        return ApiResponse.success(res, { inWishlist: true }, 'Added to Wishlist');
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = WishlistController;
