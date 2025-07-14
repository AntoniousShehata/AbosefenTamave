# Frontend - React Application

React-based frontend for the Abosefen e-commerce platform with modern UI/UX and responsive design.

## 🛠️ Technology Stack

- **React 19** - Modern UI library with latest features
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **Context API** - State management

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Header.jsx       # Navigation header
│   │   ├── Toast.jsx        # Notification component
│   │   └── ProtectedRoute.jsx # Route protection
│   ├── context/            # React Context providers
│   │   ├── AuthContext.jsx  # Authentication state
│   │   └── CartContext.jsx  # Shopping cart state
│   ├── pages/              # Main page components
│   │   ├── Home.jsx        # Homepage
│   │   ├── Products.jsx    # Product catalog
│   │   ├── Cart.jsx        # Shopping cart
│   │   ├── Checkout.jsx    # Checkout process
│   │   ├── Login.jsx       # User authentication
│   │   ├── Register.jsx    # User registration
│   │   └── admin/          # Admin dashboard pages
│   ├── assets/             # Static assets
│   ├── pictures/           # Product images
│   ├── App.jsx            # Main App component
│   ├── App.css            # Global styles
│   ├── index.css          # Tailwind imports
│   └── main.jsx           # Entry point
├── public/                 # Static public assets
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.cjs     # PostCSS configuration
└── eslint.config.js       # ESLint configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 API Integration

The frontend communicates with the backend through the API Gateway:

### Base URL Configuration

```javascript
// src/context/AuthContext.jsx
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
```

### Environment Variables

Create a `.env.local` file in the frontend directory:

```bash
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_ENVIRONMENT=development
```

## 🔐 Authentication

### Authentication Context

The `AuthContext` provides global authentication state:

```javascript
// Usage in components
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, login, logout, register } = useAuth();
  
  // Component logic
}
```

### Protected Routes

Routes requiring authentication use the `ProtectedRoute` component:

```javascript
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
```

## 🛒 Shopping Cart

### Cart Context

The `CartContext` manages shopping cart state:

```javascript
import { useCart } from '../context/CartContext';

function ProductCard({ product }) {
  const { addToCart, removeFromCart, cartItems } = useCart();
  
  // Cart operations
}
```

### Cart Persistence

Cart items are automatically persisted to localStorage and synced across tabs.

## 🎨 Styling

### Tailwind CSS

The project uses Tailwind CSS for styling with custom configuration:

```javascript
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A8A',      // Blue
        secondary: '#F59E0B',    // Amber  
        'primary-dark': '#1E40AF', // Dark blue
        accent: '#10B981',       // Green
        light: '#F8FAFC',        // Light gray
        dark: '#1F2937'          // Dark gray
      }
    }
  }
};
```

### Custom Styles

Additional custom styles are in `src/App.css` for components that need specific styling beyond Tailwind.

## 📱 Responsive Design

The application is fully responsive with:

- **Mobile-first approach** using Tailwind's responsive prefixes
- **Flexible grid layouts** for product catalogs
- **Touch-friendly interface** with appropriate button sizes
- **Optimized navigation** for different screen sizes

## 🔄 State Management

### Authentication State

```javascript
// AuthContext state
{
  user: null | UserObject,
  token: null | string,
  isLoading: boolean,
  isAuthenticated: boolean
}
```

### Cart State

```javascript
// CartContext state
{
  cartItems: CartItem[],
  totalItems: number,
  totalPrice: number
}
```

## 📦 Component Library

### Reusable Components

- **Header** - Navigation with responsive menu
- **Toast** - Notification system
- **ProtectedRoute** - Authentication-based routing
- **PaymentForm** - Stripe payment integration

### Page Components

- **Home** - Landing page with featured products
- **Products** - Product catalog with filtering
- **Cart** - Shopping cart management
- **Checkout** - Order placement and payment
- **Login/Register** - User authentication
- **Admin Dashboard** - Administrative interface

## 🧪 Testing

### Running Tests

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

## 🏗️ Build & Deployment

### Development Build

```bash
npm run dev
# Starts dev server at http://localhost:5173
```

### Production Build

```bash
npm run build
# Creates optimized build in dist/ folder
```

### Build Analysis

```bash
npm run build -- --analyze
# Generates bundle size analysis
```

### Deployment

1. **Static Hosting** (Netlify, Vercel)
   ```bash
   npm run build
   # Deploy dist/ folder
   ```

2. **Docker Deployment**
   ```dockerfile
   FROM nginx:alpine
   COPY dist/ /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

## 🔧 Configuration

### Vite Configuration

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

### ESLint Configuration

The project includes ESLint configuration for code quality:

```javascript
// eslint.config.js
export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      }
    }
  }
];
```

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Verify backend services are running
   - Check `REACT_APP_API_URL` environment variable
   - Ensure CORS is properly configured

2. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
   - Check for TypeScript errors if using TS

3. **Styling Issues**
   - Ensure Tailwind CSS is properly installed
   - Check if custom styles conflict with Tailwind

### Debug Mode

Enable debug logging in development:

```javascript
// Add to main.jsx
if (import.meta.env.DEV) {
  console.log('Development mode enabled');
}
```

## 📞 Support

For frontend-specific issues:

1. Check browser console for errors
2. Verify API connectivity
3. Review component prop requirements
4. Check responsive design at different breakpoints

---

**Frontend built with React + Vite for optimal performance and developer experience** ⚡ 