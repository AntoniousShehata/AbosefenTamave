# Scripts - Build & Deployment

Automated scripts for building, testing, and deploying the Abosefen e-commerce platform.

## 📁 Script Structure

```
scripts/
├── build/
│   ├── build-frontend.sh    # Frontend build script
│   ├── build-backend.sh     # Backend services build
│   └── build-all.sh         # Build entire application
├── deploy/
│   ├── deploy-dev.sh        # Development deployment
│   ├── deploy-staging.sh    # Staging deployment
│   └── deploy-prod.sh       # Production deployment
├── dev/
│   ├── start-dev.sh         # Start development environment
│   ├── stop-dev.sh          # Stop development environment
│   └── reset-dev.sh         # Reset development data
├── test/
│   ├── test-frontend.sh     # Frontend tests
│   ├── test-backend.sh      # Backend API tests
│   └── test-e2e.sh          # End-to-end tests
└── utils/
    ├── setup-env.sh         # Environment setup
    ├── backup-db.sh         # Database backup
    └── restore-db.sh        # Database restore
```

## 🚀 Quick Start Scripts

### Development Environment

```bash
# Setup and start development environment
./scripts/dev/start-dev.sh

# Stop development environment
./scripts/dev/stop-dev.sh

# Reset development data (WARNING: Deletes all data)
./scripts/dev/reset-dev.sh
```

### Build Scripts

```bash
# Build frontend only
./scripts/build/build-frontend.sh

# Build backend services only
./scripts/build/build-backend.sh

# Build entire application
./scripts/build/build-all.sh
```

### Deployment Scripts

```bash
# Deploy to development
./scripts/deploy/deploy-dev.sh

# Deploy to staging
./scripts/deploy/deploy-staging.sh

# Deploy to production (requires confirmation)
./scripts/deploy/deploy-prod.sh
```

## 📝 Script Details

### Development Scripts

#### start-dev.sh
Starts the complete development environment:

```bash
#!/bin/bash
echo "🚀 Starting Abosefen Development Environment"

# Start backend services
cd backend && docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Install frontend dependencies if needed
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start frontend development server
echo "🌐 Starting frontend development server..."
npm run dev &

echo "✅ Development environment started!"
echo "   Frontend: http://localhost:5173"
echo "   API Gateway: http://localhost:8080"
echo "   Health Check: http://localhost:8080/health"
```

#### stop-dev.sh
Stops all development services:

```bash
#!/bin/bash
echo "🛑 Stopping Abosefen Development Environment"

# Stop frontend development server
pkill -f "vite"

# Stop backend services
cd backend && docker-compose down

echo "✅ Development environment stopped!"
```

#### reset-dev.sh
Resets development data:

```bash
#!/bin/bash
echo "⚠️  WARNING: This will delete all development data!"
read -p "Are you sure? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Resetting development environment..."
    
    # Stop services
    cd backend && docker-compose down
    
    # Remove volumes
    docker volume rm backend_sqlserver_data backend_product_uploads
    
    # Restart services
    docker-compose up -d
    
    echo "✅ Development environment reset complete!"
else
    echo "❌ Reset cancelled"
fi
```

### Build Scripts

#### build-frontend.sh
Builds the React frontend for production:

```bash
#!/bin/bash
echo "🏗️  Building Frontend Application"

cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run tests
echo "🧪 Running tests..."
npm test -- --watchAll=false

# Build for production
echo "📦 Building for production..."
npm run build

# Check build size
echo "📊 Build analysis:"
du -sh dist/

echo "✅ Frontend build complete!"
echo "   Output: frontend/dist/"
```

#### build-backend.sh
Builds all backend microservices:

```bash
#!/bin/bash
echo "🏗️  Building Backend Microservices"

cd backend

# Build Docker images
echo "🐳 Building Docker images..."
docker-compose build

# Test services
echo "🧪 Testing services..."
docker-compose up -d
sleep 30

# Health checks
services=("api-gateway:8080" "auth-service:3001" "product-service:3003")
for service in "${services[@]}"; do
    IFS=':' read -r name port <<< "$service"
    if curl -f http://localhost:$port/health &>/dev/null; then
        echo "✅ $name is healthy"
    else
        echo "❌ $name is not responding"
    fi
done

docker-compose down

echo "✅ Backend build complete!"
```

### Deployment Scripts

#### deploy-dev.sh
Deploys to development environment:

```bash
#!/bin/bash
echo "🚀 Deploying to Development Environment"

# Build applications
./build/build-all.sh

# Deploy to development
cd backend
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

echo "✅ Development deployment complete!"
echo "   Environment: http://localhost:8080"
```

#### deploy-prod.sh
Deploys to production (with safety checks):

```bash
#!/bin/bash
echo "🚀 Production Deployment"

# Safety check
echo "⚠️  WARNING: This will deploy to PRODUCTION!"
read -p "Environment: " env
read -p "Version tag: " version
read -p "Are you sure? (type 'DEPLOY' to continue): " confirm

if [[ $confirm != "DEPLOY" ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Pre-deployment checks
echo "🔍 Pre-deployment checks..."

# Check if all tests pass
./test/test-all.sh
if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Deployment aborted."
    exit 1
fi

# Backup database
echo "💾 Creating database backup..."
./utils/backup-db.sh

# Deploy
echo "🚀 Starting production deployment..."
cd backend
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

echo "✅ Production deployment complete!"
```

### Test Scripts

#### test-frontend.sh
Runs frontend tests:

```bash
#!/bin/bash
echo "🧪 Running Frontend Tests"

cd frontend

# Unit tests
echo "Running unit tests..."
npm test -- --watchAll=false --coverage

# Lint check
echo "Running linter..."
npm run lint

# Build test
echo "Testing build..."
npm run build

echo "✅ Frontend tests complete!"
```

#### test-backend.sh
Runs backend API tests:

```bash
#!/bin/bash
echo "🧪 Running Backend API Tests"

cd backend

# Start test environment
docker-compose -f docker-compose.test.yml up -d
sleep 30

# Run API tests
echo "Testing API endpoints..."

# Test health endpoints
curl -f http://localhost:8080/health
curl -f http://localhost:3001/health
curl -f http://localhost:3003/health

# Test authentication
echo "Testing authentication..."
# ... API test commands

docker-compose -f docker-compose.test.yml down

echo "✅ Backend tests complete!"
```

### Utility Scripts

#### setup-env.sh
Sets up development environment:

```bash
#!/bin/bash
echo "🔧 Setting up Development Environment"

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js required"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker required"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose required"; exit 1; }

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend && npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd ../backend/api-gateway && npm install
cd ../auth-service && npm install
cd ../product-service && npm install

# Create environment files
echo "📄 Creating environment files..."
cp config.env.example config.env

echo "✅ Environment setup complete!"
echo "   Edit backend/config.env with your settings"
echo "   Run './scripts/dev/start-dev.sh' to start development"
```

#### backup-db.sh
Creates database backup:

```bash
#!/bin/bash
echo "💾 Creating Database Backup"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"

mkdir -p $BACKUP_DIR

# Backup using Docker
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "Tmahereswd123." \
  -Q "BACKUP DATABASE Abosefen_Auth TO DISK='/var/opt/mssql/backup/auth_${TIMESTAMP}.bak'"

docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "Tmahereswd123." \
  -Q "BACKUP DATABASE Abosefen_Products TO DISK='/var/opt/mssql/backup/products_${TIMESTAMP}.bak'"

echo "✅ Database backup complete!"
echo "   Files: backups/*_${TIMESTAMP}.bak"
```

## 🛠️ Script Usage

### Making Scripts Executable

```bash
# Make all scripts executable
find scripts/ -name "*.sh" -exec chmod +x {} \;

# Or individually
chmod +x scripts/dev/start-dev.sh
chmod +x scripts/build/build-all.sh
```

### Running Scripts

```bash
# From project root
./scripts/dev/start-dev.sh

# Or navigate to scripts directory
cd scripts/dev
./start-dev.sh
```

## 🔧 Configuration

### Environment Variables

Scripts use environment variables for configuration:

```bash
# In scripts/config.env
NODE_ENV=development
API_URL=http://localhost:8080
DB_BACKUP_DIR=/path/to/backups
DEPLOY_ENV=development
```

### Platform Compatibility

Scripts are designed to work on:
- **Linux** (Ubuntu, CentOS, etc.)
- **macOS** 
- **Windows** (via Git Bash or WSL)

For Windows PowerShell, equivalent `.ps1` scripts can be created.

## 📞 Support

For script-related issues:

1. Check script permissions: `ls -la scripts/`
2. Verify prerequisites are installed
3. Check log output for error details
4. Ensure Docker services are running

---

**Automated deployment scripts for seamless development and production workflows** 🚀 