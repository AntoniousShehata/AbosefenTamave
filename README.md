# Abosefen E-commerce Platform

A modern, scalable e-commerce platform for sanitaryware business built with **microservices architecture**.

## 🏗️ Project Architecture

```
abosefen-app/
├── frontend/               # React.js Frontend Application
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Build configuration
├── backend/               # Microservices Backend
│   ├── api-gateway/       # API Gateway service
│   ├── auth-service/      # Authentication service
│   ├── product-service/   # Product catalog service
│   ├── user-service/      # User management service
│   ├── order-service/     # Order processing service
│   ├── payment-service/   # Payment processing service
│   ├── notification-service/  # Email/SMS notifications
│   ├── admin-service/     # Admin dashboard service
│   ├── docker-compose.yml # Container orchestration
│   └── shared/            # Shared utilities and types
├── database/              # Database scripts and migrations
├── docs/                  # Technical documentation
├── docker/                # Docker configurations
├── scripts/               # Build and deployment scripts
└── shared/                # Cross-project shared resources
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **Docker & Docker Compose**
- **Git**

### 1. Clone the Repository

```bash
git clone <repository-url>
cd abosefen-app
```

### 2. Start Backend Services

```bash
cd backend
docker-compose up -d
```

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:8080
- **Backend Health**: http://localhost:8080/health

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQL Server** - Database (separate DB per service)
- **JWT** - Authentication
- **Docker** - Containerization

### DevOps
- **Docker Compose** - Local development
- **Health Checks** - Service monitoring
- **API Gateway** - Request routing and authentication

## 📋 Available Services

| Service | Status | Port | Description |
|---------|--------|------|-------------|
| API Gateway | ✅ Complete | 8080 | Request routing and authentication |
| Auth Service | ✅ Complete | 3001 | User authentication and JWT management |
| Product Service | ✅ Complete | 3003 | Product catalog and inventory |
| User Service | 🚧 Development | 3002 | User profile management |
| Order Service | 🚧 Development | 3004 | Order processing and tracking |
| Payment Service | 🚧 Development | 3005 | Payment processing (Stripe) |
| Notification Service | 🚧 Development | 3006 | Email and SMS notifications |
| Admin Service | 🚧 Development | 3007 | Admin dashboard and analytics |

## 🌐 API Documentation

All API requests go through the API Gateway at `http://localhost:8080/api`

### Authentication Endpoints
```
POST /api/auth/register    - User registration
POST /api/auth/login       - User login
POST /api/auth/refresh     - Refresh JWT token
GET  /api/auth/profile     - Get user profile
```

### Product Endpoints
```
GET  /api/products         - List all products
GET  /api/products/:id     - Get product details
GET  /api/categories       - List categories
GET  /api/search?q=term    - Search products
```

### Admin Endpoints (Authentication Required)
```
POST /api/products         - Create product (admin only)
PUT  /api/products/:id     - Update product (admin only)
POST /api/categories       - Create category (admin only)
```

## 🔒 Default Admin Access

- **Email**: `admin@abosefen.com`
- **Password**: `Admin123456!`

## 🏃‍♂️ Development Workflow

### Running Individual Services

```bash
# Start API Gateway only
cd backend/api-gateway
npm install && npm start

# Start Auth Service only  
cd backend/auth-service
npm install && npm start

# Start Product Service only
cd backend/product-service
npm install && npm start
```

### Docker Commands

```bash
# View service status
cd backend && docker-compose ps

# View logs
docker-compose logs -f auth-service

# Restart service
docker-compose restart product-service

# Stop all services
docker-compose down
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📊 Monitoring

### Health Checks
- **Overall Health**: http://localhost:8080/health
- **Service Health**: http://localhost:8080/health/services
- **Individual Services**: http://localhost:{port}/health

### Logging
```bash
# View all service logs
cd backend && docker-compose logs

# View specific service logs
docker-compose logs -f auth-service

# View last 100 lines
docker-compose logs --tail=100 product-service
```

## 📚 Documentation

- **[Backend Documentation](backend/README.md)** - Microservices architecture details
- **[Frontend Documentation](frontend/README.md)** - React application guide
- **[API Documentation](docs/api.md)** - Complete API reference
- **[Deployment Guide](docs/deployment.md)** - Production deployment instructions
- **[Database Documentation](database/README.md)** - Database schema and migrations

## 🚀 Deployment

### Development
```bash
# Start all services
cd backend && docker-compose up -d
cd frontend && npm run dev
```

### Production
```bash
# Build and deploy backend
cd backend && docker-compose -f docker-compose.prod.yml up -d

# Build and serve frontend
cd frontend && npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For technical support or questions:

1. Check the [documentation](docs/)
2. Review service health endpoints
3. Check Docker Compose logs
4. Create an issue in the repository

---

**Built with ❤️ for Abosefen & Tamave Irini Sanitaryware Business**
