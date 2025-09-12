const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

module.exports = async (req, res) => {
  try {
    const { SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_API_TOKEN, SHOPIFY_ADMIN_API_VERSION } = process.env;

    if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_API_TOKEN) {
      return res.json({
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
    res.json({
      error: 'Failed to fetch orders',
      message: error.message,
      details: error.response?.data || null
    });
  }
};
