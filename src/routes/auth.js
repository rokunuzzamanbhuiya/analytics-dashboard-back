const express = require('express');
const axios = require('axios');
const router = express.Router();

// OAuth-only authentication - no manual login/registration



// Shopify OAuth login initiation
router.get('/shopify-login', async (req, res) => {
  try {
    const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
    const apiKey = process.env.SHOPIFY_API_KEY;
    

    if (!storeDomain) {
      return res.status(500).json({
        error: 'Shopify store domain missing'
      });
    }

    // Use backend callback URL for OAuth
    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/shopify-callback`;
    const scopes = 'read_products,read_orders,read_customers,read_analytics';
    
    const authUrl = `https://${storeDomain}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    console.log('OAuth URL:', authUrl);
    console.log('Redirect URI:', redirectUri);
    
    res.json({ authUrl });

  } catch (error) {
    console.error('Shopify login error:', error);
    res.status(500).json({
      error: 'Failed to initiate Shopify login'
    });
  }
});

// Shopify OAuth callback handler
router.get('/shopify-callback', async (req, res) => {
  try {
    const { code, shop, error } = req.query;

    if (error) {
      console.error('OAuth error:', error);
      return res.redirect(`http://localhost:5173/?error=${encodeURIComponent(error)}`);
    }

    if (!code || !shop) {
      return res.redirect('http://localhost:5173/?error=missing_parameters');
    }

    // Use hardcoded values for testing
    const apiKey = 'ea188c8a8b8b8b8b8b8b8b8b8b8b8b8b'; // Replace with your actual API key
    const apiSecret = 'your_api_secret_here'; // Replace with your actual API secret

    if (!apiKey || !apiSecret) {
      return res.redirect('http://localhost:5173/?error=configuration_missing');
    }

    // Exchange authorization code for access token
    const tokenResponse = await axios.post(`https://${shop}/admin/oauth/access_token`, {
      client_id: apiKey,
      client_secret: apiSecret,
      code: code
    });

    const { access_token } = tokenResponse.data;

    // Fetch user information
    const userResponse = await axios.get(`https://${shop}/admin/api/2023-10/users/current.json`, {
      headers: {
        'X-Shopify-Access-Token': access_token
      }
    });

    const user = userResponse.data.user;

    // Create user data object
    const userData = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
      shop: shop,
      access_token: access_token,
      hasAccess: true // You can add custom access logic here
    };

    // Encode user data for URL
    const encodedUserData = encodeURIComponent(JSON.stringify(userData));
    
    // Redirect back to frontend with user data
    res.redirect(`http://localhost:5173/?login=success&user=${encodedUserData}`);

  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`http://localhost:5173/?error=${encodeURIComponent(error.message)}`);
  }
});


// Exchange authorization code for access token
router.post('/token', async (req, res) => {
  try {
    const { code, shop } = req.body;

    if (!code || !shop) {
      return res.status(400).json({
        error: 'Missing authorization code or shop parameter'
      });
    }

    // Get API credentials from environment variables
    const apiKey = process.env.SHOPIFY_API_KEY;
    const apiSecret = process.env.SHOPIFY_API_SECRET;

    if (!apiKey || !apiSecret) {
      return res.status(500).json({
        error: 'Shopify API credentials not configured'
      });
    }

    // Exchange authorization code for access token
    const tokenResponse = await axios.post(`https://${shop}/admin/oauth/access_token`, {
      client_id: apiKey,
      client_secret: apiSecret,
      code: code
    });

    const { access_token } = tokenResponse.data;

    // Fetch user information
    const userResponse = await axios.get(`https://${shop}/admin/api/2023-10/users/current.json`, {
      headers: {
        'X-Shopify-Access-Token': access_token
      }
    });

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
        shop: shop
      }
    });

  } catch (error) {
    console.error('Token exchange error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to exchange authorization code for access token',
      details: error.response?.data || error.message
    });
  }
});

// Verify access token
router.get('/verify', async (req, res) => {
  try {
    const { shop, access_token } = req.query;

    if (!shop || !access_token) {
      return res.status(400).json({
        error: 'Missing shop or access_token parameter'
      });
    }

    // Verify token by fetching shop information
    const shopResponse = await axios.get(`https://${shop}/admin/api/2023-10/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': access_token
      }
    });

    res.json({
      valid: true,
      shop: shopResponse.data.shop
    });

  } catch (error) {
    console.error('Token verification error:', error.response?.data || error.message);
    res.status(401).json({
      error: 'Invalid access token',
      details: error.response?.data || error.message
    });
  }
});

module.exports = router;