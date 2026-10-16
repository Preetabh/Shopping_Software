const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    attributes: { type: Map, of: String },
    image: { type: String, default: '' }
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
      index: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true
    },
    description: {
      type: String,
      required: true
    },
    highlights: [
      {
        type: String
      }
    ],
    specs: [
      {
        group: { type: String, default: 'General' },
        name: { type: String, required: true },
        value: { type: String, required: true }
      }
    ],
    images: [
      {
        type: String,
        required: true
      }
    ],
    thumbnail: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true
    },
    mrp: {
      type: Number,
      required: true,
      min: 0
    },
    discountPercent: {
      type: Number,
      default: 0,
      index: true
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      index: true
    },
    lowStockThreshold: {
      type: Number,
      default: 5
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    variants: [variantSchema],
    rating: {
      average: { type: Number, default: 4.5, min: 0, max: 5, index: true },
      count: { type: Number, default: 0 }
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    isTrending: {
      type: Boolean,
      default: false,
      index: true
    },
    isDealOfDay: {
      type: Boolean,
      default: false,
      index: true
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    warranty: {
      type: String,
      default: '1 Year Brand Warranty'
    },
    returnPolicy: {
      type: String,
      default: '7 Days Replacement Policy'
    }
  },
  { timestamps: true }
);

// Calculate discount percentage automatically if not provided
productSchema.pre('save', function () {
  if (this.mrp > 0 && this.price > 0 && this.mrp >= this.price) {
    this.discountPercent = Math.round(((this.mrp - this.price) / this.mrp) * 100);
  }
});

productSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
