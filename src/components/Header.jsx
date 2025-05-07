import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../pictures/logo.jpg';
import { useCart } from '../context/CartContext';

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { cart } = useCart(); 

  return (
    <header className="bg-primary text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-2xl font-bold tracking-wide">
          <img
            src={logo}
            alt="Logo"
            className="w-10 h-10 object-contain rounded-full"
          />
          <span>Abosefen & TamaveIrini</span>
        </div>

        <nav className="hidden md:flex gap-6 text-lg">
          <Link to="/" className="hover:text-secondary transition">Home</Link>
          <Link to="/products" className="hover:text-secondary transition">Products</Link>
          <Link to="/contact" className="hover:text-secondary transition">Contact</Link>
          <Link to="/cart" className="relative hover:text-secondary transition">
            🛒 Cart
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                {cart.length}
              </span>
            )}
          </Link>
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
          <Link to="/" onClick={() => setIsOpen(false)} className="block py-2 hover:text-secondary">Home</Link>
          <Link to="/products" onClick={() => setIsOpen(false)} className="block py-2 hover:text-secondary">Products</Link>
          <Link to="/contact" onClick={() => setIsOpen(false)} className="block py-2 hover:text-secondary">Contact</Link>
          <Link to="/cart" onClick={() => setIsOpen(false)} className="block py-2 hover:text-secondary">
            🛒 Cart
            {cart.length > 0 && (
              <span className="ml-2 inline-block bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                {cart.length}
              </span>
            )}
          </Link>
        </div>
      )}
    </header>
  );
}

export default Header;
