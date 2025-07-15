import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import SmartRecommendations from '../components/SmartRecommendations';
import axios from 'axios';

function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem, getItemQuantity, isInCart, formatPrice } = useCart();
  const { showSuccess, showError, showInfo } = useToast();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3003/products/details/${slug}`);
        
        if (response.data.success) {
          setProduct(response.data.product);
          setRelatedProducts(response.data.relatedProducts || []);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('❌ Error fetching product details:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProductDetails();
    }
  }, [slug]);

  // Add to cart handler with enhanced functionality
  const handleAddToCart = async () => {
    if (!product || !product.inventory?.inStock) {
      showError('Product is out of stock');
      return;
    }

    if (quantity <= 0) {
      showError('Please select a valid quantity');
      return;
    }

    setAddingToCart(true);

    try {
      const wasInCart = isInCart(product._id);
      
      // Add item to cart using enhanced context
      addItem(product, quantity);
      
      if (wasInCart) {
        showInfo(`Updated quantity in cart! Now ${getItemQuantity(product._id)} items total.`);
      } else {
        showSuccess(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart!`);
      }
      
      // Optional: Reset quantity to 1 after adding
      setQuantity(1);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      showError('Failed to add item to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  // Buy now handler
  const handleBuyNow = () => {
    if (!product || !product.inventory?.inStock) {
      showError('Product is out of stock');
      return;
    }

    try {
      // Add to cart and redirect to checkout
      addItem(product, quantity);
      showInfo('Redirecting to checkout...');
      navigate('/checkout');
    } catch (error) {
      showError('Failed to proceed to checkout');
    }
  };

  // Get product primary image
  const getProductImage = (product) => {
    if (product?.images && product.images.length > 0) {
      const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
      return primaryImage.url;
    }
    return '/images/products/default.jpg';
  };

  // Get all product images for gallery
  const getProductImages = (product) => {
    if (product?.images && product.images.length > 0) {
      return product.images.sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return [{ url: '/images/products/default.jpg', alt: { en: 'Product image' } }];
  };

  // Calculate savings
  const calculateSavings = (originalPrice, salePrice) => {
    if (!originalPrice || !salePrice || originalPrice <= salePrice) return null;
    return originalPrice - salePrice;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg text-gray-600">Loading product...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-12 px-6">
          <div className="mb-8">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h2>
            <p className="text-lg text-gray-600 mb-8">{error || 'The product you are looking for does not exist.'}</p>
          </div>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/products')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300"
            >
              ← Back to Products
            </button>
            <button
              onClick={() => navigate('/')}
              className="block mx-auto border-2 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-all duration-300"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const images = getProductImages(product);
  const savings = calculateSavings(product.pricing?.originalPrice, product.pricing?.salePrice);
  const currentQuantityInCart = getItemQuantity(product._id);
  const isProductInCart = isInCart(product._id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <ol className="flex items-center space-x-2 text-gray-600">
            <li><button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-800 transition-colors">Home</button></li>
            <li>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li><button onClick={() => navigate('/products')} className="text-blue-600 hover:text-blue-800 transition-colors">Products</button></li>
            <li>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            {product.category && (
              <>
                <li><span className="text-blue-600">{product.category.name?.en}</span></li>
                <li>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </li>
              </>
            )}
            <li className="text-gray-900 font-medium truncate">{product.name?.en}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-2xl shadow-lg overflow-hidden">
              <img
                src={images[selectedImage]?.url}
                alt={images[selectedImage]?.alt?.en || product.name?.en}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.src = '/images/products/default.jpg';
                }}
              />
            </div>
            
            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === index ? 'border-blue-600 shadow-lg' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt?.en || `Product image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/images/products/default.jpg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Product Name & SKU */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{product.name?.en}</h1>
              {product.name?.ar && (
                <p className="text-xl text-gray-600 mb-2">{product.name.ar}</p>
              )}
              {product.sku && (
                <p className="text-sm text-gray-500">SKU: {product.sku}</p>
              )}
            </div>

            {/* Rating & Reviews */}
            {product.rating && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-6 h-6 ${i < Math.round(product.rating.average) ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-lg font-medium text-gray-700">
                  {product.rating.average}
                </span>
                <span className="text-gray-500">
                  ({product.rating.totalReviews} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center space-x-4 mb-3">
                <span className="text-4xl font-bold text-blue-600">
                  {formatPrice(product.pricing?.salePrice || product.pricing?.originalPrice)}
                </span>
                {product.pricing?.originalPrice && product.pricing.salePrice && product.pricing.originalPrice > product.pricing.salePrice && (
                  <span className="text-2xl text-gray-500 line-through">
                    {formatPrice(product.pricing.originalPrice)}
                  </span>
                )}
                {product.pricing?.isOnSale && product.pricing.discountPercentage && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{product.pricing.discountPercentage}% OFF
                  </span>
                )}
              </div>
              {savings && (
                <p className="text-green-600 font-semibold text-lg">You save {formatPrice(savings)}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <p className="text-gray-700 leading-relaxed text-lg">{product.description?.en}</p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              {product.inventory?.inStock ? (
                <>
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-semibold text-lg">In Stock</span>
                  {product.inventory.quantity && product.inventory.quantity <= product.inventory.lowStockThreshold && (
                    <span className="text-orange-600 font-medium">
                      Only {product.inventory.quantity} left!
                    </span>
                  )}
                </>
              ) : (
                <>
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-red-700 font-semibold text-lg">Out of Stock</span>
                </>
              )}
            </div>

            {/* Cart Status */}
            {isProductInCart && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  <span className="text-blue-800 font-medium">
                    {currentQuantityInCart} {currentQuantityInCart === 1 ? 'item' : 'items'} in cart
                  </span>
                </div>
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            {product.inventory?.inStock && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <label htmlFor="quantity" className="text-lg font-semibold text-gray-700">Quantity:</label>
                  <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 h-12 text-center text-lg font-semibold border-0 focus:ring-0 focus:outline-none"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:transform-none disabled:shadow-none"
                  >
                    {addingToCart ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding to Cart...
                      </span>
                    ) : (
                      <>
                        <svg className="w-6 h-6 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                        </svg>
                        Add to Cart
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleBuyNow}
                    className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            )}

            {/* Features */}
            {product.features?.en && product.features.en.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Key Features</h3>
                <ul className="space-y-3">
                  {product.features.en.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <svg className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 text-lg">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Product Specifications */}
        {product.specifications && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Product Specifications</h2>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-gray-800 capitalize text-lg">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-gray-600 text-lg text-right">
                        {typeof value === 'object' ? 
                          Object.entries(value).map(([k, v]) => `${k}: ${v}`).join(', ') : 
                          value
                        }
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Long Description */}
        {product.longDescription?.en && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Product Details</h2>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg">{product.longDescription.en}</p>
              </div>
            </div>
          </div>
        )}

        {/* Smart Recommendations */}
        <div className="space-y-16">
          <SmartRecommendations
            productId={product._id}
            type="related"
            className="mb-8"
          />
          
          <SmartRecommendations
            productId={product._id}
            type="frequently-bought-together"
            className="mb-8"
          />
          
          <SmartRecommendations
            productId={product._id}
            type="bundles"
            className="mb-8"
          />
          
          <SmartRecommendations
            productId={product._id}
            type="similar"
            className="mb-8"
          />
        </div>
      </div>
    </div>
  );
}

export default ProductDetails; 