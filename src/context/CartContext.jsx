import { createContext, useReducer, useContext } from 'react';

const CartContext = createContext();

const initialState = [];

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      const existing = state.find(p => p.id === action.payload.id);
      if (existing) {
        return state.map(p =>
          p.id === action.payload.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...state, { ...action.payload, quantity: 1 }];
    case 'INCREMENT':
      return state.map(p =>
        p.id === action.payload ? { ...p, quantity: p.quantity + 1 } : p
      );
    case 'DECREMENT':
      return state.map(p =>
        p.id === action.payload && p.quantity > 1
          ? { ...p, quantity: p.quantity - 1 }
          : p
      );
    case 'REMOVE':
      return state.filter(p => p.id !== action.payload);
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, initialState);
  return (
    <CartContext.Provider value={{ cart, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
