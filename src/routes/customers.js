const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/CustomerController');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateId, validatePagination } = require('../middleware/validation');

/**
 * Customer Routes
 * All routes are prefixed with /api/customers
 */

// GET /api/customers - Get all customers
router.get('/',
  validatePagination(),
  asyncHandler(CustomerController.getCustomers)
);

// GET /api/customers/stats - Get customer statistics
router.get('/stats',
  asyncHandler(CustomerController.getCustomerStats)
);

// GET /api/customers/:id - Get single customer by ID
router.get('/:id',
  validateId('id'),
  asyncHandler(CustomerController.getCustomerById)
);

module.exports = router;
