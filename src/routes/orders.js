const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateId, validatePagination, validateDateRange, validateQueryParams } = require('../middleware/validation');

/**
 * Order Routes
 * All routes are prefixed with /api/orders
 */

// GET /api/orders - Get all orders
router.get('/',
  validatePagination(),
  validateQueryParams({
    limit: { type: 'number', min: 1, max: 250, required: false },
    status: { 
      type: 'string', 
      enum: ['any', 'open', 'closed', 'cancelled', 'pending'], 
      required: false 
    },
    fulfillment_status: { 
      type: 'string', 
      enum: ['fulfilled', 'null', 'partial', 'restocked', 'unfulfilled'], 
      required: false 
    }
  }),
  asyncHandler(OrderController.getOrders)
);

// GET /api/orders/pending - Get pending/unfulfilled orders
router.get('/pending',
  validatePagination(),
  asyncHandler(OrderController.getPendingOrders)
);

// GET /api/orders/date-range - Get orders by date range
router.get('/date-range',
  validateDateRange(),
  validateQueryParams({
    start_date: { type: 'date', required: true },
    end_date: { type: 'date', required: true },
    limit: { type: 'number', min: 1, max: 250, required: false },
    status: { 
      type: 'string', 
      enum: ['any', 'open', 'closed', 'cancelled', 'pending'], 
      required: false 
    }
  }),
  asyncHandler(OrderController.getOrdersByDateRange)
);

// GET /api/orders/:id - Get single order by ID
router.get('/:id',
  validateId('id'),
  asyncHandler(OrderController.getOrderById)
);

module.exports = router;
