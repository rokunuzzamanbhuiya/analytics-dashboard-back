/**
 * Notification Helper Functions
 * Utility functions for notification-related operations
 */

/**
 * Format order data for notification
 * @param {Object} order - Order object
 * @returns {Object} Formatted order for notification
 */
const formatOrderForNotification = (order) => {
  if (!order) {
    return null;
  }

  const customerName = order.customer ? 
    `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() : 
    'Guest Customer';

  return {
    id: order.id,
    orderId: order.id, // Front-end expects orderId
    order_number: order.order_number,
    name: order.name,
    customer: customerName, // Front-end expects customer field
    customer_name: customerName,
    customer_email: order.customer?.email || order.email,
    orderValue: order.total_price, // Front-end expects orderValue
    total_price: order.total_price,
    currency: order.currency,
    financial_status: order.financial_status,
    fulfillment_status: order.fulfillment_status,
    createdAt: order.created_at, // Front-end expects createdAt
    created_at: order.created_at,
    line_items_count: order.line_items?.length || 0,
    source: order.source_name || 'Unknown',
    read: false, // Default state
    archived: false // Default state
  };
};

/**
 * Create notification message for new order
 * @param {Object} order - Order object
 * @returns {string} Notification message
 */
const createNewOrderNotification = (order) => {
  const formattedOrder = formatOrderForNotification(order);
  if (!formattedOrder) {
    return 'New order received';
  }

  return `New order #${formattedOrder.order_number} from ${formattedOrder.customer_name} - $${formattedOrder.total_price} ${formattedOrder.currency}`;
};

/**
 * Create notification message for order status change
 * @param {Object} order - Order object
 * @param {string} oldStatus - Previous status
 * @param {string} newStatus - New status
 * @returns {string} Notification message
 */
const createOrderStatusNotification = (order, oldStatus, newStatus) => {
  const formattedOrder = formatOrderForNotification(order);
  if (!formattedOrder) {
    return `Order status changed from ${oldStatus} to ${newStatus}`;
  }

  return `Order #${formattedOrder.order_number} status changed from ${oldStatus} to ${newStatus}`;
};

/**
 * Create notification message for low stock
 * @param {Object} product - Product object
 * @param {number} currentStock - Current stock level
 * @returns {string} Notification message
 */
const createLowStockNotification = (product, currentStock) => {
  if (!product) {
    return 'Product is running low on stock';
  }

  return `Low stock alert: ${product.title} has only ${currentStock} items remaining`;
};

/**
 * Create notification message for new customer
 * @param {Object} customer - Customer object
 * @returns {string} Notification message
 */
const createNewCustomerNotification = (customer) => {
  if (!customer) {
    return 'New customer registered';
  }

  const customerName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
  return `New customer registered: ${customerName || customer.email}`;
};

/**
 * Format notification data for API response
 * @param {Object} notification - Raw notification object
 * @returns {Object} Formatted notification
 */
const formatNotification = (notification) => {
  if (!notification) {
    return null;
  }

  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    data: notification.data,
    read: notification.read || false,
    archived: notification.archived || false,
    created_at: notification.created_at,
    updated_at: notification.updated_at,
    read_at: notification.read_at,
    archived_at: notification.archived_at
  };
};

/**
 * Sort notifications by date (newest first)
 * @param {Array} notifications - Array of notifications
 * @returns {Array} Sorted notifications
 */
const sortNotificationsByDate = (notifications) => {
  if (!Array.isArray(notifications)) {
    return [];
  }

  return notifications.sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return dateB - dateA;
  });
};

/**
 * Filter notifications by type
 * @param {Array} notifications - Array of notifications
 * @param {string} type - Type to filter by
 * @returns {Array} Filtered notifications
 */
const filterNotificationsByType = (notifications, type) => {
  if (!Array.isArray(notifications)) {
    return [];
  }

  return notifications.filter(notification => notification.type === type);
};

/**
 * Get unread notifications count
 * @param {Array} notifications - Array of notifications
 * @returns {number} Count of unread notifications
 */
const getUnreadNotificationsCount = (notifications) => {
  if (!Array.isArray(notifications)) {
    return 0;
  }

  return notifications.filter(notification => !notification.read && !notification.archived).length;
};

module.exports = {
  formatOrderForNotification,
  createNewOrderNotification,
  createOrderStatusNotification,
  createLowStockNotification,
  createNewCustomerNotification,
  formatNotification,
  sortNotificationsByDate,
  filterNotificationsByType,
  getUnreadNotificationsCount
};
