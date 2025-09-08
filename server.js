// const express = require("express");
// const axios = require("axios");
// const cors = require("cors");
// const dotenv = require("dotenv");
// dotenv.config();

// const app = express();
// app.use(cors());

// const { SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_API_TOKEN } = process.env;

// const shopify = axios.create({
//   baseURL: `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2023-10/`,
//   headers: {
//     "X-Shopify-Access-Token": SHOPIFY_ADMIN_API_TOKEN,
//     "Content-Type": "application/json",
//   },
// });

// // Orders endpoint
// app.get("/api/orders", async (req, res) => {
//   try {
//     const { data } = await shopify.get("orders.json?status=any&limit=50");
//     res.json(data.orders);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Products endpoint
// app.get("/api/products", async (req, res) => {
//   try {
//     const { data } = await shopify.get("products.json?limit=50");
//     res.json(data.products);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Customers endpoint
// app.get("/api/customers", async (req, res) => {
//   try {
//     const { data } = await shopify.get("customers.json?limit=50");
//     res.json(data.customers);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Best-selling endpoint
// app.get("/api/best-selling", async (req, res) => {
//   const response = await axios.get(
//     "https://your-store.myshopify.com/admin/api/2025-01/reports.json",
//     { headers: { "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN } }
//   );
//   res.json(response.data.reports); // adapt shape
// });

// app.listen(3001, () => console.log("Backend running on http://localhost:3001"));

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(cors());

const { SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_API_TOKEN } = process.env;

if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_API_TOKEN) {
  console.error("❌ Missing environment variables in .env file");
  process.exit(1);
}

const shopify = axios.create({
  baseURL: `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2025-01/`,
  headers: {
    "X-Shopify-Access-Token": SHOPIFY_ADMIN_API_TOKEN,
    "Content-Type": "application/json",
  },
});

// Orders endpoint
app.get("/api/orders", async (req, res) => {
  try {
    const { data } = await shopify.get("orders.json?status=any&limit=50");
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
    const { data } = await shopify.get(
      "orders.json?fulfillment_status=unfulfilled&status=any&limit=50"
    );
    console.log("✅ Pending orders:", data.orders?.length || 0);
    res.json(data.orders);
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
    const { data } = await shopify.get("products.json?limit=50");
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
    const { data } = await shopify.get("products.json?limit=100");
    const lowStock = [];

    data.products.forEach((product) => {
      product.variants.forEach((variant) => {
        if (
          variant.inventory_quantity !== null &&
          variant.inventory_quantity <= 5
        ) {
          lowStock.push({
            product_id: product.id,
            title: product.title,
            variant_id: variant.id,
            variant_title: variant.title,
            inventory_quantity: variant.inventory_quantity,
          });
        }
      });
    });

    console.log("✅ Low stock products:", lowStock.length);
    res.json(lowStock);
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
    const { data } = await shopify.get("customers.json?limit=50");
    console.log("✅ Customers fetched:", data.customers?.length || 0);
    res.json(data.customers);
  } catch (err) {
    console.error("❌ Customers Error:", err.response?.data || err.message);
    res
      .status(500)
      .json({ error: err.message, details: err.response?.data || null });
  }
});

// Best-selling products (Top 10 by quantity sold)
app.get("/api/best-selling", async (req, res) => {
  try {
    const { data } = await shopify.get("orders.json?status=any&limit=250");
    const productSales = {};

    data.orders.forEach((order) => {
      order.line_items.forEach((item) => {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = {
            product_id: item.product_id,
            name: item.name,
            quantity: 0,
          };
        }
        productSales[item.product_id].quantity += item.quantity;
      });
    });

    const sorted = Object.values(productSales).sort(
      (a, b) => b.quantity - a.quantity
    );
    console.log("✅ Best-selling count:", sorted.length);
    res.json(sorted.slice(0, 10));
  } catch (err) {
    console.error("❌ Best-Selling Error:", err.response?.data || err.message);
    res
      .status(500)
      .json({ error: err.message, details: err.response?.data || null });
  }
});

// Worst-selling products (Bottom 10)
app.get("/api/worst-selling", async (req, res) => {
  try {
    const { data } = await shopify.get("orders.json?status=any&limit=250");
    const productSales = {};

    data.orders.forEach((order) => {
      order.line_items.forEach((item) => {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = {
            product_id: item.product_id,
            name: item.name,
            quantity: 0,
          };
        }
        productSales[item.product_id].quantity += item.quantity;
      });
    });

    const sorted = Object.values(productSales).sort(
      (a, b) => a.quantity - b.quantity
    );
    console.log("✅ Worst-selling count:", sorted.length);
    res.json(sorted.slice(0, 10));
  } catch (err) {
    console.error("❌ Worst-Selling Error:", err.response?.data || err.message);
    res
      .status(500)
      .json({ error: err.message, details: err.response?.data || null });
  }
});

// Start server
app.listen(3001, () =>
  console.log("🚀 Backend running at http://localhost:3001")
);
