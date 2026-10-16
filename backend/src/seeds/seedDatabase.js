const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const env = require('../config/env');
const { ROLES, PERMISSIONS, ORDER_STATUS, PAYMENT_METHODS, PAYMENT_STATUS, SUPPORT_STATUS } = require('../config/constants');

// Models
const Role = require('../models/Role');
const User = require('../models/User');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Banner = require('../models/Banner');
const Address = require('../models/Address');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const SupportTicket = require('../models/SupportTicket');
const StoreSetting = require('../models/StoreSetting');
const InventoryMovement = require('../models/InventoryMovement');
const AuditLog = require('../models/AuditLog');

async function seedDatabase() {
  console.log(' Connecting to MongoDB Atlas for database seeding...');
  await mongoose.connect(env.MONGO_URI, { dbName: 'flipkart_store' });
  console.log(' Connected to MongoDB!');

  console.log(' Clearing old data...');
  await Promise.all([
    Role.deleteMany({}),
    User.deleteMany({}),
    Category.deleteMany({}),
    Brand.deleteMany({}),
    Product.deleteMany({}),
    Coupon.deleteMany({}),
    Banner.deleteMany({}),
    Address.deleteMany({}),
    Order.deleteMany({}),
    Payment.deleteMany({}),
    Review.deleteMany({}),
    SupportTicket.deleteMany({}),
    StoreSetting.deleteMany({}),
    InventoryMovement.deleteMany({}),
    AuditLog.deleteMany({})
  ]);

  console.log(' Seeding Roles & Permissions...');
  const roles = await Role.insertMany([
    {
      name: 'Super Administrator',
      code: ROLES.SUPER_ADMIN,
      permissions: [PERMISSIONS.ALL],
      description: 'Universal administrative access to all modules and configurations',
      isSystem: true
    },
    {
      name: 'Administrator',
      code: ROLES.ADMIN,
      permissions: [
        PERMISSIONS.PRODUCTS_READ,
        PERMISSIONS.PRODUCTS_WRITE,
        PERMISSIONS.PRODUCTS_DELETE,
        PERMISSIONS.CATEGORIES_MANAGE,
        PERMISSIONS.ORDERS_READ,
        PERMISSIONS.ORDERS_MANAGE,
        PERMISSIONS.CUSTOMERS_READ,
        PERMISSIONS.CUSTOMERS_MANAGE,
        PERMISSIONS.INVENTORY_MANAGE,
        PERMISSIONS.COUPONS_MANAGE,
        PERMISSIONS.REVIEWS_MANAGE,
        PERMISSIONS.SUPPORT_MANAGE,
        PERMISSIONS.BANNERS_MANAGE,
        PERMISSIONS.REPORTS_READ,
        PERMISSIONS.SETTINGS_MANAGE,
        PERMISSIONS.LOGS_READ
      ],
      description: 'System administrator with broad management access',
      isSystem: true
    },
    {
      name: 'Product Manager',
      code: ROLES.PRODUCT_MANAGER,
      permissions: [
        PERMISSIONS.PRODUCTS_READ,
        PERMISSIONS.PRODUCTS_WRITE,
        PERMISSIONS.PRODUCTS_DELETE,
        PERMISSIONS.CATEGORIES_MANAGE,
        PERMISSIONS.INVENTORY_MANAGE,
        PERMISSIONS.REPORTS_READ
      ],
      description: 'Manages product catalog, taxonomy, and stock levels',
      isSystem: true
    },
    {
      name: 'Order Manager',
      code: ROLES.ORDER_MANAGER,
      permissions: [
        PERMISSIONS.ORDERS_READ,
        PERMISSIONS.ORDERS_MANAGE,
        PERMISSIONS.CUSTOMERS_READ,
        PERMISSIONS.REPORTS_READ
      ],
      description: 'Handles orders, shipments, delivery tracking and return requests',
      isSystem: true
    },
    {
      name: 'Customer Support Agent',
      code: ROLES.SUPPORT_AGENT,
      permissions: [
        PERMISSIONS.SUPPORT_MANAGE,
        PERMISSIONS.REVIEWS_MANAGE,
        PERMISSIONS.CUSTOMERS_READ,
        PERMISSIONS.ORDERS_READ
      ],
      description: 'Manages support tickets, user reviews moderation and inquiries',
      isSystem: true
    },
    {
      name: 'Customer',
      code: ROLES.CUSTOMER,
      permissions: [],
      description: 'Standard consumer account with cart and checkout access',
      isSystem: true
    }
  ]);

  const roleMap = {};
  roles.forEach((r) => {
    roleMap[r.code] = r._id;
  });

  console.log(' Seeding Users (Admin, Staff, Customers)...');
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const users = await User.insertMany([
    {
      name: 'Vikram Mehta (Super Admin)',
      email: 'superadmin@flipkart.com',
      phone: '9800000001',
      password: hashedPassword,
      role: ROLES.SUPER_ADMIN,
      roleRef: roleMap[ROLES.SUPER_ADMIN],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      isVerified: true
    },
    {
      name: 'Ananya Roy (Store Admin)',
      email: 'admin@flipkart.com',
      phone: '9800000002',
      password: hashedPassword,
      role: ROLES.ADMIN,
      roleRef: roleMap[ROLES.ADMIN],
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
      isVerified: true
    },
    {
      name: 'Rohan Gupta (Product Manager)',
      email: 'products@flipkart.com',
      phone: '9800000003',
      password: hashedPassword,
      role: ROLES.PRODUCT_MANAGER,
      roleRef: roleMap[ROLES.PRODUCT_MANAGER],
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      isVerified: true
    },
    {
      name: 'Suresh Kumar (Order Manager)',
      email: 'orders@flipkart.com',
      phone: '9800000004',
      password: hashedPassword,
      role: ROLES.ORDER_MANAGER,
      roleRef: roleMap[ROLES.ORDER_MANAGER],
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      isVerified: true
    },
    {
      name: 'Sneha Verma (Support Agent)',
      email: 'support@flipkart.com',
      phone: '9800000005',
      password: hashedPassword,
      role: ROLES.SUPPORT_AGENT,
      roleRef: roleMap[ROLES.SUPPORT_AGENT],
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      isVerified: true
    },
    {
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      phone: '9876543210',
      password: hashedPassword,
      role: ROLES.CUSTOMER,
      roleRef: roleMap[ROLES.CUSTOMER],
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      isVerified: true
    },
    {
      name: 'Priya Patel',
      email: 'priya.patel@example.com',
      phone: '9876543211',
      password: hashedPassword,
      role: ROLES.CUSTOMER,
      roleRef: roleMap[ROLES.CUSTOMER],
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
      isVerified: true
    }
  ]);

  const customerUser = users.find((u) => u.email === 'rahul.sharma@example.com');
  const superAdminUser = users.find((u) => u.email === 'superadmin@flipkart.com');

  console.log(' Seeding Brands...');
  const brands = await Brand.insertMany([
    { name: 'Apple', slug: 'apple', logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=200&q=80' },
    { name: 'Samsung', slug: 'samsung', logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=200&q=80' },
    { name: 'Sony', slug: 'sony', logo: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=200&q=80' },
    { name: 'Nike', slug: 'nike', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80' },
    { name: 'Asus', slug: 'asus', logo: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=200&q=80' },
    { name: 'Xiaomi', slug: 'xiaomi', logo: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=200&q=80' },
    { name: 'Puma', slug: 'puma', logo: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=200&q=80' },
    { name: 'Philips', slug: 'philips', logo: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=200&q=80' },
    { name: 'LG', slug: 'lg', logo: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=200&q=80' },
    { name: 'OnePlus', slug: 'oneplus', logo: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=200&q=80' }
  ]);

  const brandMap = {};
  brands.forEach((b) => {
    brandMap[b.slug] = b._id;
  });

  console.log(' Seeding Hierarchical Categories...');
  const mainCategories = await Category.insertMany([
    {
      name: 'Mobiles & Tablets',
      slug: 'mobiles',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=80',
      isFeatured: true,
      displayOrder: 1
    },
    {
      name: 'Electronics & Audio',
      slug: 'electronics',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80',
      isFeatured: true,
      displayOrder: 2
    },
    {
      name: 'Fashion & Footwear',
      slug: 'fashion',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=300&q=80',
      isFeatured: true,
      displayOrder: 3
    },
    {
      name: 'Home & Kitchen',
      slug: 'home-kitchen',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=300&q=80',
      isFeatured: true,
      displayOrder: 4
    },
    {
      name: 'TVs & Appliances',
      slug: 'appliances',
      image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=300&q=80',
      isFeatured: true,
      displayOrder: 5
    },
    {
      name: 'Beauty & Personal Care',
      slug: 'beauty',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80',
      isFeatured: true,
      displayOrder: 6
    }
  ]);

  const catMap = {};
  mainCategories.forEach((c) => {
    catMap[c.slug] = c._id;
  });

  // Subcategories
  const subCategories = await Category.insertMany([
    { name: 'Smartphones', slug: 'smartphones', parent: catMap['mobiles'], level: 1 },
    { name: 'Tablets & iPads', slug: 'tablets', parent: catMap['mobiles'], level: 1 },
    { name: 'Laptops & Computers', slug: 'laptops', parent: catMap['electronics'], level: 1 },
    { name: 'Headphones & Earbuds', slug: 'headphones', parent: catMap['electronics'], level: 1 },
    { name: 'Smart Watches', slug: 'smartwatches', parent: catMap['electronics'], level: 1 },
    { name: "Men's Sneakers", slug: 'mens-sneakers', parent: catMap['fashion'], level: 1 },
    { name: "Women's Apparel", slug: 'womens-apparel', parent: catMap['fashion'], level: 1 },
    { name: 'Kitchen Appliances', slug: 'kitchen-appliances', parent: catMap['home-kitchen'], level: 1 },
    { name: 'Smart Televisions', slug: 'smart-tvs', parent: catMap['appliances'], level: 1 }
  ]);

  subCategories.forEach((s) => {
    catMap[s.slug] = s._id;
  });

  console.log(' Seeding Products with Rich Specs, Variants and Images...');
  const products = await Product.insertMany([
    {
      title: 'Apple iPhone 15 Pro (128 GB) - Natural Titanium',
      slug: 'apple-iphone-15-pro-128gb-natural-titanium',
      brand: brandMap['apple'],
      category: catMap['mobiles'],
      subCategory: catMap['smartphones'],
      description: 'Experience the revolutionary Apple iPhone 15 Pro forged in titanium and featuring the groundbreaking A17 Pro chip, customizable Action button, and the most versatile Pro camera system yet with 48MP resolution.',
      highlights: [
        '128 GB ROM | 15.49 cm (6.1 inch) Super Retina XDR Display',
        '48MP + 12MP + 12MP | 12MP Front Camera',
        'A17 Pro Chip, 6 Core Processor',
        'Aerospace-Grade Titanium Design with Ceramic Shield Front'
      ],
      specs: [
        { group: 'Display Features', name: 'Display Size', value: '6.1 inch' },
        { group: 'Display Features', name: 'Resolution', value: '2556 x 1179 Pixels' },
        { group: 'Processor', name: 'Processor Chip', value: 'A17 Pro Bionic' },
        { group: 'Memory', name: 'Internal Storage', value: '128 GB' },
        { group: 'Camera', name: 'Primary Camera', value: '48MP + 12MP + 12MP' }
      ],
      images: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
      price: 124999,
      mrp: 134900,
      discountPercent: 7,
      stock: 35,
      lowStockThreshold: 5,
      sku: 'IPHONE15PRO-128-NAT',
      variants: [
        { name: '128GB - Natural Titanium', sku: 'IPH15P-128-NAT', price: 124999, mrp: 134900, stock: 20 },
        { name: '256GB - Blue Titanium', sku: 'IPH15P-256-BLU', price: 134999, mrp: 144900, stock: 15 }
      ],
      rating: { average: 4.8, count: 1248 },
      isPublished: true,
      isFeatured: true,
      isTrending: true,
      isDealOfDay: true,
      tags: ['smartphone', 'apple', 'iphone', '5g', 'flagship']
    },
    {
      title: 'Samsung Galaxy S24 Ultra 5G (Titanium Gray, 256 GB) (12 GB RAM)',
      slug: 'samsung-galaxy-s24-ultra-5g-titanium-gray-256gb',
      brand: brandMap['samsung'],
      category: catMap['mobiles'],
      subCategory: catMap['smartphones'],
      description: 'Meet Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with a new titanium exterior and a 17.25 cm (6.8 inch) flat display. Armed with Galaxy AI to amplify your productivity and photography.',
      highlights: [
        '12 GB RAM | 256 GB ROM',
        '17.27 cm (6.8 inch) Quad HD+ Dynamic AMOLED 2X Display',
        '200MP + 50MP + 12MP + 10MP | 12MP Front Camera',
        '5000 mAh Battery | Snapdragon 8 Gen 3 Processor'
      ],
      specs: [
        { group: 'General', name: 'Model Name', value: 'Galaxy S24 Ultra 5G' },
        { group: 'Display Features', name: 'Display Size', value: '6.8 inch' },
        { group: 'Processor', name: 'Processor', value: 'Snapdragon 8 Gen 3 Mobile Platform' },
        { group: 'Camera', name: 'Primary Camera', value: '200MP Quad Tele System' }
      ],
      images: [
        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1584006682522-dc17d6c0d963?auto=format&fit=crop&w=800&q=80'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80',
      price: 119999,
      mrp: 134999,
      discountPercent: 11,
      stock: 28,
      lowStockThreshold: 5,
      sku: 'SAMS24U-256-GRY',
      variants: [
        { name: '12GB/256GB - Titanium Gray', sku: 'S24U-256-GRY', price: 119999, mrp: 134999, stock: 18 },
        { name: '12GB/512GB - Titanium Black', sku: 'S24U-512-BLK', price: 129999, mrp: 144999, stock: 10 }
      ],
      rating: { average: 4.7, count: 890 },
      isPublished: true,
      isFeatured: true,
      isTrending: true,
      tags: ['samsung', 'galaxy', 's24', 'android', 'flagship']
    },
    {
      title: 'Sony WH-1000XM5 Wireless Active Noise Cancelling Headphones - Silver',
      slug: 'sony-wh-1000xm5-wireless-noise-cancelling-headphones-silver',
      brand: brandMap['sony'],
      category: catMap['electronics'],
      subCategory: catMap['headphones'],
      description: 'Industry-leading noise cancellation with 8 microphones and Auto NC Optimizer. Magnificently engineered for high-resolution audio with 30-hour battery life and ultra-comfortable lightweight design.',
      highlights: [
        'Industry-Leading Noise Cancellation with 2 processors and 8 microphones',
        'Up to 30 Hours Battery Life with Quick Charging (3 min for 3 hours)',
        'Crystal Clear Hands-Free Calling with 4 beamforming microphones',
        'Multipoint Connection lets you switch between devices seamlessly'
      ],
      specs: [
        { group: 'Audio', name: 'Driver Unit', value: '30 mm Carbon Fiber' },
        { group: 'Connectivity', name: 'Bluetooth Version', value: 'v5.2' },
        { group: 'Battery', name: 'Playback Time', value: 'Up to 30 Hours' }
      ],
      images: [
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
      price: 26990,
      mrp: 34990,
      discountPercent: 23,
      stock: 45,
      lowStockThreshold: 8,
      sku: 'SONY-XM5-SLV',
      rating: { average: 4.8, count: 2150 },
      isPublished: true,
      isFeatured: true,
      isDealOfDay: true,
      tags: ['sony', 'headphones', 'anc', 'wireless', 'bluetooth']
    },
    {
      title: 'ASUS ROG Zephyrus G16 (2026) OLED Gaming Laptop (Intel Core Ultra 9 / RTX 4070 / 32GB / 1TB)',
      slug: 'asus-rog-zephyrus-g16-gaming-laptop-rtx-4070',
      brand: brandMap['asus'],
      category: catMap['electronics'],
      subCategory: catMap['laptops'],
      description: 'The Zephyrus G16 combines precision CNC aluminum chassis with an awe-inspiring 2.5K 240Hz OLED ROG Nebula display, Intel Core Ultra 9 processor, and NVIDIA GeForce RTX 4070 GPU.',
      highlights: [
        'Intel Core Ultra 9 185H Processor (up to 5.1 GHz)',
        '32 GB LPDDR5X RAM | 1 TB PCIe 4.0 NVMe SSD',
        'NVIDIA GeForce RTX 4070 Graphics (8GB GDDR6)',
        '16.0-inch 2.5K (2560 x 1600) OLED 240Hz 0.2ms Display'
      ],
      specs: [
        { group: 'Processor', name: 'Processor', value: 'Intel Core Ultra 9 185H' },
        { group: 'Graphics', name: 'Dedicated GPU', value: 'NVIDIA RTX 4070 (8GB)' },
        { group: 'Memory & Storage', name: 'RAM', value: '32 GB LPDDR5X' },
        { group: 'Display', name: 'Screen Type', value: 'ROG Nebula OLED 240Hz' }
      ],
      images: [
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
      price: 189990,
      mrp: 229990,
      discountPercent: 17,
      stock: 12,
      lowStockThreshold: 3,
      sku: 'ROG-G16-RTX4070',
      rating: { average: 4.9, count: 320 },
      isPublished: true,
      isFeatured: true,
      tags: ['asus', 'rog', 'laptop', 'gaming', 'rtx4070']
    },
    {
      title: 'Nike Air Force 1 07 Low Sneakers - Triple White',
      slug: 'nike-air-force-1-07-low-sneakers-triple-white',
      brand: brandMap['nike'],
      category: catMap['fashion'],
      subCategory: catMap['mens-sneakers'],
      description: 'The radiance lives on in the Nike Air Force 1 07, the basketball icon that puts a fresh spin on what you know best: crisp leather, bold colors and the perfect amount of flash.',
      highlights: [
        'Stitched leather overlays on upper add heritage style and durability',
        'Originally designed for performance hoops, Nike Air cushioning adds lightweight comfort',
        'Low-cut silhouette creates a clean, streamlined look',
        'Padded collar feels soft and comfortable'
      ],
      specs: [
        { group: 'Footwear Details', name: 'Upper Material', value: 'Genuine Leather' },
        { group: 'Footwear Details', name: 'Sole Material', value: 'Non-marking Rubber' },
        { group: 'General', name: 'Color', value: 'White / White' }
      ],
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
      price: 7495,
      mrp: 9695,
      discountPercent: 23,
      stock: 60,
      lowStockThreshold: 10,
      sku: 'NIKE-AF1-07-WHT',
      variants: [
        { name: 'UK 8', sku: 'AF1-UK8', price: 7495, mrp: 9695, stock: 20 },
        { name: 'UK 9', sku: 'AF1-UK9', price: 7495, mrp: 9695, stock: 25 },
        { name: 'UK 10', sku: 'AF1-UK10', price: 7495, mrp: 9695, stock: 15 }
      ],
      rating: { average: 4.6, count: 4210 },
      isPublished: true,
      isFeatured: true,
      isTrending: true,
      tags: ['nike', 'sneakers', 'shoes', 'fashion', 'streetwear']
    },
    {
      title: 'Puma Velocity NITRO 3 Running Shoes For Men',
      slug: 'puma-velocity-nitro-3-running-shoes-men',
      brand: brandMap['puma'],
      category: catMap['fashion'],
      subCategory: catMap['mens-sneakers'],
      description: 'With the Velocity NITRO 3, we take the industry standard for lightweight daily running shoes to an even higher level. Featuring NITRO advanced nitrogen-injected foam technology.',
      highlights: [
        'NITRO: Advanced nitrogen-injected foam for superior responsiveness and cushioning',
        'PUMAGRIP: Durable performance rubber compound designed for all-surface traction',
        'Breathable engineered mesh upper'
      ],
      specs: [
        { group: 'Performance', name: 'Activity', value: 'Road Running / Training' },
        { group: 'Technology', name: 'Cushioning', value: 'NITRO Foam Cushioning' }
      ],
      images: [
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80',
      price: 5999,
      mrp: 11999,
      discountPercent: 50,
      stock: 40,
      lowStockThreshold: 10,
      sku: 'PUMA-VELO-NITRO3',
      rating: { average: 4.5, count: 910 },
      isPublished: true,
      isDealOfDay: true,
      tags: ['puma', 'running', 'shoes', 'nitro']
    },
    {
      title: 'Philips Digital Air Fryer HD9252/90 (4.1L Capacity, 1400W, Touch Panel)',
      slug: 'philips-digital-air-fryer-hd9252-90',
      brand: brandMap['philips'],
      category: catMap['home-kitchen'],
      subCategory: catMap['kitchen-appliances'],
      description: 'Healthy frying with Rapid Air technology. Delicious fries with up to 90% less fat. Touch screen with 7 presets for easy cooking, keep warm function and dishwasher safe parts.',
      highlights: [
        'Rapid Air Technology with unique Starfish design for even cooking',
        '4.1 Liter Pan Capacity with 0.8kg Basket',
        'Touch screen with 7 preset programs (Fries, Meat, Fish, Chicken, Baking)',
        'Automatic shut-off, Cool wall exterior'
      ],
      specs: [
        { group: 'General', name: 'Power Consumption', value: '1400 W' },
        { group: 'Capacity', name: 'Capacity', value: '4.1 Liters' },
        { group: 'Control', name: 'Control Type', value: 'Digital Touch Screen' }
      ],
      images: [
        'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80',
      price: 7999,
      mrp: 12995,
      discountPercent: 38,
      stock: 35,
      lowStockThreshold: 5,
      sku: 'PHILIPS-AIRFRYER-9252',
      rating: { average: 4.6, count: 5320 },
      isPublished: true,
      isDealOfDay: true,
      tags: ['philips', 'kitchen', 'airfryer', 'appliance', 'healthy']
    },
    {
      title: 'LG 55 Inch OLED 4K Ultra HD Smart Cinema TV (OLED55C3PSA)',
      slug: 'lg-55-inch-oled-4k-smart-tv-c3',
      brand: brandMap['lg'],
      category: catMap['appliances'],
      subCategory: catMap['smart-tvs'],
      description: 'Self-lit pixels emit their own light for perfect black and infinite contrast. Powered by the α9 AI Processor Gen6, Dolby Vision IQ and Dolby Atmos for true cinema immersion.',
      highlights: [
        'Ultra HD (4K) 3840 x 2160 Pixels | 120 Hz Native Refresh Rate',
        'α9 Gen6 AI Processor 4K for ultimate picture & sound upscaling',
        '40 W Sound Output | Dolby Atmos & Dolby Vision IQ',
        '4 HDMI 2.1 Ports with VRR, ALLM, G-Sync & FreeSync for elite gaming'
      ],
      specs: [
        { group: 'Display', name: 'Screen Size', value: '55 inch (139 cm)' },
        { group: 'Display', name: 'Panel Type', value: 'OLED evo 4K' },
        { group: 'Smart Features', name: 'Operating System', value: 'webOS 24 with AI ThinQ' }
      ],
      images: [
        'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=600&q=80',
      price: 114990,
      mrp: 174990,
      discountPercent: 34,
      stock: 18,
      lowStockThreshold: 4,
      sku: 'LG-OLED55-C3',
      rating: { average: 4.8, count: 1420 },
      isPublished: true,
      isFeatured: true,
      tags: ['lg', 'oled', 'smart tv', '4k', 'cinema']
    },
    {
      title: 'OnePlus 12 (Flowy Emerald, 16GB RAM, 512GB Storage)',
      slug: 'oneplus-12-flowy-emerald-16gb-512gb',
      brand: brandMap['oneplus'],
      category: catMap['mobiles'],
      subCategory: catMap['smartphones'],
      description: 'Powered by Snapdragon 8 Gen 3 with 4th Gen Hasselblad Camera System, 2K 120Hz ProXDR Display, and ultra-fast 100W SUPERVOOC charging.',
      highlights: [
        '16 GB RAM | 512 GB Storage',
        '6.82 inch 2K 120 Hz ProXDR Display with Aqua Touch',
        '50MP Sony LYT-808 + 64MP 3X Periscope + 48MP Ultra-Wide',
        '5400 mAh Battery | 100W Wired + 50W Wireless Charging'
      ],
      specs: [
        { group: 'Performance', name: 'Chipset', value: 'Snapdragon 8 Gen 3' },
        { group: 'Camera', name: 'Rear Camera', value: '50MP + 64MP + 48MP' }
      ],
      images: [
        'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=600&q=80',
      price: 64999,
      mrp: 69999,
      discountPercent: 7,
      stock: 3, // Low stock demo!
      lowStockThreshold: 5,
      sku: 'ONEPLUS12-16-512-EMR',
      rating: { average: 4.7, count: 760 },
      isPublished: true,
      isTrending: true,
      tags: ['oneplus', 'flagship', 'hasselblad', 'fast charging']
    }
  ]);

  console.log(' Seeding Discount Coupons...');
  await Coupon.insertMany([
    {
      code: 'AURELIA10',
      description: 'Exclusive 10% courtesy discount for Aurelia Privé members up to ₹5,000',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: 1000,
      maxDiscount: 5000,
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      usageLimit: 5000,
      isActive: true
    },
    {
      code: 'PRIVE500',
      description: 'Flat ₹500 courtesy privilege on acquisitions above ₹2,500',
      discountType: 'FIXED',
      discountValue: 500,
      minOrderAmount: 2500,
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      usageLimit: 2000,
      isActive: true
    },
    {
      code: 'MAISON2026',
      description: 'Maison Autumn Gala: 20% privileged savings up to ₹10,000',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minOrderAmount: 5000,
      maxDiscount: 10000,
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      usageLimit: 10000,
      isActive: true
    },
    {
      code: 'FLIPKART10',
      description: 'Legacy 10% discount on orders above ₹1,000',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: 1000,
      maxDiscount: 1500,
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      usageLimit: 5000,
      isActive: true
    }
  ]);

  console.log(' Seeding Hero & Promotional Banners...');
  await Banner.insertMany([
    {
      title: 'The Atelier Private Collection',
      subtitle: 'Haute Horlogerie, Fine Couture & Masterpiece Tech',
      imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80',
      targetType: 'CATEGORY',
      targetValue: 'mobiles',
      position: 'HERO',
      displayOrder: 1,
      isActive: true
    },
    {
      title: 'Acoustique & Pure Titanium Flagships',
      subtitle: 'Curated Audio Engineering & Mastercraft Devices',
      imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1200&q=80',
      targetType: 'CATEGORY',
      targetValue: 'electronics',
      position: 'HERO',
      displayOrder: 2,
      isActive: true
    },
    {
      title: 'Haute Couture & Heritage Apparel',
      subtitle: 'Curated Elegance from Esteemed International Maisons',
      imageUrl: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=80',
      targetType: 'CATEGORY',
      targetValue: 'fashion',
      position: 'HERO',
      displayOrder: 3,
      isActive: true
    },
    {
      title: 'Maison Living & Artisanal Interiors',
      subtitle: 'Timeless Luxury for Distinquished Residences',
      imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
      targetType: 'CATEGORY',
      targetValue: 'home-kitchen',
      position: 'MIDDLE',
      displayOrder: 4,
      isActive: true
    }
  ]);

  console.log(' Seeding Customer Address...');
  const customerAddress = await Address.create({
    user: customerUser._id,
    fullName: 'Rahul Sharma',
    phone: '9876543210',
    alternatePhone: '9876543219',
    pincode: '560034',
    locality: 'Koramangala 4th Block',
    addressLine: 'Flat 402, Green Glen Apartments, 12th Main',
    city: 'Bengaluru',
    state: 'Karnataka',
    landmark: 'Near Wipro Park',
    addressType: 'HOME',
    isDefault: true
  });

  console.log(' Seeding Demo Orders in Multiple Lifecycle States...');
  const iphoneProduct = products.find((p) => p.sku === 'IPHONE15PRO-128-NAT');
  const sonyProduct = products.find((p) => p.sku === 'SONY-XM5-SLV');
  const nikeProduct = products.find((p) => p.sku === 'NIKE-AF1-07-WHT');

  // Order 1: Delivered Order with Invoice & Complete Tracking
  const deliveredOrder = await Order.create({
    orderNumber: 'OD20261012ABC12',
    user: customerUser._id,
    items: [
      {
        product: sonyProduct._id,
        title: sonyProduct.title,
        image: sonyProduct.thumbnail,
        price: sonyProduct.price,
        mrp: sonyProduct.mrp,
        quantity: 1,
        itemTotal: sonyProduct.price
      }
    ],
    shippingAddress: customerAddress.toObject(),
    pricing: {
      subtotal: sonyProduct.price,
      mrpTotal: sonyProduct.mrp,
      totalDiscount: sonyProduct.mrp - sonyProduct.price,
      couponDiscount: 500,
      couponCode: 'WELCOME500',
      deliveryCharge: 0,
      tax: 0,
      totalAmount: sonyProduct.price - 500
    },
    payment: {
      method: PAYMENT_METHODS.ONLINE_RAZORPAY,
      status: PAYMENT_STATUS.PAID,
      transactionId: 'TXN_RZP_DEMO_998811',
      razorpayOrderId: 'order_rzp_998811',
      razorpayPaymentId: 'pay_rzp_998811',
      paidAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    },
    orderStatus: ORDER_STATUS.DELIVERED,
    tracking: {
      courierName: 'Ekart Logistics',
      trackingNumber: 'EKT882910245',
      estimatedDeliveryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      statusUpdates: [
        { status: ORDER_STATUS.PLACED, timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), location: 'Bengaluru Hub', note: 'Order placed' },
        { status: ORDER_STATUS.PACKED, timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), location: 'Fulfillment Center 1', note: 'Packed in secure box' },
        { status: ORDER_STATUS.SHIPPED, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), location: 'Transit Hub', note: 'Dispatched via Ekart Air' },
        { status: ORDER_STATUS.DELIVERED, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), location: 'Koramangala Facility', note: 'Delivered to customer' }
      ]
    },
    invoiceNumber: 'INV-2026-004128'
  });

  // Record Payment
  await Payment.create({
    order: deliveredOrder._id,
    user: customerUser._id,
    amount: deliveredOrder.pricing.totalAmount,
    currency: 'INR',
    method: PAYMENT_METHODS.ONLINE_RAZORPAY,
    status: PAYMENT_STATUS.PAID,
    transactionId: 'TXN_RZP_DEMO_998811',
    razorpayOrderId: 'order_rzp_998811',
    razorpayPaymentId: 'pay_rzp_998811'
  });

  // Order 2: Shipped Order in Transit
  await Order.create({
    orderNumber: 'OD20261015XYZ89',
    user: customerUser._id,
    items: [
      {
        product: nikeProduct._id,
        title: nikeProduct.title,
        image: nikeProduct.thumbnail,
        price: nikeProduct.price,
        mrp: nikeProduct.mrp,
        quantity: 1,
        variantName: 'UK 9',
        itemTotal: nikeProduct.price
      }
    ],
    shippingAddress: customerAddress.toObject(),
    pricing: {
      subtotal: nikeProduct.price,
      mrpTotal: nikeProduct.mrp,
      totalDiscount: nikeProduct.mrp - nikeProduct.price,
      couponDiscount: 0,
      deliveryCharge: 0,
      tax: 0,
      totalAmount: nikeProduct.price
    },
    payment: {
      method: PAYMENT_METHODS.COD,
      status: PAYMENT_STATUS.PENDING
    },
    orderStatus: ORDER_STATUS.SHIPPED,
    tracking: {
      courierName: 'Ekart Logistics',
      trackingNumber: 'EKT991203481',
      estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      statusUpdates: [
        { status: ORDER_STATUS.PLACED, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), location: 'Whitefield Hub', note: 'Order placed' },
        { status: ORDER_STATUS.PACKED, timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000), location: 'Warehouse 4', note: 'Quality inspection passed' },
        { status: ORDER_STATUS.SHIPPED, timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), location: 'Hub 2', note: 'Item in transit to delivery facility' }
      ]
    },
    invoiceNumber: 'INV-2026-004129'
  });

  console.log(' Seeding Reviews & Verified Purchase Ratings...');
  await Review.create({
    product: sonyProduct._id,
    user: customerUser._id,
    order: deliveredOrder._id,
    rating: 5,
    title: 'Mindblowing Noise Cancellation and Soundstage!',
    comment: 'The Sony WH-1000XM5 are by far the best headphones I have ever used. Call quality is super crisp and battery lasts over 3 days of heavy usage. Absolutely worth every rupee!',
    images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=400&q=80'],
    isVerifiedPurchase: true,
    status: 'APPROVED',
    likesCount: 142
  });

  console.log(' Seeding Support Ticket Thread...');
  await SupportTicket.create({
    ticketNumber: 'TCK-881920',
    user: customerUser._id,
    order: deliveredOrder._id,
    subject: 'Warranty registration query for Sony XM5',
    category: 'PRODUCT',
    priority: 'MEDIUM',
    status: SUPPORT_STATUS.RESOLVED,
    messages: [
      {
        sender: customerUser._id,
        senderRole: 'customer',
        message: 'Hello, how do I register for the 1-year Sony official warranty for my newly delivered headphones?',
        timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000)
      },
      {
        sender: superAdminUser._id,
        senderRole: 'support_agent',
        message: 'Hi Rahul! Your invoice attached with the order (Invoice INV-2026-004128) serves as the valid proof of purchase. You can register the serial number on Sony India website under Product Registration.',
        timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000)
      }
    ]
  });

  console.log(' Initializing Store Settings & Inventory Movement logs...');
  await StoreSetting.create({
    storeName: 'Aurelia Luxe International',
    supportEmail: 'concierge@aurelia-luxe.com',
    supportPhone: '+91 1800 202 9898',
    taxRatePercent: 0,
    freeShippingThreshold: 500,
    standardDeliveryCharge: 40,
    codEnabled: true,
    razorpayKeyId: 'rzp_test_flipkart_demo_key',
    maintenanceMode: false,
    announcementBanner: {
      enabled: true,
      text: 'Exclusive Autumn Soirée Privilège! Complimentary Concierge & Courtesy Savings with code AURELIA10.'
    }
  });

  await InventoryMovement.create({
    product: sonyProduct._id,
    sku: sonyProduct.sku,
    type: 'ORDER_RESERVED',
    quantity: 1,
    previousStock: 46,
    newStock: 45,
    referenceOrder: deliveredOrder._id,
    reason: `Reserved for order ${deliveredOrder.orderNumber}`,
    performedBy: customerUser._id
  });

  await AuditLog.create({
    actor: superAdminUser._id,
    actorRole: 'superadmin',
    action: 'SYSTEM_INITIALIZATION',
    module: 'System',
    targetModel: 'StoreSetting',
    changes: { action: 'Database seeded with full production catalog and roles' },
    ipAddress: '127.0.0.1',
    userAgent: 'Flipkart Seed Utility'
  });

  console.log('\n======================================================');
  console.log(' DATABASE SEEDED SUCCESSFULLY!');
  console.log('======================================================');
  console.log('Credentials:');
  console.log('Super Admin:     superadmin@flipkart.com   / Password123!');
  console.log('Admin:           admin@flipkart.com        / Password123!');
  console.log('Product Manager: products@flipkart.com     / Password123!');
  console.log('Order Manager:   orders@flipkart.com       / Password123!');
  console.log('Support Agent:   support@flipkart.com      / Password123!');
  console.log('Customer:        rahul.sharma@example.com  / Password123! (OTP: 123456 or generated)');
  console.log('======================================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

seedDatabase().catch((err) => {
  console.error(' Seeding error:', err);
  process.exit(1);
});
