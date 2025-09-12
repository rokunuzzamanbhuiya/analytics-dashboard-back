module.exports = (req, res) => {
  res.json({
    status: 'success',
    message: 'Vercel deployment is working!',
    timestamp: new Date().toISOString(),
    project: 'analytics-dashboard-back',
    version: '1.0.0'
  });
};
