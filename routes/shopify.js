// routes/shopify.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

const {
  SHOPIFY_STORE_DOMAIN,
  SHOPIFY_ADMIN_API_TOKEN,
  SHOPIFY_ADMIN_API_VERSION,
} = process.env;

const BASE_URL = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_ADMIN_API_VERSION}`;

// 🔹 GET /api/shopify/products
router.get("/products", async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/products.json`, {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ADMIN_API_TOKEN,
        "Content-Type": "application/json",
      },
    });

    res.json(response.data.products);
  } catch (error) {
    console.error(
      "❌ Error fetching products:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// 🔹 Add other routes like orders, metafields, etc.

module.exports = router;
