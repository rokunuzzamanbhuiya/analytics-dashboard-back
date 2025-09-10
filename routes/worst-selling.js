const express = require('express');
const router = express.Router();
const { shopify, SHOPIFY_STORE_DOMAIN } = require('../config/shopify');
const { calculateProductSales } = require('../utils/productHelpers');

// Worst-selling products (Products with lowest sales or no sales)
router.get('/', async (req, res) => {
  try {
    // Get all products first
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
      quantity: productSales[product.id] || 0, // 0 if never sold
      handle: product.handle,
      admin_url: `https://${SHOPIFY_STORE_DOMAIN}/admin/products/${product.id}`,
      public_url: `https://${SHOPIFY_STORE_DOMAIN}/products/${product.handle}`
    }));

    // Sort by quantity (ascending) to get worst-selling first
    const sorted = productsWithSales.sort((a, b) => a.quantity - b.quantity);

    // Return bottom 10 (worst-selling)
    const result = sorted.slice(0, 10);

    console.log("✅ Worst-selling count:", result.length);
    res.json(result);
  } catch (err) {
    console.error("❌ Worst-Selling Error:", err.response?.data || err.message);
    res
      .status(500)
      .json({ error: err.message, details: err.response?.data || null });
  }
});

module.exports = router;
