const express = require('express');
const router = express.Router();

// Best selling products endpoint
router.get('/', async (req, res) => {
  try {
    res.json({ message: 'Best selling products endpoint - coming soon' });
  } catch (err) {
    console.error("❌ Best Selling Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
