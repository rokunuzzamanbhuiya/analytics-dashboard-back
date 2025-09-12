const axios = require('axios');
const crypto = require('crypto');

/**
 * Auth Controller
 * Handles authentication-related business logic
 */
class AuthController {
  /**
   * Handle Shopify OAuth callback
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async handleOAuthCallback(req, res) {
    try {
      const { code, shop, state, redirect_uri } = req.body;

      // Validate required parameters
      if (!code || !shop) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: code and shop'
        });
      }

      // Verify the shop domain
      if (!shop.endsWith('.myshopify.com')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid shop domain'
        });
      }

      // Validate environment variables
      if (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_SECRET) {
        return res.status(500).json({
          success: false,
          error: 'OAuth configuration missing'
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
          success: false,
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

      console.log(`✅ OAuth successful for shop: ${shopData.name}`);

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
      console.error('❌ OAuth callback error:', error.response?.data || error.message);
      res.status(500).json({
        success: false,
        error: 'OAuth callback failed',
        details: error.response?.data || error.message
      });
    }
  }

  /**
   * Handle logout
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  logout(req, res) {
    try {
      // In a real app, you might want to revoke the token
      // For now, we'll just return success
      
      console.log('✅ User logged out');
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('❌ Logout error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Logout failed'
      });
    }
  }

  /**
   * Verify webhook signature
   * @param {string} body - Request body
   * @param {string} signature - Webhook signature
   * @param {string} secret - Webhook secret
   * @returns {boolean} True if signature is valid
   */
  verifyWebhookSignature(body, signature, secret) {
    try {
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(body, 'utf8');
      const hash = hmac.digest('base64');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'base64'),
        Buffer.from(hash, 'base64')
      );
    } catch (error) {
      console.error('❌ Webhook signature verification error:', error.message);
      return false;
    }
  }

  /**
   * Generate secure random state for OAuth
   * @returns {string} Random state string
   */
  generateOAuthState() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validate OAuth state
   * @param {string} receivedState - State received from callback
   * @param {string} expectedState - Expected state
   * @returns {boolean} True if state is valid
   */
  validateOAuthState(receivedState, expectedState) {
    return receivedState === expectedState;
  }
}

module.exports = new AuthController();
