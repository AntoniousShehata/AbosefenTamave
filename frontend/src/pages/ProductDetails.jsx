import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Toast from '../components/Toast';
import SmartRecommendations from '../components/SmartRecommendations';
import axios from 'axios';

function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { dispatch } = useCart();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

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

  // Add to cart handler
  const handleAddToCart = () => {
    if (!product || !product.inventory?.inStock) {
      setToastMsg('❌ Product is out of stock');
      return;
    }

    const cartItem = {
      id: product._id,
      name: product.name?.en || 'Unknown Product',
      price: product.pricing?.salePrice || product.pricing?.originalPrice || 0,
      image: getProductImage(product),
      sku: product.sku,
      quantity: quantity
    };

    // Add multiple quantities if needed
    for (let i = 0; i < quantity; i++) {
      dispatch({ type: 'ADD', payload: cartItem });
    }

    setToastMsg(`✅ Added ${quantity} item(s) to cart!`);
    setQuantity(1);
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

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Calculate savings
  const calculateSavings = (originalPrice, salePrice) => {
    if (!originalPrice || !salePrice || originalPrice <= salePrice) return null;
    return originalPrice - salePrice;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Product Not Found</h2>
        <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
        <button
          onClick={() => navigate('/products')}
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition"
        >
          ← Back to Products
        </button>
      </div>
    );
  }

  const images = getProductImages(product);
  const savings = calculateSavings(product.pricing?.originalPrice, product.pricing?.salePrice);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}
      
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm">
        <ol className="flex items-center space-x-2">
          <li><button onClick={() => navigate('/')} className="text-primary hover:underline">Home</button></li>
          <li className="text-gray-500">›</li>
          <li><button onClick={() => navigate('/products')} className="text-primary hover:underline">Products</button></li>
          <li className="text-gray-500">›</li>
          {product.category && (
            <>
              <li><span className="text-primary">{product.category.name?.en}</span></li>
              <li className="text-gray-500">›</li>
            </>
          )}
          <li className="text-gray-900 font-medium">{product.name?.en}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={images[selectedImage]?.url}
              alt={images[selectedImage]?.alt?.en || product.name?.en}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/images/products/default.jpg';
              }}
            />
          </div>
          
          {/* Image Thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition ${
                    selectedImage === index ? 'border-primary' : 'border-transparent hover:border-gray-300'
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
        <div className="space-y-6">
          {/* Product Name */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name?.en}</h1>
            <p className="text-lg text-gray-600">{product.name?.ar}</p>
            {product.sku && (
              <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
            )}
          </div>

          {/* Rating & Reviews */}
          {product.rating && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${i < Math.round(product.rating.average) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating.average} ({product.rating.totalReviews} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(product.pricing?.salePrice || product.pricing?.originalPrice)}
              </span>
              {product.pricing?.originalPrice && product.pricing.salePrice && product.pricing.originalPrice > product.pricing.salePrice && (
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(product.pricing.originalPrice)}
                </span>
              )}
              {product.pricing?.isOnSale && product.pricing.discountPercentage && (
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                  -{product.pricing.discountPercentage}%
                </span>
              )}
            </div>
            {savings && (
              <p className="text-green-600 font-medium">You save {formatPrice(savings)}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <p className="text-gray-700 leading-relaxed">{product.description?.en}</p>
          </div>

          {/* Stock Status */}
          <div className="flex items-center space-x-2">
            {product.inventory?.inStock ? (
              <>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-700 font-medium">In Stock</span>
                {product.inventory.quantity && product.inventory.quantity <= product.inventory.lowStockThreshold && (
                  <span className="text-orange-600 text-sm">Only {product.inventory.quantity} left!</span>
                )}
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-red-700 font-medium">Out of Stock</span>
              </>
            )}
          </div>

          {/* Quantity Selector & Add to Cart */}
          {product.inventory?.inStock && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label htmlFor="quantity" className="text-sm font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 px-3 py-2 text-center border-0 focus:ring-0"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-dark transition"
              >
                Add to Cart
              </button>
            </div>
          )}

          {/* Features */}
          {product.features?.en && product.features.en.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
              <ul className="space-y-2">
                {product.features.en.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Product Specifications */}
      {product.specifications && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Specifications</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="border-b border-gray-200 pb-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className="text-gray-600">
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
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Details</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed text-lg">{product.longDescription.en}</p>
          </div>
        </div>
      )}

      {/* Smart Recommendations */}
      <div className="space-y-12">
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
  );
}

export default ProductDetails; 