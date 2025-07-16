const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Configuration
const config = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your-very-secure-jwt-secret-key-2024-abosefen'
  },
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    user: process.env.USER_SERVICE_URL || 'http://localhost:3002',
    product: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3003',
    order: process.env.ORDER_SERVICE_URL || 'http://localhost:3004',
    payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005',
    notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006',
    admin: process.env.ADMIN_SERVICE_URL || 'http://localhost:3007'
  }
};

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('combined'));
// Remove global express.json() and express.urlencoded() here
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later'
});

// === Place these IMMEDIATELY after rate limiters ===
app.use('/api/auth/register', authLimiter, createProxyMiddleware({ 
  target: config.services.auth, 
  changeOrigin: true, 
  pathRewrite: { '^/api/auth': '/auth' }
}));
app.use('/api/auth/login', authLimiter, createProxyMiddleware({ 
  target: config.services.auth, 
  changeOrigin: true, 
  pathRewrite: { '^/api/auth': '/auth' }
}));

// JWT Verification Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, config.jwt.secret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Admin verification middleware
const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Health check endpoint (apply body parsing only here)
app.use('/health', express.json(), express.urlencoded({ extended: true }));
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: config.services
  });
});

// Service health check endpoint
app.get('/health/services', async (req, res) => {
  const healthChecks = {};
  
  for (const [serviceName, serviceUrl] of Object.entries(config.services)) {
    try {
      const response = await fetch(`${serviceUrl}/health`, { 
        method: 'GET',
        timeout: 5000 
      });
      healthChecks[serviceName] = {
        status: response.ok ? 'healthy' : 'unhealthy',
        url: serviceUrl,
        responseTime: response.headers.get('x-response-time') || 'N/A'
      };
    } catch (error) {
      healthChecks[serviceName] = {
        status: 'unhealthy',
        url: serviceUrl,
        error: error.message
      };
    }
  }
  
  res.json({ healthChecks, timestamp: new Date().toISOString() });
});

// API Routes

// Authentication Service (Public endpoints)
app.use('/api/auth/refresh', authLimiter, createProxyMiddleware({
  target: config.services.auth,
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '/auth' }
}));

// All other auth endpoints require authentication
app.use('/api/auth', verifyToken, createProxyMiddleware({
  target: config.services.auth,
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '/auth' }
}));

// User Service (Protected endpoints)
app.use('/api/users', verifyToken, createProxyMiddleware({
  target: config.services.user,
  changeOrigin: true,
  pathRewrite: { '^/api/users': '/api' }
}));

// Product Service (Public read, protected write)
app.use('/api/products/search', createProxyMiddleware({
  target: config.services.product,
  changeOrigin: true,
  pathRewrite: { '^/api/products': '/api' }
}));

app.use('/api/products/:id', (req, res, next) => {
  if (req.method === 'GET') {
    next();
  } else {
    verifyToken(req, res, next);
  }
}, createProxyMiddleware({
  target: config.services.product,
  changeOrigin: true,
  pathRewrite: { '^/api/products': '/api' }
}));

app.use('/api/products', (req, res, next) => {
  if (req.method === 'GET') {
    next();
  } else {
    verifyToken(req, res, () => {
      verifyAdmin(req, res, next);
    });
  }
}, createProxyMiddleware({
  target: config.services.product,
  changeOrigin: true,
  pathRewrite: { '^/api/products': '/api' }
}));

// Order Service (Protected endpoints)
app.use('/api/orders', verifyToken, createProxyMiddleware({
  target: config.services.order,
  changeOrigin: true,
  pathRewrite: { '^/api/orders': '/api' }
}));

// Payment Service (Protected endpoints)
app.use('/api/payments', verifyToken, createProxyMiddleware({
  target: config.services.payment,
  changeOrigin: true,
  pathRewrite: { '^/api/payments': '/api' }
}));

// Notification Service (Protected endpoints)
app.use('/api/notifications', verifyToken, createProxyMiddleware({
  target: config.services.notification,
  changeOrigin: true,
  pathRewrite: { '^/api/notifications': '/api' }
}));

// Admin Service (Admin only endpoints)
app.use('/api/admin', verifyToken, verifyAdmin, createProxyMiddleware({
  target: config.services.admin,
  changeOrigin: true,
  pathRewrite: { '^/api/admin': '/api' }
}));

// Catch-all error handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Gateway Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on http://localhost:${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`🔍 Service health check available at http://localhost:${PORT}/health/services`);
  console.log('🏗️  Microservices Configuration:');
  Object.entries(config.services).forEach(([name, url]) => {
    console.log(`   📌 ${name.toUpperCase()} Service: ${url}`);
  });
});

module.exports = app; 