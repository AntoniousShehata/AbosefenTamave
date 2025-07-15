import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
          axios.get('http://localhost:3003/categories'),
          axios.get('http://localhost:3003/products/featured?limit=8')
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
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Shop by Category Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-8 text-primary text-center">Shop by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map(category => (
          <div
              key={category._id}
              onClick={() => navigate(`/products/category/${category._id}`)}
              className="cursor-pointer bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition group"
            >
              <div className="aspect-square bg-gray-100 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name?.en}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = '/images/categories/default.jpg';
                  }}
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-semibold text-lg text-dark mb-2">{category.name?.en}</h3>
                {category.description?.en && (
                  <p className="text-sm text-gray-600 line-clamp-2">{category.description.en}</p>
                )}
                <div className="mt-3">
                  <span className="text-primary font-medium hover:underline">
                    Explore Products →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold mb-8 text-primary text-center">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <div
                key={product._id}
                onClick={() => navigate(`/products/details/${product.slug}`)}
                className="cursor-pointer bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition group"
          >
                <div className="aspect-square bg-gray-100 overflow-hidden relative">
                  <img
                    src={getProductImage(product)}
                    alt={product.name?.en}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = '/images/products/default.jpg';
                    }}
                  />
                  {product.pricing?.isOnSale && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                      -{product.pricing.discountPercentage}%
                    </div>
                  )}
                  {product.featured && (
                    <div className="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                      ⭐ Featured
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name?.en}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description?.en}
                  </p>
                  
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

                  {/* Stock Status */}
                  <div className="flex items-center justify-between">
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

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-primary font-medium hover:underline text-sm">
                      View Details →
                    </span>
                  </div>
            </div>
          </div>
        ))}
      </div>
        </section>
      )}
    </div>
  );
}

export default ProductsPage;
