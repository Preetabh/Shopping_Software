const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');
const SupportTicket = require('../models/SupportTicket');
const ApiResponse = require('../utils/apiResponse');

class AdminController {
  /**
   * Complete high-level dashboard metrics
   */
  static async getDashboardMetrics(req, res, next) {
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [
        totalOrdersCount,
        pendingOrdersCount,
        deliveredOrdersCount,
        totalCustomersCount,
        totalProductsCount,
        lowStockProductsCount,
        openTicketsCount,
        recentOrders,
        recentActivities,
        revenueData
      ] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ orderStatus: { $in: ['PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED'] } }),
        Order.countDocuments({ orderStatus: 'DELIVERED' }),
        User.countDocuments({ role: 'customer' }),
        Product.countDocuments({ isArchived: false }),
        Product.countDocuments({ isArchived: false, $expr: { $lte: ['$stock', '$lowStockThreshold'] } }),
        SupportTicket.countDocuments({ status: { $in: ['OPEN', 'IN_PROGRESS'] } }),
        Order.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('user', 'name email')
          .lean(),
        AuditLog.find()
          .sort({ createdAt: -1 })
          .limit(8)
          .populate('actor', 'name role')
          .lean(),
        Order.aggregate([
          { $match: { 'payment.status': 'PAID' } },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$pricing.totalAmount' },
              totalDiscount: { $sum: '$pricing.totalDiscount' }
            }
          }
        ])
      ]);

      const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
      const estimatedProfit = Math.round(totalRevenue * 0.22); // ~22% margin estimate

      // Sales trends over last 7 days
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const salesTrends = await Order.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            orders: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [{ $eq: ['$payment.status', 'PAID'] }, '$pricing.totalAmount', 0]
              }
            }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      return ApiResponse.success(res, {
        summary: {
          totalRevenue,
          estimatedProfit,
          totalOrders: totalOrdersCount,
          pendingOrders: pendingOrdersCount,
          deliveredOrders: deliveredOrdersCount,
          totalCustomers: totalCustomersCount,
          totalProducts: totalProductsCount,
          lowStockProducts: lowStockProductsCount,
          openTickets: openTicketsCount
        },
        salesTrends,
        recentOrders,
        recentActivities
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Customer list with order counts and spent totals
   */
  static async getCustomers(req, res, next) {
    try {
      const { search, status, page = 1, limit = 15 } = req.query;
      const filter = { role: 'customer' };

      if (status) filter.status = status;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ];
      }

      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.max(1, parseInt(limit, 10));
      const skip = (pageNum - 1) * limitNum;

      const [customers, total] = await Promise.all([
        User.find(filter)
          .select('-password -refreshTokens')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        User.countDocuments(filter)
      ]);

      // Enrich with customer orders summary
      const customerIds = customers.map((c) => c._id);
      const orderStats = await Order.aggregate([
        { $match: { user: { $in: customerIds } } },
        {
          $group: {
            _id: '$user',
            totalOrders: { $sum: 1 },
            totalSpent: {
              $sum: {
                $cond: [{ $eq: ['$payment.status', 'PAID'] }, '$pricing.totalAmount', 0]
              }
            }
          }
        }
      ]);

      const statsMap = {};
      orderStats.forEach((s) => {
        statsMap[String(s._id)] = s;
      });

      const enriched = customers.map((c) => ({
        ...c,
        totalOrders: statsMap[String(c._id)]?.totalOrders || 0,
        totalSpent: statsMap[String(c._id)]?.totalSpent || 0
      }));

      return ApiResponse.success(res, enriched, 'Customers retrieved', 200, {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Customer detail profile
   */
  static async getCustomerDetail(req, res, next) {
    try {
      const { id } = req.params;
      const [customer, orders, tickets] = await Promise.all([
        User.findById(id).select('-password -refreshTokens').lean(),
        Order.find({ user: id }).sort({ createdAt: -1 }).limit(10).lean(),
        SupportTicket.find({ user: id }).sort({ createdAt: -1 }).limit(5).lean()
      ]);

      if (!customer) return ApiResponse.notFound(res, 'Customer not found');

      return ApiResponse.success(res, {
        customer,
        orders,
        tickets
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update customer account status (active, suspended, blocked)
   */
  static async updateCustomerStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const customer = await User.findByIdAndUpdate(id, { status }, { new: true }).select('-password');
      if (!customer) return ApiResponse.notFound(res, 'Customer not found');

      return ApiResponse.success(res, customer, `Customer status updated to ${status}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reports & Analytics
   */
  static async getReports(req, res, next) {
    try {
      const { period = '30d' } = req.query;
      const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
      const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const [salesReport, topProducts, categoryPerformance] = await Promise.all([
        Order.aggregate([
          { $match: { createdAt: { $gte: fromDate } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              orderCount: { $sum: 1 },
              revenue: {
                $sum: {
                  $cond: [{ $eq: ['$payment.status', 'PAID'] }, '$pricing.totalAmount', 0]
                }
              }
            }
          },
          { $sort: { _id: 1 } }
        ]),
        Order.aggregate([
          { $match: { createdAt: { $gte: fromDate } } },
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.product',
              title: { $first: '$items.title' },
              unitsSold: { $sum: '$items.quantity' },
              totalRevenue: { $sum: '$items.itemTotal' }
            }
          },
          { $sort: { unitsSold: -1 } },
          { $limit: 8 }
        ]),
        Product.aggregate([
          { $match: { isArchived: false } },
          {
            $group: {
              _id: '$category',
              productCount: { $sum: 1 },
              avgPrice: { $avg: '$price' }
            }
          },
          {
            $lookup: {
              from: 'categories',
              localField: '_id',
              foreignField: '_id',
              as: 'category'
            }
          },
          { $unwind: '$category' },
          {
            $project: {
              categoryName: '$category.name',
              productCount: 1,
              avgPrice: { $round: ['$avgPrice', 0] }
            }
          }
        ])
      ]);

      return ApiResponse.success(res, {
        salesReport,
        topProducts,
        categoryPerformance
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Activity logs
   */
  static async getActivityLogs(req, res, next) {
    try {
      const { module, page = 1, limit = 25 } = req.query;
      const filter = module ? { module } : {};

      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.max(1, parseInt(limit, 10));
      const skip = (pageNum - 1) * limitNum;

      const [logs, total] = await Promise.all([
        AuditLog.find(filter)
          .populate('actor', 'name email role')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        AuditLog.countDocuments(filter)
      ]);

      return ApiResponse.success(res, logs, 'Activity logs retrieved', 200, {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Roles & Staff Management
   */
  static async getRoles(req, res, next) {
    try {
      const roles = await Role.find().sort({ name: 1 }).lean();
      return ApiResponse.success(res, roles);
    } catch (error) {
      next(error);
    }
  }

  static async getStaffUsers(req, res, next) {
    try {
      const staff = await User.find({ role: { $ne: 'customer' } })
        .select('-password -refreshTokens')
        .populate('roleRef')
        .sort({ createdAt: -1 })
        .lean();
      return ApiResponse.success(res, staff);
    } catch (error) {
      next(error);
    }
  }

  static async updateStaffRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const roleDoc = await Role.findOne({ code: role });
      const user = await User.findByIdAndUpdate(
        id,
        { role, roleRef: roleDoc ? roleDoc._id : null },
        { new: true }
      ).select('-password');

      if (!user) return ApiResponse.notFound(res, 'User not found');
      return ApiResponse.success(res, user, 'Staff role updated');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminController;
