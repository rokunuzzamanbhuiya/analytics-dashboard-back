const express = require('express');
const router = express.Router();

// Products endpoint
router.get('/', async (req, res) => {
  try {
    res.json({ message: 'Products endpoint - coming soon' });
  } catch (err) {
    console.error("❌ Products Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
