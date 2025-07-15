import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SmartRecommendations from '../components/SmartRecommendations';
import SmartSearch from '../components/SmartSearch';

function Home() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories and featured products in parallel
        const [categoriesResponse, featuredResponse] = await Promise.all([
          axios.get('http://localhost:3003/categories'),
          axios.get('http://localhost:3003/products/featured?limit=6')
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
          { _id: 'prewall-systems', name: { en: 'Prewall Systems' }, image: '/images/categories/PREWALL.jpg' }
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden">
        <div className="relative">
          <picture>
            <source media="(max-width: 768px)" srcSet="/images/cover.jpg" />
            <img
              src="/images/cover.jpg"
              alt="Abosefen & TamaveIrini Store"
              className="w-full h-[300px] xs:h-[350px] sm:h-[400px] md:h-[500px] lg:h-[600px] object-cover"
              loading="eager"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
          <div className="absolute inset-0 flex items-center">
            <div className="container-responsive">
              <div className="max-w-sm sm:max-w-lg md:max-w-2xl text-white">
                <h1 className="text-responsive-3xl font-bold leading-tight mb-4 sm:mb-6">
                  Premium Home & 
                  <span className="text-blue-400 block sm:inline"> Bathroom Solutions</span>
                </h1>
                <p className="text-responsive-lg mb-6 sm:mb-8 leading-relaxed opacity-90">
                  Discover our extensive collection of high-quality bathroom fittings, kitchen solutions, 
                  and home improvement products.
                </p>
                <div className="flex flex-col xs:flex-row gap-3 sm:gap-4">
                  <button 
                    onClick={() => navigate('/products')}
                    className="btn btn-primary text-responsive-lg px-6 py-3 sm:px-8 sm:py-4 shadow-lg transform hover:scale-105 touch-manipulation"
                  >
                    Shop Now
                  </button>
                  <button 
                    onClick={() => navigate('/products')}
                    className="btn btn-outline text-responsive-lg px-6 py-3 sm:px-8 sm:py-4 touch-manipulation"
                  >
                    Browse Categories
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="section-padding bg-white">
        <div className="container-responsive">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-responsive-3xl font-bold text-gray-900 mb-3 sm:mb-4">Find What You Need</h2>
            <p className="text-responsive-lg text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8">
              Search through our extensive collection of premium home and bathroom solutions
            </p>
            <div className="max-w-2xl mx-auto">
              <SmartSearch className="w-full" />
            </div>
          </div>
          
          {/* Quick Search Categories */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              { name: 'Bathroom Fittings', icon: '🚿', query: 'bathroom fittings' },
              { name: 'Kitchen Fittings', icon: '🔧', query: 'kitchen fittings' },
              { name: 'Ceramics', icon: '🏺', query: 'ceramics tiles' },
              { name: 'Bathtubs', icon: '🛁', query: 'bathtubs' },
              { name: 'Accessories', icon: '🔩', query: 'bathroom accessories' },
              { name: 'Prewall Systems', icon: '🧱', query: 'prewall systems' }
            ].map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(`/search?q=${encodeURIComponent(item.query)}`)}
                className="p-3 sm:p-4 bg-gray-50 hover:bg-blue-50 rounded-lg transition-all duration-300 group touch-manipulation"
              >
                <div className="text-lg sm:text-2xl mb-2 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                  {item.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-responsive">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-responsive-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-responsive-base text-gray-600">High-quality products from trusted brands with warranty guarantee</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-responsive-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-responsive-base text-gray-600">Quick and reliable delivery service across Egypt</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01" />
                </svg>
              </div>
              <h3 className="text-responsive-xl font-semibold mb-2">Expert Support</h3>
              <p className="text-responsive-base text-gray-600">Professional consultation and installation guidance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="section-padding bg-white">
        <div className="container-responsive">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-responsive-3xl font-bold text-gray-900 mb-3 sm:mb-4">Shop by Category</h2>
            <p className="text-responsive-lg text-gray-600 max-w-2xl mx-auto">
              Explore our comprehensive range of products organized by category
            </p>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-6 w-6 sm:h-8 sm:w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-responsive-lg text-gray-600">Loading categories...</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {categories.map(category => (
                <div
                  key={category._id}
                  onClick={() => navigate(`/products/category/${category._id}`)}
                  className="card-product cursor-pointer group touch-manipulation"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name?.en}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = '/images/categories/default.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-4 sm:p-6">
                    <h3 className="text-responsive-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {category.name?.en}
                    </h3>
                    {category.description?.en && (
                      <p className="text-responsive-base text-gray-600 mb-3 sm:mb-4 line-clamp-2">{category.description.en}</p>
                    )}
                    <div className="flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all text-responsive-base">
                      <span>Explore Products</span>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="section-padding bg-gray-50">
          <div className="container-responsive">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-responsive-3xl font-bold text-gray-900 mb-3 sm:mb-4">Featured Products</h2>
              <p className="text-responsive-lg text-gray-600 max-w-2xl mx-auto">
                Discover our handpicked selection of premium products
              </p>
            </div>
            
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {featuredProducts.map(product => (
                <div
                  key={product._id}
                  onClick={() => navigate(`/products/details/${product.slug}`)}
                  className="card-product cursor-pointer group touch-manipulation"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={getProductImage(product)}
                      alt={product.name?.en}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = '/images/products/default.jpg';
                      }}
                    />
                    {product.pricing?.isOnSale && (
                      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-red-500 text-white px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                        -{product.pricing.discountPercentage}% OFF
                      </div>
                    )}
                    {product.featured && (
                      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-yellow-500 text-white px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                        ⭐ Featured
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className="p-4 sm:p-6">
                    <h3 className="text-responsive-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.name?.en}
                    </h3>
                    <p className="text-responsive-base text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                      {product.description?.en}
                    </p>
                    
                    {/* Price */}
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg sm:text-2xl font-bold text-blue-600">
                          {formatPrice(product.pricing?.salePrice || product.pricing?.originalPrice)}
                        </span>
                        {product.pricing?.originalPrice && product.pricing.salePrice && product.pricing.originalPrice > product.pricing.salePrice && (
                          <span className="text-sm sm:text-lg text-gray-500 line-through">
                            {formatPrice(product.pricing.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stock Status and Rating */}
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${product.inventory?.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-xs sm:text-sm font-medium ${product.inventory?.inStock ? 'text-green-700' : 'text-red-700'}`}>
                          {product.inventory?.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                      
                      {product.rating && product.rating.average > 0 && (
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-xs sm:text-sm font-medium text-gray-700">{product.rating.average}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all text-responsive-base">
                      <span>View Details</span>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8 sm:mt-12">
              <button 
                onClick={() => navigate('/products')}
                className="btn btn-primary text-responsive-lg px-6 py-3 sm:px-8 sm:py-4 shadow-lg transform hover:scale-105 touch-manipulation"
              >
                View All Products
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Smart Recommendations Section */}
      <section className="section-padding bg-white">
        <div className="container-responsive">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-responsive-3xl font-bold text-gray-900 mb-3 sm:mb-4">Recommended for You</h2>
            <p className="text-responsive-lg text-gray-600 max-w-2xl mx-auto">
              Personalized product recommendations based on your preferences
            </p>
          </div>
          <SmartRecommendations
            type="personalized"
            limit={8}
            className="mb-4 sm:mb-8"
          />
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="section-padding bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container-responsive text-center">
          <h2 className="text-responsive-3xl font-bold mb-3 sm:mb-4">Ready to Transform Your Home?</h2>
          <p className="text-responsive-xl mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have transformed their homes with our premium products
          </p>
          <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center">
            <button 
              onClick={() => navigate('/products')}
              className="btn text-blue-600 bg-white hover:bg-gray-100 text-responsive-lg px-6 py-3 sm:px-8 sm:py-4 shadow-lg transform hover:scale-105 touch-manipulation"
            >
              Start Shopping
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="btn btn-outline text-responsive-lg px-6 py-3 sm:px-8 sm:py-4 touch-manipulation"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
