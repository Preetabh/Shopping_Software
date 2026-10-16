const { z } = require('zod');

const createOrderSchema = {
  body: z.object({
    addressId: z.string().min(1, 'Delivery address is required'),
    paymentMethod: z.enum(['COD', 'ONLINE_RAZORPAY']),
    couponCode: z.string().optional().nullable()
  })
};

const updateOrderStatusSchema = {
  body: z.object({
    status: z.enum([
      'PLACED',
      'CONFIRMED',
      'PACKED',
      'SHIPPED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
      'RETURN_REQUESTED',
      'RETURN_APPROVED',
      'RETURN_REJECTED',
      'RETURNED'
    ]),
    note: z.string().optional(),
    location: z.string().optional(),
    trackingNumber: z.string().optional(),
    courierName: z.string().optional()
  })
};

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema
};
