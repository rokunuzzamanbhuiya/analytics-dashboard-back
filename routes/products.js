const express = require('express');
const router = express.Router();
const { shopify, SHOPIFY_STORE_DOMAIN } = require('../config/shopify');
const { processLowStockProducts } = require('../utils/productHelpers');

// Products endpoint
router.get('/', async (req, res) => {
  try {
    const { data } = await shopify.get("products.json?limit=250");
    const products = data?.products || [];
    console.log("✅ Products fetched:", products.length);
    res.json({ data: products });
  } catch (err) {
    console.error("❌ Products Error:", err.response?.data || err.message);
    res
      .status(500)
      .json({ error: err.message, details: err.response?.data || null });
  }
});

// Low stock products (<=5 qty)
router.get('/low-stock', async (req, res) => {
  try {
    const { data } = await shopify.get("products.json?limit=50");
    const products = data?.products || [];
    const sortedLowStock = processLowStockProducts(products, SHOPIFY_STORE_DOMAIN);

    console.log("✅ Low stock products:", sortedLowStock.length);
    res.json(sortedLowStock);
  } catch (err) {
    console.error("❌ Low Stock Error:", err.response?.data || err.message);
    res
      .status(500)
      .json({ error: err.message, details: err.response?.data || null });
  }
});

module.exports = router;
