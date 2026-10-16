const Product = require('../models/Product');
const InventoryMovement = require('../models/InventoryMovement');

class InventoryService {
  /**
   * Verify and reserve stock for an order
   */
  static async reserveStock(items, orderId = null, userId = null) {
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Product not found: ${item.title || item.product}`);
      }

      if (item.variantId) {
        const variant = product.variants.id(item.variantId);
        if (!variant) {
          throw new Error(`Variant not found for product: ${product.title}`);
        }
        if (variant.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${product.title} (${variant.name})". Available: ${variant.stock}, Requested: ${item.quantity}`
          );
        }
        const previousStock = variant.stock;
        variant.stock -= item.quantity;
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();

        await InventoryMovement.create({
          product: product._id,
          sku: variant.sku,
          type: 'ORDER_RESERVED',
          quantity: item.quantity,
          previousStock,
          newStock: variant.stock,
          referenceOrder: orderId,
          reason: `Stock reserved for order ${orderId || 'new order'}`,
          performedBy: userId
        });
      } else {
        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${product.title}". Available: ${product.stock}, Requested: ${item.quantity}`
          );
        }
        const previousStock = product.stock;
        product.stock -= item.quantity;
        await product.save();

        await InventoryMovement.create({
          product: product._id,
          sku: product.sku,
          type: 'ORDER_RESERVED',
          quantity: item.quantity,
          previousStock,
          newStock: product.stock,
          referenceOrder: orderId,
          reason: `Stock reserved for order ${orderId || 'new order'}`,
          performedBy: userId
        });
      }
    }
  }

  /**
   * Restock items when an order is cancelled or returned
   */
  static async restockOrder(order, reason = 'Order cancelled', type = 'ORDER_CANCELLED_RESTOCK', userId = null) {
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (!product) continue;

      if (item.variantId) {
        const variant = product.variants.id(item.variantId);
        if (variant) {
          const previousStock = variant.stock;
          variant.stock += item.quantity;
          product.stock += item.quantity;
          await product.save();

          await InventoryMovement.create({
            product: product._id,
            sku: variant.sku,
            type,
            quantity: item.quantity,
            previousStock,
            newStock: variant.stock,
            referenceOrder: order._id,
            reason,
            performedBy: userId
          });
        }
      } else {
        const previousStock = product.stock;
        product.stock += item.quantity;
        await product.save();

        await InventoryMovement.create({
          product: product._id,
          sku: product.sku,
          type,
          quantity: item.quantity,
          previousStock,
          newStock: product.stock,
          referenceOrder: order._id,
          reason,
          performedBy: userId
        });
      }
    }
  }

  /**
   * Manual inventory adjustment from admin panel
   */
  static async adjustStock({ productId, variantId, newStock, reason = 'Manual inventory adjustment', userId }) {
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');

    if (variantId) {
      const variant = product.variants.id(variantId);
      if (!variant) throw new Error('Variant not found');
      const previousStock = variant.stock;
      const difference = newStock - previousStock;
      variant.stock = newStock;
      product.stock += difference;
      await product.save();

      await InventoryMovement.create({
        product: product._id,
        sku: variant.sku,
        type: 'ADJUSTMENT',
        quantity: Math.abs(difference),
        previousStock,
        newStock,
        reason,
        performedBy: userId
      });
      return { product, updatedStock: variant.stock };
    } else {
      const previousStock = product.stock;
      const difference = newStock - previousStock;
      product.stock = newStock;
      await product.save();

      await InventoryMovement.create({
        product: product._id,
        sku: product.sku,
        type: 'ADJUSTMENT',
        quantity: Math.abs(difference),
        previousStock,
        newStock,
        reason,
        performedBy: userId
      });
      return { product, updatedStock: product.stock };
    }
  }
}

module.exports = InventoryService;
