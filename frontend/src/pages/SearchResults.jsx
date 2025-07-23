import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import SmartSearch from '../components/SmartSearch';
import axios from 'axios';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showSuccess, showError } = useToast();
  
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [totalFound, setTotalFound] = useState(0);
  const [sortBy, setSortBy] = useState('relevance');
  const [searchTime, setSearchTime] = useState(0);

  // Perform search when query changes
  useEffect(() => {
    const searchQuery = searchParams.get('q');
    if (searchQuery) {
      setQuery(searchQuery);
      performSearch(searchQuery);
    }
  }, [searchParams]);

  // Perform smart search
  const performSearch = async (searchTerm, sortOption = sortBy) => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await axios.get(`http://localhost:8080/api/products/smart-search?q=${encodeURIComponent(searchTerm)}&limit=20&sortBy=${sortOption}&includeSuggestions=true`);
      
      if (response.data.success) {
        setResults(response.data.results);
        setSuggestions(response.data.suggestions);
        setTotalFound(response.data.totalFound);
        setSearchTime(Date.now() - startTime);
      }
    } catch (error) {
      console.error('Error performing search:', error);
      showError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle new search from search component
  const handleNewSearch = (searchData) => {
    setResults(searchData.results);
    setSuggestions(searchData.suggestions);
    setTotalFound(searchData.totalFound);
    setQuery(searchData.query);
    
    // Update URL
    const newUrl = `/search?q=${encodeURIComponent(searchData.query)}`;
    window.history.pushState({}, '', newUrl);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    const newSortBy = e.target.value;
    setSortBy(newSortBy);
    performSearch(query, newSortBy);
  };

  // Add to cart handler
  const handleAddToCart = (product, e) => {
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Results</h1>
        <div className="max-w-2xl">
          <SmartSearch 
            onSearchResults={handleNewSearch}
            className="mb-4"
          />
        </div>
      </div>

      {/* Search Info */}
      {query && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Search results for: <span className="font-semibold text-gray-900">"{query}"</span>
              </p>
              <p className="text-sm text-gray-500">
                Found {totalFound} products {searchTime > 0 && `in ${searchTime}ms`}
              </p>
            </div>
            
            {/* Sort Controls */}
            <div className="flex items-center space-x-2">
              <label htmlFor="sort" className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                id="sort"
                value={sortBy}
                onChange={handleSortChange}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
              >
                <option value="relevance">Relevance</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Smart Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">💡 Smart Suggestions</h3>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleNewSearch({ 
                  query: suggestion.text, 
                  results: [], 
                  suggestions: [], 
                  totalFound: 0 
                })}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  suggestion.type === 'category' 
                    ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    : suggestion.type === 'product'
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {suggestion.type === 'category' && '📁 '}
                {suggestion.type === 'product' && '🛍️ '}
                {suggestion.type === 'correction' && '✨ '}
                {suggestion.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-96">
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-lg text-gray-600">Searching...</span>
          </div>
        </div>
      )}

      {/* Results Grid */}
      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.map(product => (
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
                
                {/* Search Score Badge */}
                {product.searchScore && (
                  <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {Math.round(product.searchScore * 100)}% match
                  </div>
                )}
                
                {/* Match Type Badge */}
                {product.matchType && (
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                    product.matchType === 'direct' 
                      ? 'bg-blue-500 text-white'
                      : 'bg-orange-500 text-white'
                  }`}>
                    {product.matchType}
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

      {/* No Results */}
      {!loading && query && results.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No results found for "{query}"</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search terms or browse our categories below.
          </p>
          <button
            onClick={() => navigate('/products')}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition"
          >
            Browse All Products
          </button>
        </div>
      )}
    </div>
  );
}

export default SearchResults; 