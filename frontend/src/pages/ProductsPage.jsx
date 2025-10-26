import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CATEGORIES_API_URL, PRODUCTS_API_URL, API_HEADERS } from '../config/api';

function ProductsPage() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories and featured products in parallel
        const [categoriesResponse, featuredResponse] = await Promise.all([
          axios.get(CATEGORIES_API_URL, { headers: API_HEADERS }),
          axios.get(`${PRODUCTS_API_URL}/featured?limit=8`, { headers: API_HEADERS })
        ]);

        if (categoriesResponse.data.success) {
          setCategories(categoriesResponse.data.categories);
        }

        if (featuredResponse.data.success) {
          setFeaturedProducts(featuredResponse.data.products);
        }
      } catch (error) {
        console.error('❌ Error fetching data:', error);
        // Fallback categories in case of API failure
        setCategories([
          { _id: 'bathroom-fittings', name: { en: 'Bathroom Fittings' }, image: '/images/categories/BATHROOM_FITTINGS.jpg' },
          { _id: 'kitchen-fittings', name: { en: 'Kitchen Fittings' }, image: '/images/categories/KITCHEN_FITTINGS.jpg' },
          { _id: 'ceramics', name: { en: 'Ceramics & Tiles' }, image: '/images/categories/CERAMIC.jpg' },
          { _id: 'bathtubs', name: { en: 'Bathtubs' }, image: '/images/categories/BATHTUBS.jpg' },
          { _id: 'accessories', name: { en: 'Bathroom Accessories' }, image: '/images/categories/ACCESSORIES.jpg' },
          { _id: 'prewall-systems', name: { en: 'Prewall Systems' }, image: '/images/categories/PREWALL.jpg' },
          { _id: 'furniture', name: { en: 'Bathroom Furniture' }, image: '/images/categories/FURNITURE.jpg' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to get product image
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
      <div className="min-h-screen flex items-center justify-center section-padding">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-6 w-6 sm:h-8 sm:w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-responsive-lg text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm">
        <div className="container-responsive py-6 sm:py-8">
          <div className="text-center">
            <h1 className="text-responsive-3xl font-bold text-primary mb-2 sm:mb-4">Our Products</h1>
            <p className="text-responsive-lg text-gray-600 max-w-2xl mx-auto">
              Discover our comprehensive range of premium home and bathroom solutions
            </p>
          </div>
        </div>
      </div>

      <div className="container-responsive section-padding">
        {/* Shop by Category Section */}
        <section className="mb-8 sm:mb-12 lg:mb-16">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-responsive-2xl font-bold text-primary mb-2 sm:mb-3">Shop by Category</h2>
            <p className="text-responsive-base text-gray-600">
              Browse our curated categories to find what you need
            </p>
          </div>
          
          <div className="grid grid-responsive-products">
            {categories.map(category => (
              <div
                key={category._id}
                onClick={() => navigate(`/products/category/${category._id}`)}
                className="card-product cursor-pointer group touch-manipulation"
              >
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name?.en}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = '/images/categories/default.jpg';
                    }}
                  />
                </div>
                <div className="p-3 sm:p-4 text-center">
                  <h3 className="font-semibold text-responsive-lg text-dark mb-1 sm:mb-2 line-clamp-2">
                    {category.name?.en}
                  </h3>
                  {category.description?.en && (
                    <p className="text-responsive-sm text-gray-600 line-clamp-2 mb-2 sm:mb-3">
                      {category.description.en}
                    </p>
                  )}
                  <div className="flex items-center justify-center text-primary font-medium text-responsive-sm group-hover:gap-1 transition-all">
                    <span>Explore</span>
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <section>
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-responsive-2xl font-bold text-primary mb-2 sm:mb-3">Featured Products</h2>
              <p className="text-responsive-base text-gray-600">
                Our handpicked selection of premium products
              </p>
            </div>
            
            <div className="grid grid-responsive-products">
              {featuredProducts.map(product => (
                <div
                  key={product._id}
                  onClick={() => navigate(`/products/details/${product.slug}`)}
                  className="card-product cursor-pointer group touch-manipulation"
                >
                  <div className="aspect-square bg-gray-100 overflow-hidden relative">
                    <img
                      src={getProductImage(product)}
                      alt={product.name?.en}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = '/images/products/default.jpg';
                      }}
                    />
                    {product.pricing?.isOnSale && (
                      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
                        -{product.pricing.discountPercentage}%
                      </div>
                    )}
                    {product.featured && (
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-yellow-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
                        ⭐
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 line-clamp-2 text-responsive-base">
                      {product.name?.en}
                    </h3>
                    <p className="text-responsive-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">
                      {product.description?.en}
                    </p>
                    
                    {/* Price */}
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <span className="text-sm sm:text-lg font-bold text-primary">
                          {formatPrice(product.pricing?.salePrice || product.pricing?.originalPrice)}
                        </span>
                        {product.pricing?.originalPrice && product.pricing.salePrice && product.pricing.originalPrice > product.pricing.salePrice && (
                          <span className="text-xs sm:text-sm text-gray-500 line-through">
                            {formatPrice(product.pricing.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${product.inventory?.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-xs font-medium ${product.inventory?.inStock ? 'text-green-700' : 'text-red-700'}`}>
                          {product.inventory?.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                      
                      {/* Rating */}
                      {product.rating && product.rating.average > 0 && (
                        <div className="flex items-center space-x-1">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-xs text-gray-600">{product.rating.average}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
                      <div className="flex items-center text-primary font-medium text-responsive-sm group-hover:gap-1 transition-all">
                        <span>View Details</span>
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* View All Products Button */}
            <div className="text-center mt-6 sm:mt-8 lg:mt-12">
              <button 
                onClick={() => navigate('/products')}
                className="btn btn-primary text-responsive-lg px-6 py-3 sm:px-8 sm:py-4 shadow-lg transform hover:scale-105 touch-manipulation"
              >
                View All Products
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default ProductsPage;
