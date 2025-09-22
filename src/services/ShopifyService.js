const axios = require('axios');
const { SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_API_TOKEN, SHOPIFY_ADMIN_API_VERSION } = require('../config/shopify');

// Order fields to fetch from Shopify API
const ORDER_FIELDS = [
  'id',
  'order_number',
  'name',
  'email',
  'phone',
  'created_at',
  'updated_at',
  'processed_at',
  'cancelled_at',
  'closed_at',
  'financial_status',
  'fulfillment_status',
  'total_price',
  'subtotal_price',
  'total_tax',
  'currency',
  'line_items',
  'customer',
  'shipping_address',
  'billing_address',
  'note',
  'tags',
  'source_name'
];

/**
 * Shopify API Service
 * Handles all interactions with the Shopify Admin API
 */
class ShopifyService {
  constructor() {
    this.baseURL = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_ADMIN_API_VERSION}/`;
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_TOKEN,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🔄 Shopify API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ Shopify API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error(`❌ Shopify API Error: ${error.response?.status} ${error.config?.url}`);
        console.error('Error details:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Generic GET request to Shopify API
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response data
   */
  async get(endpoint, params = {}) {
    try {
      const response = await this.client.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error, `GET ${endpoint}`);
    }
  }

  /**
   * Generic POST request to Shopify API
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise<Object>} API response data
   */
  async post(endpoint, data = {}) {
    try {
      const response = await this.client.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `POST ${endpoint}`);
    }
  }

  /**
   * Generic PUT request to Shopify API
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise<Object>} API response data
   */
  async put(endpoint, data = {}) {
    try {
      const response = await this.client.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `PUT ${endpoint}`);
    }
  }

  /**
   * Generic PATCH request to Shopify API
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise<Object>} API response data
   */
  async patch(endpoint, data = {}) {
    try {
      const response = await this.client.patch(endpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `PATCH ${endpoint}`);
    }
  }

  /**
   * Generic DELETE request to Shopify API
   * @param {string} endpoint - API endpoint
   * @returns {Promise<Object>} API response data
   */
  async delete(endpoint) {
    try {
      const response = await this.client.delete(endpoint);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `DELETE ${endpoint}`);
    }
  }

  // Products API methods
  async getProducts(limit = 250, pageInfo = null) {
    const params = { limit };
    if (pageInfo) params.page_info = pageInfo;
    return this.get('products.json', params);
  }

  async getProduct(productId) {
    return this.get(`products/${productId}.json`);
  }

  async getProductsByIds(productIds) {
    return this.get('products.json', { ids: productIds.join(',') });
  }

  // Orders API methods
  async getOrders(limit = 250, status = 'any', fulfillmentStatus = null, createdAtMin = null) {
    const params = { 
      limit, 
      status,
      fields: ORDER_FIELDS.join(',')
    };
    if (fulfillmentStatus) params.fulfillment_status = fulfillmentStatus;
    if (createdAtMin) params.created_at_min = createdAtMin;
    return this.get('orders.json', params);
  }

  async getOrder(orderId) {
    return this.get(`orders/${orderId}.json`, {
      fields: ORDER_FIELDS.join(',')
    });
  }

  // Customers API methods
  async getCustomers(limit = 250) {
    return this.get('customers.json', { limit });
  }

  async getCustomer(customerId) {
    return this.get(`customers/${customerId}.json`);
  }

  // Shop API methods
  async getShop() {
    return this.get('shop.json');
  }

  // User API methods
  async getCurrentUser() {
    return this.get('users/current.json');
  }

  /**
   * Handle API errors with proper formatting
   * @param {Error} error - The error object
   * @param {string} operation - The operation that failed
   * @returns {Error} Formatted error
   */
  handleError(error, operation) {
    const shopifyError = new Error(`Shopify API Error in ${operation}`);
    shopifyError.status = error.response?.status || 500;
    shopifyError.details = error.response?.data || error.message;
    shopifyError.originalError = error;
    return shopifyError;
  }

  /**
   * Check if the service is properly configured
   * @returns {boolean} True if configured correctly
   */
  isConfigured() {
    return !!(SHOPIFY_STORE_DOMAIN && SHOPIFY_ADMIN_API_TOKEN);
  }
}

module.exports = new ShopifyService();
