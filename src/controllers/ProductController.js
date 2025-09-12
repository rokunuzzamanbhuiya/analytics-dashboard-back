const ShopifyService = require('../services/ShopifyService');
const { processLowStockProducts, calculateProductSales, getProductDetails } = require('../../utils/productHelpers');
const { SHOPIFY_STORE_DOMAIN } = require('../../config/shopify');

/**
 * Product Controller
 * Handles all product-related business logic
 */
class ProductController {
  /**
   * Get all products
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProducts(req, res) {
    try {
      const { limit = 250, page_info } = req.query;
      
      const data = await ShopifyService.getProducts(parseInt(limit), page_info);
      const products = data?.products || [];
      
      console.log(`✅ Products fetched: ${products.length}`);
      
      res.json({
        success: true,
        data: products,
        count: products.length,
        pagination: {
          hasNextPage: !!data.page_info,
          nextPageInfo: data.page_info || null
        }
      });
    } catch (error) {
      console.error('❌ Products Error:', error.message);
      res.status(error.status || 500).json({
        success: false,
        error: error.message,
        details: error.details
      });
    }
  }

  /**
   * Get low stock products (inventory <= 5)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getLowStockProducts(req, res) {
    try {
      const { threshold = 5 } = req.query;
      
      const data = await ShopifyService.getProducts(50);
      const products = data?.products || [];
      
      const lowStockProducts = processLowStockProducts(products, SHOPIFY_STORE_DOMAIN)
        .filter(product => product.stock <= parseInt(threshold));
      
      console.log(`✅ Low stock products: ${lowStockProducts.length}`);
      
      res.json({
        success: true,
        data: lowStockProducts,
        count: lowStockProducts.length,
        threshold: parseInt(threshold)
      });
    } catch (error) {
      console.error('❌ Low Stock Error:', error.message);
      res.status(error.status || 500).json({
        success: false,
        error: error.message,
        details: error.details
      });
    }
  }

  /**
   * Get best selling products
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getBestSellingProducts(req, res) {
    try {
      const { limit = 10 } = req.query;
      
      // Get orders to calculate sales
      const ordersData = await ShopifyService.getOrders(250);
      const orders = ordersData?.orders || [];
      
      const productSales = calculateProductSales(orders);
      
      // Sort by quantity (descending)
      const sorted = Object.values(productSales).sort(
        (a, b) => b.quantity - a.quantity
      );
      
      // Get product details for top products
      const productIds = sorted.slice(0, parseInt(limit)).map(product => product.id);
      const productDetails = await getProductDetails(productIds, ShopifyService, SHOPIFY_STORE_DOMAIN);
      
      // Combine sales data with product details
      const result = sorted.slice(0, parseInt(limit)).map(product => ({
        id: product.id,
        name: product.name,
        product_id: product.id,
        total_sold: product.quantity,
        revenue: product.quantity * (product.price || 0), // Approximate revenue
        currency: 'USD',
        admin_url: productDetails[product.id]?.admin_url || `https://${SHOPIFY_STORE_DOMAIN}/admin/products/${product.id}`,
        public_url: productDetails[product.id]?.public_url || `https://${SHOPIFY_STORE_DOMAIN}/products/${product.handle || 'unknown'}`
      }));
      
      console.log(`✅ Best selling products: ${result.length}`);
      
      res.json({
        success: true,
        data: result,
        count: result.length
      });
    } catch (error) {
      console.error('❌ Best Selling Error:', error.message);
      res.status(error.status || 500).json({
        success: false,
        error: error.message,
        details: error.details
      });
    }
  }

  /**
   * Get worst selling products
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getWorstSellingProducts(req, res) {
    try {
      const { limit = 10 } = req.query;
      
      // Get all products
      const productsData = await ShopifyService.getProducts(250);
      const allProducts = productsData?.products || [];
      
      // Get sales data from orders
      const ordersData = await ShopifyService.getOrders(250);
      const orders = ordersData?.orders || [];
      const productSales = calculateProductSales(orders);
      
      // Create array with all products and their sales (0 if never sold)
      const productsWithSales = allProducts.map(product => ({
        id: product.id,
        name: product.title,
        product_id: product.id,
        total_sold: productSales[product.id]?.quantity || 0,
        revenue: (productSales[product.id]?.quantity || 0) * (product.variants?.[0]?.price || 0),
        currency: 'USD',
        admin_url: `https://${SHOPIFY_STORE_DOMAIN}/admin/products/${product.id}`,
        public_url: `https://${SHOPIFY_STORE_DOMAIN}/products/${product.handle}`
      }));
      
      // Sort by quantity (ascending) to get worst-selling first
      const sorted = productsWithSales.sort((a, b) => a.total_sold - b.total_sold);
      
      // Return bottom products (worst-selling)
      const result = sorted.slice(0, parseInt(limit));
      
      console.log(`✅ Worst selling products: ${result.length}`);
      
      res.json({
        success: true,
        data: result,
        count: result.length
      });
    } catch (error) {
      console.error('❌ Worst Selling Error:', error.message);
      res.status(error.status || 500).json({
        success: false,
        error: error.message,
        details: error.details
      });
    }
  }

  /**
   * Get single product by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProductById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Valid product ID is required'
        });
      }
      
      const data = await ShopifyService.getProduct(id);
      const product = data?.product;
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      
      console.log(`✅ Product fetched: ${product.title}`);
      
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('❌ Product Error:', error.message);
      res.status(error.status || 500).json({
        success: false,
        error: error.message,
        details: error.details
      });
    }
  }
}

module.exports = new ProductController();
