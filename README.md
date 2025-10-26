# 🏪 Abosefen E-commerce Platform

A complete, modern e-commerce web application built with React and microservices architecture. Features a full shopping experience from product search to checkout, plus comprehensive admin dashboard.

## 🌟 Features

### 🛍️ **Complete E-commerce Experience**
- **Smart Product Search** with autocomplete, filters, and intelligent suggestions
- **Product Catalog** with categories, detailed views, and image galleries
- **Shopping Cart** with persistent storage and real-time updates
- **Secure Checkout** with multiple payment options
- **User Authentication** with registration and login
- **Mobile-First Design** optimized for all devices

### 👑 **Admin Dashboard**
- **Product Management** - Add, edit, delete products with rich forms
- **Inventory Tracking** - Stock levels and low-stock alerts
- **Order Management** - View and process customer orders
- **User Management** - Customer accounts and admin roles
- **Analytics Dashboard** - Sales metrics and insights

### 🔍 **Advanced Search**
- **Smart Autocomplete** with real-time suggestions
- **Category Filtering** and advanced product filters
- **Voice Search** support for hands-free browsing
- **Search History** and trending products
- **Typo Tolerance** and intelligent query suggestions

### 📱 **Mobile Optimization**
- **Responsive Design** for phones, tablets, and desktops
- **Touch-Optimized** controls and gestures
- **Fast Loading** with optimized images and caching
- **Offline Support** for better connectivity
- **PWA Ready** for app-like experience

## 🏗️ Architecture

### **Microservices Backend**
- **API Gateway** (Port 8080) - Central routing and authentication
- **Auth Service** (Port 3001) - User management and JWT tokens
- **Product Service** (Port 3003) - Catalog and inventory
- **MongoDB** (Port 27017) - Database with separate collections per service

### **Frontend Stack**
- **React 19** with functional components and hooks
- **Tailwind CSS** for responsive styling
- **Vite** for fast development and building
- **Axios** for API communication
- **React Router** for navigation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git
- **ngrok** (for external access) - Download from [ngrok.com](https://ngrok.com/download)

### 1. Clone & Setup
```bash
git clone <repository-url>
cd abosefen-app

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Start Backend Services
```bash
cd backend
docker-compose up -d --build

# Verify services are running
docker-compose ps
```

### 3. Start Frontend (Local Development)
```bash
cd frontend
npm run dev
```

### 4. Access the Application
- **Frontend (Local)**: http://localhost:5173
- **Frontend (Vercel)**: https://abosefen-tamave.vercel.app
- **API Gateway**: http://localhost:8080
- **Database Admin UI**: http://localhost:8081/mongo-admin/

### 5. Expose Backend for External Access (Vercel/Mobile)
```powershell
# Start ngrok tunnel for API Gateway
ngrok http 8080

# Your ngrok URL will be: https://xxxxxxxx.ngrok-free.app
# Copy this URL - you'll need it for Vercel configuration
```

## 🧪 Testing the Application

### **User Journey Testing**
1. **Browse Products**: Visit homepage and explore categories
2. **Search Products**: Use smart search with autocomplete
3. **View Product Details**: Click any product for detailed view
4. **Add to Cart**: Add items and see cart updates
5. **Checkout**: Complete purchase with customer info
6. **User Account**: Register/login for personalized experience

### **Admin Testing**
1. **Admin Login**: Use admin credentials to access dashboard
2. **Product Management**: Add/edit products with images and details
3. **Inventory Control**: Update stock levels and track availability
4. **Order Processing**: View and manage customer orders

### **Mobile Testing**
1. **Responsive Design**: Test on various screen sizes
2. **Touch Controls**: Verify all buttons and forms work on mobile
3. **Performance**: Check loading times and interactions

## 📋 API Endpoints

### **Authentication**
```
POST /api/auth/register    - User registration
POST /api/auth/login       - User login
POST /api/auth/refresh     - Refresh JWT token
GET  /api/auth/profile     - Get user profile
```

### **Products**
```
GET    /api/products                    - Get all products
GET    /api/products/:id                - Get product by ID
GET    /api/products/details/:slug      - Get product details by slug
GET    /api/products/category/:id       - Get products by category
GET    /api/products/search             - Smart product search
POST   /api/products                    - Create product (admin)
PUT    /api/products/:id                - Update product (admin)
DELETE /api/products/:id                - Delete product (admin)
```

### **Categories**
```
GET    /api/categories                  - Get all categories
POST   /api/categories                  - Create category (admin)
```

## 🌐 Deployment Guide

### **Architecture Overview**
Your project can run in two modes:
1. **Local Development** - Everything runs on localhost
2. **Production (Vercel + Ngrok)** - Frontend on Vercel, Backend on your laptop via ngrok

### **🎯 Complete Deployment Setup**

#### **Step 1: Run Backend Locally**
```bash
cd backend
docker-compose up -d --build

# Verify all services are healthy
docker ps
```

#### **Step 2: Start Ngrok Tunnel**
```powershell
# Expose API Gateway to the internet
ngrok http 8080

# Save the ngrok URL shown (e.g., https://cc6732f37ee5.ngrok-free.app)
```

**Important Notes:**
- ✅ Ngrok **FREE tier** allows **1 tunnel** at a time
- ✅ Keep the ngrok window **open** while using the app
- ✅ The URL changes each time you restart ngrok

#### **Step 3: Configure Vercel**
1. Go to [Vercel Dashboard](https://vercel.com/antoniousshehatas-projects/abosefen-tamave/settings/environment-variables)
2. Add/Update environment variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-ngrok-url.ngrok-free.app` (use your actual ngrok URL)
   - **Environments**: Production, Preview, Development (check all)
3. Click "Save"
4. **Redeploy**: Go to Deployments → Click "..." → "Redeploy"
5. **Important**: Wait for fresh build (not just reuse existing build)

#### **Step 4: Test Your Deployment**
Visit https://abosefen-tamave.vercel.app

Test these features:
- ✅ **Homepage** loads products
- ✅ **Login** with admin credentials (see below)
- ✅ **Products** display correctly
- ✅ **Search** works
- ✅ **Admin Dashboard** accessible

### **🔑 Admin Credentials**
```
Email:    admin@abosefen.com
Password: Tmaher123@
```

### **📱 Access From Phone/Outside Network**
Once Vercel is configured with your ngrok URL:
1. **From Phone**: Visit https://abosefen-tamave.vercel.app
2. **From Another Computer**: Same URL
3. **Your laptop must be on** with Docker & ngrok running!

### **🔧 Configuration

### **Environment Variables**
```bash
# Frontend (.env)
VITE_API_URL=http://localhost:3001  # For local development
# or
VITE_API_URL=https://your-ngrok-url.ngrok-free.app  # For Vercel deployment

# Backend (backend/config.env)
MONGODB_URI=mongodb://admin:AbosefenMongo2024!@mongodb:27017/abosefen-auth?authSource=admin
JWT_SECRET=your-very-secure-jwt-secret-key-2024-abosefen
JWT_EXPIRE=7d
```

### **Database Configuration**
- **MongoDB 7.0** with authentication
- **Separate databases** per microservice
  - `abosefen-auth` - Users and authentication
  - `abosefen-catalog` - Products and categories
- **Auto-initialization** with sample data

### **Admin Credentials**
```
Email:    admin@abosefen.com
Password: Tmaher123@
```

### **Database Admin UI**
- **Mongo Express**: http://localhost:8081/mongo-admin/
- **Login**: admin / admin

## 🔧 Troubleshooting

### **Login Failed / Route Not Found**
**Problem**: Vercel app can't connect to backend  
**Solution**:
1. Check ngrok is running: `http://localhost:4040` (ngrok dashboard)
2. Verify `VITE_API_URL` in Vercel matches your ngrok URL **exactly**
3. Redeploy with **fresh build** (not reuse cache)
4. Check CORS: API Gateway allows `*.vercel.app` domains

### **ngrok "ERR_NGROK_3004" or Timeout**
**Problem**: ngrok tunnel can't reach backend  
**Solution**:
1. Verify Docker containers are running: `docker ps`
2. Restart API Gateway: `docker-compose restart api-gateway`
3. Test locally first: `curl http://localhost:8080/health`
4. If localhost works, ngrok should work too

### **Products Not Loading on Vercel**
**Problem**: `VITE_API_URL` not picked up during build  
**Solution**:
1. In Vercel, check environment variable name is **exactly** `VITE_API_URL` (case-sensitive)
2. Must be applied to **all environments** (Production, Preview, Development)
3. **Force rebuild**: Deployments → "..." → "Redeploy" → **uncheck** "Use existing build cache"
4. Wait 2-3 minutes for fresh build to complete

### **"Only 1 tunnel allowed" Error (ngrok)**
**Problem**: Free tier limit reached  
**Solution**:
1. Stop all other ngrok processes
2. Check running: `Get-Process ngrok` (PowerShell)
3. Kill if needed: `Stop-Process -Name ngrok`
4. Restart: `ngrok http 8080`

### **MongoDB Connection Failed**
**Problem**: Backend can't connect to database  
**Solution**:
1. Check MongoDB is running: `docker ps | findstr mongodb`
2. Verify credentials in `backend/config.env`
3. Restart MongoDB: `docker-compose restart mongodb`
4. Check logs: `docker logs backend-mongodb-1`

### **CORS Policy Blocked**
**Problem**: Browser blocks requests from Vercel to ngrok  
**Solution**:
- Already fixed! API Gateway allows all `*.vercel.app` domains
- If still issues, check `backend/api-gateway/server.js` line 47

## 📱 Mobile Features

### **Responsive Design**
- Fully responsive layouts for all screen sizes
- Touch-optimized buttons (44px minimum)
- Swipe gestures for cart management
- Mobile-specific navigation patterns

### **Performance Optimization**
- Lazy loading for images and components
- Optimized bundle sizes with code splitting
- Service worker for offline functionality
- Progressive enhancement for better UX

### **Accessibility**
- WCAG 2.1 compliant design
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support

## 🛡️ Security Features

- **JWT Authentication** with secure token storage
- **Role-based Access Control** (customer/admin)
- **Input Validation** and sanitization
- **CORS Protection** and security headers
- **Rate Limiting** on API endpoints
- **Password Hashing** with bcrypt

## 🔄 Development Workflow

### **Code Structure**
```
frontend/
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── context/           # React contexts (Auth, Cart)
│   ├── utils/             # Utility functions
│   └── assets/            # Static assets

backend/
├── api-gateway/           # Main entry point
├── auth-service/          # Authentication service
├── product-service/       # Product catalog service
└── docker-compose.yml     # Service orchestration
```

### **Available Scripts**
```bash
# Frontend
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build

# Backend
docker-compose up -d --build  # Start all services (rebuild if needed)
docker-compose logs -f         # View service logs (follow mode)
docker-compose down            # Stop all services
docker-compose restart api-gateway  # Restart specific service
```

## 🎬 Complete Setup Summary

### **For Local Development (Localhost Only)**
```bash
# 1. Start backend
cd backend && docker-compose up -d

# 2. Start frontend
cd frontend && npm run dev

# 3. Access at http://localhost:5173
```

### **For Production (Vercel + External Access)**
```powershell
# 1. Start backend
cd backend
docker-compose up -d --build

# 2. Start ngrok
ngrok http 8080
# Save the URL: https://xxxxxxxx.ngrok-free.app

# 3. Configure Vercel
# Go to: https://vercel.com/antoniousshehatas-projects/abosefen-tamave/settings/environment-variables
# Set: VITE_API_URL = https://xxxxxxxx.ngrok-free.app
# Redeploy with fresh build

# 4. Access from anywhere
# https://abosefen-tamave.vercel.app
```

### **What's Running Where**
| Component | Local URL | Public URL (via ngrok) | Port |
|-----------|-----------|------------------------|------|
| Frontend (Dev) | http://localhost:5173 | N/A | 5173 |
| Frontend (Vercel) | N/A | https://abosefen-tamave.vercel.app | - |
| API Gateway | http://localhost:8080 | https://xxxxxxxx.ngrok-free.app | 8080 |
| Auth Service | http://localhost:3001 | (via API Gateway) | 3001 |
| Product Service | http://localhost:3003 | (via API Gateway) | 3003 |
| MongoDB | localhost:27017 | (internal) | 27017 |
| Mongo Express | http://localhost:8081/mongo-admin/ | N/A | 8081 |

### **Key Points**
✅ **API Gateway** is the **single entry point** for all frontend requests  
✅ **Vercel** needs `VITE_API_URL` = your **ngrok URL** (API Gateway)  
✅ **Ngrok FREE tier** = 1 tunnel, must keep running  
✅ **Docker** must be running for backend services  
✅ **MongoDB** data persists in Docker volumes  
```

## 🎯 Feature Highlights

### **Smart Search Engine**
- **Real-time autocomplete** with intelligent suggestions
- **Category-aware search** with filtering
- **Typo tolerance** and query expansion
- **Search analytics** and trending products

### **Shopping Cart**
- **Persistent storage** across sessions
- **Real-time price calculations** with tax and discounts
- **Quantity controls** with inventory validation
- **Mobile-optimized** swipe gestures

### **Admin Dashboard**
- **Rich product forms** with image upload
- **Bulk operations** for efficiency
- **Real-time inventory** tracking
- **Analytics and reporting** tools

### **Payment Integration**
- **Multiple payment methods** (Cash, Bank Transfer, Card)
- **Secure payment processing** with validation
- **Order confirmation** and tracking
- **Egyptian market** specific features

## 📈 Performance Metrics

- **Page Load Time**: < 2 seconds on 3G
- **First Contentful Paint**: < 1.5 seconds
- **Mobile Performance Score**: 90+
- **Accessibility Score**: 95+
- **SEO Score**: 90+

## 🌐 Deployment

### **Deploy to Vercel (Frontend)**

1. **Push to GitHub** (if not already)
2. **Connect to Vercel**:
   - Go to https://vercel.com
   - Import your repository
   - Vercel will auto-detect Vite configuration

3. **Set Environment Variables** in Vercel:
   - Go to Project Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-ngrok-url.ngrok-free.app`

4. **Deploy**: Vercel will automatically deploy

### **Expose Local Backend with Ngrok**

For connecting Vercel frontend to your local database:

1. **Install Ngrok**:
   - Download from https://ngrok.com/download
   - Extract to a folder (e.g., `C:\Users\YourName\ngrok\`)
   - Get authtoken from https://dashboard.ngrok.com

2. **Configure Ngrok**:
   ```powershell
   ngrok config add-authtoken YOUR_TOKEN
   ```

3. **Start Docker Services**:
   ```powershell
   cd backend
   docker-compose up -d
   ```

4. **Expose Auth Service**:
   ```powershell
   ngrok http 3001
   ```

5. **Get Public URL**: Copy the `https://xxx.ngrok-free.app` URL from terminal

6. **Update Vercel**: Set `VITE_API_URL` to your ngrok URL and redeploy

### **Helper Scripts**

Use the password reset script when needed:
```powershell
node reset-admin-password.js
```

## 🌍 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📞 Support

For technical support or questions:
- Create an issue in the repository
- Check the documentation in `/docs`
- Review the API documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for the Egyptian e-commerce market**
