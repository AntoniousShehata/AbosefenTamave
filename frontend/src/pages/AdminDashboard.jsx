import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminOrders from './admin/AdminOrders';
import AdminProducts from './admin/AdminProducts';
import AdminInventory from './admin/AdminInventory';
import AdminUsers from './admin/AdminUsers';
import AdminDashboardHome from './admin/AdminDashboardHome';
import axios from 'axios';

function AdminDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Orders', href: '/admin/orders', icon: '📦' },
    { name: 'Products', href: '/admin/products', icon: '🛍️' },
    { name: 'Inventory', href: '/admin/inventory', icon: '📋' },
    { name: 'Users', href: '/admin/users', icon: '👥' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-primary transform lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300 ease-in-out`}>
        <div className="flex items-center justify-center h-16 px-4 bg-primary-dark">
          <h2 className="text-xl font-bold text-white">Admin Panel</h2>
        </div>
        
        <nav className="mt-8">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/admin' && location.pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`${
                  isActive
                    ? 'bg-primary-dark text-white'
                    : 'text-gray-300 hover:bg-primary-dark hover:text-white'
                } group flex items-center px-6 py-3 text-base font-medium transition-colors duration-200`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-primary-dark rounded-lg p-3">
            <p className="text-white text-sm">Logged in as:</p>
            <p className="text-gray-300 text-xs">{user?.firstName} {user?.lastName}</p>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top navigation */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  type="button"
                  className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                  onClick={() => setSidebarOpen(true)}
                >
                  <span className="sr-only">Open sidebar</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                <h1 className="ml-4 text-2xl font-semibold text-gray-900">
                  Abosefen & Tamave Irini - Admin
                </h1>
              </div>
              
              <div className="flex items-center">
                <Link
                  to="/"
                  className="text-primary hover:text-secondary text-sm font-medium"
                >
                  ← Back to Store
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Routes>
              <Route path="/" element={<AdminDashboardHome />} />
              <Route path="/orders" element={<AdminOrders />} />
              <Route path="/products" element={<AdminProducts />} />
              <Route path="/inventory" element={<AdminInventory />} />
              <Route path="/users" element={<AdminUsers />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard; 