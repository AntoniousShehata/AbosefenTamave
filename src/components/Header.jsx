import React from 'react';

function Header() {
  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold tracking-wide">
          أبوسيفين و تماف إيريني
        </div>
        <nav className="space-x-4">
          <a href="#" className="hover:text-secondary transition">الرئيسية</a>
          <a href="#" className="hover:text-secondary transition">المنتجات</a>
          <a href="#" className="hover:text-secondary transition">اتصل بنا</a>
        </nav>
      </div>
    </header>
  );
}

export default Header;
