# Abosefen E-commerce Microservices Architecture

## Overview
This document describes the microservices architecture for the Abosefen e-commerce platform, designed for scalability, maintainability, and independent deployment.

## Architecture Components

### API Gateway (Port 8080)
- **Purpose**: Single entry point for all client requests
- **Technology**: Express.js with http-proxy-middleware
- **Responsibilities**:
  - Request routing to appropriate microservices
  - Authentication verification
  - Rate limiting and security
  - Load balancing
  - Request/response transformation

### Microservices

#### 1. Authentication Service (Port 3001)
- **Database**: Auth_DB (SQL Server)
- **Responsibilities**:
  - User registration and login
  - JWT token generation and validation
  - Password reset functionality
  - Session management

#### 2. User Service (Port 3002)
- **Database**: User_DB (SQL Server)
- **Responsibilities**:
  - User profile management
  - User preferences and settings
  - User address management
  - User activity tracking

#### 3. Product Service (Port 3003)
- **Database**: Product_DB (SQL Server)
- **Responsibilities**:
  - Product catalog management
  - Inventory tracking
  - Product search and filtering
  - Category management
  - Stock level monitoring

#### 4. Order Service (Port 3004)
- **Database**: Order_DB (SQL Server)
- **Responsibilities**:
  - Order creation and processing
  - Order status tracking
  - Order history
  - Shopping cart management
  - Order cancellation

#### 5. Payment Service (Port 3005)
- **Database**: Payment_DB (SQL Server)
- **External**: Stripe API
- **Responsibilities**:
  - Payment processing
  - Transaction tracking
  - Refund management
  - Payment method management
  - Egyptian payment gateway integration

#### 6. Notification Service (Port 3006)
- **Database**: Notification_DB (SQL Server)
- **External**: Email providers, SMS services
- **Responsibilities**:
  - Email notifications
  - SMS notifications
  - Push notifications
  - Notification templates
  - Delivery tracking

#### 7. Admin Service (Port 3007)
- **Responsibilities**:
  - Admin dashboard
  - Business analytics
  - System monitoring
  - Admin user management
  - Reporting

## Service Communication

### Synchronous Communication
- HTTP/REST APIs for direct service-to-service communication
- API Gateway handles external client requests

### Asynchronous Communication
- Event-driven architecture for loose coupling
- Events: OrderCreated, PaymentProcessed, UserRegistered, etc.

## Database Strategy

### Database per Service
Each microservice has its own dedicated database to ensure:
- Data ownership and encapsulation
- Independent scaling
- Technology diversity
- Failure isolation

### Database Names
- `Abosefen_Auth` - Authentication Service
- `Abosefen_Users` - User Service  
- `Abosefen_Products` - Product Service
- `Abosefen_Orders` - Order Service
- `Abosefen_Payments` - Payment Service
- `Abosefen_Notifications` - Notification Service

## Security

### Authentication Flow
1. Client authenticates with Auth Service
2. Auth Service returns JWT token
3. API Gateway validates JWT for subsequent requests
4. Services trust API Gateway authentication

### Inter-Service Security
- Service-to-service authentication using API keys
- Internal network communication
- Request validation and sanitization

## Deployment

### Docker Containerization
Each service runs in its own Docker container:
- Isolated environments
- Consistent deployments
- Easy scaling
- Port management

### Development Setup
```bash
# Start all services
docker-compose up

# Start individual service
cd microservices/auth-service && npm start
```

### Production Deployment
- Container orchestration (Docker Swarm/Kubernetes)
- Load balancing
- Health checks
- Auto-scaling

## Monitoring and Logging

### Service Health
- Health check endpoints for each service
- Service discovery and registration
- Circuit breaker patterns

### Logging Strategy
- Centralized logging
- Correlation IDs for request tracking
- Performance metrics
- Error tracking

## Development Guidelines

### API Standards
- RESTful API design
- Consistent error handling
- Standardized response formats
- API versioning

### Code Structure
```
microservices/
├── api-gateway/
├── auth-service/
├── user-service/
├── product-service/
├── order-service/
├── payment-service/
├── notification-service/
├── admin-service/
├── docker-compose.yml
└── shared/
    ├── middleware/
    ├── utils/
    └── types/
```

## Getting Started

1. **Prerequisites**
   - Node.js 18+
   - Docker & Docker Compose
   - SQL Server

2. **Setup**
   ```bash
   # Clone and setup
   git clone <repository>
   cd abosefen-app/microservices
   
   # Install dependencies for all services
   npm run install-all
   
   # Start with Docker
   docker-compose up
   ```

3. **Development**
   ```bash
   # Start individual service
   cd auth-service && npm run dev
   
   # Run tests
   npm test
   
   # Build for production
   npm run build
   ```

## API Endpoints

### API Gateway Routes
- `POST /api/auth/*` → Auth Service (3001)
- `GET /api/users/*` → User Service (3002)
- `GET /api/products/*` → Product Service (3003)
- `POST /api/orders/*` → Order Service (3004)
- `POST /api/payments/*` → Payment Service (3005)
- `POST /api/notifications/*` → Notification Service (3006)
- `GET /api/admin/*` → Admin Service (3007)

## Benefits of This Architecture

1. **Scalability**: Scale individual services based on demand
2. **Maintainability**: Smaller, focused codebases
3. **Technology Diversity**: Use best tool for each service
4. **Fault Isolation**: Failure in one service doesn't bring down entire system
5. **Independent Deployment**: Deploy services independently
6. **Team Autonomy**: Different teams can own different services

## Migration Plan

1. ✅ Design architecture and create directory structure
2. 🔄 Implement API Gateway
3. ⏳ Migrate Authentication logic to Auth Service
4. ⏳ Migrate Product logic to Product Service
5. ⏳ Migrate Order logic to Order Service
6. ⏳ Migrate Payment logic to Payment Service
7. ⏳ Implement Notification Service
8. ⏳ Implement User Service
9. ⏳ Implement Admin Service
10. ⏳ Set up Docker containers
11. ⏳ Update frontend to use API Gateway 