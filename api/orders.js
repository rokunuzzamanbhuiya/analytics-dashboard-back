module.exports = (req, res) => {
  res.json({
    message: 'Orders endpoint is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
};
