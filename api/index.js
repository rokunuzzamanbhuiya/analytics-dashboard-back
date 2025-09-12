const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const ordersRoutes = require('./routes/orders');
const productsRoutes = require('./routes/products');
const customersRoutes = require('./routes/customers');
const bestSellingRoutes = require('./routes/best-selling');
const worstSellingRoutes = require('./routes/worst-selling');
const notificationsRoutes = require('./routes/notifications');
const authRoutes = require('./routes/auth');

// Use routes
app.use('/api/orders', ordersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/best-selling', bestSellingRoutes);
app.use('/api/worst-selling', worstSellingRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global Error:', err);
  console.error('❌ Error Stack:', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Export the Express app for Vercel
module.exports = app;
