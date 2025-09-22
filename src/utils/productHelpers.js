/**
 * Product Helper Functions
 * Utility functions for product-related operations
 */

/**
 * Process low stock products
 * @param {Array} products - Array of products
 * @param {number} threshold - Low stock threshold (default: 10)
 * @returns {Array} Array of low stock products
 */
const processLowStockProducts = (products, threshold = 10) => {
  if (!Array.isArray(products)) {
    return [];
  }

  return products.filter(product => {
    if (!product.variants || !Array.isArray(product.variants)) {
      return false;
    }

    return product.variants.some(variant => {
      const inventory = variant.inventory_quantity;
      
      // Handle different inventory states:
      // -1: Inventory tracking disabled (treat as unlimited stock, don't include)
      // 0: Out of stock (include)
      // > 0: Limited stock (include if <= threshold)
      if (inventory === -1) {
        return false; // Skip products with disabled inventory tracking
      }
      
      return inventory <= threshold && inventory >= 0;
    });
  });
};

/**
 * Calculate product sales data from orders
 * @param {Array} orders - Array of orders
 * @returns {Object} Object with product sales data
 */
const calculateProductSales = (orders) => {
  if (!Array.isArray(orders)) {
    return {};
  }

  const productSales = {};

  orders.forEach(order => {
    if (order.line_items && Array.isArray(order.line_items)) {
      order.line_items.forEach(item => {
        const productId = item.product_id;
        if (productId) {
          if (!productSales[productId]) {
            productSales[productId] = {
              quantity: 0,
              revenue: 0
            };
          }
          productSales[productId].quantity += item.quantity || 0;
          productSales[productId].revenue += (item.price || 0) * (item.quantity || 0);
        }
      });
    }
  });

  return productSales;
};

/**
 * Get product details with formatted data
 * @param {Object} product - Product object
 * @returns {Object} Formatted product details
 */
const getProductDetails = (product) => {
  if (!product) {
    return null;
  }

  const variants = product.variants || [];
  const images = product.images || [];
  const options = product.options || [];

  return {
    id: product.id,
    title: product.title,
    body_html: product.body_html,
    vendor: product.vendor,
    product_type: product.product_type,
    handle: product.handle,
    status: product.status,
    tags: product.tags,
    created_at: product.created_at,
    updated_at: product.updated_at,
    published_at: product.published_at,
    variants: variants.map(variant => ({
      id: variant.id,
      title: variant.title,
      price: variant.price,
      compare_at_price: variant.compare_at_price,
      inventory_quantity: variant.inventory_quantity,
      sku: variant.sku,
      weight: variant.weight,
      weight_unit: variant.weight_unit
    })),
    images: images.map(image => ({
      id: image.id,
      src: image.src,
      alt: image.alt,
      width: image.width,
      height: image.height
    })),
    options: options.map(option => ({
      id: option.id,
      name: option.name,
      position: option.position,
      values: option.values
    })),
    primary_image: product.image
  };
};

module.exports = {
  processLowStockProducts,
  calculateProductSales,
  getProductDetails
};
