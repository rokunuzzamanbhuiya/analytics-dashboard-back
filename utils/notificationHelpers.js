// Helper function to determine notification type
function getNotificationType(order) {
  try {
    if (!order || typeof order !== 'object') return 'new-order';
    
    const value = parseFloat(order.total_price || 0);
    
    if (value > 500) return 'high-value';
    if (order.financial_status === 'paid' && order.fulfillment_status === 'unfulfilled') return 'pending-fulfillment';
    if (order.financial_status === 'pending') return 'payment-pending';
    if (order.financial_status === 'refunded') return 'refunded';
    
    return 'new-order';
  } catch (error) {
    console.error('❌ Error in getNotificationType:', error.message);
    return 'new-order';
  }
}

// Helper function to determine notification priority
function getNotificationPriority(order) {
  try {
    if (!order || typeof order !== 'object') return 'low';
    
    const value = parseFloat(order.total_price || 0);
    
    if (value > 1000) return 'high';
    if (value > 500) return 'medium';
    if (order.financial_status === 'paid' && order.fulfillment_status === 'unfulfilled') return 'medium';
    
    return 'low';
  } catch (error) {
    console.error('❌ Error in getNotificationPriority:', error.message);
    return 'low';
  }
}

// Helper function to format order for notifications
function formatOrderForNotification(order) {
  try {
    // Validate input
    if (!order || typeof order !== 'object') {
      console.error('❌ Invalid order object:', order);
      return null;
    }

    console.log('🔔 formatOrderForNotification - Input order:', {
      id: order.id,
      name: order.name,
      order_number: order.order_number,
      customer: order.customer,
      total_price: order.total_price,
      currency: order.currency,
      fulfillment_status: order.fulfillment_status,
      financial_status: order.financial_status,
      created_at: order.created_at
    });

    // Ensure we have a valid ID
    if (!order.id) {
      console.error('❌ Order missing ID:', order);
      return null;
    }

    const result = {
      id: order.id,
      orderId: order.name || `#${order.order_number || 'unknown'}`,
      customer: order.customer ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() || 'Guest' : 'Guest',
      orderValue: parseFloat(order.total_price || 0),
      currency: order.currency || 'USD',
      status: order.fulfillment_status || 'unfulfilled',
      financialStatus: order.financial_status || 'pending',
      createdAt: order.created_at || new Date().toISOString(),
      read: false, // New notifications are unread by default
      archived: false,
      type: getNotificationType(order),
      priority: getNotificationPriority(order)
    };

    console.log('🔔 formatOrderForNotification - Result:', result);
    return result;
  } catch (error) {
    console.error('❌ Error in formatOrderForNotification:', error.message);
    console.error('❌ Order data:', JSON.stringify(order, null, 2));
    console.error('❌ Error stack:', error.stack);
    return null; // Return null instead of throwing to prevent crashes
  }
}

module.exports = {
  getNotificationType,
  getNotificationPriority,
  formatOrderForNotification
};
