// Simple Vercel function (like test.js but with more endpoints)
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url, method } = req;
  
  // Route handling
  if (method === 'GET') {
    if (url === '/api/health') {
      res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0'
      });
      return;
    }
    
    if (url === '/api/test') {
      res.json({ 
        message: 'API is working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
      return;
    }
    
    if (url === '/') {
      res.json({ 
        message: 'Shopify Analytics Dashboard API',
        endpoints: [
          '/api/health',
          '/api/test'
        ]
      });
      return;
    }
  }
  
  // 404 for everything else
  res.status(404).json({ 
    error: 'Route not found',
    path: url,
    method: method,
    availableEndpoints: [
      '/api/health',
      '/api/test'
    ]
  });
};
