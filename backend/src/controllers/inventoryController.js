const Product = require('../models/Product');
const InventoryMovement = require('../models/InventoryMovement');
const InventoryService = require('../services/inventoryService');
const ApiResponse = require('../utils/apiResponse');

class InventoryController {
  static async getInventory(req, res, next) {
    try {
      const { search, lowStockOnly, page = 1, limit = 15 } = req.query;
      const filter = { isArchived: false };

      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } }
        ];
      }

      if (lowStockOnly === 'true') {
        filter.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
      }

      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.max(1, parseInt(limit, 10));
      const skip = (pageNum - 1) * limitNum;

      const [products, total] = await Promise.all([
        Product.find(filter)
          .select('title sku stock lowStockThreshold price category brand thumbnail variants')
          .populate('brand', 'name')
          .populate('category', 'name')
          .sort({ stock: 1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Product.countDocuments(filter)
      ]);

      return ApiResponse.success(res, products, 'Inventory fetched', 200, {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
      });
    } catch (error) {
      next(error);
    }
  }

  static async adjustStock(req, res, next) {
    try {
      const { productId, variantId, newStock, reason } = req.body;
      const result = await InventoryService.adjustStock({
        productId,
        variantId,
        newStock: Number(newStock),
        reason,
        userId: req.user._id
      });

      return ApiResponse.success(res, result, 'Stock updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getMovements(req, res, next) {
    try {
      const { productId, type, page = 1, limit = 20 } = req.query;
      const filter = {};
      if (productId) filter.product = productId;
      if (type) filter.type = type;

      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.max(1, parseInt(limit, 10));
      const skip = (pageNum - 1) * limitNum;

      const [movements, total] = await Promise.all([
        InventoryMovement.find(filter)
          .populate('product', 'title thumbnail')
          .populate('performedBy', 'name email')
          .populate('referenceOrder', 'orderNumber')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        InventoryMovement.countDocuments(filter)
      ]);

      return ApiResponse.success(res, movements, 'Inventory movements retrieved', 200, {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = InventoryController;
