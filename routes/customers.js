const express = require('express');
const router = express.Router();
const { shopify } = require('../config/shopify');

// Customers endpoint
router.get('/', async (req, res) => {
  try {
    const { data } = await shopify.get("customers.json?limit=10");
    const customers = data?.customers || [];
    console.log("✅ Customers fetched:", customers.length);
    res.json({ data: customers });
  } catch (err) {
    console.error("❌ Customers Error:", err.response?.data || err.message);
    res
      .status(500)
      .json({ error: err.message, details: err.response?.data || null });
  }
});

module.exports = router;
