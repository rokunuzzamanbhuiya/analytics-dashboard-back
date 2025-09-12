module.exports = (req, res) => {
  const url = req.url || '';
  
  // Health endpoint
  if (url.includes('/health')) {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0'
    });
    return;
  }
  
  // Orders endpoint
  if (url.includes('/orders')) {
    res.json({
      message: 'Orders endpoint is working!',
      timestamp: new Date().toISOString(),
      note: 'Shopify integration coming soon'
    });
    return;
  }
  
  // Products endpoint
  if (url.includes('/products')) {
    res.json({
      message: 'Products endpoint is working!',
      timestamp: new Date().toISOString(),
      note: 'Shopify integration coming soon'
    });
    return;
  }
  
  // Default response
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      '/health',
      '/orders', 
      '/products'
    ]
  });
};
