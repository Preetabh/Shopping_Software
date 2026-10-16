const { z } = require('zod');

const couponSchema = {
  body: z.object({
    code: z.string().min(3).max(20).toUpperCase(),
    description: z.string().min(5),
    discountType: z.enum(['PERCENTAGE', 'FIXED']),
    discountValue: z.number().positive(),
    minOrderAmount: z.number().nonnegative().default(0),
    maxDiscount: z.number().positive().optional().nullable(),
    startDate: z.string().or(z.date()).optional(),
    endDate: z.string().or(z.date()),
    usageLimit: z.number().int().positive().default(1000),
    perUserLimit: z.number().int().positive().default(1),
    isActive: z.boolean().default(true)
  })
};

module.exports = {
  couponSchema
};
