const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');

// Shopify OAuth callback endpoint
router.post('/callback', async (req, res) => {
  try {
    const { code, shop, state, redirect_uri } = req.body;

    if (!code || !shop) {
      return res.status(400).json({ 
        error: 'Missing required parameters: code and shop' 
      });
    }

    // Verify the shop domain
    if (!shop.endsWith('.myshopify.com')) {
      return res.status(400).json({ 
        error: 'Invalid shop domain' 
      });
    }

    // Check for required OAuth environment variables
    if (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_SECRET) {
      return res.status(500).json({ 
        error: 'OAuth configuration missing. Please set SHOPIFY_API_KEY and SHOPIFY_API_SECRET environment variables.' 
      });
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(`https://${shop}/admin/oauth/access_token`, {
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code: code
    });

    const { access_token } = tokenResponse.data;

    if (!access_token) {
      return res.status(400).json({ 
        error: 'Failed to obtain access token' 
      });
    }

    // Get shop information
    const shopResponse = await axios.get(`https://${shop}/admin/api/2024-01/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json'
      }
    });

    const shopData = shopResponse.data.shop;

    // Get current user information (shop owner)
    const userResponse = await axios.get(`https://${shop}/admin/api/2024-01/users/current.json`, {
      headers: {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json'
      }
    });

    const userData = userResponse.data.user;

    // Return user data and access token
    res.json({
      success: true,
      access_token: access_token,
      shop: {
        id: shopData.id,
        name: shopData.name,
        domain: shopData.domain,
        email: shopData.email,
        phone: shopData.phone,
        address1: shopData.address1,
        city: shopData.city,
        province: shopData.province,
        country: shopData.country,
        zip: shopData.zip
      },
      user: {
        id: userData.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        avatar_url: userData.avatar_url,
        image: userData.image,
        role: userData.role,
        permissions: userData.permissions
      }
    });

  } catch (error) {
    console.error('OAuth callback error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'OAuth callback failed',
      details: error.response?.data || error.message
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  // In a real app, you might want to revoke the token
  res.json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
});

module.exports = router;
