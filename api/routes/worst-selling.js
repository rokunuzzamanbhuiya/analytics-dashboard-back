const express = require('express');
const router = express.Router();

// Worst selling products endpoint
router.get('/', async (req, res) => {
  try {
    res.json({ message: 'Worst selling products endpoint - coming soon' });
  } catch (err) {
    console.error("❌ Worst Selling Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
