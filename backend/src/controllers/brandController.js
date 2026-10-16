const Brand = require('../models/Brand');
const ApiResponse = require('../utils/apiResponse');

class BrandController {
  static async getBrands(req, res, next) {
    try {
      const { activeOnly = 'true' } = req.query;
      const filter = activeOnly === 'true' ? { isActive: true } : {};
      const brands = await Brand.find(filter).sort({ name: 1 }).lean();
      return ApiResponse.success(res, brands);
    } catch (error) {
      next(error);
    }
  }

  static async createBrand(req, res, next) {
    try {
      const { name, slug, logo, description } = req.body;
      const brandSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      const brand = await Brand.create({
        name,
        slug: brandSlug,
        logo,
        description
      });

      return ApiResponse.created(res, brand, 'Brand created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateBrand(req, res, next) {
    try {
      const { id } = req.params;
      const brand = await Brand.findByIdAndUpdate(id, req.body, { new: true });
      if (!brand) return ApiResponse.notFound(res, 'Brand not found');
      return ApiResponse.success(res, brand, 'Brand updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteBrand(req, res, next) {
    try {
      const { id } = req.params;
      const brand = await Brand.findByIdAndDelete(id);
      if (!brand) return ApiResponse.notFound(res, 'Brand not found');
      return ApiResponse.success(res, null, 'Brand deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BrandController;
