const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { asyncHandler, validateRequiredFields } = require('../middleware/errorHandler');
const { validateRequiredFields: validateFields } = require('../middleware/validation');

/**
 * Auth Routes
 * All routes are prefixed with /api/auth
 */

// POST /api/auth/callback - Handle Shopify OAuth callback
router.post('/callback',
  validateFields(['code', 'shop']),
  asyncHandler(AuthController.handleOAuthCallback)
);

// POST /api/auth/logout - Handle logout
router.post('/logout',
  AuthController.logout
);

module.exports = router;
