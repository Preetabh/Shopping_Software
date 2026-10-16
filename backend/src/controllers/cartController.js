const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const OrderService = require('../services/orderService');
const ApiResponse = require('../utils/apiResponse');

class CartController {
  static async getCart(req, res, next) {
    try {
      let cart = await Cart.findOne({ user: req.user._id }).populate({
        path: 'items.product',
        select: 'title slug thumbnail images price mrp stock lowStockThreshold isPublished isArchived'
      });

      if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
      }

      // Filter out products that were deleted or unpublished
      const validItems = cart.items.filter((item) => item.product && item.product.isPublished && !item.product.isArchived);
      if (validItems.length !== cart.items.length) {
        cart.items = validItems;
        await cart.save();
      }

      // Recalculate summary if there are items
      let pricing = {
        subtotal: 0,
        mrpTotal: 0,
        totalDiscount: 0,
        couponDiscount: 0,
        deliveryCharge: 0,
        tax: 0,
        totalAmount: 0
      };

      if (cart.items.length > 0) {
        const calculated = await OrderService.calculateOrderPricing(cart.items, cart.coupon?.code);
        pricing = calculated.pricing;
      }

      return ApiResponse.success(res, {
        items: cart.items,
        coupon: cart.coupon,
        pricing
      });
    } catch (error) {
      next(error);
    }
  }

  static async addToCart(req, res, next) {
    try {
      const { productId, variantId, quantity = 1 } = req.body;
      const product = await Product.findById(productId);

      if (!product || !product.isPublished || product.isArchived) {
        return ApiResponse.badRequest(res, 'Product is unavailable');
      }

      let price = product.price;
      let mrp = product.mrp;
      let variantName = '';
      let availableStock = product.stock;

      if (variantId) {
        const variant = product.variants.id(variantId);
        if (!variant) return ApiResponse.badRequest(res, 'Variant not found');
        price = variant.price;
        mrp = variant.mrp;
        variantName = variant.name;
        availableStock = variant.stock;
      }

      if (availableStock < quantity) {
        return ApiResponse.badRequest(res, `Only ${availableStock} units available in stock`);
      }

      let cart = await Cart.findOne({ user: req.user._id });
      if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
      }

      const existingIndex = cart.items.findIndex(
        (item) => String(item.product) === String(productId) && String(item.variantId || '') === String(variantId || '')
      );

      if (existingIndex > -1) {
        const newQty = cart.items[existingIndex].quantity + Number(quantity);
        if (newQty > availableStock) {
          return ApiResponse.badRequest(res, `Cannot add more than ${availableStock} items`);
        }
        cart.items[existingIndex].quantity = newQty;
      } else {
        cart.items.push({
          product: product._id,
          variantId: variantId || null,
          variantName,
          quantity: Number(quantity),
          price,
          mrp
        });
      }

      await cart.save();
      return ApiResponse.success(res, cart, 'Item added to cart');
    } catch (error) {
      next(error);
    }
  }

  static async updateQuantity(req, res, next) {
    try {
      const { itemId } = req.params;
      const { quantity } = req.body;

      if (quantity < 1) {
        return ApiResponse.badRequest(res, 'Quantity must be at least 1');
      }

      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart) return ApiResponse.notFound(res, 'Cart not found');

      const item = cart.items.id(itemId);
      if (!item) return ApiResponse.notFound(res, 'Cart item not found');

      const product = await Product.findById(item.product);
      if (!product) return ApiResponse.badRequest(res, 'Product not found');

      let availableStock = product.stock;
      if (item.variantId) {
        const variant = product.variants.id(item.variantId);
        if (variant) availableStock = variant.stock;
      }

      if (quantity > availableStock) {
        return ApiResponse.badRequest(res, `Only ${availableStock} units available in stock`);
      }

      item.quantity = Number(quantity);
      await cart.save();

      return ApiResponse.success(res, cart, 'Cart updated');
    } catch (error) {
      next(error);
    }
  }

  static async removeFromCart(req, res, next) {
    try {
      const { itemId } = req.params;
      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart) return ApiResponse.notFound(res, 'Cart not found');

      cart.items = cart.items.filter((item) => String(item._id) !== String(itemId));
      await cart.save();

      return ApiResponse.success(res, cart, 'Item removed from cart');
    } catch (error) {
      next(error);
    }
  }

  static async applyCoupon(req, res, next) {
    try {
      const { code } = req.body;
      const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        isActive: true,
        endDate: { $gte: new Date() }
      });

      if (!coupon) {
        return ApiResponse.badRequest(res, 'Invalid or expired coupon code');
      }

      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart || cart.items.length === 0) {
        return ApiResponse.badRequest(res, 'Cart is empty');
      }

      const calculated = await OrderService.calculateOrderPricing(cart.items, coupon.code);
      if (calculated.pricing.couponDiscount <= 0) {
        return ApiResponse.badRequest(res, `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`);
      }

      cart.coupon = {
        code: coupon.code,
        discountAmount: calculated.pricing.couponDiscount,
        couponId: coupon._id
      };
      await cart.save();

      return ApiResponse.success(res, { coupon: cart.coupon, pricing: calculated.pricing }, `Coupon "${coupon.code}" applied! You saved ₹${calculated.pricing.couponDiscount}`);
    } catch (error) {
      next(error);
    }
  }

  static async removeCoupon(req, res, next) {
    try {
      const cart = await Cart.findOne({ user: req.user._id });
      if (cart) {
        cart.coupon = { code: null, discountAmount: 0, couponId: null };
        await cart.save();
      }
      return ApiResponse.success(res, null, 'Coupon removed');
    } catch (error) {
      next(error);
    }
  }

  static async clearCart(req, res, next) {
    try {
      const cart = await Cart.findOne({ user: req.user._id });
      if (cart) {
        cart.items = [];
        cart.coupon = { code: null, discountAmount: 0, couponId: null };
        await cart.save();
      }
      return ApiResponse.success(res, null, 'Cart cleared');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CartController;
