import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SmartRecommendations from '../components/SmartRecommendations';

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
          <img
            src="/images/cover.jpg"
            alt="Abosefen & TamaveIrini Store"
            className="w-full h-[400px] md:h-[500px] lg:h-[600px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-2xl text-white">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                  Premium Home & 
                  <span className="text-blue-400"> Bathroom Solutions</span>
                </h1>
                <p className="text-lg md:text-xl mb-8 leading-relaxed opacity-90">
                  Discover our extensive collection of high-quality bathroom fittings, kitchen solutions, 
                  and home improvement products designed to transform your living spaces.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => navigate('/products')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Shop Now
                  </button>
                  <button 
                    onClick={() => navigate('/products')}
                    className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
                  >
                    Browse Categories
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-gray-600">High-quality products from trusted brands with warranty guarantee</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Quick and reliable delivery service across Egypt</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
              <p className="text-gray-600">Professional consultation and installation guidance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our comprehensive range of products organized by category to find exactly what you need
            </p>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-lg text-gray-600">Loading categories...</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map(category => (
                <div
                  key={category._id}
                  onClick={() => navigate(`/products/category/${category._id}`)}
                  className="cursor-pointer group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name?.en}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = '/images/categories/default.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {category.name?.en}
                    </h3>
                    {category.description?.en && (
                      <p className="text-gray-600 mb-4 line-clamp-2">{category.description.en}</p>
                    )}
                    <div className="flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
                      <span>Explore Products</span>
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover our handpicked selection of premium products chosen for their quality and popularity
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map(product => (
                <div
                  key={product._id}
                  onClick={() => navigate(`/products/details/${product.slug}`)}
                  className="cursor-pointer group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={getProductImage(product)}
                      alt={product.name?.en}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = '/images/products/default.jpg';
                      }}
                    />
                    {product.pricing?.isOnSale && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        -{product.pricing.discountPercentage}% OFF
                      </div>
                    )}
                    {product.featured && (
                      <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        ⭐ Featured
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.name?.en}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {product.description?.en}
                    </p>
                    
                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-blue-600">
                          {formatPrice(product.pricing?.salePrice || product.pricing?.originalPrice)}
                        </span>
                        {product.pricing?.originalPrice && product.pricing.salePrice && product.pricing.originalPrice > product.pricing.salePrice && (
                          <span className="text-lg text-gray-500 line-through">
                            {formatPrice(product.pricing.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stock Status and Rating */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${product.inventory?.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-sm font-medium ${product.inventory?.inStock ? 'text-green-700' : 'text-red-700'}`}>
                          {product.inventory?.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                      
                      {product.rating && product.rating.average > 0 && (
                        <div className="flex items-center space-x-1">
                          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700">{product.rating.average}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
                      <span>View Details</span>
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <button 
                onClick={() => navigate('/products')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                View All Products
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Smart Recommendations Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Recommended for You</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Personalized product recommendations based on your preferences and browsing history
            </p>
          </div>
          <SmartRecommendations
            type="personalized"
            limit={8}
            className="mb-8"
          />
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Home?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have transformed their homes with our premium products
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/products')}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Start Shopping
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
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
