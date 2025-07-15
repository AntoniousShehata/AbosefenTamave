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

  // Get products from API
  useEffect(() => {
    axios.get('http://localhost:3003/products')
      .then(res => {
        const productsData = res.data.products || res.data;
        setProducts(productsData);
      })
      .catch(err => console.error('❌ Error fetching products:', err));
  }, []);

  const handleViewDetails = (productName) => {
    alert(`ℹ️ Details for: ${productName}`);
  };

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
    return product.pricing?.price || product.Price || 0;
  };

  // Helper function to get category name for filtering
  const getProductCategory = (product) => {
    return product.categoryId?.name?.en || product.CategoryName || '';
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

  return (
    <>
      {/* toastMsg && <Toast message={toastMsg} /> */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-primary">
          Products in: {category}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products
            .filter(p => getProductCategory(p) === category) // Filter by category
            .map(product => (
              <div key={product._id || product.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col group">
                <div className="overflow-hidden">
                  <img
                    src={getProductImage(product)}
                    alt={getProductName(product)}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = '/images/products/default.jpg';
                    }}
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-semibold mb-2">{getProductName(product)}</h4>
                    {product.shortDescription?.en && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.shortDescription.en}
                      </p>
                    )}
                    <p className="text-secondary font-bold text-xl">
                      EGP {getProductPrice(product).toLocaleString()}
                    </p>
                    {product.pricing?.comparePrice && product.pricing.comparePrice > product.pricing.price && (
                      <p className="text-gray-500 line-through text-sm">
                        EGP {product.pricing.comparePrice.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="bg-primary text-white py-2 px-4 rounded hover:bg-secondary transition"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleViewDetails(getProductName(product))}
                      className="border border-primary text-primary py-2 px-4 rounded hover:bg-primary hover:text-white transition"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
        
        {products.filter(p => getProductCategory(p) === category).length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-500">No products available in this category yet.</p>
          </div>
        )}
      </div>
    </>
  );
}

export default Products;
