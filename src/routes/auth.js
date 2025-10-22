const express = require("express");
const axios = require("axios");
const router = express.Router();
const shopifyService = require("../services/ShopifyService");

// Test endpoint for backend logging
router.get("/test-log", (req, res) => {
  console.log("✅ Test endpoint hit");
  res.send("Test ok");
});

// Shopify OAuth login initiation
router.get("/shopify-login", async (req, res) => {
  try {
    const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
    const apiKey = process.env.SHOPIFY_API_KEY;

    if (!storeDomain) {
      return res.status(500).json({
        error: "Shopify store domain missing",
      });
    }

    const redirectUri = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/shopify-callback`;
    const scopes = "read_products,read_orders,read_customers,read_analytics";

    const authUrl = `https://${storeDomain}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}`;

    console.log("OAuth URL:", authUrl);
    console.log("Redirect URI:", redirectUri);

    res.json({ authUrl });
  } catch (error) {
    console.error("Shopify login error:", error);
    res.status(500).json({
      error: "Failed to initiate Shopify login",
    });
  }
});

// Shopify OAuth callback handler
router.get("/shopify-callback", async (req, res) => {
  try {
    const { code, shop, error } = req.query;

    if (error) {
      console.error("OAuth error:", error);
      return res.redirect(
        `http://localhost:5173/?error=${encodeURIComponent(error)}`
      );
    }

    if (!code || !shop) {
      return res.redirect("http://localhost:5173/?error=missing_parameters");
    }

    const apiKey = process.env.SHOPIFY_API_KEY;
    const apiSecret = process.env.SHOPIFY_API_SECRET;

    if (!apiKey || !apiSecret) {
      return res.redirect("http://localhost:5173/?error=configuration_missing");
    }

    const tokenResponse = await axios.post(
      `https://${shop}/admin/oauth/access_token`,
      {
        client_id: apiKey,
        client_secret: apiSecret,
        code: code,
      }
    );

    const { access_token } = tokenResponse.data;
    console.log("✅ Received access token:", access_token);

    const userResponse = await axios.get(
      `https://${shop}/admin/api/2023-10/users/current.json`,
      {
        headers: {
          "X-Shopify-Access-Token": access_token,
        },
      }
    );

    const user = userResponse.data.user;

    const userData = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
      shop: shop,
      access_token: access_token,
      hasAccess: true,
    };

    const encodedUserData = encodeURIComponent(JSON.stringify(userData));

    res.redirect(
      `http://localhost:5173/?login=success&user=${encodedUserData}`
    );
  } catch (error) {
    console.error("OAuth callback error:", {
      message: error.message,
      status: error.response?.status,
      responseData: error.response?.data,
      requestConfig: error.config,
    });
    res.redirect(
      `http://localhost:5173/?error=${encodeURIComponent(error.message)}`
    );
  }
});

// Exchange authorization code for access token
router.post("/token", async (req, res) => {
  try {
    const { code, shop } = req.body;

    if (!code || !shop) {
      return res.status(400).json({
        error: "Missing authorization code or shop parameter",
      });
    }

    const apiKey = process.env.SHOPIFY_API_KEY;
    const apiSecret = process.env.SHOPIFY_API_SECRET;

    if (!apiKey || !apiSecret) {
      return res.status(500).json({
        error: "Shopify API credentials not configured",
      });
    }

    const tokenResponse = await axios.post(
      `https://${shop}/admin/oauth/access_token`,
      {
        client_id: apiKey,
        client_secret: apiSecret,
        code: code,
      }
    );

    const { access_token } = tokenResponse.data;

    const userResponse = await axios.get(
      `https://${shop}/admin/api/2023-10/users/current.json`,
      {
        headers: {
          "X-Shopify-Access-Token": access_token,
        },
      }
    );

    const user = userResponse.data.user;

    res.json({
      access_token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        shop: shop,
      },
    });
  } catch (error) {
    console.error(
      "Token exchange error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to exchange authorization code for access token",
      details: error.response?.data || error.message,
    });
  }
});

// Verify access token
router.get("/verify", async (req, res) => {
  try {
    const { shop, access_token } = req.query;

    if (!shop || !access_token) {
      return res.status(400).json({
        error: "Missing shop or access_token parameter",
      });
    }

    const shopResponse = await axios.get(
      `https://${shop}/admin/api/2023-10/shop.json`,
      {
        headers: {
          "X-Shopify-Access-Token": access_token,
        },
      }
    );

    res.json({
      valid: true,
      shop: shopResponse.data.shop,
    });
  } catch (error) {
    console.error(
      "Token verification error:",
      error.response?.data || error.message
    );
    res.status(401).json({
      error: "Invalid access token",
      details: error.response?.data || error.message,
    });
  }
});

// Email-only login endpoint
router.post("/email-login", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res
        .status(400)
        .json({ hasAccess: false, message: "Invalid email." });
    }

    // ✅ Allow multiple authorized emails
    const allowedEmails = [
      "abir.blinto@gmail.com",
      "rokunuzzamanbhuiya@gmail.com",
    ];

    if (!allowedEmails.includes(email.trim().toLowerCase())) {
      return res.json({
        hasAccess: false,
        message: "No access for this email.",
      });
    }

    // Compose user info as needed
    const user = {
      email: email.trim().toLowerCase(),
      first_name: email.includes("abir") ? "Abir" : "Rokunuzzaman",
      last_name: email.includes("abir") ? "" : "Bhuiya",
      hasAccess: true,
    };

    res.json({ hasAccess: true, user });
  } catch (err) {
    console.error("Email login error:", err);
    res
      .status(500)
      .json({ hasAccess: false, message: "Internal server error" });
  }
});

module.exports = router;
