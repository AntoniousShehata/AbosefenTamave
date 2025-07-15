import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import SmartSearch from './SmartSearch';

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { getCartTotals } = useCart();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  
  const cartTotals = getCartTotals();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <header className="bg-primary text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-2xl font-bold tracking-wide">
          <img
            src="/images/logo.jpg"
            alt="Abosefen & TamaveIrini Logo"
            className="w-10 h-10 object-contain rounded-full"
          />
          <span>Abosefen & TamaveIrini</span>
        </div>

        {/* Smart Search */}
        <div className="hidden md:block flex-1 max-w-xl mx-8">
          <SmartSearch className="w-full" />
        </div>

        <nav className="hidden md:flex gap-6 text-lg items-center">
          <Link to="/" className="hover:text-secondary transition">Home</Link>
          <Link to="/products" className="hover:text-secondary transition">Products</Link>
          <Link to="/contact" className="hover:text-secondary transition">Contact</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/cart" className="relative hover:text-secondary transition group">
                <div className="flex items-center space-x-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  <span>Cart</span>
                </div>
                {cartTotals.itemCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center font-semibold animate-pulse">
                    {cartTotals.itemCount}
                  </span>
                )}
              </Link>
              
              {isAdmin() && (
                <Link to="/admin" className="hover:text-secondary transition">
                  📊 Admin
                </Link>
              )}
              
              <div className="flex items-center gap-3">
                <span className="text-sm">
                  Welcome, {user?.firstName}!
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-secondary text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/cart" className="relative hover:text-secondary transition">
                🛒 Cart
                {cartTotals.itemCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {cartTotals.itemCount}
                  </span>
                )}
              </Link>
              
              <Link
                to="/login"
                className="bg-secondary text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Login
              </Link>
              
              <Link
                to="/register"
                className="border border-white text-white px-4 py-2 rounded hover:bg-white hover:text-primary transition"
              >
                Register
              </Link>
            </>
          )}
        </nav>

        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-white text-primary p-2 rounded-full shadow hover:bg-secondary hover:text-white transition-all flex justify-center items-center w-10 h-10"
          >
            {isOpen ? (
              <div className="relative w-5 h-5">
                <span className="absolute top-1/2 left-0 w-5 h-0.5 bg-primary transform -translate-y-1/2 rotate-45"></span>
                <span className="absolute top-1/2 left-0 w-5 h-0.5 bg-primary transform -translate-y-1/2 -rotate-45"></span>
              </div>
            ) : (
              <div className="flex flex-col justify-between items-center w-5 h-4">
                <div className="w-5 h-0.5 bg-primary"></div>
                <div className="w-5 h-0.5 bg-primary"></div>
                <div className="w-5 h-0.5 bg-primary"></div>
              </div>
            )}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden px-4 pb-4">
          <Link to="/" onClick={() => setIsOpen(false)} className="block py-2 hover:text-secondary">
            Home
          </Link>
          <Link to="/products" onClick={() => setIsOpen(false)} className="block py-2 hover:text-secondary">
            Products
          </Link>
          <Link to="/contact" onClick={() => setIsOpen(false)} className="block py-2 hover:text-secondary">
            Contact
          </Link>
          <Link to="/cart" onClick={() => setIsOpen(false)} className="block py-2 hover:text-secondary">
            🛒 Cart
            {cartTotals.itemCount > 0 && (
              <span className="ml-2 inline-block bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                {cartTotals.itemCount}
              </span>
            )}
          </Link>
          
          {isAuthenticated ? (
            <>
              {isAdmin() && (
                <Link to="/admin" onClick={() => setIsOpen(false)} className="block py-2 hover:text-secondary">
                  📊 Admin Dashboard
                </Link>
              )}
              <div className="py-2 border-t border-white/20 mt-2">
                <p className="text-sm mb-2">Welcome, {user?.firstName}!</p>
                <button
                  onClick={handleLogout}
                  className="bg-secondary text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="py-2 border-t border-white/20 mt-2 space-y-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block bg-secondary text-white px-4 py-2 rounded text-center hover:bg-red-700 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="block border border-white text-white px-4 py-2 rounded text-center hover:bg-white hover:text-primary transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;
