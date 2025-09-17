const express = require('express');
const router = express.Router();
const { shopify, SHOPIFY_STORE_DOMAIN } = require('../config/shopify');
const { calculateProductSales, getProductDetails } = require('../utils/productHelpers');

// Best-selling products (Top 10 by quantity sold across all orders)
router.get('/', async (req, res) => {
  try {
    // Get all products first (same approach as worst-selling)
    const { data: productsData } = await shopify.get("products.json?limit=250");
    const allProducts = productsData?.products || [];
    
    // Get sales data from orders
    const { data: ordersData } = await shopify.get("orders.json?status=any&limit=250");
    const orders = ordersData?.orders || [];
    const productSales = calculateProductSales(orders);

    // Create array with all products and their sales (0 if never sold)
    const productsWithSales = allProducts.map(product => ({
      id: product.id,
      name: product.title,
      quantity: productSales[product.id]?.quantity || 0, // 0 if never sold
      handle: product.handle,
      admin_url: `https://${SHOPIFY_STORE_DOMAIN}/admin/products/${product.id}`,
      public_url: `https://${SHOPIFY_STORE_DOMAIN}/products/${product.handle}`
    }));

    // Filter out products with 0 sales and sort by quantity (descending) to get best-selling first
    const productsWithSalesOnly = productsWithSales.filter(product => product.quantity > 0);
    const sorted = productsWithSalesOnly.sort((a, b) => b.quantity - a.quantity);

    // Return top 10 (best-selling)
    const result = sorted.slice(0, 10);

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
