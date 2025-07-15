import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import axios from 'axios';

function SmartRecommendations({ 
  productId, 
  type = 'related', 
  title, 
  className = '',
  limit = 6 
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (type === 'personalized') {
      fetchPersonalizedRecommendations();
    } else if (type === 'bundles') {
      fetchSmartBundles();
    } else if (productId) {
      fetchProductRecommendations();
    }
  }, [productId, type, limit]);

  // Fetch product-specific recommendations
  const fetchProductRecommendations = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      
      switch (type) {
        case 'related':
          endpoint = `/products/${productId}/related?limit=${limit}`;
          break;
        case 'frequently-bought-together':
          endpoint = `/products/${productId}/frequently-bought-together?limit=${limit}`;
          break;
        case 'similar':
          endpoint = `/products/${productId}/similar?limit=${limit}`;
          break;
        default:
          endpoint = `/products/${productId}/related?limit=${limit}`;
      }
      
      const response = await axios.get(`http://localhost:3003${endpoint}`);
      
      if (response.data.success) {
        const products = response.data.products || response.data.similarProducts || response.data.frequentlyBoughtTogether || [];
        setRecommendations(products);
      } else {
        setError('Failed to load recommendations');
      }
    } catch (err) {
      console.error('❌ Error fetching recommendations:', err);
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch personalized recommendations
  const fetchPersonalizedRecommendations = async () => {
    try {
      setLoading(true);
      const userId = user?.id || 'guest';
      const response = await axios.get(`http://localhost:3003/products/recommendations/personalized?userId=${userId}&limit=${limit}`);
      
      if (response.data.success) {
        // Handle both possible response formats
        const products = response.data.recommendations || response.data.products || [];
        setRecommendations(products);
      } else {
        setError('Failed to load personalized recommendations');
      }
    } catch (err) {
      console.error('❌ Error fetching personalized recommendations:', err);
      setError('Failed to load personalized recommendations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch smart bundles
  const fetchSmartBundles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3003/products/${productId}/bundles?limit=${limit}`);
      
      if (response.data.success) {
        const bundles = response.data.bundles || [];
        setBundles(bundles);
      } else {
        setError('Failed to load smart bundles');
      }
    } catch (err) {
      console.error('❌ Error fetching smart bundles:', err);
      setError('Failed to load smart bundles');
    } finally {
      setLoading(false);
    }
  };

  // Track user interaction
  const trackInteraction = async (productId, interactionType) => {
    try {
      const userId = user?.id || 'guest';
      await axios.post(`http://localhost:3003/products/${productId}/interaction`, {
        userId,
        interactionType
      });
    } catch (error) {
      console.error('❌ Error tracking interaction:', error);
    }
  };

  // Add to cart handler
  const handleAddToCart = async (product, e) => {
    e.stopPropagation();
    
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
      
      // Track interaction
      await trackInteraction(product._id, 'add_to_cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showError('Failed to add product to cart');
    }
  };

  // Handle product click
  const handleProductClick = async (product) => {
    await trackInteraction(product._id, 'view_product');
    navigate(`/products/details/${product.slug}`);
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

  // Get recommendation title
  const getRecommendationTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'related':
        return 'Related Products';
      case 'frequently-bought-together':
        return 'Frequently Bought Together';
      case 'similar':
        return 'Similar Products';
      case 'personalized':
        return 'Recommended for You';
      case 'bundles':
        return 'Smart Bundles';
      default:
        return 'Recommendations';
    }
  };

  // Get recommendation icon
  const getRecommendationIcon = () => {
    switch (type) {
      case 'related':
        return '🔗';
      case 'frequently-bought-together':
        return '🛍️';
      case 'similar':
        return '🔄';
      case 'personalized':
        return '🎯';
      case 'bundles':
        return '📦';
      default:
        return '💡';
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-600">Loading recommendations...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || ((recommendations?.length || 0) === 0 && (bundles?.length || 0) === 0)) {
    return null; // Don't show anything if no recommendations
  }

  return (
    <div className={`${className}`}>

      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <span className="mr-2 text-3xl">{getRecommendationIcon()}</span>
          {getRecommendationTitle()}
        </h2>
        
        {type === 'personalized' && user && (
          <p className="text-sm text-gray-600">
            Curated specially for you, {user.firstName}
          </p>
        )}
      </div>

      {/* Smart Bundles Display */}
      {type === 'bundles' && bundles.length > 0 && (
        <div className="space-y-4">
          {bundles.map((bundle, index) => (
            <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Bundle Deal</h3>
                <div className="text-right">
                  <span className="text-2xl font-bold text-green-600">
                    {formatPrice(bundle.totalPrice - bundle.savings)}
                  </span>
                  <div className="text-sm text-gray-500">
                    Save {formatPrice(bundle.savings)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 overflow-x-auto">
                {[bundle.mainProduct, ...bundle.complementaryProducts].map((product, pIndex) => (
                  <div key={pIndex} className="flex-shrink-0 w-32">
                    <div 
                      className="aspect-square bg-white rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => handleProductClick(product)}
                    >
                      <img
                        src={getProductImage(product)}
                        alt={product.name?.en}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1 truncate">{product.name?.en}</p>
                    <p className="text-xs font-semibold text-gray-900">
                      {formatPrice(product.pricing?.salePrice || product.pricing?.originalPrice)}
                    </p>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => {
                  // Add all products in bundle to cart
                  [bundle.mainProduct, ...bundle.complementaryProducts].forEach(product => {
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
                  });
                  showSuccess('Bundle added to cart!');
                }}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition"
              >
                Add Bundle to Cart
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Regular Recommendations Grid */}
      {recommendations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {recommendations.map((product, index) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group cursor-pointer"
            >
              {/* Product Image */}
              <div 
                className="aspect-square bg-gray-100 overflow-hidden relative"
                onClick={() => handleProductClick(product)}
              >
                <img
                  src={getProductImage(product)}
                  alt={product.name?.en}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = '/images/products/default.jpg';
                  }}
                />
                
                {/* Recommendation Score */}
                {product.similarityScore && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {Math.round(product.similarityScore * 100)}%
                  </div>
                )}
                
                {/* Recommendation Type Badge */}
                {product.recommendationType && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {product.recommendationType === 'trending' ? '🔥' : '🎯'}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-3">
                <div onClick={() => handleProductClick(product)}>
                  <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2 hover:text-primary transition">
                    {product.name?.en}
                  </h3>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-primary">
                    {formatPrice(product.pricing?.salePrice || product.pricing?.originalPrice)}
                  </span>
                  
                  {/* Rating */}
                  {product.rating && product.rating.average > 0 && (
                    <div className="flex items-center">
                      <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs text-gray-600 ml-1">{product.rating.average}</span>
                    </div>
                  )}
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={(e) => handleAddToCart(product, e)}
                  disabled={!product.inventory?.inStock}
                  className={`w-full py-2 px-3 rounded-md text-xs font-medium transition ${
                    product.inventory?.inStock
                      ? 'bg-primary text-white hover:bg-primary-dark'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {product.inventory?.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SmartRecommendations; 