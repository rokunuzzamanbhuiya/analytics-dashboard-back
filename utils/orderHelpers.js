// Helper function to transform order data
function transformOrder(order, SHOPIFY_STORE_DOMAIN) {
  return {
    id: order.id,
    order_number: order.order_number,
    name: order.name,
    total_price: order.total_price,
    currency: order.currency,
    created_at: order.created_at,
    updated_at: order.updated_at,
    fulfillment_status: order.fulfillment_status,
    financial_status: order.financial_status,
    customer: {
      id: order.customer?.id || null,
      name: order.customer?.first_name && order.customer?.last_name 
        ? `${order.customer.first_name} ${order.customer.last_name}`.trim()
        : order.customer?.email || 'Guest',
      email: order.customer?.email || null,
      phone: order.customer?.phone || null
    },
    shipping_address: order.shipping_address ? {
      name: order.shipping_address.name,
      address1: order.shipping_address.address1,
      city: order.shipping_address.city,
      province: order.shipping_address.province,
      country: order.shipping_address.country,
      zip: order.shipping_address.zip
    } : null,
    line_items: order.line_items.map(item => ({
      id: item.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      name: item.name,
      title: item.title,
      quantity: item.quantity,
      price: item.price,
      total_discount: item.total_discount
    })),
    admin_url: `https://${SHOPIFY_STORE_DOMAIN}/admin/orders/${order.id}`,
    public_url: `https://${SHOPIFY_STORE_DOMAIN}/orders/${order.order_number}`,
    summary: order.line_items.map(item => `${item.quantity}x ${item.name}`).join(', ')
  };
}

// Helper function to sort orders by creation date
function sortOrdersByDate(orders) {
  return orders
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 50);
}

module.exports = {
  transformOrder,
  sortOrdersByDate
};
