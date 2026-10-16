const SupportTicket = require('../models/SupportTicket');
const ApiResponse = require('../utils/apiResponse');

class SupportController {
  static async createTicket(req, res, next) {
    try {
      const { subject, category, priority, message, orderId } = req.body;
      const ticketNumber = `TCK-${Date.now().toString().slice(-6)}`;

      const ticket = await SupportTicket.create({
        ticketNumber,
        user: req.user._id,
        order: orderId || null,
        subject,
        category: category || 'GENERAL',
        priority: priority || 'MEDIUM',
        messages: [
          {
            sender: req.user._id,
            senderRole: req.user.role,
            message,
            timestamp: new Date()
          }
        ]
      });

      return ApiResponse.created(res, ticket, 'Support ticket created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getUserTickets(req, res, next) {
    try {
      const tickets = await SupportTicket.find({ user: req.user._id })
        .populate('order', 'orderNumber orderStatus pricing.totalAmount')
        .sort({ updatedAt: -1 })
        .lean();
      return ApiResponse.success(res, tickets);
    } catch (error) {
      next(error);
    }
  }

  static async getTicketById(req, res, next) {
    try {
      const { id } = req.params;
      const query = req.user.role === 'customer' ? { _id: id, user: req.user._id } : { _id: id };

      const ticket = await SupportTicket.findOne(query)
        .populate('user', 'name email phone')
        .populate('order', 'orderNumber orderStatus pricing.totalAmount')
        .populate('messages.sender', 'name avatar role');

      if (!ticket) return ApiResponse.notFound(res, 'Ticket not found');
      return ApiResponse.success(res, ticket);
    } catch (error) {
      next(error);
    }
  }

  static async addMessage(req, res, next) {
    try {
      const { id } = req.params;
      const { message, attachments } = req.body;
      const query = req.user.role === 'customer' ? { _id: id, user: req.user._id } : { _id: id };

      const ticket = await SupportTicket.findOne(query);
      if (!ticket) return ApiResponse.notFound(res, 'Ticket not found');

      ticket.messages.push({
        sender: req.user._id,
        senderRole: req.user.role,
        message,
        attachments: attachments || [],
        timestamp: new Date()
      });

      if (req.user.role !== 'customer' && ticket.status === 'OPEN') {
        ticket.status = 'IN_PROGRESS';
      }

      await ticket.save();
      return ApiResponse.success(res, ticket, 'Message added');
    } catch (error) {
      next(error);
    }
  }

  static async getAllTickets(req, res, next) {
    try {
      const { status, category, priority, page = 1, limit = 15 } = req.query;
      const filter = {};

      if (status) filter.status = status;
      if (category) filter.category = category;
      if (priority) filter.priority = priority;

      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.max(1, parseInt(limit, 10));
      const skip = (pageNum - 1) * limitNum;

      const [tickets, total] = await Promise.all([
        SupportTicket.find(filter)
          .populate('user', 'name email phone')
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        SupportTicket.countDocuments(filter)
      ]);

      return ApiResponse.success(res, tickets, 'Support tickets retrieved', 200, {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const ticket = await SupportTicket.findByIdAndUpdate(id, { status }, { new: true });
      if (!ticket) return ApiResponse.notFound(res, 'Ticket not found');

      return ApiResponse.success(res, ticket, `Ticket status changed to ${status}`);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SupportController;
