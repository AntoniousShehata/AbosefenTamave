import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import axios from 'axios';

function Products() {
  const { category } = useParams();
  const { addItem } = useCart();
  const { showSuccess, showError } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);

  // Get products from API
  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:3003/products')
      .then(res => {
        const productsData = res.data.products || res.data;
        setProducts(productsData);
      })
      .catch(err => console.error('❌ Error fetching products:', err))
      .finally(() => setLoading(false));
  }, []);

  // Helper function to get primary product image
  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
      return primaryImage.url;
    }
    return '/images/products/default.jpg'; // Fallback image
  };

  // Helper function to get product name in English
  const getProductName = (product) => {
    return product.name?.en || product.ItemName || 'Unnamed Product';
  };

  // Helper function to get product price
  const getProductPrice = (product) => {
    return product.pricing?.salePrice || product.pricing?.originalPrice || product.pricing?.price || product.Price || 0;
  };

  // Helper function to get category name for filtering
  const getProductCategory = (product) => {
    return product.categoryId?.name?.en || product.CategoryName || '';
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Helper function to handle add to cart
  const handleAddToCart = (product) => {
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

  // Filter and sort products
  const filteredProducts = products
    .filter(p => getProductCategory(p) === category)
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return getProductPrice(a) - getProductPrice(b);
        case 'price-high':
          return getProductPrice(b) - getProductPrice(a);
        case 'name':
        default:
          return getProductName(a).localeCompare(getProductName(b));
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center section-padding">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-6 w-6 sm:h-8 sm:w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-responsive-lg text-gray-600">Loading products...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm">
        <div className="container-responsive py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-responsive-2xl font-bold text-primary mb-1">
                {category ? category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Products'}
              </h1>
              <p className="text-responsive-base text-gray-600">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              </p>
            </div>
            
            {/* Mobile Filter Toggle */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-outline sm:hidden px-3 py-2 text-responsive-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                </svg>
                Filters
              </button>
              
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-input text-responsive-sm px-3 py-2 w-auto min-w-0"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
          
          {/* Mobile Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg sm:hidden animate-slide-down">
              <div className="space-y-3">
                <div>
                  <label className="form-label">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="form-input"
                  >
                    <option value="name">Name</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container-responsive section-padding">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="mb-4">
              <svg className="w-16 h-16 sm:w-24 sm:h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M12 11L4 7" />
              </svg>
            </div>
            <h3 className="text-responsive-xl font-semibold text-gray-600 mb-2">No products found</h3>
            <p className="text-responsive-base text-gray-500 mb-6">No products available in this category yet.</p>
            <button
              onClick={() => window.history.back()}
              className="btn btn-primary text-responsive-base touch-manipulation"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="grid grid-responsive-products">
            {filteredProducts.map(product => (
              <div key={product._id || product.id} className="card-product group">
                <div className="aspect-square overflow-hidden relative">
                  <img
                    src={getProductImage(product)}
                    alt={getProductName(product)}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = '/images/products/default.jpg';
                    }}
                  />
                  {product.pricing?.isOnSale && (
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
                      -{product.pricing.discountPercentage}% OFF
                    </div>
                  )}
                  {!product.inventory?.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-medium text-responsive-sm bg-black/70 px-3 py-1 rounded-full">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-3 sm:p-4 flex-1 flex flex-col">
                  <div className="flex-1">
                    <h4 className="text-responsive-lg font-semibold mb-1 sm:mb-2 line-clamp-2">
                      {getProductName(product)}
                    </h4>
                    {product.shortDescription?.en && (
                      <p className="text-responsive-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">
                        {product.shortDescription.en}
                      </p>
                    )}
                    
                    {/* Price */}
                    <div className="mb-2 sm:mb-3">
                      <p className="text-secondary font-bold text-responsive-xl">
                        {formatPrice(getProductPrice(product))}
                      </p>
                      {product.pricing?.comparePrice && product.pricing.comparePrice > product.pricing.price && (
                        <p className="text-gray-500 line-through text-responsive-sm">
                          {formatPrice(product.pricing.comparePrice)}
                        </p>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center mb-3 sm:mb-4">
                      <div className={`w-2 h-2 rounded-full mr-2 ${product.inventory?.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`text-xs sm:text-sm font-medium ${product.inventory?.inStock ? 'text-green-700' : 'text-red-700'}`}>
                        {product.inventory?.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      disabled={!product.inventory?.inStock}
                      className={`w-full btn text-responsive-sm py-2 px-3 sm:py-3 sm:px-4 touch-manipulation ${
                        product.inventory?.inStock 
                          ? 'btn-primary' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {product.inventory?.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    <button
                      onClick={() => window.alert(`ℹ️ Details for: ${getProductName(product)}`)}
                      className="w-full btn btn-outline text-responsive-sm py-2 px-3 sm:py-3 sm:px-4 touch-manipulation"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
