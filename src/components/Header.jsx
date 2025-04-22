import React from 'react';

function Header() {
  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold tracking-wide">
        🛁 Abosefen & Tamav Irini | Sanitaryware
        </div>
        <nav className="space-x-4">
          <a href="#" className="hover:text-secondary transition">Home</a>
          <a href="#" className="hover:text-secondary transition">Products</a>
          <a href="#" className="hover:text-secondary transition">Contact</a>
        </nav>
      </div>
    </header>
  );
}

export default Header;
