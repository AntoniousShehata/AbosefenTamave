import { createContext, useReducer, useContext, useEffect } from 'react';
import { useToast } from '../components/Toast';

const CartContext = createContext();

// Load cart from localStorage
const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem('abosefen_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error('Error loading cart from storage:', error);
    return [];
  }
};

// Save cart to localStorage
const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem('abosefen_cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to storage:', error);
  }
};

const initialState = loadCartFromStorage();

function cartReducer(state, action) {
  let newState;
  
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItemIndex = state.findIndex(item => item._id === action.payload._id);
      
      if (existingItemIndex > -1) {
        // Item exists, increase quantity
        newState = state.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
            : item
        );
      } else {
        // New item, add to cart
        const newItem = {
          _id: action.payload._id,
          name: action.payload.name,
          slug: action.payload.slug,
          price: action.payload.pricing?.salePrice || action.payload.pricing?.originalPrice || 0,
          originalPrice: action.payload.pricing?.originalPrice,
          isOnSale: action.payload.pricing?.isOnSale || false,
          image: action.payload.images && action.payload.images.length > 0 
            ? (action.payload.images.find(img => img.isPrimary) || action.payload.images[0]).url
            : '/images/products/default.jpg',
          inventory: action.payload.inventory,
          quantity: action.payload.quantity || 1
        };
        newState = [...state, newItem];
      }
      break;

    case 'UPDATE_QUANTITY':
      newState = state.map(item =>
        item._id === action.payload.id
          ? { ...item, quantity: Math.max(1, action.payload.quantity) }
          : item
      );
      break;

    case 'INCREMENT_ITEM':
      newState = state.map(item =>
        item._id === action.payload
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      break;

    case 'DECREMENT_ITEM':
      newState = state.map(item =>
        item._id === action.payload && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
      break;

    case 'REMOVE_ITEM':
      newState = state.filter(item => item._id !== action.payload);
      break;

    case 'CLEAR_CART':
      newState = [];
      break;

    case 'LOAD_CART':
      newState = action.payload;
      break;

    default:
      return state;
  }

  // Save to localStorage whenever state changes
  saveCartToStorage(newState);
  return newState;
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, initialState);

  // Cart utilities with toast notifications
  const cartUtils = {
    // Add item to cart
    addItem: (product, quantity = 1) => {
      try {
        const wasInCart = cart.some(item => item._id === product._id);
        
        dispatch({ 
          type: 'ADD_ITEM', 
          payload: { ...product, quantity } 
        });

        // Toast notification will be handled by the calling component
        // to avoid circular dependency with useToast
        
      } catch (error) {
        console.error('Error adding item to cart:', error);
        throw error;
      }
    },

    // Update item quantity
    updateQuantity: (productId, quantity) => {
      try {
        if (quantity <= 0) {
          dispatch({ type: 'REMOVE_ITEM', payload: productId });
        } else {
          dispatch({ 
            type: 'UPDATE_QUANTITY', 
            payload: { id: productId, quantity } 
          });
        }
      } catch (error) {
        console.error('Error updating quantity:', error);
        throw error;
      }
    },

    // Increment item quantity
    incrementItem: (productId) => {
      try {
        dispatch({ type: 'INCREMENT_ITEM', payload: productId });
      } catch (error) {
        console.error('Error incrementing item:', error);
        throw error;
      }
    },

    // Decrement item quantity
    decrementItem: (productId) => {
      try {
        dispatch({ type: 'DECREMENT_ITEM', payload: productId });
      } catch (error) {
        console.error('Error decrementing item:', error);
        throw error;
      }
    },

    // Remove item from cart
    removeItem: (productId) => {
      try {
        dispatch({ type: 'REMOVE_ITEM', payload: productId });
      } catch (error) {
        console.error('Error removing item:', error);
        throw error;
      }
    },

    // Clear entire cart
    clearCart: () => {
      try {
        dispatch({ type: 'CLEAR_CART' });
      } catch (error) {
        console.error('Error clearing cart:', error);
        throw error;
      }
    },

    // Get cart totals
    getCartTotals: () => {
      const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
      const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
      const originalTotal = cart.reduce((total, item) => {
        const originalPrice = item.originalPrice || item.price;
        return total + (originalPrice * item.quantity);
      }, 0);
      const savings = originalTotal - subtotal;

      return {
        itemCount,
        subtotal,
        originalTotal,
        savings,
        total: subtotal // Can add shipping, tax, etc. here later
      };
    },

    // Check if item is in cart
    isInCart: (productId) => {
      return cart.some(item => item._id === productId);
    },

    // Get item quantity in cart
    getItemQuantity: (productId) => {
      const item = cart.find(item => item._id === productId);
      return item ? item.quantity : 0;
    },

    // Format price
    formatPrice: (price) => {
      return new Intl.NumberFormat('en-EG', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 0
      }).format(price);
    }
  };

  const value = {
    cart,
    dispatch,
    ...cartUtils
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
