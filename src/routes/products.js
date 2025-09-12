const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateId, validatePagination, validateQueryParams } = require('../middleware/validation');

/**
 * Product Routes
 * All routes are prefixed with /api/products
 */

// GET /api/products - Get all products
router.get('/', 
  validatePagination(),
  validateQueryParams({
    limit: { type: 'number', min: 1, max: 250, required: false },
    page_info: { type: 'string', required: false }
  }),
  asyncHandler(ProductController.getProducts)
);

// GET /api/products/low-stock - Get low stock products
router.get('/low-stock',
  validateQueryParams({
    threshold: { type: 'number', min: 1, max: 100, required: false }
  }),
  asyncHandler(ProductController.getLowStockProducts)
);

// GET /api/products/best-selling - Get best selling products
router.get('/best-selling',
  validateQueryParams({
    limit: { type: 'number', min: 1, max: 50, required: false }
  }),
  asyncHandler(ProductController.getBestSellingProducts)
);

// GET /api/products/worst-selling - Get worst selling products
router.get('/worst-selling',
  validateQueryParams({
    limit: { type: 'number', min: 1, max: 50, required: false }
  }),
  asyncHandler(ProductController.getWorstSellingProducts)
);

// GET /api/products/:id - Get single product by ID
router.get('/:id',
  validateId('id'),
  asyncHandler(ProductController.getProductById)
);

module.exports = router;
