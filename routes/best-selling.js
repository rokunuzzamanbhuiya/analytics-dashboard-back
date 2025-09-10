const express = require('express');
const router = express.Router();
const { shopify, SHOPIFY_STORE_DOMAIN } = require('../config/shopify');
const { calculateProductSales, getProductDetails } = require('../utils/productHelpers');

// Best-selling products (Top 10 by quantity sold across all orders)
router.get('/', async (req, res) => {
  try {
    // Get more orders to get accurate best-selling data
    const { data: ordersData } = await shopify.get("orders.json?status=any&limit=250");
    const orders = ordersData?.orders || [];
    const productSales = calculateProductSales(orders);

    // Sort by quantity (descending) to get best-selling first
    const sorted = Object.values(productSales).sort(
      (a, b) => b.quantity - a.quantity
    );

    // Get product details for top 10 products
    const productIds = sorted.slice(0, 10).map(product => product.id);
    const productDetails = await getProductDetails(productIds, shopify, SHOPIFY_STORE_DOMAIN);

    // Combine sales data with product details
    const result = sorted.slice(0, 10).map(product => ({
      id: product.id,
      name: product.name,
      quantity: product.quantity,
      admin_url: productDetails[product.id]?.admin_url || `https://${SHOPIFY_STORE_DOMAIN}/admin/products/${product.id}`,
      public_url: productDetails[product.id]?.public_url || `https://${SHOPIFY_STORE_DOMAIN}/products/${product.handle || 'unknown'}`
    }));

    console.log("✅ Best-selling count:", result.length);
    res.json(result);
  } catch (err) {
    console.error("❌ Best-Selling Error:", err.response?.data || err.message);
    res
      .status(500)
      .json({ error: err.message, details: err.response?.data || null });
  }
});

module.exports = router;
