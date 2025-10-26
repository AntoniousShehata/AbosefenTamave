/**
 * Centralized API Configuration
 * 
 * Usage:
 * import { API_URL } from '@/config/api';
 * axios.get(`${API_URL}/products`);
 */

// Get base API URL from environment variable
// For development: http://localhost:8080
// For production (Vercel): https://your-ngrok-url.ngrok-free.app
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Ensure no trailing slash
export const API_URL = API_BASE_URL.replace(/\/$/, '');

// Auth endpoints use /api/auth prefix
export const AUTH_API_URL = `${API_URL}/api/auth`;

// Products endpoints use /api prefix  
export const PRODUCTS_API_URL = `${API_URL}/api/products`;

// Categories endpoints
export const CATEGORIES_API_URL = `${API_URL}/api/categories`;

// Helper function for constructing API URLs
export const getApiUrl = (path) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${cleanPath}`;
};

// Export for backward compatibility
export default API_URL;

