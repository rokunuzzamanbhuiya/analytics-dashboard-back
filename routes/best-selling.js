const express = require("express");
const router = express.Router();
const { shopify, SHOPIFY_STORE_DOMAIN } = require("../config/shopify");
const { calculateProductSales } = require("../utils/productHelpers");

// Best-selling products (Top 10 by sales quantity)
router.get("/", async (req, res) => {
  try {
    // Get all products
    const { data: productsData } = await shopify.get("products.json?limit=250");
    const allProducts = productsData?.products || [];

    // Get sales data from orders
    const { data: ordersData } = await shopify.get(
      "orders.json?status=any&limit=250"
    );
    const orders = ordersData?.orders || [];
    const productSales = calculateProductSales(orders);

    // Attach sales count to each product
    const productsWithSales = allProducts.map((product) => {
      const productId = product.id;
      return {
        id: productId,
        name: product.title,
        quantity: productSales[productId] || 0, // 0 if no sales
        handle: product.handle,
        admin_url: `https://${SHOPIFY_STORE_DOMAIN}/admin/products/${productId}`,
        public_url: `https://${SHOPIFY_STORE_DOMAIN}/products/${product.handle}`,
      };
    });

    // Sort by quantity (descending → best selling first)
    const sorted = productsWithSales.sort((a, b) => b.quantity - a.quantity);

    // Top 10 products
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
