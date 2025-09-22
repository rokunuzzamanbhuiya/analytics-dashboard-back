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
      const inventory = variant.inventory_quantity || 0;
      return inventory <= threshold && inventory >= 0;
    });
  });
};

/**
 * Calculate product sales data
 * @param {Array} products - Array of products
 * @returns {Array} Array of products with sales data
 */
const calculateProductSales = (products) => {
  if (!Array.isArray(products)) {
    return [];
  }

  return products.map(product => {
    const totalSales = product.variants?.reduce((sum, variant) => {
      return sum + (variant.price || 0);
    }, 0) || 0;

    const averagePrice = product.variants?.length > 0 
      ? totalSales / product.variants.length 
      : 0;

    return {
      ...product,
      totalSales,
      averagePrice,
      variantCount: product.variants?.length || 0
    };
  });
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

/**
 * Sort products by sales (best selling)
 * @param {Array} products - Array of products
 * @returns {Array} Sorted products (best selling first)
 */
const sortProductsBySales = (products) => {
  return products.sort((a, b) => {
    const aSales = a.totalSales || 0;
    const bSales = b.totalSales || 0;
    return bSales - aSales;
  });
};

/**
 * Sort products by sales (worst selling)
 * @param {Array} products - Array of products
 * @returns {Array} Sorted products (worst selling first)
 */
const sortProductsByWorstSales = (products) => {
  return products.sort((a, b) => {
    const aSales = a.totalSales || 0;
    const bSales = b.totalSales || 0;
    return aSales - bSales;
  });
};

module.exports = {
  processLowStockProducts,
  calculateProductSales,
  getProductDetails,
  sortProductsBySales,
  sortProductsByWorstSales
};
