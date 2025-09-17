// Helper function to determine notification type
function getNotificationType(order) {
  const value = parseFloat(order.total_price || 0);
  
  if (value > 500) return 'high-value';
  if (order.financial_status === 'paid' && order.fulfillment_status === 'unfulfilled') return 'pending-fulfillment';
  if (order.financial_status === 'pending') return 'payment-pending';
  if (order.financial_status === 'refunded') return 'refunded';
  
  return 'new-order';
}

// Helper function to determine notification priority
function getNotificationPriority(order) {
  const value = parseFloat(order.total_price || 0);
  
  if (value > 1000) return 'high';
  if (value > 500) return 'medium';
  if (order.financial_status === 'paid' && order.fulfillment_status === 'unfulfilled') return 'medium';
  
  return 'low';
}

// Helper function to format order for notifications
function formatOrderForNotification(order) {
  try {
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

    const result = {
      id: order.id,
      orderId: order.name || `#${order.order_number}`,
      customer: order.customer ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() : 'Guest',
      orderValue: parseFloat(order.total_price || 0),
      currency: order.currency || 'USD',
      status: order.fulfillment_status || 'unfulfilled',
      financialStatus: order.financial_status || 'pending',
      createdAt: order.created_at,
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
    throw error;
  }
}

module.exports = {
  getNotificationType,
  getNotificationPriority,
  formatOrderForNotification
};
