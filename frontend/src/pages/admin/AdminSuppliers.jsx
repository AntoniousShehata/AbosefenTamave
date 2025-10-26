import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../components/Toast';

function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { showSuccess, showError } = useToast();
  
  const [supplierForm, setSupplierForm] = useState({
    code: '',
    name: { en: '', ar: '' },
    legalName: '',
    taxId: '',
    contact: {
      address: { en: '', ar: '' },
      city: { en: '', ar: '' },
      country: 'Egypt',
      phone: '',
      email: '',
      website: '',
      contactPerson: {
        name: '',
        position: '',
        phone: '',
        email: ''
      }
    },
    businessInfo: {
      establishedYear: new Date().getFullYear(),
      businessType: '',
      certifications: [],
      paymentTerms: '30 days',
      creditLimit: 0,
      currency: 'EGP'
    },
    performance: {
      rating: 5,
      onTimeDelivery: 100,
      qualityRating: 5,
      responseTime: 24,
      totalOrders: 0,
      totalValue: 0
    },
    products: [],
    isActive: true
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      const response = await axios.get(`${API_BASE}/products/suppliers?isActive=all`);
      
      if (response.data.success) {
        setSuppliers(response.data.suppliers);
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
      showError('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      
      if (selectedSupplier) {
        // Update existing supplier
        const response = await axios.put(
          `${API_BASE}/products/suppliers/${selectedSupplier._id}`,
          supplierForm
        );
        
        if (response.data.success) {
          showSuccess('Supplier updated successfully');
          setShowEditModal(false);
          loadSuppliers();
        }
      } else {
        // Create new supplier
        const response = await axios.post(
          `${API_BASE}/products/suppliers`,
          supplierForm
        );
        
        if (response.data.success) {
          showSuccess('Supplier created successfully');
          setShowAddModal(false);
          loadSuppliers();
        }
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving supplier:', error);
      showError(error.response?.data?.error || 'Failed to save supplier');
    }
  };

  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setSupplierForm({
      ...supplier,
      businessInfo: supplier.businessInfo || {
        establishedYear: new Date().getFullYear(),
        businessType: '',
        certifications: [],
        paymentTerms: '30 days',
        creditLimit: 0,
        currency: 'EGP'
      },
      performance: supplier.performance || {
        rating: 5,
        onTimeDelivery: 100,
        qualityRating: 5,
        responseTime: 24,
        totalOrders: 0,
        totalValue: 0
      }
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setSupplierForm({
      code: '',
      name: { en: '', ar: '' },
      legalName: '',
      taxId: '',
      contact: {
        address: { en: '', ar: '' },
        city: { en: '', ar: '' },
        country: 'Egypt',
        phone: '',
        email: '',
        website: '',
        contactPerson: {
          name: '',
          position: '',
          phone: '',
          email: ''
        }
      },
      businessInfo: {
        establishedYear: new Date().getFullYear(),
        businessType: '',
        certifications: [],
        paymentTerms: '30 days',
        creditLimit: 0,
        currency: 'EGP'
      },
      performance: {
        rating: 5,
        onTimeDelivery: 100,
        qualityRating: 5,
        responseTime: 24,
        totalOrders: 0,
        totalValue: 0
      },
      products: [],
      isActive: true
    });
    setSelectedSupplier(null);
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    if (!searchTerm) return true;
    
    return supplier.name.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
           supplier.name.ar.includes(searchTerm) ||
           supplier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
           supplier.legalName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getRatingStars = (rating) => {
    return '⭐'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '⭐' : '');
  };

  const getPerformanceColor = (value, type) => {
    if (type === 'rating' || type === 'quality') {
      if (value >= 4.5) return 'text-green-600';
      if (value >= 3.5) return 'text-yellow-600';
      return 'text-red-600';
    }
    
    if (type === 'delivery') {
      if (value >= 95) return 'text-green-600';
      if (value >= 85) return 'text-yellow-600';
      return 'text-red-600';
    }
    
    if (type === 'response') {
      if (value <= 24) return 'text-green-600';
      if (value <= 48) return 'text-yellow-600';
      return 'text-red-600';
    }
    
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg text-gray-600">Loading suppliers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Supplier Management</h2>
          <p className="text-gray-600">Manage your suppliers and track their performance</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
        >
          <span>+</span>
          Add New Supplier
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <input
          type="text"
          placeholder="Search suppliers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <div key={supplier._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{supplier.name.en}</h3>
                  <p className="text-sm text-gray-600">{supplier.name.ar}</p>
                  <p className="text-xs text-gray-500">{supplier.legalName}</p>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {supplier.code}
                </span>
              </div>

              {/* Contact Info */}
              <div className="mb-4 space-y-1">
                <p className="text-sm text-gray-600">
                  📍 {supplier.contact.city.en}, {supplier.contact.country}
                </p>
                {supplier.contact.phone && (
                  <p className="text-sm text-gray-600">📞 {supplier.contact.phone}</p>
                )}
                {supplier.contact.email && (
                  <p className="text-sm text-gray-600">✉️ {supplier.contact.email}</p>
                )}
              </div>

              {/* Contact Person */}
              {supplier.contact.contactPerson?.name && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700">Contact Person:</p>
                  <p className="text-sm text-gray-600">{supplier.contact.contactPerson.name}</p>
                  <p className="text-xs text-gray-500">{supplier.contact.contactPerson.position}</p>
                </div>
              )}

              {/* Performance Metrics */}
              {supplier.performance && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Performance:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>Rating:</span>
                      <span className={getPerformanceColor(supplier.performance.rating, 'rating')}>
                        {getRatingStars(supplier.performance.rating)} ({supplier.performance.rating}/5)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>On-time:</span>
                      <span className={getPerformanceColor(supplier.performance.onTimeDelivery, 'delivery')}>
                        {supplier.performance.onTimeDelivery}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quality:</span>
                      <span className={getPerformanceColor(supplier.performance.qualityRating, 'quality')}>
                        {supplier.performance.qualityRating}/5
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Response:</span>
                      <span className={getPerformanceColor(supplier.performance.responseTime, 'response')}>
                        {supplier.performance.responseTime}h
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Business Info */}
              <div className="mb-4">
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Payment Terms: {supplier.businessInfo?.paymentTerms || 'N/A'}</p>
                  <p>Credit Limit: {supplier.businessInfo?.creditLimit || 0} {supplier.businessInfo?.currency || 'EGP'}</p>
                  {supplier.performance?.totalOrders > 0 && (
                    <p>Total Orders: {supplier.performance.totalOrders}</p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  supplier.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {supplier.isActive ? '✅ Active' : '❌ Inactive'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(supplier)}
                  className="flex-1 bg-primary text-white py-2 px-3 rounded-md hover:bg-primary-dark transition-colors text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    // Toggle active status
                    const updatedSupplier = { ...supplier, isActive: !supplier.isActive };
                    handleEdit(updatedSupplier);
                  }}
                  className={`flex-1 py-2 px-3 rounded-md transition-colors text-sm ${
                    supplier.isActive
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {supplier.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
          <p className="text-gray-600">
            {searchTerm 
              ? 'Try adjusting your search criteria'
              : 'Get started by adding your first supplier'
            }
          </p>
        </div>
      )}

      {/* Add/Edit Supplier Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                  {selectedSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supplier Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={supplierForm.code}
                      onChange={(e) => setSupplierForm(prev => ({ ...prev, code: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="SUP001, SUP002, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Legal Name
                    </label>
                    <input
                      type="text"
                      value={supplierForm.legalName}
                      onChange={(e) => setSupplierForm(prev => ({ ...prev, legalName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={supplierForm.name.en}
                      onChange={(e) => setSupplierForm(prev => ({ 
                        ...prev, 
                        name: { ...prev.name, en: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name (Arabic) *
                    </label>
                    <input
                      type="text"
                      required
                      value={supplierForm.name.ar}
                      onChange={(e) => setSupplierForm(prev => ({ 
                        ...prev, 
                        name: { ...prev.name, ar: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax ID
                    </label>
                    <input
                      type="text"
                      value={supplierForm.taxId}
                      onChange={(e) => setSupplierForm(prev => ({ ...prev, taxId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={supplierForm.contact.country}
                      onChange={(e) => setSupplierForm(prev => ({ 
                        ...prev, 
                        contact: { ...prev.contact, country: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium mb-4">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address (English)
                      </label>
                      <input
                        type="text"
                        value={supplierForm.contact.address.en}
                        onChange={(e) => setSupplierForm(prev => ({ 
                          ...prev, 
                          contact: { ...prev.contact, address: { ...prev.contact.address, en: e.target.value }}
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City (English)
                      </label>
                      <input
                        type="text"
                        value={supplierForm.contact.city.en}
                        onChange={(e) => setSupplierForm(prev => ({ 
                          ...prev, 
                          contact: { ...prev.contact, city: { ...prev.contact.city, en: e.target.value }}
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={supplierForm.contact.phone}
                        onChange={(e) => setSupplierForm(prev => ({ 
                          ...prev, 
                          contact: { ...prev.contact, phone: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={supplierForm.contact.email}
                        onChange={(e) => setSupplierForm(prev => ({ 
                          ...prev, 
                          contact: { ...prev.contact, email: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={supplierForm.contact.website}
                        onChange={(e) => setSupplierForm(prev => ({ 
                          ...prev, 
                          contact: { ...prev.contact, website: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Person */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium mb-4">Contact Person</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={supplierForm.contact.contactPerson.name}
                        onChange={(e) => setSupplierForm(prev => ({ 
                          ...prev, 
                          contact: { 
                            ...prev.contact, 
                            contactPerson: { ...prev.contact.contactPerson, name: e.target.value }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Position
                      </label>
                      <input
                        type="text"
                        value={supplierForm.contact.contactPerson.position}
                        onChange={(e) => setSupplierForm(prev => ({ 
                          ...prev, 
                          contact: { 
                            ...prev.contact, 
                            contactPerson: { ...prev.contact.contactPerson, position: e.target.value }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={supplierForm.contact.contactPerson.phone}
                        onChange={(e) => setSupplierForm(prev => ({ 
                          ...prev, 
                          contact: { 
                            ...prev.contact, 
                            contactPerson: { ...prev.contact.contactPerson, phone: e.target.value }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={supplierForm.contact.contactPerson.email}
                        onChange={(e) => setSupplierForm(prev => ({ 
                          ...prev, 
                          contact: { 
                            ...prev.contact, 
                            contactPerson: { ...prev.contact.contactPerson, email: e.target.value }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium mb-4">Business Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Established Year
                      </label>
                      <input
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        value={supplierForm.businessInfo.establishedYear}
                        onChange={(e) => setSupplierForm(prev => ({ 
                          ...prev, 
                          businessInfo: { ...prev.businessInfo, establishedYear: parseInt(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Type
                      </label>
                      <input
                        type="text"
                        value={supplierForm.businessInfo.businessType}
                        onChange={(e) => setSupplierForm(prev => ({ 
                          ...prev, 
                          businessInfo: { ...prev.businessInfo, businessType: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Manufacturer, Distributor, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Terms
                      </label>
                      <select
                        value={supplierForm.businessInfo.paymentTerms}
                        onChange={(e) => setSupplierForm(prev => ({ 
                          ...prev, 
                          businessInfo: { ...prev.businessInfo, paymentTerms: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="Immediate">Immediate</option>
                        <option value="15 days">15 days</option>
                        <option value="30 days">30 days</option>
                        <option value="45 days">45 days</option>
                        <option value="60 days">60 days</option>
                        <option value="90 days">90 days</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Credit Limit
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={supplierForm.businessInfo.creditLimit}
                        onChange={(e) => setSupplierForm(prev => ({ 
                          ...prev, 
                          businessInfo: { ...prev.businessInfo, creditLimit: parseInt(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        value={supplierForm.businessInfo.currency}
                        onChange={(e) => setSupplierForm(prev => ({ 
                          ...prev, 
                          businessInfo: { ...prev.businessInfo, currency: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="EGP">EGP</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="border-t pt-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={supplierForm.isActive}
                      onChange={(e) => setSupplierForm(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Supplier is active</span>
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 border-t pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                  >
                    {selectedSupplier ? 'Update Supplier' : 'Create Supplier'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSuppliers; 