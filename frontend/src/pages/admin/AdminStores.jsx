import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../components/Toast';

function AdminStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { showSuccess, showError } = useToast();
  
  const [storeForm, setStoreForm] = useState({
    code: '',
    name: { en: '', ar: '' },
    type: 'branch',
    location: {
      address: { en: '', ar: '' },
      city: { en: '', ar: '' },
      governorate: { en: '', ar: '' },
      postalCode: '',
      coordinates: { lat: 0, lng: 0 },
      phone: '',
      email: ''
    },
    manager: {
      name: '',
      phone: '',
      email: ''
    },
    operatingHours: {
      weekdays: { open: '08:00', close: '18:00' },
      weekends: { open: '10:00', close: '16:00' },
      holidays: '10:00-14:00'
    },
    features: [],
    isActive: true
  });

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setLoading(true);
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      const response = await axios.get(`${API_BASE}/products/stores?isActive=all`);
      
      if (response.data.success) {
        setStores(response.data.stores);
      }
    } catch (error) {
      console.error('Error loading stores:', error);
      showError('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      
      if (selectedStore) {
        // Update existing store
        const response = await axios.put(
          `${API_BASE}/products/stores/${selectedStore._id}`,
          storeForm
        );
        
        if (response.data.success) {
          showSuccess('Store updated successfully');
          setShowEditModal(false);
          loadStores();
        }
      } else {
        // Create new store
        const response = await axios.post(
          `${API_BASE}/products/stores`,
          storeForm
        );
        
        if (response.data.success) {
          showSuccess('Store created successfully');
          setShowAddModal(false);
          loadStores();
        }
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving store:', error);
      showError(error.response?.data?.error || 'Failed to save store');
    }
  };

  const handleEdit = (store) => {
    setSelectedStore(store);
    setStoreForm({
      ...store,
      features: store.features || []
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setStoreForm({
      code: '',
      name: { en: '', ar: '' },
      type: 'branch',
      location: {
        address: { en: '', ar: '' },
        city: { en: '', ar: '' },
        governorate: { en: '', ar: '' },
        postalCode: '',
        coordinates: { lat: 0, lng: 0 },
        phone: '',
        email: ''
      },
      manager: {
        name: '',
        phone: '',
        email: ''
      },
      operatingHours: {
        weekdays: { open: '08:00', close: '18:00' },
        weekends: { open: '10:00', close: '16:00' },
        holidays: '10:00-14:00'
      },
      features: [],
      isActive: true
    });
    setSelectedStore(null);
  };

  const filteredStores = stores.filter(store => {
    const matchesType = filterType === 'all' || store.type === filterType;
    const matchesSearch = !searchTerm || 
      store.name.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.name.ar.includes(searchTerm) ||
      store.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'main': return '🏢';
      case 'branch': return '🏪';
      case 'warehouse': return '🏭';
      case 'showroom': return '🏬';
      default: return '🏪';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'main': return 'bg-blue-100 text-blue-800';
      case 'branch': return 'bg-green-100 text-green-800';
      case 'warehouse': return 'bg-purple-100 text-purple-800';
      case 'showroom': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg text-gray-600">Loading stores...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Stores & Branches Management</h2>
          <p className="text-gray-600">Manage your retail locations and warehouses</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
        >
          <span>+</span>
          Add New Store
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search stores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Types</option>
            <option value="main">Main Store</option>
            <option value="branch">Branch</option>
            <option value="warehouse">Warehouse</option>
            <option value="showroom">Showroom</option>
          </select>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.map((store) => (
          <div key={store._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getTypeIcon(store.type)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{store.name.en}</h3>
                    <p className="text-sm text-gray-600">{store.name.ar}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(store.type)}`}>
                  {store.type}
                </span>
              </div>

              {/* Store Code */}
              <div className="mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {store.code}
                </span>
              </div>

              {/* Location */}
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  📍 {store.location.city.en}, {store.location.governorate.en}
                </p>
                <p className="text-sm text-gray-500">{store.location.address.en}</p>
              </div>

              {/* Manager */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700">Manager:</p>
                <p className="text-sm text-gray-600">{store.manager.name}</p>
                <p className="text-sm text-gray-500">{store.manager.phone}</p>
              </div>

              {/* Features */}
              {store.features && store.features.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                  <div className="flex flex-wrap gap-1">
                    {store.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  store.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {store.isActive ? '✅ Active' : '❌ Inactive'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(store)}
                  className="flex-1 bg-primary text-white py-2 px-3 rounded-md hover:bg-primary-dark transition-colors text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    // Toggle active status
                    const updatedStore = { ...store, isActive: !store.isActive };
                    handleEdit(updatedStore);
                  }}
                  className={`flex-1 py-2 px-3 rounded-md transition-colors text-sm ${
                    store.isActive
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {store.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredStores.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏪</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No stores found</h3>
          <p className="text-gray-600">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search criteria'
              : 'Get started by adding your first store'
            }
          </p>
        </div>
      )}

      {/* Add/Edit Store Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                  {selectedStore ? 'Edit Store' : 'Add New Store'}
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
                      Store Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={storeForm.code}
                      onChange={(e) => setStoreForm(prev => ({ ...prev, code: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="ST01, WH01, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Type *
                    </label>
                    <select
                      required
                      value={storeForm.type}
                      onChange={(e) => setStoreForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="main">Main Store</option>
                      <option value="branch">Branch</option>
                      <option value="warehouse">Warehouse</option>
                      <option value="showroom">Showroom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={storeForm.name.en}
                      onChange={(e) => setStoreForm(prev => ({ 
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
                      value={storeForm.name.ar}
                      onChange={(e) => setStoreForm(prev => ({ 
                        ...prev, 
                        name: { ...prev.name, ar: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Location Information */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium mb-4">Location Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address (English) *
                      </label>
                      <input
                        type="text"
                        required
                        value={storeForm.location.address.en}
                        onChange={(e) => setStoreForm(prev => ({ 
                          ...prev, 
                          location: { ...prev.location, address: { ...prev.location.address, en: e.target.value }}
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address (Arabic) *
                      </label>
                      <input
                        type="text"
                        required
                        value={storeForm.location.address.ar}
                        onChange={(e) => setStoreForm(prev => ({ 
                          ...prev, 
                          location: { ...prev.location, address: { ...prev.location.address, ar: e.target.value }}
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        dir="rtl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City (English) *
                      </label>
                      <input
                        type="text"
                        required
                        value={storeForm.location.city.en}
                        onChange={(e) => setStoreForm(prev => ({ 
                          ...prev, 
                          location: { ...prev.location, city: { ...prev.location.city, en: e.target.value }}
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Governorate (English) *
                      </label>
                      <input
                        type="text"
                        required
                        value={storeForm.location.governorate.en}
                        onChange={(e) => setStoreForm(prev => ({ 
                          ...prev, 
                          location: { ...prev.location, governorate: { ...prev.location.governorate, en: e.target.value }}
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
                        value={storeForm.location.phone}
                        onChange={(e) => setStoreForm(prev => ({ 
                          ...prev, 
                          location: { ...prev.location, phone: e.target.value }
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
                        value={storeForm.location.email}
                        onChange={(e) => setStoreForm(prev => ({ 
                          ...prev, 
                          location: { ...prev.location, email: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Manager Information */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium mb-4">Manager Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Manager Name
                      </label>
                      <input
                        type="text"
                        value={storeForm.manager.name}
                        onChange={(e) => setStoreForm(prev => ({ 
                          ...prev, 
                          manager: { ...prev.manager, name: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Manager Phone
                      </label>
                      <input
                        type="tel"
                        value={storeForm.manager.phone}
                        onChange={(e) => setStoreForm(prev => ({ 
                          ...prev, 
                          manager: { ...prev.manager, phone: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Manager Email
                      </label>
                      <input
                        type="email"
                        value={storeForm.manager.email}
                        onChange={(e) => setStoreForm(prev => ({ 
                          ...prev, 
                          manager: { ...prev.manager, email: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium mb-4">Store Features</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['showroom', 'warehouse', 'service', 'delivery'].map((feature) => (
                      <label key={feature} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={storeForm.features.includes(feature)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setStoreForm(prev => ({ 
                                ...prev, 
                                features: [...prev.features, feature]
                              }));
                            } else {
                              setStoreForm(prev => ({ 
                                ...prev, 
                                features: prev.features.filter(f => f !== feature)
                              }));
                            }
                          }}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700 capitalize">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="border-t pt-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={storeForm.isActive}
                      onChange={(e) => setStoreForm(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Store is active</span>
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
                    {selectedStore ? 'Update Store' : 'Create Store'}
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

export default AdminStores; 