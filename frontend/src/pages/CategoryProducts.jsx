import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import { PRODUCTS_API_URL } from '../config/api';
import AdvancedFilters from '../components/AdvancedFilters';
import { applyFilters, sortProducts } from '../utils/productFilters';
import axios from 'axios';

function CategoryProducts() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showSuccess, showError } = useToast();
  
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [filters, setFilters] = useState({});
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Fetch category products
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${PRODUCTS_API_URL}/category/${categoryId}?sortBy=${sortBy}&limit=50`);
        
        if (response.data.success) {
          setCategory(response.data.category);
          setProducts(response.data.products);
        } else {
          setError('Category not found');
        }
      } catch (err) {
        console.error('❌ Error fetching category products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryProducts();
    }
  }, [categoryId, sortBy]);

  // Apply filters and sorting to products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = applyFilters(products, filters);
    return sortProducts(filtered, sortBy);
  }, [products, filters, sortBy]);

  // Handle filter changes
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Add to cart handler
  const handleAddToCart = (product, e) => {
    e.stopPropagation(); // Prevent navigation to product details
    
    try {
      if (!product.inventory?.inStock) {
        showError('Product is out of stock');
        return;
      }

      const cartItem = {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        pricing: {
          salePrice: product.pricing?.salePrice || product.pricing?.originalPrice,
          originalPrice: product.pricing?.originalPrice,
          currency: product.pricing?.currency || 'EGP'
        },
        images: product.images,
        inventory: product.inventory,
        sku: product.sku
      };

      addItem(cartItem, 1);
      showSuccess(`${product.name?.en || 'Product'} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      showError('Failed to add product to cart');
    }
  };

  // Get product primary image
  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
      return primaryImage.url;
    }
    return '/images/products/default.jpg';
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
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

  if (error || !category) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Category Not Found</h2>
        <p className="text-gray-600 mb-6">{error || 'The category you are looking for does not exist.'}</p>
        <button
          onClick={() => navigate('/products')}
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition"
        >
          ← Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm">
        <ol className="flex items-center space-x-2">
          <li><button onClick={() => navigate('/')} className="text-primary hover:underline">Home</button></li>
          <li className="text-gray-500">›</li>
          <li><button onClick={() => navigate('/products')} className="text-primary hover:underline">Products</button></li>
          <li className="text-gray-500">›</li>
          <li className="text-gray-900 font-medium">{category.name?.en}</li>
        </ol>
      </nav>

      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name?.en}</h1>
        {category.description?.en && (
          <p className="text-lg text-gray-600">{category.description.en}</p>
        )}
      </div>

      {/* Filters and Sort Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="lg:hidden">
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filters</span>
          </button>
        </div>

        <div className="flex items-center justify-between flex-1">
          <div className="flex items-center space-x-4">
            <p className="text-gray-600">
              {filteredAndSortedProducts.length} of {products.length} {products.length === 1 ? 'product' : 'products'}
              {filteredAndSortedProducts.length !== products.length && ' filtered'}
            </p>
            {Object.keys(filters).some(key => 
              (Array.isArray(filters[key]) && filters[key].length > 0) || 
              (key === 'searchTerm' && filters[key]) ||
              (key === 'inStock' && filters[key] === true) ||
              (key === 'onSale' && filters[key] === true)
            ) && (
              <button
                onClick={() => setFilters({})}
                className="text-sm text-primary hover:text-primary-dark"
              >
                Clear all filters
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <label htmlFor="sort" className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
            >
              <option value="featured">Featured</option>
              <option value="createdAt">Newest</option>
              <option value="pricing.salePrice">Price: Low to High</option>
              <option value="pricing.salePrice_desc">Price: High to Low</option>
              <option value="rating.average">Highest Rated</option>
              <option value="name.en">Name A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content with Filters */}
      <div className="flex gap-8">
        {/* Desktop Filters Sidebar */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <AdvancedFilters
            products={products}
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
            isOpen={true}
          />
        </div>

        {/* Mobile Filters Overlay */}
        {filtersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-80 bg-white overflow-y-auto">
              <AdvancedFilters
                products={products}
                onFiltersChange={handleFiltersChange}
                initialFilters={filters}
                isOpen={true}
                onToggle={() => setFiltersOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1">
          {filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                {products.length === 0 ? '📦' : '🔍'}
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {products.length === 0 ? 'No products found' : 'No products match your filters'}
              </h3>
              <p className="text-gray-600 mb-6">
                {products.length === 0 
                  ? 'There are currently no products in this category.'
                  : 'Try adjusting your filters to see more products.'
                }
              </p>
              <button
                onClick={() => products.length === 0 ? navigate('/products') : setFilters({})}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition"
              >
                {products.length === 0 ? 'Browse Other Categories' : 'Clear Filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredAndSortedProducts.map(product => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition group cursor-pointer"
            >
              {/* Product Image */}
              <div 
                className="aspect-square bg-gray-100 overflow-hidden relative"
                onClick={() => navigate(`/products/details/${product.slug}`)}
              >
                <img
                  src={getProductImage(product)}
                  alt={product.name?.en}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = '/images/products/default.jpg';
                  }}
                />
                
                {/* Sale Badge */}
                {product.pricing?.isOnSale && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                    -{product.pricing.discountPercentage}%
                  </div>
                )}
                
                {/* Featured Badge */}
                {product.featured && (
                  <div className="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                    ⭐
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div onClick={() => navigate(`/products/details/${product.slug}`)}>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary transition">
                    {product.name?.en}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description?.en}
                  </p>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(product.pricing?.salePrice || product.pricing?.originalPrice)}
                    </span>
                    {product.pricing?.originalPrice && product.pricing.salePrice && product.pricing.originalPrice > product.pricing.salePrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.pricing.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock Status & Rating */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${product.inventory?.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`text-xs font-medium ${product.inventory?.inStock ? 'text-green-700' : 'text-red-700'}`}>
                      {product.inventory?.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  
                  {/* Rating */}
                  {product.rating && product.rating.average > 0 && (
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs text-gray-600">{product.rating.average}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/products/details/${product.slug}`)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-200 transition"
                  >
                    View Details
                  </button>
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    disabled={!product.inventory?.inStock}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                      product.inventory?.inStock
                        ? 'bg-primary text-white hover:bg-primary-dark'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {product.inventory?.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
</div>
);
}

export default CategoryProducts; 