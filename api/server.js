const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.vercel.app'] // Replace with your actual frontend domain
    : ['http://localhost:3000', 'http://localhost:5173'], // Vite default ports
  credentials: true
}));
app.use(express.json());

// Import routes from root routes directory
const authRoutes = require('../routes/auth');
const ordersRoutes = require('../routes/orders');
const productsRoutes = require('../routes/products');
const customersRoutes = require('../routes/customers');
const notificationsRoutes = require('../routes/notifications');
const bestSellingRoutes = require('../routes/best-selling');
const worstSellingRoutes = require('../routes/worst-selling');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/best-selling', bestSellingRoutes);
app.use('/api/worst-selling', worstSellingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Shopify Analytics API',
    version: '1.0.0',
    endpoints: [
      '/api/health',
      '/api/auth',
      '/api/orders',
      '/api/products',
      '/api/customers',
      '/api/notifications',
      '/api/best-selling',
      '/api/worst-selling'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Start server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  });
}

module.exports = app;
