const ShopifyService = require('../services/ShopifyService');
const { formatOrderForNotification } = require('../../utils/notificationHelpers');

/**
 * Notification Controller
 * Handles all notification-related business logic
 */
class NotificationController {
  constructor() {
    // In-memory storage for notification states (in production, use a database)
    this.notificationStates = {};
  }

  /**
   * Get notifications (recent orders)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getNotifications(req, res) {
    try {
      console.log('🔔 Starting notifications fetch...');
      const { hours = 24, limit = 50 } = req.query;
      
      // Get recent orders from the specified hours
      const hoursAgo = new Date();
      hoursAgo.setHours(hoursAgo.getHours() - parseInt(hours));
      const createdAtMin = hoursAgo.toISOString();
      
      console.log(`🔔 Fetching orders from last ${hours} hours (since ${createdAtMin})`);
      
      const data = await ShopifyService.getOrders(
        parseInt(limit), 
        'any', 
        null, 
        createdAtMin
      );
      
      console.log('🔔 Orders data received:', data ? 'success' : 'failed');
      const orders = data?.orders || [];
      console.log(`🔔 Found ${orders.length} orders`);
      
      // Format orders into notification format
      const notifications = orders.map((order, index) => {
        try {
          console.log(`🔔 Processing order ${index + 1}/${orders.length}:`, {
            id: order.id,
            name: order.name,
            customer: order.customer ? 'has customer' : 'no customer',
            total_price: order.total_price,
            financial_status: order.financial_status,
            fulfillment_status: order.fulfillment_status
          });
          
          const notification = formatOrderForNotification(order);
          console.log(`🔔 Formatted notification:`, {
            id: notification.id,
            orderId: notification.orderId,
            customer: notification.customer,
            orderValue: notification.orderValue
          });
          
          // Apply stored state if exists
          if (this.notificationStates[notification.id]) {
            notification.read = this.notificationStates[notification.id].read;
            notification.archived = this.notificationStates[notification.id].archived;
          }
          return notification;
        } catch (formatError) {
          console.error('❌ Error formatting order:', order.id, formatError.message);
          console.error('❌ Order data:', JSON.stringify(order, null, 2));
          console.error('❌ Format error stack:', formatError.stack);
          return null;
        }
      }).filter(Boolean); // Remove null entries
      
      // Sort by creation date (newest first)
      notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      console.log(`🔔 Notifications fetched: ${notifications.length}`);
      
      res.json({
        success: true,
        data: notifications,
        count: notifications.length,
        timeRange: `${hours} hours`
      });
    } catch (error) {
      console.error('❌ Notifications Error:', error.message);
      console.error('❌ Error stack:', error.stack);
      res.status(error.status || 500).json({
        success: false,
        error: error.message,
        details: error.details
      });
    }
  }

  /**
   * Mark notification as read
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  markAsRead(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Notification ID is required'
        });
      }
      
      if (!this.notificationStates[id]) {
        this.notificationStates[id] = { read: false, archived: false };
      }
      
      this.notificationStates[id].read = true;
      
      console.log(`✅ Notification ${id} marked as read`);
      
      res.json({
        success: true,
        message: 'Notification marked as read',
        notificationId: id
      });
    } catch (error) {
      console.error('❌ Mark as Read Error:', error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Archive notification
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  archive(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Notification ID is required'
        });
      }
      
      if (!this.notificationStates[id]) {
        this.notificationStates[id] = { read: false, archived: false };
      }
      
      this.notificationStates[id].archived = true;
      
      console.log(`✅ Notification ${id} archived`);
      
      res.json({
        success: true,
        message: 'Notification archived',
        notificationId: id
      });
    } catch (error) {
      console.error('❌ Archive Error:', error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Mark all notifications as read
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  markAllAsRead(req, res) {
    try {
      let markedCount = 0;
      
      // Mark all unarchived notifications as read
      Object.keys(this.notificationStates).forEach(id => {
        if (!this.notificationStates[id].archived) {
          this.notificationStates[id].read = true;
          markedCount++;
        }
      });
      
      console.log(`✅ ${markedCount} notifications marked as read`);
      
      res.json({
        success: true,
        message: 'All notifications marked as read',
        count: markedCount
      });
    } catch (error) {
      console.error('❌ Mark All Read Error:', error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get notification statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getNotificationStats(req, res) {
    try {
      const states = Object.values(this.notificationStates);
      
      const stats = {
        total: states.length,
        read: states.filter(s => s.read).length,
        unread: states.filter(s => !s.read).length,
        archived: states.filter(s => s.archived).length,
        active: states.filter(s => !s.archived).length
      };
      
      console.log(`📊 Notification stats: ${stats.total} total, ${stats.unread} unread`);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('❌ Notification Stats Error:', error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new NotificationController();
