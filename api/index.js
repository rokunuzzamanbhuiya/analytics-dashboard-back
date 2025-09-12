module.exports = (req, res) => {
  const url = req.url || '';
  const method = req.method || 'GET';
  
  console.log('Request URL:', url);
  console.log('Request Method:', method);
  
  // Health endpoint
  if (url === '/health' || url === '/api/health' || url.includes('health')) {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      url: url
    });
    return;
  }
  
  // Orders endpoint
  if (url === '/orders' || url === '/api/orders' || url.includes('orders')) {
    res.json({
      message: 'Orders endpoint is working!',
      timestamp: new Date().toISOString(),
      note: 'Shopify integration coming soon',
      url: url
    });
    return;
  }
  
  // Products endpoint
  if (url === '/products' || url === '/api/products' || url.includes('products')) {
    res.json({
      message: 'Products endpoint is working!',
      timestamp: new Date().toISOString(),
      note: 'Shopify integration coming soon',
      url: url
    });
    return;
  }
  
  // Default response
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    url: url,
    method: method,
    availableEndpoints: [
      '/health',
      '/orders', 
      '/products'
    ]
  });
};
