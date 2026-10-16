const { z } = require('zod');

const productSchema = {
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    brand: z.string().min(1, 'Brand is required'),
    category: z.string().min(1, 'Category is required'),
    subCategory: z.string().optional().nullable(),
    price: z.number().positive('Price must be greater than 0'),
    mrp: z.number().positive('MRP must be greater than 0'),
    stock: z.number().int().nonnegative('Stock cannot be negative'),
    sku: z.string().min(3, 'SKU is required'),
    thumbnail: z.string().min(1, 'Thumbnail image URL is required'),
    images: z.array(z.string()).min(1, 'At least one image is required'),
    highlights: z.array(z.string()).optional(),
    specs: z
      .array(
        z.object({
          group: z.string().default('General'),
          name: z.string(),
          value: z.string()
        })
      )
      .optional(),
    variants: z
      .array(
        z.object({
          name: z.string(),
          sku: z.string(),
          price: z.number().positive(),
          mrp: z.number().positive(),
          stock: z.number().int().nonnegative(),
          attributes: z.record(z.string()).optional(),
          image: z.string().optional()
        })
      )
      .optional(),
    isPublished: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    isTrending: z.boolean().optional(),
    isDealOfDay: z.boolean().optional()
  })
};

module.exports = {
  productSchema
};
