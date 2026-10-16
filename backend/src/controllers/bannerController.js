const Banner = require('../models/Banner');
const ApiResponse = require('../utils/apiResponse');

class BannerController {
  static async getBanners(req, res, next) {
    try {
      const { position, activeOnly = 'true' } = req.query;
      const filter = {};
      if (activeOnly === 'true') filter.isActive = true;
      if (position) filter.position = position;

      const banners = await Banner.find(filter).sort({ displayOrder: 1, createdAt: -1 }).lean();
      return ApiResponse.success(res, banners);
    } catch (error) {
      next(error);
    }
  }

  static async createBanner(req, res, next) {
    try {
      const banner = await Banner.create(req.body);
      return ApiResponse.created(res, banner, 'Banner created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateBanner(req, res, next) {
    try {
      const { id } = req.params;
      const banner = await Banner.findByIdAndUpdate(id, req.body, { new: true });
      if (!banner) return ApiResponse.notFound(res, 'Banner not found');
      return ApiResponse.success(res, banner, 'Banner updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteBanner(req, res, next) {
    try {
      const { id } = req.params;
      const banner = await Banner.findByIdAndDelete(id);
      if (!banner) return ApiResponse.notFound(res, 'Banner not found');
      return ApiResponse.success(res, null, 'Banner deleted');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BannerController;
