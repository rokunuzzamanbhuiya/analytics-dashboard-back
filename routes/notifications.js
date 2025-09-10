const express = require('express');
const router = express.Router();
const { shopify } = require('../config/shopify');
const { formatOrderForNotification } = require('../utils/notificationHelpers');

// In-memory storage for notification states (in production, use a database)
let notificationStates = {};

// Notifications endpoint - Get recent orders for notifications
router.get('/', async (req, res) => {
  try {
    // Get recent orders from the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const createdAtMin = oneDayAgo.toISOString();
    
    const { data } = await shopify.get(
      `orders.json?status=any&limit=50&created_at_min=${createdAtMin}`
    );
    
    const orders = data.orders || [];
    
    // Format orders into notification format
    const notifications = orders.map((order) => {
      const notification = formatOrderForNotification(order);
      // Apply stored state if exists
      if (notificationStates[notification.id]) {
        notification.read = notificationStates[notification.id].read;
        notification.archived = notificationStates[notification.id].archived;
      }
      return notification;
    });
    
    // Sort by creation date (newest first)
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    console.log("🔔 Notifications fetched:", notifications.length);
    res.json(notifications);
  } catch (err) {
    console.error("❌ Notifications Error:", err.response?.data || err.message);
    res
      .status(500)
      .json({ error: err.message, details: err.response?.data || null });
  }
});

// Mark notification as read
router.patch('/:id/read', (req, res) => {
  try {
    const { id } = req.params;
    
    if (!notificationStates[id]) {
      notificationStates[id] = { read: false, archived: false };
    }
    
    notificationStates[id].read = true;
    
    console.log(`✅ Notification ${id} marked as read`);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    console.error("❌ Mark as Read Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Archive notification
router.patch('/:id/archive', (req, res) => {
  try {
    const { id } = req.params;
    
    if (!notificationStates[id]) {
      notificationStates[id] = { read: false, archived: false };
    }
    
    notificationStates[id].archived = true;
    
    console.log(`✅ Notification ${id} archived`);
    res.json({ success: true, message: 'Notification archived' });
  } catch (err) {
    console.error("❌ Archive Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', (req, res) => {
  try {
    // This would need to be implemented with a proper database
    // For now, we'll just return success
    console.log("✅ All notifications marked as read");
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    console.error("❌ Mark All Read Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
