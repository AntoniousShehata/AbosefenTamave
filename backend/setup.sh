#!/bin/bash

# Abosefen E-commerce Microservices Setup Script
echo "🚀 Setting up Abosefen E-commerce Microservices Architecture"
echo "============================================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Function to install dependencies for a service
install_service_deps() {
    local service=$1
    echo "📦 Installing dependencies for $service..."
    cd $service
    if [ -f package.json ]; then
        npm install
        echo "✅ Dependencies installed for $service"
    else
        echo "⚠️  No package.json found for $service"
    fi
    cd ..
}

# Install dependencies for all services
echo "📦 Installing dependencies for all microservices..."
install_service_deps "api-gateway"
install_service_deps "auth-service"
install_service_deps "product-service"

# Create placeholder services (if they don't exist)
create_placeholder_service() {
    local service=$1
    local port=$2
    
    if [ ! -d "$service" ]; then
        echo "🏗️  Creating placeholder service: $service"
        mkdir -p $service
        
        # Create basic package.json
        cat > $service/package.json << EOF
{
  "name": "abosefen-$service",
  "version": "1.0.0",
  "description": "$service for Abosefen E-commerce platform",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.2.0",
    "morgan": "^1.10.0"
  }
}
EOF

        # Create basic server.js
        cat > $service/server.js << EOF
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || $port;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    service: '$service',
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Placeholder endpoints
app.get('/api/*', (req, res) => {
  res.status(200).json({ 
    message: '$service is under development',
    endpoint: req.path,
    method: req.method
  });
});

app.post('/api/*', (req, res) => {
  res.status(200).json({ 
    message: '$service is under development',
    endpoint: req.path,
    method: req.method
  });
});

// Start server
app.listen(PORT, () => {
  console.log(\`🔧 $service running on http://localhost:\${PORT}\`);
  console.log(\`📊 Health check available at http://localhost:\${PORT}/health\`);
});
EOF

        # Create Dockerfile
        cat > $service/Dockerfile << EOF
FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE $port

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \\
  CMD curl -f http://localhost:$port/health || exit 1

CMD ["node", "server.js"]
EOF

        echo "✅ Created placeholder service: $service"
    fi
}

# Create placeholder services
create_placeholder_service "user-service" 3002
create_placeholder_service "order-service" 3004
create_placeholder_service "payment-service" 3005
create_placeholder_service "notification-service" 3006
create_placeholder_service "admin-service" 3007

# Install dependencies for placeholder services
install_service_deps "user-service"
install_service_deps "order-service"
install_service_deps "payment-service"
install_service_deps "notification-service"
install_service_deps "admin-service"

echo ""
echo "🐳 Building and starting microservices with Docker Compose..."
echo ""

# Build and start services
docker-compose down --remove-orphans
docker-compose build
docker-compose up -d

echo ""
echo "⏳ Waiting for services to start up..."
sleep 30

# Check service health
echo ""
echo "🔍 Checking service health..."
echo ""

services=(
    "api-gateway:8080"
    "auth-service:3001"
    "product-service:3003"
    "user-service:3002"
    "order-service:3004"
    "payment-service:3005"
    "notification-service:3006"
    "admin-service:3007"
)

for service in "\${services[@]}"; do
    IFS=':' read -r name port <<< "\$service"
    if curl -f http://localhost:\$port/health &>/dev/null; then
        echo "✅ \$name is healthy"
    else
        echo "❌ \$name is not responding"
    fi
done

echo ""
echo "🎉 Microservices setup complete!"
echo ""
echo "📋 Available Services:"
echo "   🌐 API Gateway:         http://localhost:8080"
echo "   🔐 Auth Service:        http://localhost:3001"
echo "   👤 User Service:        http://localhost:3002" 
echo "   🛍️  Product Service:     http://localhost:3003"
echo "   📦 Order Service:       http://localhost:3004"
echo "   💳 Payment Service:     http://localhost:3005"
echo "   📧 Notification Service: http://localhost:3006"
echo "   👑 Admin Service:       http://localhost:3007"
echo ""
echo "🔍 Health Checks:"
echo "   📊 Overall health:      http://localhost:8080/health"
echo "   🏥 Service health:      http://localhost:8080/health/services"
echo ""
echo "📈 View logs:"
echo "   docker-compose logs -f [service-name]"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose down"
echo ""
echo "🔄 Restart services:"
echo "   docker-compose restart"
echo ""
echo "💡 To update the frontend to use the API Gateway:"
echo "   Update your frontend API base URL to: http://localhost:8080/api"
echo "" 