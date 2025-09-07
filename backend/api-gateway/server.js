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
    auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
    user: process.env.USER_SERVICE_URL || 'http://localhost:3002',
    product: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3003',
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
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://abosefen-tamave.vercel.app',
      'http://localhost:5173',
      'http://localhost:5174'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(morgan('combined'));

// Critical: Body parsing middleware MUST be before proxy middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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
  max: 200, // limit each IP to 200 auth requests per windowMs (increased for testing)
  message: 'Too many authentication attempts, please try again later'
});

// Debug middleware for auth routes
app.use('/api/auth/*', (req, res, next) => {
  console.log(`🔍 Auth request: ${req.method} ${req.originalUrl}`, {
    body: req.body,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
  next();
});

// JWT Verification Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // TEMPORARY BYPASS - Remove when auth is fixed
  if (token === 'temp-mock-token-for-testing') {
    console.log('🚧 TEMPORARY TOKEN BYPASS - For testing purposes only');
    req.user = {
      _id: 'temp-admin-id',
      email: 'admin@abosefen.com',
      name: 'Admin User',
      role: 'admin',
      isActive: true
    };
    return next();
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

// Root endpoint - API information
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Abosefen E-commerce API Gateway',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      serviceHealth: '/health/services',
      auth: '/api/auth/*',
      products: '/api/products/*',
      categories: '/api/categories/*',
      cart: '/api/cart/*',
      orders: '/api/orders/*',
      payments: '/api/payments/*',
      notifications: '/api/notifications/*',
      admin: '/api/admin/*'
    },
    documentation: 'https://github.com/abosefen/abosefen-app'
  });
});

// Health check endpoint
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

// API Routes - PUBLIC AUTH ENDPOINTS FIRST (specific routes before catch-all)

// Public Authentication Service endpoints
app.use('/api/auth/register', authLimiter, createProxyMiddleware({ 
  target: config.services.auth, 
  changeOrigin: true, 
  pathRewrite: { '^/api/auth': '/auth' },
  timeout: 30000, // 30 seconds
  proxyTimeout: 30000,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🚀 Proxying REGISTER: ${req.method} ${req.originalUrl} to ${config.services.auth}/auth/register`);
  },
  onError: (err, req, res) => {
    console.error('❌ Proxy error (register):', err.message);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
}));

app.use('/api/auth/login', authLimiter, createProxyMiddleware({ 
  target: config.services.auth, 
  changeOrigin: true, 
  pathRewrite: { '^/api/auth': '/auth' },
  timeout: 30000, // 30 seconds
  proxyTimeout: 30000,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🚀 Proxying LOGIN: ${req.method} ${req.originalUrl} to ${config.services.auth}/auth/login`);
  },
  onError: (err, req, res) => {
    console.error('❌ Proxy error (login):', err.message);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
}));

app.use('/api/auth/refresh', authLimiter, createProxyMiddleware({
  target: config.services.auth,
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '/auth' },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🚀 Proxying REFRESH: ${req.method} ${req.originalUrl} to ${config.services.auth}/auth/refresh`);
  },
  onError: (err, req, res) => {
    console.error('❌ Proxy error (refresh):', err.message);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
}));

// PROTECTED AUTH ENDPOINTS (catch-all for remaining auth routes)
app.use('/api/auth', verifyToken, createProxyMiddleware({
  target: config.services.auth,
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '/auth' },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🚀 Proxying PROTECTED AUTH: ${req.method} ${req.originalUrl} to ${config.services.auth}`);
  },
  onError: (err, req, res) => {
    console.error('❌ Proxy error (protected auth):', err.message);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
}));

// Cart Service Routes (Proxied to Auth Service since carts are user-specific)
app.use('/api/cart', verifyToken, createProxyMiddleware({
  target: config.services.auth,
  changeOrigin: true,
  pathRewrite: { '^/api/cart': '/cart' }
}));

// User Service (Protected endpoints)
app.use('/api/users', verifyToken, createProxyMiddleware({
  target: config.services.user,
  changeOrigin: true,
  pathRewrite: { '^/api/users': '/api' }
}));

// Product Service (Public read, protected write)
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
  pathRewrite: { '^/api/products': '/products' },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.originalUrl} to ${config.services.product}${req.url.replace('/api/products', '/products')}`);
  }
}));

// Categories Service (Public read)
app.use('/api/categories', createProxyMiddleware({
  target: config.services.product,
  changeOrigin: true,
  pathRewrite: { '^/api/categories': '/categories' }
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
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
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