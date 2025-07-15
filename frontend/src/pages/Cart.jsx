import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';

function Cart() {
  const { 
    cart, 
    getCartTotals, 
    updateQuantity, 
    incrementItem, 
    decrementItem, 
    removeItem, 
    clearCart,
    formatPrice 
  } = useCart();
  
  const navigate = useNavigate();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const totals = getCartTotals();

  const handleQuantityChange = (productId, newQuantity) => {
    const quantity = parseInt(newQuantity);
    if (quantity > 0) {
      updateQuantity(productId, quantity);
    }
  };

  const handleRemoveItem = (productId) => {
    removeItem(productId);
  };

  const handleClearCart = () => {
    clearCart();
    setShowClearConfirm(false);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-lg p-12">
              <div className="mb-8">
                <svg className="w-24 h-24 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
                <p className="text-lg text-gray-600 mb-8">
                  Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
                </p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/products')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Start Shopping
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full border-2 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
                >
                  Browse Categories
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Shopping Cart</h1>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-red-600 hover:text-red-800 font-medium transition-colors duration-200"
            >
              Clear Cart
            </button>
          </div>
          <p className="text-gray-600">
            {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="divide-y divide-gray-200">
                {cart.map((item, index) => (
                  <div key={item._id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name?.en || item.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = '/images/products/default.jpg';
                            }}
                          />
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                              {item.name?.en || item.name}
                            </h3>
                            
                            {/* Price */}
                            <div className="flex items-center space-x-2 mb-4">
                              <span className="text-xl font-bold text-blue-600">
                                {formatPrice(item.price)}
                              </span>
                              {item.isOnSale && item.originalPrice && (
                                <span className="text-lg text-gray-500 line-through">
                                  {formatPrice(item.originalPrice)}
                                </span>
                              )}
                              {item.isOnSale && (
                                <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                                  Sale
                                </span>
                              )}
                            </div>

                            {/* Stock Status */}
                            <div className="flex items-center space-x-2 mb-4">
                              <div className={`w-3 h-3 rounded-full ${item.inventory?.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              <span className={`text-sm font-medium ${item.inventory?.inStock ? 'text-green-700' : 'text-red-700'}`}>
                                {item.inventory?.inStock ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex flex-col items-end space-y-4">
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                              <button
                                onClick={() => decrementItem(item._id)}
                                disabled={item.quantity <= 1}
                                className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              
                              <input
                                type="number"
                                min="1"
                                max="99"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                                className="w-16 h-10 text-center border-0 focus:ring-0 focus:outline-none"
                              />
                              
                              <button
                                onClick={() => incrementItem(item._id)}
                                className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </button>
                            </div>

                            {/* Item Total */}
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">
                                {formatPrice(item.price * item.quantity)}
                              </div>
                              {item.isOnSale && item.originalPrice && (
                                <div className="text-sm text-gray-500">
                                  Save {formatPrice((item.originalPrice - item.price) * item.quantity)}
                                </div>
                              )}
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => handleRemoveItem(item._id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Subtotal ({totals.itemCount} items)</span>
                  <span className="font-semibold">{formatPrice(totals.subtotal)}</span>
                </div>
                
                {totals.savings > 0 && (
                  <div className="flex justify-between items-center py-2 text-red-600">
                    <span>Savings</span>
                    <span className="font-semibold">-{formatPrice(totals.savings)}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center py-2 text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold">Free</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">{formatPrice(totals.total)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Proceed to Checkout
                </button>
                
                <button
                  onClick={() => navigate('/products')}
                  className="w-full border-2 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600 px-6 py-4 rounded-lg font-semibold transition-all duration-300"
                >
                  Continue Shopping
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 pt-6 border-t">
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Free shipping on all orders</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Secure payment processing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>30-day return policy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clear Cart Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 m-4 max-w-md w-full">
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Clear Cart</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to remove all items from your cart? This action cannot be undone.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 border-2 border-gray-300 text-gray-700 hover:border-gray-400 px-4 py-3 rounded-lg font-semibold transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearCart}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
