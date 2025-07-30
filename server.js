const express = require("express");
const axios = require("axios");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const PORT = 3001;

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

app.listen(PORT, () => console.log(`✅ Server is running on port ${PORT}`));

// const express = require("express");
// const axios = require("axios");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const bodyParser = require("body-parser");
// const crypto = require("crypto");
// const http = require("http");

// dotenv.config();

// const app = express();
// const server = http.createServer(app);
// const io = require("socket.io")(server, {
//   cors: { origin: "*" },
// });

// app.use(cors());
// app.use(bodyParser.json());

// const PORT = 3001;

// const {
//   SHOPIFY_STORE_DOMAIN,
//   SHOPIFY_ADMIN_API_TOKEN,
//   SHOPIFY_WEBHOOK_SECRET,
// } = process.env;

// const shopify = axios.create({
//   baseURL: `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2023-10/`,
//   headers: {
//     "X-Shopify-Access-Token": SHOPIFY_ADMIN_API_TOKEN,
//     "Content-Type": "application/json",
//   },
// });

// // Signature verification middleware
// function verifyShopifyWebhook(req, res, next) {
//   const hmac = req.get("X-Shopify-Hmac-Sha256");
//   const digest = crypto
//     .createHmac("sha256", SHOPIFY_WEBHOOK_SECRET)
//     .update(JSON.stringify(req.body), "utf8")
//     .digest("base64");

//   if (digest !== hmac) {
//     return res.status(401).send("Unauthorized webhook");
//   }
//   next();
// }

// // Shopify webhook handler
// app.post("/webhooks/orders-create", verifyShopifyWebhook, (req, res) => {
//   const order = req.body;
//   console.log("✅ Webhook received: New Order", order.id);

//   // Emit new order to all connected clients
//   io.emit("new-order", order);

//   res.status(200).send("Webhook received");
// });

// // API endpoints
// app.get("/api/orders", async (req, res) => {
//   try {
//     const { data } = await shopify.get("orders.json?status=any&limit=50");
//     res.json(data.orders);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.get("/api/products", async (req, res) => {
//   try {
//     const { data } = await shopify.get("products.json?limit=50");
//     res.json(data.products);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.get("/api/customers", async (req, res) => {
//   try {
//     const { data } = await shopify.get("customers.json?limit=50");
//     res.json(data.customers);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// server.listen(PORT, () =>
//   console.log(`✅ Server running at http://localhost:${PORT}`)
// );
