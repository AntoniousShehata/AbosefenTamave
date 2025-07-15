import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PaymentForm from '../components/PaymentForm';
import axios from 'axios';

function Checkout() {
  const { cart, getCartTotals, clearCart, formatPrice } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const totals = getCartTotals();

  const [customer, setCustomer] = useState({
    name: user ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    if (!customer.name.trim()) {
      errors.name = 'Full name is required';
    }
    
    if (!customer.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(customer.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!customer.address.trim()) {
      errors.address = 'Delivery address is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setShowPaymentForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    if (paymentMethod === 'visa') {
      setShowPaymentForm(true);
      return;
    }

    // Handle cash on delivery or bank transfer
    await processOrder();
  };

  const processOrder = async () => {
    setIsSubmitting(true);

    try {
      const orderData = {
        items: cart.map(item => ({
          id: item._id,
          name: item.name?.en || item.name,
          price: item.price,
          quantity: item.quantity
        })),
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address
        },
        paymentMethod: paymentMethod,
        totals: {
          subtotal: totals.subtotal,
          savings: totals.savings,
          total: totals.total,
          itemCount: totals.itemCount
        }
      };

      const response = await axios.post('http://localhost:3005/api/orders', orderData);
      
      if (response.data.orderNumber) {
        setOrderNumber(response.data.orderNumber);
        setSubmitted(true);
        
        // Clear cart after successful order
        clearCart();
      }

    } catch (error) {
      console.error('Order submission error:', error);
      alert('Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = (result) => {
    setOrderNumber(result.orderNumber);
    setSubmitted(true);
    
    // Clear cart after successful order
    clearCart();
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    alert(error);
    setShowPaymentForm(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Success Header */}
              <div className="bg-green-500 text-white p-8 text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold mb-2">Order Confirmed!</h2>
                <p className="text-xl opacity-90">Thank you for your purchase</p>
              </div>

              {/* Order Details */}
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Order Number</h3>
                    <p className="text-3xl font-bold text-blue-600">{orderNumber}</p>
                  </div>
                  
                  <div className="space-y-2 text-gray-600">
                    <p>We will contact you soon to confirm delivery details.</p>
                    {paymentMethod === 'visa' && (
                      <p className="text-green-600 font-medium">Payment has been processed successfully.</p>
                    )}
                    {paymentMethod === 'cash' && (
                      <p className="text-blue-600 font-medium">You will pay cash on delivery.</p>
                    )}
                    {paymentMethod === 'bank_transfer' && (
                      <p className="text-purple-600 font-medium">Please check your email for bank transfer details.</p>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-4">
                  <button
                    onClick={() => navigate('/')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Continue Shopping
                  </button>
                  
                  <button
                    onClick={() => navigate('/contact')}
                    className="w-full border-2 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600 px-6 py-4 rounded-lg font-semibold transition-all duration-300"
                  >
                    Contact Us
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showPaymentForm) {
    const orderData = {
      items: cart.map(item => ({
        id: item._id,
        name: item.name?.en || item.name,
        price: item.price,
        quantity: item.quantity
      })),
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address
      },
      totals: totals
    };

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <button
                onClick={() => setShowPaymentForm(false)}
                className="flex items-center text-blue-600 hover:text-blue-800 mb-4 font-medium transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Order Details
              </button>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Complete Your Payment</h1>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-semibold text-lg">
                  Total Amount: {formatPrice(totals.total)}
                </p>
              </div>
            </div>

            <PaymentForm
              amount={totals.total}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              orderData={orderData}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">Checkout</h1>

          {cart.length === 0 ? (
            <div className="text-center bg-white rounded-2xl shadow-lg p-12">
              <div className="mb-8">
                <svg className="w-24 h-24 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
                <p className="text-lg text-gray-600 mb-8">Add some items to your cart before checking out.</p>
              </div>
              <button
                onClick={() => navigate('/products')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Order Summary */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {cart.map(item => (
                    <div key={item._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name?.en || item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/images/products/default.jpg';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {item.name?.en || item.name}
                        </h3>
                        <p className="text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Totals */}
                <div className="border-t pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({totals.itemCount} items)</span>
                      <span>{formatPrice(totals.subtotal)}</span>
                    </div>
                    
                    {totals.savings > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Savings</span>
                        <span>-{formatPrice(totals.savings)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-blue-600">{formatPrice(totals.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information & Payment */}
              <div className="space-y-8">
                {/* Customer Information Form */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Information</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={customer.name}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                            formErrors.name 
                              ? 'border-red-500 focus:ring-red-500' 
                              : 'border-gray-300 focus:ring-blue-500'
                          }`}
                        />
                        {formErrors.name && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={customer.phone}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                            formErrors.phone 
                              ? 'border-red-500 focus:ring-red-500' 
                              : 'border-gray-300 focus:ring-blue-500'
                          }`}
                        />
                        {formErrors.phone && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={customer.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                          formErrors.email 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      />
                      {formErrors.email && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Delivery Address *
                      </label>
                      <textarea
                        name="address"
                        value={customer.address}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Enter your complete delivery address including city, area, and landmarks"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${
                          formErrors.address 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      />
                      {formErrors.address && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
                      )}
                    </div>
                  </form>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>
                  
                  <div className="space-y-4">
                    {/* Cash on Delivery */}
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'cash' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => handlePaymentMethodChange(e.target.value)}
                        className="mr-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-2xl">💵</span>
                          <span className="font-semibold text-gray-900">Cash on Delivery</span>
                        </div>
                        <p className="text-sm text-gray-600">Pay when your order is delivered to your doorstep</p>
                      </div>
                    </label>
                    
                    {/* Credit Card */}
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'visa' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="visa"
                        checked={paymentMethod === 'visa'}
                        onChange={(e) => handlePaymentMethodChange(e.target.value)}
                        className="mr-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-2xl">💳</span>
                          <span className="font-semibold text-gray-900">Credit/Debit Card</span>
                        </div>
                        <p className="text-sm text-gray-600">Secure payment with Visa, Mastercard, or other cards</p>
                      </div>
                    </label>
                    
                    {/* Bank Transfer */}
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'bank_transfer' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank_transfer"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={(e) => handlePaymentMethodChange(e.target.value)}
                        className="mr-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-2xl">🏦</span>
                          <span className="font-semibold text-gray-900">Bank Transfer</span>
                        </div>
                        <p className="text-sm text-gray-600">Transfer payment directly to our bank account</p>
                      </div>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:transform-none disabled:shadow-none"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing Order...
                      </span>
                    ) : paymentMethod === 'visa' ? (
                      `Proceed to Payment - ${formatPrice(totals.total)}`
                    ) : (
                      `Confirm Order - ${formatPrice(totals.total)}`
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Checkout;
