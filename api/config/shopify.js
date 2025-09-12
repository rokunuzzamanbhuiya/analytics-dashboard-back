const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const { SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_API_TOKEN, SHOPIFY_ADMIN_API_VERSION } = process.env;

if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_API_TOKEN) {
  console.error("❌ Missing environment variables:");
  console.error("SHOPIFY_STORE_DOMAIN:", SHOPIFY_STORE_DOMAIN ? "✅ Set" : "❌ Missing");
  console.error("SHOPIFY_ADMIN_API_TOKEN:", SHOPIFY_ADMIN_API_TOKEN ? "✅ Set" : "❌ Missing");
  
  // Don't exit in Vercel environment, just log the error
  if (process.env.VERCEL) {
    console.error("⚠️ Running in Vercel without proper environment variables");
  } else {
    process.exit(1);
  }
}

const shopify = axios.create({
  baseURL: `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_ADMIN_API_VERSION}/`,
  headers: {
    "X-Shopify-Access-Token": SHOPIFY_ADMIN_API_TOKEN,
    "Content-Type": "application/json",
  },
});

module.exports = {
  shopify,
  SHOPIFY_STORE_DOMAIN,
  SHOPIFY_ADMIN_API_TOKEN,
  SHOPIFY_ADMIN_API_VERSION
};
