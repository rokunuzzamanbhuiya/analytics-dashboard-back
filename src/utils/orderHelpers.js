/**
 * Order Helper Functions
 * Utility functions for order-related operations
 */

/**
 * Transform order data for API response
 * @param {Object} order - Raw order object from Shopify
 * @returns {Object} Transformed order object
 */
const transformOrder = (order) => {
  if (!order) {
    return null;
  }

  const lineItems = order.line_items || [];
  const shippingAddress = order.shipping_address || {};
  const billingAddress = order.billing_address || {};

  return {
    id: order.id,
    order_number: order.order_number,
    name: order.name,
    email: order.email,
    phone: order.phone,
    created_at: order.created_at,
    updated_at: order.updated_at,
    processed_at: order.processed_at,
    cancelled_at: order.cancelled_at,
    closed_at: order.closed_at,
    financial_status: order.financial_status,
    fulfillment_status: order.fulfillment_status,
    total_price: order.total_price,
    subtotal_price: order.subtotal_price,
    total_tax: order.total_tax,
    currency: order.currency,
    customer: order.customer ? {
      id: order.customer.id,
      email: order.customer.email,
      first_name: order.customer.first_name,
      last_name: order.customer.last_name,
      phone: order.customer.phone
    } : null,
    line_items: lineItems.map(item => ({
      id: item.id,
      title: item.title,
      quantity: item.quantity,
      price: item.price,
      total_discount: item.total_discount,
      variant_id: item.variant_id,
      product_id: item.product_id,
      vendor: item.vendor,
      sku: item.sku
    })),
    shipping_address: {
      first_name: shippingAddress.first_name,
      last_name: shippingAddress.last_name,
      company: shippingAddress.company,
      address1: shippingAddress.address1,
      address2: shippingAddress.address2,
      city: shippingAddress.city,
      province: shippingAddress.province,
      country: shippingAddress.country,
      zip: shippingAddress.zip,
      phone: shippingAddress.phone
    },
    billing_address: {
      first_name: billingAddress.first_name,
      last_name: billingAddress.last_name,
      company: billingAddress.company,
      address1: billingAddress.address1,
      address2: billingAddress.address2,
      city: billingAddress.city,
      province: billingAddress.province,
      country: billingAddress.country,
      zip: billingAddress.zip,
      phone: billingAddress.phone
    },
    note: order.note,
    tags: order.tags,
    source_name: order.source_name
  };
};

/**
 * Sort orders by date (newest first)
 * @param {Array} orders - Array of orders
 * @returns {Array} Sorted orders
 */
const sortOrdersByDate = (orders) => {
  if (!Array.isArray(orders)) {
    return [];
  }

  return orders.sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return dateB - dateA;
  });
};

/**
 * Filter orders by status
 * @param {Array} orders - Array of orders
 * @param {string} status - Status to filter by
 * @returns {Array} Filtered orders
 */
const filterOrdersByStatus = (orders, status) => {
  if (!Array.isArray(orders)) {
    return [];
  }

  return orders.filter(order => {
    switch (status) {
      case 'pending':
        return order.financial_status === 'pending';
      case 'paid':
        return order.financial_status === 'paid';
      case 'cancelled':
        return order.financial_status === 'cancelled';
      case 'refunded':
        return order.financial_status === 'refunded';
      default:
        return true;
    }
  });
};

/**
 * Calculate order statistics
 * @param {Array} orders - Array of orders
 * @returns {Object} Order statistics
 */
const calculateOrderStats = (orders) => {
  if (!Array.isArray(orders)) {
    return {
      total: 0,
      totalValue: 0,
      averageValue: 0,
      pending: 0,
      paid: 0,
      cancelled: 0,
      refunded: 0
    };
  }

  const stats = {
    total: orders.length,
    totalValue: 0,
    averageValue: 0,
    pending: 0,
    paid: 0,
    cancelled: 0,
    refunded: 0
  };

  orders.forEach(order => {
    const value = parseFloat(order.total_price || 0);
    stats.totalValue += value;

    switch (order.financial_status) {
      case 'pending':
        stats.pending++;
        break;
      case 'paid':
        stats.paid++;
        break;
      case 'cancelled':
        stats.cancelled++;
        break;
      case 'refunded':
        stats.refunded++;
        break;
    }
  });

  stats.averageValue = stats.total > 0 ? stats.totalValue / stats.total : 0;

  return stats;
};

/**
 * Get orders within date range
 * @param {Array} orders - Array of orders
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Filtered orders
 */
const getOrdersInDateRange = (orders, startDate, endDate) => {
  if (!Array.isArray(orders)) {
    return [];
  }

  return orders.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate >= startDate && orderDate <= endDate;
  });
};

module.exports = {
  transformOrder,
  sortOrdersByDate,
  filterOrdersByStatus,
  calculateOrderStats,
  getOrdersInDateRange
};
