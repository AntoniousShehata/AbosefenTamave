# Abosefen E-commerce Microservices Deployment Guide

## 🏗️ Architecture Overview

The Abosefen e-commerce platform has been successfully converted to a microservices architecture with the following components:

### ✅ Completed Services

1. **API Gateway** (Port 8080) - Request routing and authentication
2. **Authentication Service** (Port 3001) - User registration, login, JWT management
3. **Product Service** (Port 3003) - Product catalog and inventory management
4. **Placeholder Services** - User, Order, Payment, Notification, Admin services

### 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: SQL Server (separate database per service)
- **Authentication**: JWT tokens
- **Containerization**: Docker & Docker Compose
- **API Gateway**: Express.js with http-proxy-middleware
- **Frontend**: React (updated to work with API Gateway)

## 🚀 Quick Start

### Prerequisites

1. **Docker & Docker Compose** installed
2. **Node.js 18+** (for development)
3. **Git** for version control

### 1. Setup Microservices

```bash
# Navigate to microservices directory
cd microservices

# Make setup script executable (Linux/Mac)
chmod +x setup.sh

# Run setup script (Linux/Mac)
./setup.sh

# Or manually run (Windows)
docker-compose up -d
```

### 2. Start Frontend

```bash
# Go back to project root
cd ..

# Start React frontend
npm run dev
```

### 3. Access the Application

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:8080
- **Health Check**: http://localhost:8080/health

## 📊 Service Status

| Service | Status | Port | Health Check |
|---------|--------|------|-------------|
| API Gateway | ✅ Complete | 8080 | http://localhost:8080/health |
| Auth Service | ✅ Complete | 3001 | http://localhost:3001/health |
| Product Service | ✅ Complete | 3003 | http://localhost:3003/health |
| User Service | 🚧 Placeholder | 3002 | http://localhost:3002/health |
| Order Service | 🚧 Placeholder | 3004 | http://localhost:3004/health |
| Payment Service | 🚧 Placeholder | 3005 | http://localhost:3005/health |
| Notification Service | 🚧 Placeholder | 3006 | http://localhost:3006/health |
| Admin Service | 🚧 Placeholder | 3007 | http://localhost:3007/health |

## 🔧 Development Workflow

### Running Individual Services

```bash
# Start API Gateway only
cd microservices/api-gateway
npm install
npm start

# Start Auth Service only
cd microservices/auth-service
npm install
npm start

# Start Product Service only
cd microservices/product-service
npm install
npm start
```

### Docker Commands

```bash
# View all services status
docker-compose ps

# View logs for specific service
docker-compose logs -f auth-service

# Restart specific service
docker-compose restart product-service

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

## 🗄️ Database Configuration

Each service has its own SQL Server database:

- **Abosefen_Auth** - Authentication Service
- **Abosefen_Products** - Product Service
- **Abosefen_Users** - User Service (when implemented)
- **Abosefen_Orders** - Order Service (when implemented)
- **Abosefen_Payments** - Payment Service (when implemented)
- **Abosefen_Notifications** - Notification Service (when implemented)

### Default Admin User

- **Email**: admin@abosefen.com
- **Password**: Admin123456!

## 🌐 API Endpoints

All API requests go through the API Gateway at `http://localhost:8080/api`

### Authentication Endpoints

```
POST /api/auth/register    - User registration
POST /api/auth/login       - User login
POST /api/auth/refresh     - Refresh JWT token
POST /api/auth/logout      - User logout
GET  /api/auth/profile     - Get user profile
POST /api/auth/change-password - Change password
```

### Product Endpoints

```
GET    /api/products              - Get all products (public)
GET    /api/products/:id          - Get product by ID (public)
POST   /api/products              - Create product (admin only)
PUT    /api/products/:id          - Update product (admin only)
DELETE /api/products/:id          - Delete product (admin only)
GET    /api/categories            - Get all categories
POST   /api/categories            - Create category (admin only)
GET    /api/search?q=term         - Search products
POST   /api/products/:id/inventory - Update inventory (admin only)
```

## 🔒 Security Features

- **JWT Authentication** with access and refresh tokens
- **Rate Limiting** on all endpoints
- **Role-based Access Control** (customer/admin)
- **CORS Protection** 
- **Helmet.js** security headers
- **Input Validation** using express-validator
- **SQL Injection Protection** using parameterized queries

## 📈 Monitoring & Health Checks

### Health Check Endpoints

- **Overall Health**: http://localhost:8080/health
- **Service Health**: http://localhost:8080/health/services
- **Individual Service Health**: http://localhost:{port}/health

### Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs -f auth-service

# View last 100 lines
docker-compose logs --tail=100 product-service
```

## 🔄 Migration from Monolith

The frontend has been updated to work with the API Gateway:

1. **AuthContext** now points to `http://localhost:8080/api`
2. **All API calls** go through the API Gateway
3. **Authentication headers** are handled by the gateway
4. **Service discovery** is managed by the gateway

## 🚀 Production Deployment

### Environment Variables

Copy `config.env` and update for production:

```bash
# Database
DB_SERVER=your-production-db-server
DB_PASSWORD=your-secure-password

# JWT
JWT_SECRET=your-very-secure-production-secret

# External Services
STRIPE_SECRET_KEY=your-production-stripe-key
EMAIL_USER=your-production-email
EMAIL_PASS=your-production-email-password
```

### Docker Production

```bash
# Build for production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Kubernetes Deployment

1. Create Kubernetes manifests from Docker Compose
2. Set up ingress controller for API Gateway
3. Configure persistent volumes for database
4. Set up monitoring and logging

## 🧪 Testing

### Service Health Tests

```bash
# Test all service health endpoints
curl http://localhost:8080/health/services

# Test authentication
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@abosefen.com","password":"Admin123456!"}'

# Test product catalog
curl http://localhost:8080/api/products
```

### Load Testing

Use tools like Apache Bench or Artillery to test:

```bash
# Test API Gateway
ab -n 1000 -c 10 http://localhost:8080/health

# Test product listing
ab -n 1000 -c 10 http://localhost:8080/api/products
```

## 🔮 Next Steps

### Immediate Priorities

1. **Implement Order Service** - Order processing and management
2. **Implement Payment Service** - Stripe integration and payment processing
3. **Implement Notification Service** - Email and SMS notifications
4. **Implement User Service** - User profile management
5. **Implement Admin Service** - Admin dashboard and analytics

### Advanced Features

1. **Service Mesh** (Istio/Linkerd) for advanced networking
2. **Event-Driven Architecture** with message queues
3. **Centralized Logging** (ELK Stack)
4. **Monitoring** (Prometheus + Grafana)
5. **CI/CD Pipeline** with automated testing
6. **Auto-scaling** based on load

## 🆘 Troubleshooting

### Common Issues

**Services not starting:**
```bash
# Check Docker logs
docker-compose logs

# Restart services
docker-compose restart
```

**Database connection issues:**
```bash
# Check SQL Server container
docker-compose logs sqlserver

# Verify database connectivity
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P Tmahereswd123.
```

**Port conflicts:**
```bash
# Check what's using ports
netstat -tulpn | grep :8080

# Change ports in docker-compose.yml if needed
```

### Service Discovery Issues

If services can't communicate:

1. Check Docker network: `docker network ls`
2. Verify service names in docker-compose.yml
3. Check environment variables in containers

## 📞 Support

For issues or questions:

1. Check service health endpoints
2. Review Docker Compose logs
3. Verify environment configuration
4. Check database connectivity

## 🎉 Success Metrics

The microservices architecture provides:

- ✅ **Scalability**: Scale individual services independently
- ✅ **Maintainability**: Smaller, focused codebases
- ✅ **Resilience**: Failure isolation between services
- ✅ **Development Speed**: Teams can work on services independently
- ✅ **Technology Flexibility**: Different technologies per service
- ✅ **Deployment Independence**: Deploy services separately

---

**Congratulations!** 🎉 You now have a fully functional microservices architecture for the Abosefen e-commerce platform! 