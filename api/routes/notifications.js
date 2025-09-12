const express = require('express');
const router = express.Router();

// Notifications endpoint
router.get('/', async (req, res) => {
  try {
    res.json({ message: 'Notifications endpoint - coming soon' });
  } catch (err) {
    console.error("❌ Notifications Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
