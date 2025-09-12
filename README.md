# Shopify Analytics Backend API

A refactored, production-ready backend API for the Shopify Analytics Dashboard.

## 🏗️ Architecture

The backend follows a clean, layered architecture:

```
src/
├── controllers/     # Business logic layer
├── services/        # External API integration layer
├── middleware/      # Cross-cutting concerns
├── routes/          # API route definitions
├── models/          # Data models (future)
├── validators/      # Input validation (future)
├── app.js          # Express app configuration
└── server.js       # Server startup
```

## 🚀 Features

- **Clean Architecture**: Separation of concerns with controllers, services, and middleware
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Validation**: Input validation and sanitization middleware
- **Logging**: Request/response logging with structured output
- **Security**: CORS, input sanitization, and security headers
- **Documentation**: Self-documenting API with endpoint listings
- **Health Checks**: Comprehensive health check endpoint
- **Graceful Shutdown**: Proper server shutdown handling

## 📋 API Endpoints

### Products

- `GET /api/products` - Get all products
- `GET /api/products/low-stock` - Get low stock products
- `GET /api/products/best-selling` - Get best selling products
- `GET /api/products/worst-selling` - Get worst selling products
- `GET /api/products/:id` - Get single product

### Orders

- `GET /api/orders` - Get all orders
- `GET /api/orders/pending` - Get pending orders
- `GET /api/orders/date-range` - Get orders by date range
- `GET /api/orders/:id` - Get single order

### Customers

- `GET /api/customers` - Get all customers
- `GET /api/customers/stats` - Get customer statistics
- `GET /api/customers/:id` - Get single customer

### Notifications

- `GET /api/notifications` - Get notifications
- `GET /api/notifications/stats` - Get notification statistics
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/:id/archive` - Archive notification
- `PATCH /api/notifications/mark-all-read` - Mark all as read

### Auth

- `POST /api/auth/callback` - OAuth callback
- `POST /api/auth/logout` - Logout

### System

- `GET /api/health` - Health check
- `GET /` - API documentation

## 🛠️ Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Environment variables**:
   Create a `.env` file with:

   ```env
   SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
   SHOPIFY_ADMIN_API_TOKEN=your-admin-api-token
   SHOPIFY_ADMIN_API_VERSION=2024-01
   NODE_ENV=development
   PORT=3001
   ```

3. **Run the server**:

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 🔧 Configuration

### Environment Variables

| Variable                    | Description                            | Required | Default     |
| --------------------------- | -------------------------------------- | -------- | ----------- |
| `SHOPIFY_STORE_DOMAIN`      | Your Shopify store domain              | Yes      | -           |
| `SHOPIFY_ADMIN_API_TOKEN`   | Shopify Admin API token                | Yes      | -           |
| `SHOPIFY_ADMIN_API_VERSION` | Shopify API version                    | No       | 2024-01     |
| `NODE_ENV`                  | Environment                            | No       | development |
| `PORT`                      | Server port                            | No       | 3001        |
| `ALLOWED_ORIGINS`           | CORS allowed origins (comma-separated) | No       | localhost   |

### CORS Configuration

The API is configured with CORS for the following origins:

- **Development**: `http://localhost:3000`, `http://localhost:5173`
- **Production**: Configured via `ALLOWED_ORIGINS` environment variable

## 📊 Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "count": 10,
  "pagination": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "details": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint",
  "method": "GET"
}
```

## 🔍 Health Check

The health check endpoint (`/api/health`) provides:

```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development",
  "version": "2.0.0",
  "services": {
    "shopify": "configured"
  }
}
```

## 🚨 Error Handling

The API includes comprehensive error handling:

- **400**: Bad Request (validation errors)
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error
- **503**: Service Unavailable (Shopify API down)
- **504**: Gateway Timeout

## 📝 Logging

The API logs:

- All incoming requests with method, path, IP, and user agent
- All responses with status code and duration
- All errors with stack traces
- Shopify API interactions

## 🔒 Security

Security features include:

- Input sanitization to prevent XSS
- CORS configuration
- Request size limits
- Error message sanitization in production
- Trust proxy configuration

## 🚀 Deployment

### Vercel

The API is configured for Vercel deployment with:

- `vercel.json` configuration
- Environment variable support
- Automatic scaling

### Docker (Future)

Docker configuration can be added for containerized deployment.

## 🧪 Testing

Testing framework can be added with:

- Jest for unit tests
- Supertest for integration tests
- Test coverage reporting

## 📈 Monitoring

Consider adding:

- Application performance monitoring (APM)
- Error tracking (Sentry)
- Metrics collection
- Health check monitoring

## 🔄 Migration from v1.0

The refactored API maintains backward compatibility with legacy endpoints:

- `/api/best-selling` → `/api/products/best-selling`
- `/api/worst-selling` → `/api/products/worst-selling`

## 📚 Documentation

- API documentation is available at the root endpoint (`/`)
- All endpoints include proper HTTP status codes
- Request/response examples in controller comments
- Error handling documentation in middleware

## 🤝 Contributing

1. Follow the established architecture patterns
2. Add proper error handling and validation
3. Include logging for new endpoints
4. Update documentation
5. Test thoroughly

## 📄 License

ISC License
