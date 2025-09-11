// Helper function to process low stock products
function processLowStockProducts(products, SHOPIFY_STORE_DOMAIN) {
  const lowStock = [];

  products.forEach((product) => {
    // Check if product has variants
    if (product.variants && Array.isArray(product.variants)) {
      product.variants.forEach((variant) => {
        if (
          variant.inventory_quantity !== null &&
          variant.inventory_quantity <= 5
        ) {
          lowStock.push({
            id: `${product.id}-${variant.id}`, // Unique ID combining product and variant
            product_id: product.id,
            variant_id: variant.id,
            name: product.title,
            stock: variant.inventory_quantity,
            image: product.images && product.images.length > 0 ? product.images[0].src : null,
            handle: product.handle,
            admin_url: `https://${SHOPIFY_STORE_DOMAIN}/admin/products/${product.id}`,
            public_url: `https://${SHOPIFY_STORE_DOMAIN}/products/${product.handle}`
          });
        }
      });
    }
  });

  // Sort by stock quantity (lowest first) and take top 10
  return lowStock
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 10);
}

// Helper function to calculate product sales from orders
function calculateProductSales(orders) {
  const productSales = {};

  orders.forEach((order) => {
    if (order.line_items && Array.isArray(order.line_items)) {
      order.line_items.forEach((item) => {
        if (item.product_id && item.quantity) {
          if (!productSales[item.product_id]) {
            productSales[item.product_id] = {
              id: item.product_id,
              name: item.name,
              quantity: 0,
            };
          }
          productSales[item.product_id].quantity += item.quantity;
        }
      });
    }
  });

  return productSales;
}

// Helper function to get product details
async function getProductDetails(productIds, shopify, SHOPIFY_STORE_DOMAIN) {
  const productDetails = {};
  
  if (productIds.length > 0) {
    try {
      const { data: productsData } = await shopify.get(
        `products.json?ids=${productIds.join(',')}`
      );
      
      productsData.products.forEach(product => {
        productDetails[product.id] = {
          handle: product.handle,
          admin_url: `https://${SHOPIFY_STORE_DOMAIN}/admin/products/${product.id}`,
          public_url: `https://${SHOPIFY_STORE_DOMAIN}/products/${product.handle}`
        };
      });
    } catch (productErr) {
      console.warn("⚠️ Could not fetch product details:", productErr.message);
    }
  }

  return productDetails;
}

module.exports = {
  processLowStockProducts,
  calculateProductSales,
  getProductDetails
};
