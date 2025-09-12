const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

module.exports = async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    const { SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_API_TOKEN, SHOPIFY_ADMIN_API_VERSION } = process.env;

    if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_API_TOKEN) {
      return res.status(500).json({
        error: 'Missing Shopify configuration',
        message: 'SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_API_TOKEN are required'
      });
    }

    const shopify = axios.create({
      baseURL: `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_ADMIN_API_VERSION || '2024-01'}/`,
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ADMIN_API_TOKEN,
        "Content-Type": "application/json",
      },
    });

    // Get unfulfilled orders first
    let { data } = await shopify.get("orders.json?fulfillment_status=unfulfilled&status=any&limit=50");
    
    // If no unfulfilled orders, get recent orders as fallback
    if (!data.orders || data.orders.length === 0) {
      const recentData = await shopify.get("orders.json?status=any&limit=50");
      data = recentData;
    }
    
    // Sort by creation date (newest first)
    const sortedOrders = (data.orders || [])
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 50);

    res.json({
      success: true,
      orders: sortedOrders,
      count: sortedOrders.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Pending Orders API Error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to fetch pending orders',
      message: error.message,
      details: error.response?.data || null
    });
  }
};
