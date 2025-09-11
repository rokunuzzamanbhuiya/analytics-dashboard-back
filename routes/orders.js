const express = require('express');
const router = express.Router();
const { shopify, SHOPIFY_STORE_DOMAIN } = require('../config/shopify');
const { transformOrder, sortOrdersByDate } = require('../utils/orderHelpers');

// Orders endpoint
router.get('/', async (req, res) => {
  try {
    const { data } = await shopify.get("orders.json?status=any&limit=50");
    const orders = data?.orders || [];
    console.log("✅ Orders fetched:", orders.length);
    res.json(orders);
  } catch (err) {
    console.error("❌ Orders Error:", err.response?.data || err.message);
    res
      .status(500)
      .json({ error: err.message, details: err.response?.data || null });
  }
});

// Pending (unfulfilled) orders
router.get('/pending', async (req, res) => {
  try {
    // Get recent orders - try unfulfilled first, then fallback to recent orders
    let { data } = await shopify.get(
      "orders.json?fulfillment_status=unfulfilled&status=any&limit=50"
    );
    
    console.log("📦 Unfulfilled orders fetched:", data.orders?.length || 0);
    
    // If no unfulfilled orders, get recent orders as fallback
    if (!data.orders || data.orders.length === 0) {
      console.log("⚠️ No unfulfilled orders, fetching recent orders instead");
      const recentData = await shopify.get(
        "orders.json?status=any&limit=50"
      );
      data = recentData;
      console.log("📦 Recent orders fetched:", data.orders?.length || 0);
    }
    
    // Sort by creation date (newest first)
    const sortedOrders = sortOrdersByDate(data.orders || []);
    
    // Transform orders to include necessary details
    const transformedOrders = sortedOrders.map(order => transformOrder(order, SHOPIFY_STORE_DOMAIN));

    console.log("✅ Pending orders:", transformedOrders.length);
    res.json(transformedOrders);
  } catch (err) {
    console.error(
      "❌ Pending Orders Error:",
      err.response?.data || err.message
    );
    res
      .status(500)
      .json({ error: err.message, details: err.response?.data || null });
  }
});

module.exports = router;
