const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateId, validateQueryParams } = require('../middleware/validation');

/**
 * Notification Routes
 * All routes are prefixed with /api/notifications
 */

// GET /api/notifications - Get notifications (recent orders)
router.get('/',
  validateQueryParams({
    hours: { type: 'number', min: 1, max: 168, required: false }, // Max 1 week
    limit: { type: 'number', min: 1, max: 100, required: false }
  }),
  asyncHandler(NotificationController.getNotifications)
);

// GET /api/notifications/stats - Get notification statistics
router.get('/stats',
  NotificationController.getNotificationStats
);

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch('/:id/read',
  validateId('id'),
  NotificationController.markAsRead
);

// PATCH /api/notifications/:id/archive - Archive notification
router.patch('/:id/archive',
  validateId('id'),
  NotificationController.archive
);

// PATCH /api/notifications/mark-all-read - Mark all notifications as read
router.patch('/mark-all-read',
  NotificationController.markAllAsRead
);

module.exports = router;
