const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    subtitle: {
      type: String,
      default: ''
    },
    imageUrl: {
      type: String,
      required: true
    },
    targetType: {
      type: String,
      enum: ['CATEGORY', 'PRODUCT', 'URL', 'DEAL'],
      default: 'CATEGORY'
    },
    targetValue: {
      type: String,
      default: ''
    },
    position: {
      type: String,
      enum: ['HERO', 'MIDDLE', 'BOTTOM'],
      default: 'HERO',
      index: true
    },
    displayOrder: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    validUntil: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', bannerSchema);
