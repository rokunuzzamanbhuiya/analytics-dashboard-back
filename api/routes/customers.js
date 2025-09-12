const express = require('express');
const router = express.Router();

// Customers endpoint
router.get('/', async (req, res) => {
  try {
    res.json({ message: 'Customers endpoint - coming soon' });
  } catch (err) {
    console.error("❌ Customers Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
