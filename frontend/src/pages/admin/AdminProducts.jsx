import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../components/Toast';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [enhancedCategories, setEnhancedCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [generatingCode, setGeneratingCode] = useState(false);
  
  const { showSuccess, showError } = useToast();

  const [productForm, setProductForm] = useState({
    name: { en: '', ar: '' },
    description: { en: '', ar: '' },
    categoryId: '',
    subcategoryId: '',
    productTypeId: '',
    hierarchicalCode: {
      category: '',
      subcategory: '',
      productType: '',
      variant: '',
      full: ''
    },
    sku: '',
    specifications: {
      dimensions: { width: '', height: '', depth: '', unit: 'cm' },
      weight: { value: '', unit: 'kg' },
      material: { en: '', ar: '' },
      color: { en: '', ar: '' },
      finish: { en: '', ar: '' },
      brand: '',
      model: '',
      countryOfOrigin: 'Egypt'
    },
    pricing: {
      originalPrice: '',
      salePrice: '',
      isOnSale: false,
      discountPercentage: 0,
      currency: 'EGP'
    },
    inventory: {
      multiLocation: [],
      totalQuantity: '',
      totalReserved: 0,
      totalAvailable: '',
      inStock: true,
      lowStockThreshold: 5,
      reorderPoint: 10,
      reorderQuantity: 50,
      autoReorder: false
    },
    supplier: {
      _id: '',
      name: '',
      leadTime: 7,
      minOrderQuantity: 1,
      pricePerUnit: 0,
      paymentTerms: '30 days'
    },
    images: [],
    seo: {
      metaTitle: { en: '', ar: '' },
      metaDescription: { en: '', ar: '' },
      keywords: []
    },
    tags: [],
    isActive: true,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    status: 'active'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      
      const [productsRes, categoriesRes, enhancedCategoriesRes, storesRes] = await Promise.all([
        axios.get(`${API_BASE}/products`),
        axios.get(`${API_BASE}/categories`),
        axios.get(`${API_BASE}/products/enhanced-categories`).catch(() => ({ data: { categories: [] } })),
        axios.get(`${API_BASE}/products/stores`).catch(() => ({ data: { stores: [] } }))
      ]);

      setProducts(productsRes.data.products || []);
      setCategories(categoriesRes.data.categories || []);
      setEnhancedCategories(enhancedCategoriesRes.data.categories || []);
      setStores(storesRes.data.stores || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadSubcategories = async (categoryId) => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      const response = await axios.get(`${API_BASE}/products/enhanced-categories/${categoryId}/subcategories`);
      setSubcategories(response.data.subcategories || []);
    } catch (error) {
      console.error('Error loading subcategories:', error);
      setSubcategories([]);
    }
  };

  const loadProductTypes = async (categoryId, subcategoryId) => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      const response = await axios.get(`${API_BASE}/products/enhanced-categories/${categoryId}/${subcategoryId}/product-types`);
      setProductTypes(response.data.productTypes || []);
    } catch (error) {
      console.error('Error loading product types:', error);
      setProductTypes([]);
    }
  };

  const generateHierarchicalCode = async () => {
    if (!productForm.hierarchicalCode.category || !productForm.hierarchicalCode.subcategory || !productForm.hierarchicalCode.productType) {
      showError('Please select category, subcategory, and product type first');
      return;
    }

    try {
      setGeneratingCode(true);
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      const response = await axios.post(`${API_BASE}/products/hierarchical-codes/generate`, {
        categoryCode: productForm.hierarchicalCode.category,
        subcategoryCode: productForm.hierarchicalCode.subcategory,
        productTypeCode: productForm.hierarchicalCode.productType
      });

      if (response.data.success) {
        const newCode = response.data.hierarchicalCode;
        setProductForm(prev => ({
          ...prev,
          hierarchicalCode: newCode,
          sku: newCode.full
        }));
        showSuccess('Hierarchical code generated successfully!');
      }
    } catch (error) {
      console.error('Error generating code:', error);
      showError('Failed to generate hierarchical code');
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const parts = name.split('.');
      setProductForm(prev => {
        const newForm = { ...prev };
        let current = newForm;
        
        for (let i = 0; i < parts.length - 1; i++) {
          current = current[parts[i]];
        }
        
        current[parts[parts.length - 1]] = type === 'checkbox' ? checked : value;
        return newForm;
      });
    } else if (name.includes('_')) {
      const [parent, lang] = name.split('_');
      setProductForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [lang]: value
        }
      }));
    } else {
      setProductForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Handle category changes
    if (name === 'categoryId') {
      const category = enhancedCategories.find(cat => cat._id === value);
      if (category) {
        setProductForm(prev => ({
          ...prev,
          hierarchicalCode: {
            ...prev.hierarchicalCode,
            category: category.code
          }
        }));
        loadSubcategories(value);
        setSubcategories([]);
        setProductTypes([]);
      }
    }

    // Handle subcategory changes
    if (name === 'subcategoryId') {
      const subcategory = subcategories.find(sub => sub._id === value);
      if (subcategory) {
        setProductForm(prev => ({
          ...prev,
          hierarchicalCode: {
            ...prev.hierarchicalCode,
            subcategory: subcategory.code
          }
        }));
        loadProductTypes(productForm.categoryId, value);
        setProductTypes([]);
      }
    }

    // Handle product type changes
    if (name === 'productTypeId') {
      const productType = productTypes.find(type => type._id === value);
      if (productType) {
        setProductForm(prev => ({
          ...prev,
          hierarchicalCode: {
            ...prev.hierarchicalCode,
            productType: productType.code
          }
        }));
      }
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageObjects = files.map((file, index) => ({
      url: `/images/products/${file.name}`,
      alt: { en: productForm.name.en, ar: productForm.name.ar },
      isPrimary: index === 0,
      sortOrder: index + 1,
      variants: []
    }));
    
    setProductForm(prev => ({
      ...prev,
      images: [...prev.images, ...imageObjects]
    }));
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setProductForm(prev => ({ ...prev, tags }));
  };

  const handleKeywordsChange = (e) => {
    const keywords = e.target.value.split(',').map(keyword => keyword.trim()).filter(keyword => keyword);
    setProductForm(prev => ({
      ...prev,
      seo: { ...prev.seo, keywords }
    }));
  };

  const addStoreInventory = () => {
    const newStoreInventory = {
      storeId: '',
      storeName: '',
      quantity: 0,
      reserved: 0,
      available: 0,
      lowStockThreshold: 5,
      lastUpdated: new Date().toISOString()
    };

    setProductForm(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        multiLocation: [...prev.inventory.multiLocation, newStoreInventory]
      }
    }));
  };

  const removeStoreInventory = (index) => {
    setProductForm(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        multiLocation: prev.inventory.multiLocation.filter((_, i) => i !== index)
      }
    }));
  };

  const updateStoreInventory = (index, field, value) => {
    setProductForm(prev => {
      const newMultiLocation = [...prev.inventory.multiLocation];
      newMultiLocation[index] = {
        ...newMultiLocation[index],
        [field]: value
      };

      // Auto-calculate available quantity
      if (field === 'quantity' || field === 'reserved') {
        const quantity = field === 'quantity' ? parseInt(value) || 0 : newMultiLocation[index].quantity;
        const reserved = field === 'reserved' ? parseInt(value) || 0 : newMultiLocation[index].reserved;
        newMultiLocation[index].available = quantity - reserved;
      }

      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          multiLocation: newMultiLocation
        }
      };
    });
  };

  const calculateTotalInventory = () => {
    const totalQuantity = productForm.inventory.multiLocation.reduce((sum, loc) => sum + (parseInt(loc.quantity) || 0), 0);
    const totalReserved = productForm.inventory.multiLocation.reduce((sum, loc) => sum + (parseInt(loc.reserved) || 0), 0);
    const totalAvailable = totalQuantity - totalReserved;

    setProductForm(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        totalQuantity,
        totalReserved,
        totalAvailable,
        inStock: totalAvailable > 0
      }
    }));
  };

  const resetForm = () => {
    setProductForm({
      name: { en: '', ar: '' },
      description: { en: '', ar: '' },
      categoryId: '',
      subcategoryId: '',
      productTypeId: '',
      hierarchicalCode: {
        category: '',
        subcategory: '',
        productType: '',
        variant: '',
        full: ''
      },
      sku: '',
      specifications: {
        dimensions: { width: '', height: '', depth: '', unit: 'cm' },
        weight: { value: '', unit: 'kg' },
        material: { en: '', ar: '' },
        color: { en: '', ar: '' },
        finish: { en: '', ar: '' },
        brand: '',
        model: '',
        countryOfOrigin: 'Egypt'
      },
      pricing: {
        originalPrice: '',
        salePrice: '',
        isOnSale: false,
        discountPercentage: 0,
        currency: 'EGP'
      },
      inventory: {
        multiLocation: [],
        totalQuantity: '',
        totalReserved: 0,
        totalAvailable: '',
        inStock: true,
        lowStockThreshold: 5,
        reorderPoint: 10,
        reorderQuantity: 50,
        autoReorder: false
      },
      supplier: {
        _id: '',
        name: '',
        leadTime: 7,
        minOrderQuantity: 1,
        pricePerUnit: 0,
        paymentTerms: '30 days'
      },
      images: [],
      seo: {
        metaTitle: { en: '', ar: '' },
        metaDescription: { en: '', ar: '' },
        keywords: []
      },
      tags: [],
      isActive: true,
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      status: 'active'
    });
    setSubcategories([]);
    setProductTypes([]);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    if (!productForm.name.en || !productForm.categoryId || !productForm.pricing.originalPrice) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      calculateTotalInventory();
      
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      const response = await axios.post(`${API_BASE}/products`, {
        ...productForm,
        createdBy: 'admin',
        updatedBy: 'admin'
      });
      
      if (response.data.success) {
        showSuccess('Product added successfully!');
        loadData();
        setShowAddModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error adding product:', error);
      showError(error.response?.data?.error || 'Failed to add product');
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    
    if (!productForm.name.en || !productForm.categoryId || !productForm.pricing.originalPrice) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      calculateTotalInventory();
      
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      const response = await axios.put(
        `${API_BASE}/products/${selectedProduct._id}`, 
        {
          ...productForm,
          updatedBy: 'admin'
        }
      );
      
      if (response.data.success) {
        showSuccess('Product updated successfully!');
        loadData();
        setShowEditModal(false);
        setSelectedProduct(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error updating product:', error);
      showError(error.response?.data?.error || 'Failed to update product');
    }
  };

  const handleEditClick = async (product) => {
    setSelectedProduct(product);
    
    // Load subcategories and product types for the selected product
    if (product.categoryId) {
      await loadSubcategories(product.categoryId);
      if (product.subcategoryId) {
        await loadProductTypes(product.categoryId, product.subcategoryId);
      }
    }
    
    setProductForm({
      ...product,
      // Ensure all nested objects exist
      specifications: product.specifications || {
        dimensions: { width: '', height: '', depth: '', unit: 'cm' },
        weight: { value: '', unit: 'kg' },
        material: { en: '', ar: '' },
        color: { en: '', ar: '' },
        finish: { en: '', ar: '' },
        brand: '',
        model: '',
        countryOfOrigin: 'Egypt'
      },
      hierarchicalCode: product.hierarchicalCode || {
        category: '',
        subcategory: '',
        productType: '',
        variant: '',
        full: ''
      },
      inventory: {
        ...product.inventory,
        multiLocation: product.inventory?.multiLocation || []
      },
      supplier: product.supplier || {
        _id: '',
        name: '',
        leadTime: 7,
        minOrderQuantity: 1,
        pricePerUnit: 0,
        paymentTerms: '30 days'
      },
      seo: product.seo || {
        metaTitle: { en: '', ar: '' },
        metaDescription: { en: '', ar: '' },
        keywords: []
      }
    });
    
    setShowEditModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      const response = await axios.delete(`${API_BASE}/products/${productId}`);
      
      if (response.data.success) {
        showSuccess('Product deleted successfully!');
        loadData();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      showError(error.response?.data?.error || 'Failed to delete product');
    }
  };

  const handleProductSelect = (productId, selected) => {
    if (selected) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedProducts.length === 0) {
      showError('Please select products and an action');
      return;
    }

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      const response = await axios.post(`${API_BASE}/products/bulk`, {
        action: bulkAction,
        productIds: selectedProducts
      });
      
      if (response.data.success) {
        showSuccess(response.data.message);
        loadData();
        setSelectedProducts([]);
        setBulkAction('');
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      showError(error.response?.data?.error || 'Failed to perform bulk action');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name?.ar?.includes(searchTerm) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.hierarchicalCode?.full?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filterCategory || product.categoryId === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.name?.en || '').localeCompare(b.name?.en || '');
      case 'price':
        return (a.pricing?.originalPrice || 0) - (b.pricing?.originalPrice || 0);
      case 'sku':
        return (a.sku || '').localeCompare(b.sku || '');
      case 'created':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg text-gray-600">Loading products...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Product
          </button>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
          />
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="form-input"
          >
            <option value="">All Categories</option>
            {enhancedCategories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name?.en || category.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-input"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="stock">Sort by Stock</option>
            <option value="created">Sort by Date</option>
          </select>

          <div className="flex gap-2">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="form-input"
              disabled={selectedProducts.length === 0}
            >
              <option value="">Bulk Actions</option>
              <option value="activate">Activate</option>
              <option value="deactivate">Deactivate</option>
              <option value="delete">Delete</option>
            </select>
            
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction || selectedProducts.length === 0}
              className="btn btn-secondary"
            >
              Apply
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          {sortedProducts.length} products found
          {selectedProducts.length > 0 && ` (${selectedProducts.length} selected)`}
        </div>
      </div>
      
      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts(sortedProducts.map(p => p._id));
                      } else {
                        setSelectedProducts([]);
                      }
                    }}
                    checked={selectedProducts.length === sortedProducts.length && sortedProducts.length > 0}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product._id)}
                      onChange={(e) => handleProductSelect(product._id, e.target.checked)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={product.images?.[0]?.url || '/images/products/default.jpg'}
                          alt={product.name?.en || product.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name?.en || product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          SKU: {product.sku}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {enhancedCategories.find(c => c._id === product.categoryId)?.name?.en || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        EGP {product.pricing?.salePrice || product.pricing?.originalPrice || 0}
                      </span>
                      {product.pricing?.isOnSale && product.pricing?.originalPrice !== product.pricing?.salePrice && (
                        <span className="text-xs text-gray-500 line-through">
                          EGP {product.pricing.originalPrice}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      (product.inventory?.totalAvailable || 0) > (product.inventory?.lowStockThreshold || 5)
                        ? 'bg-green-100 text-green-800'
                        : (product.inventory?.totalAvailable || 0) > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.inventory?.totalAvailable || 0} units
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.isActive !== false
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                    {product.isFeatured && (
                      <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEditClick(product)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modals */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {showAddModal ? 'Add New Product' : 'Edit Product'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedProduct(null);
                  resetForm();
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={showAddModal ? handleAddProduct : handleEditProduct} className="p-6 space-y-6">
              {/* Product Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name (English) *
                  </label>
                  <input
                    type="text"
                    name="name_en"
                    value={productForm.name.en}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Enter product name in English"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name (Arabic)
                  </label>
                  <input
                    type="text"
                    name="name_ar"
                    value={productForm.name.ar}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Enter product name in Arabic"
                  />
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="categoryId"
                    value={productForm.categoryId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select a category</option>
                    {enhancedCategories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name?.en || category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory
                  </label>
                  <select
                    name="subcategoryId"
                    value={productForm.subcategoryId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select a subcategory</option>
                    {subcategories.map((subcategory) => (
                      <option key={subcategory._id} value={subcategory._id}>
                        {subcategory.name?.en || subcategory.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Type
                  </label>
                  <select
                    name="productTypeId"
                    value={productForm.productTypeId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select a product type</option>
                    {productTypes.map((productType) => (
                      <option key={productType._id} value={productType._id}>
                        {productType.name?.en || productType.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU *
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={productForm.sku}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Enter product SKU"
                  />
                </div>
              </div>

              {/* Hierarchical Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hierarchical Code (Full)
                  </label>
                  <input
                    type="text"
                    name="hierarchicalCode.full"
                    value={productForm.hierarchicalCode.full}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="e.g., 01.01.01.01.01"
                    disabled={generatingCode}
                  />
                  <button
                    onClick={generateHierarchicalCode}
                    disabled={generatingCode || !productForm.hierarchicalCode.category || !productForm.hierarchicalCode.subcategory || !productForm.hierarchicalCode.productType}
                    className="mt-2 btn btn-primary btn-sm"
                  >
                    {generatingCode ? 'Generating...' : 'Generate Hierarchical Code'}
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hierarchical Code (Category)
                  </label>
                  <input
                    type="text"
                    name="hierarchicalCode.category"
                    value={productForm.hierarchicalCode.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="e.g., 01"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hierarchical Code (Subcategory)
                  </label>
                  <input
                    type="text"
                    name="hierarchicalCode.subcategory"
                    value={productForm.hierarchicalCode.subcategory}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="e.g., 01.01"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hierarchical Code (Product Type)
                  </label>
                  <input
                    type="text"
                    name="hierarchicalCode.productType"
                    value={productForm.hierarchicalCode.productType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="e.g., 01.01.01"
                    disabled
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (English)
                  </label>
                  <textarea
                    name="description_en"
                    value={productForm.description.en}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Enter product description in English"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Arabic)
                  </label>
                  <textarea
                    name="description_ar"
                    value={productForm.description.ar}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Enter product description in Arabic"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Price (EGP) *
                  </label>
                  <input
                    type="number"
                    name="pricing.originalPrice"
                    value={productForm.pricing.originalPrice}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sale Price (EGP)
                  </label>
                  <input
                    type="number"
                    name="pricing.salePrice"
                    value={productForm.pricing.salePrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-center space-x-4 pt-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="pricing.isOnSale"
                      checked={productForm.pricing.isOnSale}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700">On Sale</span>
                  </label>
                </div>
              </div>

              {/* Inventory */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Quantity *
                  </label>
                  <input
                    type="number"
                    name="inventory.totalQuantity"
                    value={productForm.inventory.totalQuantity}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    name="inventory.lowStockThreshold"
                    value={productForm.inventory.lowStockThreshold}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="5"
                  />
                </div>
                <div className="flex items-center space-x-4 pt-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="inventory.inStock"
                      checked={productForm.inventory.inStock}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700">In Stock</span>
                  </label>
                </div>
              </div>

              {/* Multi-Location Inventory */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Multi-Location Inventory</h3>
                {productForm.inventory.multiLocation.length === 0 && (
                  <p className="text-sm text-gray-500">No multi-location inventory configured yet.</p>
                )}
                {productForm.inventory.multiLocation.map((store, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-md font-medium text-gray-900">Store {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeStoreInventory(index)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Remove Store
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Store Name *</label>
                        <select
                          name={`inventory.multiLocation.${index}.storeId`}
                          value={store.storeId}
                          onChange={(e) => updateStoreInventory(index, 'storeId', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="">Select a store</option>
                          {stores.map(s => (
                            <option key={s._id} value={s._id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Quantity *</label>
                        <input
                          type="number"
                          name={`inventory.multiLocation.${index}.quantity`}
                          value={store.quantity}
                          onChange={(e) => updateStoreInventory(index, 'quantity', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Reserved *</label>
                        <input
                          type="number"
                          name={`inventory.multiLocation.${index}.reserved`}
                          value={store.reserved}
                          onChange={(e) => updateStoreInventory(index, 'reserved', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                        <input
                          type="number"
                          name={`inventory.multiLocation.${index}.lowStockThreshold`}
                          value={store.lowStockThreshold}
                          onChange={(e) => updateStoreInventory(index, 'lowStockThreshold', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Available: {store.available} units
                    </p>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addStoreInventory}
                  className="btn btn-primary btn-sm"
                >
                  Add Store Inventory
                </button>
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dimensions
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      name="specifications.dimensions.width"
                      value={productForm.specifications.dimensions.width}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="Width"
                    />
                    <input
                      type="text"
                      name="specifications.dimensions.height"
                      value={productForm.specifications.dimensions.height}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="Height"
                    />
                    <input
                      type="text"
                      name="specifications.dimensions.depth"
                      value={productForm.specifications.dimensions.depth}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="Depth"
                    />
                    <select
                      name="specifications.dimensions.unit"
                      value={productForm.specifications.dimensions.unit}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    >
                      <option value="cm">cm</option>
                      <option value="m">m</option>
                      <option value="in">in</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      name="specifications.weight.value"
                      value={productForm.specifications.weight.value}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="Value"
                    />
                    <select
                      name="specifications.weight.unit"
                      value={productForm.specifications.weight.unit}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="lb">lb</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Material
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      name="specifications.material.en"
                      value={productForm.specifications.material.en}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="English"
                    />
                    <input
                      type="text"
                      name="specifications.material.ar"
                      value={productForm.specifications.material.ar}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="Arabic"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      name="specifications.color.en"
                      value={productForm.specifications.color.en}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="English"
                    />
                    <input
                      type="text"
                      name="specifications.color.ar"
                      value={productForm.specifications.color.ar}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="Arabic"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Finish
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      name="specifications.finish.en"
                      value={productForm.specifications.finish.en}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="English"
                    />
                    <input
                      type="text"
                      name="specifications.finish.ar"
                      value={productForm.specifications.finish.ar}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="Arabic"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="specifications.brand"
                    value={productForm.specifications.brand}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="e.g., Brand Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    name="specifications.model"
                    value={productForm.specifications.model}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="e.g., Model Number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country of Origin
                  </label>
                  <input
                    type="text"
                    name="specifications.countryOfOrigin"
                    value={productForm.specifications.countryOfOrigin}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="e.g., Egypt"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={productForm.tags.join(', ')}
                  onChange={handleTagsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              {/* SEO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title (English)
                  </label>
                  <input
                    type="text"
                    name="seo.metaTitle.en"
                    value={productForm.seo.metaTitle.en}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="e.g., Product Name - Brand Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title (Arabic)
                  </label>
                  <input
                    type="text"
                    name="seo.metaTitle.ar"
                    value={productForm.seo.metaTitle.ar}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="e.g., اسم المنتج - اسم العلامة التجارية"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description (English)
                  </label>
                  <textarea
                    name="seo.metaDescription.en"
                    value={productForm.seo.metaDescription.en}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="e.g., Short description for search engines"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description (Arabic)
                  </label>
                  <textarea
                    name="seo.metaDescription.ar"
                    value={productForm.seo.metaDescription.ar}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="e.g., وصف قصير للمحركات البحث"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keywords (comma separated)
                  </label>
                  <input
                    type="text"
                    name="seo.keywords"
                    value={productForm.seo.keywords.join(', ')}
                    onChange={handleKeywordsChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="e.g., product, brand, category"
                  />
                </div>
              </div>

              {/* Status Options */}
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={productForm.isActive}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={productForm.isFeatured}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isNewArrival"
                    checked={productForm.isNewArrival}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">New Arrival</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isBestSeller"
                    checked={productForm.isBestSeller}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">Best Seller</span>
                </label>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">
                      Click to upload images or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </label>
                </div>
                
                {/* Display uploaded images */}
                {productForm.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {productForm.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image.url}
                          alt={`Product ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setProductForm(prev => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== index)
                            }));
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                        >
                          ×
                        </button>
                        {image.isPrimary && (
                          <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedProduct(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  {showAddModal ? 'Add Product' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts; 