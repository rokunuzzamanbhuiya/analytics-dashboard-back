const express = require("express");
const axios = require("axios");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(cors());

const { SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_API_TOKEN, SHOPIFY_ADMIN_API_VERSION, PORT } = process.env;

if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_API_TOKEN) {
  console.error("❌ Missing environment variables in .env file");
  process.exit(1);
}

const shopify = axios.create({
  baseURL: `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_ADMIN_API_VERSION}/`,
  headers: {
    "X-Shopify-Access-Token": SHOPIFY_ADMIN_API_TOKEN,
    "Content-Type": "application/json",
  },
});

// Orders endpoint
app.get("/api/orders", async (req, res) => {
  try {
    const { data } = await shopify.get("orders.json?status=any&limit=10");
    console.log("✅ Orders fetched:", data.orders?.length || 0);
    res.json(data.orders);
  } catch (err) {
    console.error("❌ Orders Error:", err.response?.data || err.message);
    res
      .status(500)
      .json({ error: err.message, details: err.response?.data || null });
  }
});

// Pending (unfulfilled) orders
app.get("/api/orders/pending", async (req, res) => {
  try {
    // Get recent orders - try unfulfilled first, then fallback to recent orders
    let { data } = await shopify.get(
      "orders.json?fulfillment_status=unfulfilled&status=any&limit=50"
    );
    
    console.log("📦 Unfulfilled orders fetched:", data.orders?.length || 0);
    
    // If no unfulfilled orders, get recent orders as fallback
    if (!data.orders || data.orders.length === 0) {
      console.log("⚠️ No unfulfilled orders, fetching recent orders instead");
      const recentData = await shopify.get(
        "orders.json?status=any&limit=50"
      );
      data = recentData;
      console.log("📦 Recent orders fetched:", data.orders?.length || 0);
    }
    
    // Sort by creation date (newest first)
    const sortedOrders = (data.orders || [])
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 50);
    
    // Transform orders to include necessary details
    const transformedOrders = sortedOrders.map(order => ({
      id: order.id,
      order_number: order.order_number,
      name: order.name,
      total_price: order.total_price,
      currency: order.currency,
      created_at: order.created_at,
      updated_at: order.updated_at,
      fulfillment_status: order.fulfillment_status,
      financial_status: order.financial_status,
      customer: {
        id: order.customer?.id || null,
        name: order.customer?.first_name && order.customer?.last_name 
          ? `${order.customer.first_name} ${order.customer.last_name}`.trim()
          : order.customer?.email || 'Guest',
        email: order.customer?.email || null,
        phone: order.customer?.phone || null
      },
      shipping_address: order.shipping_address ? {
        name: order.shipping_address.name,
        address1: order.shipping_address.address1,
        city: order.shipping_address.city,
        province: order.shipping_address.province,
        country: order.shipping_address.country,
        zip: order.shipping_address.zip
      } : null,
      line_items: order.line_items.map(item => ({
        id: item.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        name: item.name,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        total_discount: item.total_discount
      })),
      admin_url: `https://${SHOPIFY_STORE_DOMAIN}/admin/orders/${order.id}`,
      public_url: `https://${SHOPIFY_STORE_DOMAIN}/orders/${order.order_number}`,
      summary: order.line_items.map(item => `${item.quantity}x ${item.name}`).join(', ')
    }));

    console.log("✅ Pending orders:", transformedOrders.length);
    res.json(transformedOrders);
  } catch (err) {
    console.error(
      "❌ Pending Orders Error:",
      err.response?.data || err.message
    );
    res
      .status(500)
      .json({ error: err.message, details: err.response?.data || null });
  }
});

// Products endpoint
app.get("/api/products", async (req, res) => {
  try {
    const { data } = await shopify.get("products.json?limit=10");
    console.log("✅ Products fetched:", data.products?.length || 0);
    res.json(data.products);
  } catch (err) {
    console.error("❌ Products Error:", err.response?.data || err.message);
    res
      .status(500)
      .json({ error: err.message, details: err.response?.data || null });
  }
});

// Low stock products (<=5 qty)
app.get("/api/products/low-stock", async (req, res) => {
  try {
    const { data } = await shopify.get("products.json?limit=50");
    const lowStock = [];

    data.products.forEach((product) => {
      product.variants.forEach((variant) => {
        if (
          variant.inventory_quantity !== null &&
          variant.inventory_quantity <= 5
        ) {
          lowStock.push({
            id: `${product.id}-${variant.id}`, // Unique ID combining product and variant
            product_id: product.id,
            variant_id: variant.id,
            name: product.title,
            stock: variant.inventory_quantity,
            image: product.images && product.images.length > 0 ? product.images[0].src : null,
            handle: product.handle,
            admin_url: `https://${SHOPIFY_STORE_DOMAIN}/admin/products/${product.id}`,
            public_url: `https://${SHOPIFY_STORE_DOMAIN}/products/${product.handle}`
          });
        }
      });
    });

    // Sort by stock quantity (lowest first) and take top 10
    const sortedLowStock = lowStock
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 10);

    console.log("✅ Low stock products:", sortedLowStock.length);
    res.json(sortedLowStock);
  } catch (err) {
    console.error("❌ Low Stock Error:", err.response?.data || err.message);
    res
      .status(500)
      .json({ error: err.message, details: err.response?.data || null });
  }
});

// Customers endpoint
app.get("/api/customers", async (req, res) => {
  try {
    const { data } = await shopify.get("customers.json?limit=10");
    console.log("✅ Customers fetched:", data.customers?.length || 0);
    res.json(data.customers);
  } catch (err) {
    console.error("❌ Customers Error:", err.response?.data || err.message);
    res
      .status(500)
      .json({ error: err.message, details: err.response?.data || null });
  }
});

// Best-selling products (Top 10 by quantity sold across all orders)
app.get("/api/best-selling", async (req, res) => {
  try {
    // Get more orders to get accurate best-selling data
    const { data: ordersData } = await shopify.get("orders.json?status=any&limit=250");
    const productSales = {};

    // Count total sales for each product across all orders
    ordersData.orders.forEach((order) => {
      order.line_items.forEach((item) => {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = {
            id: item.product_id,
            name: item.name,
            quantity: 0,
          };
        }
        productSales[item.product_id].quantity += item.quantity;
      });
    });

    // Sort by quantity (descending) to get best-selling first
    const sorted = Object.values(productSales).sort(
      (a, b) => b.quantity - a.quantity
    );

    // Get product details for top 10 products
    const productIds = sorted.slice(0, 10).map(product => product.id);
    const productDetails = {};
    
    if (productIds.length > 0) {
      try {
        const { data: productsData } = await shopify.get(
          `products.json?ids=${productIds.join(',')}`
        );
        
        productsData.products.forEach(product => {
          productDetails[product.id] = {
            handle: product.handle,
            admin_url: `https://${SHOPIFY_STORE_DOMAIN}/admin/products/${product.id}`,
            public_url: `https://${SHOPIFY_STORE_DOMAIN}/products/${product.handle}`
          };
        });
      } catch (productErr) {
        console.warn("⚠️ Could not fetch product details:", productErr.message);
      }
    }

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

// Worst-selling products (Products with lowest sales or no sales)
app.get("/api/worst-selling", async (req, res) => {
  try {
    // Get all products first
    const { data: productsData } = await shopify.get("products.json?limit=250");
    const allProducts = productsData.products;
    
    // Get sales data from orders
    const { data: ordersData } = await shopify.get("orders.json?status=any&limit=250");
    const productSales = {};

    // Count sales for each product
    ordersData.orders.forEach((order) => {
      order.line_items.forEach((item) => {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = 0;
        }
        productSales[item.product_id] += item.quantity;
      });
    });

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

// Start server
app.listen(PORT, () =>
  console.log(`🚀 Backend running at http://localhost:${PORT}`)
);
