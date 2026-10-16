const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const ApiResponse = require('../utils/apiResponse');

class ProductController {
  static async getProducts(req, res, next) {
    try {
      const {
        search,
        category,
        brand,
        minPrice,
        maxPrice,
        minRating,
        inStock,
        sort = 'popularity',
        page = 1,
        limit = 20,
        dealOfDay,
        trending,
        featured,
        includeArchived
      } = req.query;

      const filter = {};

      if (!includeArchived) {
        filter.isArchived = false;
        filter.isPublished = true;
      }

      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      if (category) {
        // Can be slug or ObjectId
        const catDoc = await Category.findOne({ $or: [{ slug: category }, { _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null }] });
        if (catDoc) {
          filter.$or = [{ category: catDoc._id }, { subCategory: catDoc._id }];
        }
      }

      if (brand) {
        const brandDoc = await Brand.findOne({ $or: [{ slug: brand }, { _id: brand.match(/^[0-9a-fA-F]{24}$/) ? brand : null }] });
        if (brandDoc) {
          filter.brand = brandDoc._id;
        }
      }

      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }

      if (minRating) {
        filter['rating.average'] = { $gte: Number(minRating) };
      }

      if (inStock === 'true' || inStock === true) {
        filter.stock = { $gt: 0 };
      }

      if (dealOfDay === 'true' || dealOfDay === true) {
        filter.isDealOfDay = true;
      }

      if (trending === 'true' || trending === true) {
        filter.isTrending = true;
      }

      if (featured === 'true' || featured === true) {
        filter.isFeatured = true;
      }

      // Sort mapping
      let sortOptions = { createdAt: -1 };
      switch (sort) {
        case 'price_asc':
          sortOptions = { price: 1 };
          break;
        case 'price_desc':
          sortOptions = { price: -1 };
          break;
        case 'rating_desc':
          sortOptions = { 'rating.average': -1, 'rating.count': -1 };
          break;
        case 'discount_desc':
          sortOptions = { discountPercent: -1 };
          break;
        case 'newest':
          sortOptions = { createdAt: -1 };
          break;
        case 'popularity':
        default:
          sortOptions = { 'rating.count': -1, 'rating.average': -1 };
          break;
      }

      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.max(1, parseInt(limit, 10));
      const skip = (pageNum - 1) * limitNum;

      const [products, totalCount] = await Promise.all([
        Product.find(filter)
          .populate('brand', 'name slug logo')
          .populate('category', 'name slug')
          .populate('subCategory', 'name slug')
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Product.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(totalCount / limitNum);

      return ApiResponse.success(res, products, 'Products retrieved successfully', 200, {
        total: totalCount,
        page: pageNum,
        totalPages,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProductBySlugOrId(req, res, next) {
    try {
      const { idOrSlug } = req.params;
      const isObjectId = idOrSlug.match(/^[0-9a-fA-F]{24}$/);

      const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };
      const product = await Product.findOne(query)
        .populate('brand')
        .populate('category')
        .populate('subCategory');

      if (!product) {
        return ApiResponse.notFound(res, 'Product not found');
      }

      // Also fetch related / recommended products in the same category
      const relatedProducts = await Product.find({
        category: product.category._id,
        _id: { $ne: product._id },
        isPublished: true
      })
        .limit(6)
        .lean();

      return ApiResponse.success(res, {
        product,
        relatedProducts
      });
    } catch (error) {
      next(error);
    }
  }

  static async getHomePageSections(req, res, next) {
    try {
      const [dealsOfDay, trendingProducts, featuredProducts, topRated] = await Promise.all([
        Product.find({ isDealOfDay: true, isPublished: true, isArchived: false })
          .populate('brand', 'name')
          .limit(10)
          .lean(),
        Product.find({ isTrending: true, isPublished: true, isArchived: false })
          .populate('brand', 'name')
          .limit(10)
          .lean(),
        Product.find({ isFeatured: true, isPublished: true, isArchived: false })
          .populate('brand', 'name')
          .limit(10)
          .lean(),
        Product.find({ isPublished: true, isArchived: false })
          .sort({ 'rating.average': -1, 'rating.count': -1 })
          .populate('brand', 'name')
          .limit(10)
          .lean()
      ]);

      return ApiResponse.success(res, {
        dealsOfDay,
        trendingProducts,
        featuredProducts,
        topRated
      });
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req, res, next) {
    try {
      const body = { ...req.body };

      // Generate slug if missing
      if (!body.slug && body.title) {
        body.slug = body.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);
      }

      const product = await Product.create(body);
      return ApiResponse.created(res, product, 'Product created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const product = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
      });

      if (!product) {
        return ApiResponse.notFound(res, 'Product not found');
      }

      return ApiResponse.success(res, product, 'Product updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      const product = await Product.findByIdAndDelete(id);
      if (!product) {
        return ApiResponse.notFound(res, 'Product not found');
      }
      return ApiResponse.success(res, null, 'Product deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProductController;
