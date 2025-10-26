import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import SmartSearch from './SmartSearch';

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { getCartTotals } = useCart();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  
  const cartTotals = getCartTotals();

  // Close mobile menu when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
        setShowMobileSearch(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('header')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const closeMobileMenus = () => {
    setIsOpen(false);
    setShowMobileSearch(false);
  };

  return (
    <header className="bg-primary text-white shadow-lg sticky top-0 z-50 safe-top">
      {/* Main Header */}
      <div className="container-responsive">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo Section */}
          <Link to="/" onClick={closeMobileMenus} className="flex items-center gap-2 sm:gap-3 flex-shrink-0 touch-manipulation">
            <img
              src="/images/logo.jpg"
              alt="Abosefen & TamaveIrini Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-full"
            />
            <span className="text-base sm:text-xl lg:text-2xl font-bold tracking-wide truncate">
              <span className="hidden xs:inline">Abosefen & TamaveIrini</span>
              <span className="xs:hidden">Abosefen</span>
            </span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden lg:block flex-1 max-w-2xl mx-6 xl:mx-8">
            <SmartSearch className="w-full" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link to="/" className="nav-link hover:text-secondary transition-colors">
              Home
            </Link>
            <Link to="/products" className="nav-link hover:text-secondary transition-colors">
              Products
            </Link>
            <Link to="/contact" className="nav-link hover:text-secondary transition-colors">
              Contact
            </Link>
            
            {/* Cart Link */}
            <Link to="/cart" className="relative nav-link hover:text-secondary transition-colors group">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  {cartTotals.itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center font-semibold animate-pulse">
                      {cartTotals.itemCount}
                    </span>
                  )}
                </div>
                <span className="hidden lg:inline">Cart</span>
              </div>
            </Link>
            
            {/* User Actions */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 lg:gap-4">
                {isAdmin() && (
                  <Link to="/admin" className="nav-link hover:text-secondary transition-colors">
                    <span className="hidden lg:inline">📊 Admin</span>
                    <span className="lg:hidden">📊</span>
                  </Link>
                )}
                
                <div className="flex items-center gap-2">
                  <span className="text-xs lg:text-sm hidden lg:inline font-medium">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn btn-secondary text-xs lg:text-sm px-3 py-1 lg:px-4 lg:py-2"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 lg:gap-3">
                <Link
                  to="/login"
                  className="btn btn-secondary text-xs lg:text-sm px-3 py-1 lg:px-4 lg:py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-outline text-xs lg:text-sm px-3 py-1 lg:px-4 lg:py-2"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors touch-manipulation"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Mobile Cart */}
            <Link to="/cart" className="relative p-2 rounded-full hover:bg-white/10 transition-colors touch-manipulation">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              {cartTotals.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center font-semibold">
                  {cartTotals.itemCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-full hover:bg-white/10 transition-all touch-manipulation"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <div className="md:hidden border-t border-white/20 animate-slide-down">
          <div className="container-responsive py-3">
            <SmartSearch 
              className="w-full" 
              onSearchComplete={() => setShowMobileSearch(false)}
            />
          </div>
        </div>
      )}

      {/* Tablet Search Bar */}
      <div className="hidden md:block lg:hidden border-t border-white/20">
        <div className="container-responsive py-3">
          <SmartSearch className="w-full max-w-md mx-auto" />
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Mobile Menu */}
          <div className="fixed top-16 left-0 right-0 bg-primary border-t border-white/20 z-50 md:hidden animate-slide-down safe-bottom">
            <div className="container-responsive py-4">
              <nav className="space-y-1">
                <Link 
                  to="/" 
                  onClick={closeMobileMenus} 
                  className="nav-link hover:bg-white/10 rounded-lg transition-colors"
                >
                  🏠 Home
                </Link>
                <Link 
                  to="/products" 
                  onClick={closeMobileMenus} 
                  className="nav-link hover:bg-white/10 rounded-lg transition-colors"
                >
                  🛍️ Products
                </Link>
                <Link 
                  to="/contact" 
                  onClick={closeMobileMenus} 
                  className="nav-link hover:bg-white/10 rounded-lg transition-colors"
                >
                  📞 Contact
                </Link>
                
                {isAuthenticated ? (
                  <>
                    {isAdmin() && (
                      <Link 
                        to="/admin" 
                        onClick={closeMobileMenus} 
                        className="nav-link hover:bg-white/10 rounded-lg transition-colors"
                      >
                        📊 Admin Dashboard
                      </Link>
                    )}
                    
                    <div className="border-t border-white/20 pt-4 mt-4">
                      <div className="nav-link">
                        <span className="text-sm font-medium">{user?.firstName} {user?.lastName}</span>
                        <span className="text-xs opacity-75 block mt-1">{user?.email}</span>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="nav-link w-full text-left hover:bg-white/10 rounded-lg transition-colors text-red-300"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="border-t border-white/20 pt-4 mt-4 space-y-2">
                    <Link
                      to="/login"
                      onClick={closeMobileMenus}
                      className="btn btn-secondary w-full text-center"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={closeMobileMenus}
                      className="btn btn-outline w-full text-center"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

export default Header;
