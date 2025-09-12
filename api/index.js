module.exports = (req, res) => {
  // Always respond with debug info
  res.json({
    message: 'Index API is working!',
    timestamp: new Date().toISOString(),
    url: req.url || 'no url',
    method: req.method || 'no method',
    headers: req.headers || {},
    query: req.query || {},
    body: req.body || {}
  });
};
