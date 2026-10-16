const Category = require('../models/Category');
const ApiResponse = require('../utils/apiResponse');

class CategoryController {
  static async getCategories(req, res, next) {
    try {
      const { parent, activeOnly = 'true' } = req.query;
      const filter = {};

      if (activeOnly === 'true') {
        filter.isActive = true;
      }

      if (parent === 'root') {
        filter.parent = null;
      } else if (parent) {
        filter.parent = parent;
      }

      const categories = await Category.find(filter)
        .populate('parent', 'name slug')
        .sort({ displayOrder: 1, name: 1 })
        .lean();

      return ApiResponse.success(res, categories);
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryTree(req, res, next) {
    try {
      const allCategories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 }).lean();

      const buildTree = (parentId = null) => {
        return allCategories
          .filter((cat) => String(cat.parent || null) === String(parentId))
          .map((cat) => ({
            ...cat,
            children: buildTree(cat._id)
          }));
      };

      const tree = buildTree(null);
      return ApiResponse.success(res, tree);
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req, res, next) {
    try {
      const { name, slug, image, parent, description, isFeatured, displayOrder } = req.body;
      const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      const category = await Category.create({
        name,
        slug: categorySlug,
        image,
        parent: parent || null,
        description,
        isFeatured: isFeatured || false,
        displayOrder: displayOrder || 0
      });

      return ApiResponse.created(res, category, 'Category created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
      if (!category) return ApiResponse.notFound(res, 'Category not found');
      return ApiResponse.success(res, category, 'Category updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      const category = await Category.findByIdAndDelete(id);
      if (!category) return ApiResponse.notFound(res, 'Category not found');
      return ApiResponse.success(res, null, 'Category deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CategoryController;
