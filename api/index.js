module.exports = (req, res) => {
  res.json({
    message: 'Index API is working!',
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method
  });
};
