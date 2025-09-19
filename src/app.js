const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import middleware
const { requestLogger, errorLogger } = require('./middleware/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { sanitizeInput } = require('./middleware/validation');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const customerRoutes = require('./routes/customers');
const notificationRoutes = require('./routes/notifications');

// Import services to check configuration
const ShopifyService = require('./services/ShopifyService');

/**
 * Express Application Setup
 */
const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || [
        'https://analytics-dashboard-polaris.netlify.app',
        'https://your-frontend-domain.vercel.app'
      ]
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(sanitizeInput);

// Logging middleware
app.use(requestLogger);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    services: {
      shopify: ShopifyService.isConfigured() ? 'configured' : 'not configured'
    }
  };

  // Check if Shopify service is properly configured
  if (!ShopifyService.isConfigured()) {
    health.status = 'WARNING';
    health.warnings = ['Shopify service not properly configured'];
  }

  res.json(health);
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/notifications', notificationRoutes);

// Legacy route redirects for backward compatibility
app.get('/api/best-selling', (req, res) => {
  res.redirect(301, '/api/products/best-selling');
});

app.get('/api/worst-selling', (req, res) => {
  res.redirect(301, '/api/products/worst-selling');
});

// Root endpoint with API documentation
app.get('/', (req, res) => {
  res.json({
    message: 'Shopify Analytics API',
    version: '2.0.0',
    status: 'refactored',
    documentation: {
      health: '/api/health',
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      customers: '/api/customers',
      notifications: '/api/notifications'
    },
    endpoints: {
      products: [
        'GET /api/products',
        'GET /api/products/low-stock',
        'GET /api/products/best-selling',
        'GET /api/products/worst-selling',
        'GET /api/products/:id'
      ],
      orders: [
        'GET /api/orders',
        'GET /api/orders/pending',
        'GET /api/orders/date-range',
        'GET /api/orders/:id'
      ],
      customers: [
        'GET /api/customers',
        'GET /api/customers/stats',
        'GET /api/customers/:id'
      ],
      notifications: [
        'GET /api/notifications',
        'GET /api/notifications/stats',
        'PATCH /api/notifications/:id/read',
        'PATCH /api/notifications/:id/archive',
        'PATCH /api/notifications/mark-all-read'
      ],
      auth: [
        'POST /api/auth/callback',
        'POST /api/auth/logout'
      ]
    }
  });
});

// Error handling middleware (must be last)
app.use(errorLogger);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
