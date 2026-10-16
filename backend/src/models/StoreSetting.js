const mongoose = require('mongoose');

const storeSettingSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: 'Aurelia Luxe'
    },
    supportEmail: {
      type: String,
      default: 'concierge@aurelia-luxe.com'
    },
    supportPhone: {
      type: String,
      default: '+91 1800 202 9898'
    },
    taxRatePercent: {
      type: Number,
      default: 18
    },
    freeShippingThreshold: {
      type: Number,
      default: 500
    },
    standardDeliveryCharge: {
      type: Number,
      default: 40
    },
    codEnabled: {
      type: Boolean,
      default: true
    },
    razorpayKeyId: {
      type: String,
      default: 'rzp_test_flipkart_demo_key'
    },
    maintenanceMode: {
      type: Boolean,
      default: false
    },
    announcementBanner: {
      enabled: { type: Boolean, default: true },
      text: { type: String, default: 'Exclusive Autumn Soirée Privilège! Complimentary Concierge & Courtesy Savings with code AURELIA10.' }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('StoreSetting', storeSettingSchema);
