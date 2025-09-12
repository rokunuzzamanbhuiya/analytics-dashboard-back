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

    // Get orders
    const { data } = await shopify.get("orders.json?status=any&limit=50");
    const orders = data?.orders || [];

    res.json({
      success: true,
      orders: orders,
      count: orders.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Orders API Error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to fetch orders',
      message: error.message,
      details: error.response?.data || null
    });
  }
};
