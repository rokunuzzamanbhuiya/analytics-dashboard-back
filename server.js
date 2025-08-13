const express = require("express");
const axios = require("axios");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(cors());

const { SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_API_TOKEN } = process.env;

const shopify = axios.create({
  baseURL: `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2023-10/`,
  headers: {
    "X-Shopify-Access-Token": SHOPIFY_ADMIN_API_TOKEN,
    "Content-Type": "application/json",
  },
});

// Orders endpoint
app.get("/api/orders", async (req, res) => {
  try {
    const { data } = await shopify.get("orders.json?status=any&limit=50");
    res.json(data.orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Products endpoint
app.get("/api/products", async (req, res) => {
  try {
    const { data } = await shopify.get("products.json?limit=50");
    res.json(data.products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Customers endpoint
app.get("/api/customers", async (req, res) => {
  try {
    const { data } = await shopify.get("customers.json?limit=50");
    res.json(data.customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log("Backend running on http://localhost:3001"));