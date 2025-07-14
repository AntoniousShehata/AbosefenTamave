#!/bin/bash

# Abosefen Development Environment Startup Script
# This script starts all required services for local development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

print_header() {
    echo ""
    echo "=================================="
    echo "$1"
    echo "=================================="
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    local port=$1
    netstat -an 2>/dev/null | grep ":$port " | grep LISTEN >/dev/null 2>&1
}

# Function to wait for service to be healthy
wait_for_service() {
    local service_name=$1
    local health_url=$2
    local max_attempts=30
    local attempt=1

    print_status $YELLOW "⏳ Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$health_url" >/dev/null 2>&1; then
            print_status $GREEN "✅ $service_name is ready!"
            return 0
        fi
        
        if [ $attempt -eq 1 ]; then
            echo -n "   "
        fi
        echo -n "."
        
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo ""
    print_status $RED "❌ $service_name failed to start within $(($max_attempts * 2)) seconds"
    return 1
}

# Main execution
main() {
    print_header "🚀 ABOSEFEN DEVELOPMENT ENVIRONMENT"
    print_status $CYAN "Starting sanitaryware e-commerce platform..."
    
    # Change to project root
    cd "$PROJECT_ROOT"
    
    # Check prerequisites
    print_header "📋 CHECKING PREREQUISITES"
    
    local missing_deps=0
    
    if ! command_exists docker; then
        print_status $RED "❌ Docker is not installed"
        missing_deps=1
    else
        print_status $GREEN "✅ Docker found: $(docker --version | cut -d' ' -f3)"
    fi
    
    if ! command_exists docker-compose; then
        print_status $RED "❌ Docker Compose is not installed"
        missing_deps=1
    else
        print_status $GREEN "✅ Docker Compose found: $(docker-compose --version | cut -d' ' -f3)"
    fi
    
    if ! command_exists node; then
        print_status $RED "❌ Node.js is not installed"
        missing_deps=1
    else
        print_status $GREEN "✅ Node.js found: $(node --version)"
    fi
    
    if ! command_exists npm; then
        print_status $RED "❌ NPM is not installed"
        missing_deps=1
    else
        print_status $GREEN "✅ NPM found: $(npm --version)"
    fi
    
    if [ $missing_deps -eq 1 ]; then
        print_status $RED "❌ Missing required dependencies. Please install them first."
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info >/dev/null 2>&1; then
        print_status $RED "❌ Docker daemon is not running. Please start Docker first."
        exit 1
    fi
    
    print_status $GREEN "✅ All prerequisites satisfied"
    
    # Check for port conflicts
    print_header "🔍 CHECKING PORT AVAILABILITY"
    
    local ports_in_use=()
    
    if port_in_use 27017; then
        ports_in_use+=(27017)
    fi
    
    if port_in_use 8080; then
        ports_in_use+=(8080)
    fi
    
    if port_in_use 3001; then
        ports_in_use+=(3001)
    fi
    
    if port_in_use 3003; then
        ports_in_use+=(3003)
    fi
    
    if port_in_use 5173; then
        ports_in_use+=(5173)
    fi
    
    if [ ${#ports_in_use[@]} -gt 0 ]; then
        print_status $YELLOW "⚠️  The following ports are in use: ${ports_in_use[*]}"
        print_status $YELLOW "   This may cause conflicts. Continue anyway? (y/N)"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            print_status $RED "❌ Startup cancelled"
            exit 1
        fi
    else
        print_status $GREEN "✅ All required ports are available"
    fi
    
    # Start MongoDB and related services
    print_header "🗄️  STARTING DATABASE SERVICES"
    
    cd "$BACKEND_DIR"
    
    # Stop any existing containers
    print_status $YELLOW "🛑 Stopping existing containers..."
    docker-compose down --remove-orphans >/dev/null 2>&1 || true
    
    # Start MongoDB and Mongo Express
    print_status $BLUE "🚀 Starting MongoDB cluster..."
    docker-compose up -d mongodb mongo-express
    
    # Wait for MongoDB to be ready
    wait_for_service "MongoDB" "http://localhost:8081" || {
        print_status $RED "❌ Failed to start MongoDB"
        docker-compose logs mongodb
        exit 1
    }
    
    print_status $GREEN "✅ MongoDB cluster is running"
    print_status $CYAN "📊 MongoDB Admin UI: http://localhost:8081 (admin/admin123)"
    
    # Install backend dependencies
    print_header "📦 INSTALLING BACKEND DEPENDENCIES"
    
    # Auth Service
    print_status $BLUE "Installing auth service dependencies..."
    cd "$BACKEND_DIR/auth-service"
    if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
        npm install --silent
        print_status $GREEN "✅ Auth service dependencies installed"
    else
        print_status $YELLOW "⏭️  Auth service dependencies up to date"
    fi
    
    # Product Service
    print_status $BLUE "Installing product service dependencies..."
    cd "$BACKEND_DIR/product-service"
    if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
        npm install --silent
        print_status $GREEN "✅ Product service dependencies installed"
    else
        print_status $YELLOW "⏭️  Product service dependencies up to date"
    fi
    
    # API Gateway
    print_status $BLUE "Installing API gateway dependencies..."
    cd "$BACKEND_DIR/api-gateway"
    if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
        npm install --silent
        print_status $GREEN "✅ API gateway dependencies installed"
    else
        print_status $YELLOW "⏭️  API gateway dependencies up to date"
    fi
    
    # Start microservices
    print_header "🔧 STARTING MICROSERVICES"
    
    cd "$BACKEND_DIR"
    
    # Start core services first
    print_status $BLUE "🚀 Starting auth service..."
    docker-compose up -d auth-service
    
    print_status $BLUE "🚀 Starting product service..."
    docker-compose up -d product-service
    
    # Wait for core services
    wait_for_service "Auth Service" "http://localhost:3001/health" || {
        print_status $RED "❌ Failed to start Auth Service"
        docker-compose logs auth-service
        exit 1
    }
    
    wait_for_service "Product Service" "http://localhost:3003/health" || {
        print_status $RED "❌ Failed to start Product Service"  
        docker-compose logs product-service
        exit 1
    }
    
    # Start API Gateway
    print_status $BLUE "🚀 Starting API gateway..."
    docker-compose up -d api-gateway
    
    wait_for_service "API Gateway" "http://localhost:8080/health" || {
        print_status $RED "❌ Failed to start API Gateway"
        docker-compose logs api-gateway
        exit 1
    }
    
    print_status $GREEN "✅ All microservices are running"
    
    # Install and start frontend
    print_header "🎨 STARTING FRONTEND"
    
    cd "$FRONTEND_DIR"
    
    # Install frontend dependencies
    if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
        print_status $BLUE "📦 Installing frontend dependencies..."
        npm install --silent
        print_status $GREEN "✅ Frontend dependencies installed"
    else
        print_status $YELLOW "⏭️  Frontend dependencies up to date"
    fi
    
    # Start frontend in background
    print_status $BLUE "🚀 Starting frontend development server..."
    npm run dev > frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    # Wait for frontend to be ready
    wait_for_service "Frontend" "http://localhost:5173" || {
        print_status $RED "❌ Failed to start Frontend"
        cat frontend.log
        exit 1
    }
    
    # Display status
    print_header "🎉 DEVELOPMENT ENVIRONMENT READY"
    
    echo ""
    print_status $GREEN "🌟 Abosefen E-commerce Platform is running!"
    echo ""
    print_status $CYAN "📱 Frontend Application:"
    print_status $WHITE "   🔗 http://localhost:5173"
    echo ""
    print_status $CYAN "🔧 Backend Services:"
    print_status $WHITE "   🔗 API Gateway:      http://localhost:8080"
    print_status $WHITE "   🔗 Auth Service:     http://localhost:3001"
    print_status $WHITE "   🔗 Product Service:  http://localhost:3003"
    echo ""
    print_status $CYAN "🗄️  Database Services:"
    print_status $WHITE "   🔗 MongoDB:          localhost:27017"
    print_status $WHITE "   🔗 Mongo Admin UI:   http://localhost:8081 (admin/admin123)"
    echo ""
    print_status $CYAN "👤 Default Admin Account:"
    print_status $WHITE "   📧 Email:    admin@abosefen.com"
    print_status $WHITE "   🔐 Password: Admin123456!"
    echo ""
    print_status $CYAN "🛠️  Development Tools:"
    print_status $WHITE "   📊 Health Checks:    http://localhost:8080/health"
    print_status $WHITE "   📋 API Docs:         http://localhost:8080/docs"
    echo ""
    print_status $YELLOW "💡 Tips:"
    print_status $WHITE "   • Use Ctrl+C to stop the frontend"
    print_status $WHITE "   • Run './scripts/dev/stop-dev.sh' to stop all services"
    print_status $WHITE "   • Check './scripts/dev/logs.sh' for service logs"
    print_status $WHITE "   • Database is initialized with sample data"
    echo ""
    
    # Keep frontend running and monitor
    print_status $BLUE "🔄 Monitoring services... (Press Ctrl+C to stop)"
    
    # Function to cleanup on exit
    cleanup() {
        print_status $YELLOW "🛑 Shutting down frontend..."
        kill $FRONTEND_PID 2>/dev/null || true
        print_status $GREEN "✅ Frontend stopped"
    }
    
    trap cleanup EXIT
    
    # Monitor services
    while true; do
        sleep 5
        
        # Check if frontend process is still running
        if ! kill -0 $FRONTEND_PID 2>/dev/null; then
            print_status $RED "❌ Frontend process died unexpectedly"
            break
        fi
        
        # Check backend services health
        if ! curl -f -s "http://localhost:8080/health" >/dev/null 2>&1; then
            print_status $RED "❌ API Gateway health check failed"
        fi
    done
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 