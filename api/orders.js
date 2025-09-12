module.exports = (req, res) => {
  res.json({
    message: 'Orders endpoint is working!',
    timestamp: new Date().toISOString(),
    note: 'Shopify integration coming soon'
  });
};
