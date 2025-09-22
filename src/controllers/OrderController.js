const ShopifyService = require('../services/ShopifyService');
const { transformOrder, sortOrdersByDate } = require('../utils/orderHelpers');
const { SHOPIFY_STORE_DOMAIN } = require('../config/shopify');

/**
 * Order Controller
 * Handles all order-related business logic
 */
class OrderController {
  /**
   * Get all orders
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getOrders(req, res) {
    try {
      const { limit = 250, status = 'any', fulfillment_status } = req.query;
      
      const data = await ShopifyService.getOrders(
        parseInt(limit), 
        status, 
        fulfillment_status
      );
      const rawOrders = data?.orders || [];
      
      // Transform orders for consistent response format
      const orders = rawOrders.map(order => transformOrder(order, SHOPIFY_STORE_DOMAIN));
      
      console.log(`✅ Orders fetched: ${orders.length}`);
      
      res.json({
        success: true,
        data: orders,
        count: orders.length
      });
    } catch (error) {
      console.error('❌ Orders Error:', error.message);
      res.status(error.status || 500).json({
        success: false,
        error: error.message,
        details: error.details
      });
    }
  }

  /**
   * Get pending/unfulfilled orders
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPendingOrders(req, res) {
    try {
      // Get unfulfilled orders first
      let data = await ShopifyService.getOrders(50, 'any', 'unfulfilled');
      let orders = data?.orders || [];
      
      console.log(`📦 Unfulfilled orders fetched: ${orders.length}`);
      
      // If no unfulfilled orders, get recent orders as fallback
      if (orders.length === 0) {
        console.log('⚠️ No unfulfilled orders, fetching recent orders instead');
        data = await ShopifyService.getOrders(50);
        orders = data?.orders || [];
        console.log(`📦 Recent orders fetched: ${orders.length}`);
      }
      
      // Sort by creation date (newest first)
      const sortedOrders = sortOrdersByDate(orders);
      
      // Transform orders to include necessary details
      const transformedOrders = sortedOrders.map(order => 
        transformOrder(order, SHOPIFY_STORE_DOMAIN)
      );
      
      console.log(`✅ Pending orders processed: ${transformedOrders.length}`);
      
      res.json({
        success: true,
        data: transformedOrders,
        count: transformedOrders.length
      });
    } catch (error) {
      console.error('❌ Pending Orders Error:', error.message);
      res.status(error.status || 500).json({
        success: false,
        error: error.message,
        details: error.details
      });
    }
  }

  /**
   * Get single order by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Valid order ID is required'
        });
      }
      
      const data = await ShopifyService.getOrder(id);
      const order = data?.order;
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }
      
      // Transform order for consistent response format
      const transformedOrder = transformOrder(order, SHOPIFY_STORE_DOMAIN);
      
      console.log(`✅ Order fetched: ${order.name || order.id}`);
      
      res.json({
        success: true,
        data: transformedOrder
      });
    } catch (error) {
      console.error('❌ Order Error:', error.message);
      res.status(error.status || 500).json({
        success: false,
        error: error.message,
        details: error.details
      });
    }
  }

  /**
   * Get orders by date range
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getOrdersByDateRange(req, res) {
    try {
      const { 
        start_date, 
        end_date, 
        limit = 250, 
        status = 'any' 
      } = req.query;
      
      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          error: 'Start date and end date are required'
        });
      }
      
      // Validate date format
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date format. Use YYYY-MM-DD'
        });
      }
      
      const data = await ShopifyService.getOrders(
        parseInt(limit), 
        status, 
        null, 
        start_date
      );
      
      let orders = data?.orders || [];
      
      // Filter by end date on the client side (Shopify API limitation)
      orders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate <= endDate;
      });
      
      console.log(`✅ Orders by date range: ${orders.length}`);
      
      res.json({
        success: true,
        data: orders,
        count: orders.length,
        dateRange: {
          start: start_date,
          end: end_date
        }
      });
    } catch (error) {
      console.error('❌ Orders by Date Range Error:', error.message);
      res.status(error.status || 500).json({
        success: false,
        error: error.message,
        details: error.details
      });
    }
  }
}

module.exports = new OrderController();
