const ShopifyService = require('../services/ShopifyService');

/**
 * Customer Controller
 * Handles all customer-related business logic
 */
class CustomerController {
  /**
   * Get all customers
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCustomers(req, res) {
    try {
      const { limit = 250, page_info } = req.query;
      
      const data = await ShopifyService.getCustomers(parseInt(limit));
      const customers = data?.customers || [];
      
      console.log(`✅ Customers fetched: ${customers.length}`);
      
      res.json({
        success: true,
        data: customers,
        count: customers.length,
        pagination: {
          hasNextPage: !!data.page_info,
          nextPageInfo: data.page_info || null
        }
      });
    } catch (error) {
      console.error('❌ Customers Error:', error.message);
      res.status(error.status || 500).json({
        success: false,
        error: error.message,
        details: error.details
      });
    }
  }

  /**
   * Get single customer by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCustomerById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Valid customer ID is required'
        });
      }
      
      const data = await ShopifyService.getCustomer(id);
      const customer = data?.customer;
      
      if (!customer) {
        return res.status(404).json({
          success: false,
          error: 'Customer not found'
        });
      }
      
      console.log(`✅ Customer fetched: ${customer.first_name} ${customer.last_name}`);
      
      res.json({
        success: true,
        data: customer
      });
    } catch (error) {
      console.error('❌ Customer Error:', error.message);
      res.status(error.status || 500).json({
        success: false,
        error: error.message,
        details: error.details
      });
    }
  }

  /**
   * Get customer statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCustomerStats(req, res) {
    try {
      const data = await ShopifyService.getCustomers(250);
      const customers = data?.customers || [];
      
      // Calculate statistics
      const stats = {
        total: customers.length,
        verified: customers.filter(c => c.verified_email).length,
        unverified: customers.filter(c => !c.verified_email).length,
        totalSpent: customers.reduce((sum, c) => sum + parseFloat(c.total_spent || 0), 0),
        totalOrders: customers.reduce((sum, c) => sum + parseInt(c.orders_count || 0), 0),
        averageOrderValue: 0,
        topCustomers: []
      };
      
      // Calculate average order value
      if (stats.totalOrders > 0) {
        stats.averageOrderValue = stats.totalSpent / stats.totalOrders;
      }
      
      // Get top 5 customers by total spent
      stats.topCustomers = customers
        .sort((a, b) => parseFloat(b.total_spent || 0) - parseFloat(a.total_spent || 0))
        .slice(0, 5)
        .map(customer => ({
          id: customer.id,
          name: `${customer.first_name} ${customer.last_name}`.trim(),
          email: customer.email,
          total_spent: parseFloat(customer.total_spent || 0),
          orders_count: parseInt(customer.orders_count || 0)
        }));
      
      console.log(`✅ Customer stats calculated for ${stats.total} customers`);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('❌ Customer Stats Error:', error.message);
      res.status(error.status || 500).json({
        success: false,
        error: error.message,
        details: error.details
      });
    }
  }
}

module.exports = new CustomerController();
