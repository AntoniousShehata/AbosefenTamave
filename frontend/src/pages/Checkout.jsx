import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PaymentForm from '../components/PaymentForm';
import axios from 'axios';

function Checkout() {
  const { cart, dispatch } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

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

  const total = cart.reduce((acc, item) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^\d.]/g, '')) : item.price;
    return acc + price * item.quantity;
  }, 0);

  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setShowPaymentForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!customer.name || !customer.phone || !customer.address) {
      alert("Please fill in all customer details.");
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

    // Handle cash on delivery
    await processCashOrder();
  };

  const processCashOrder = async () => {
    setIsSubmitting(true);

    try {
      const orderData = {
        items: cart.map(item => ({
          id: item.id,
          name: item.name || item.ItemName,
          price: typeof item.price === 'string' ? parseFloat(item.price.replace(/[^\d.]/g, '')) : item.price,
          quantity: item.quantity
        })),
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address
        },
        paymentMethod: paymentMethod
      };

      const response = await axios.post('http://localhost:3005/api/orders', orderData);
      
      if (response.data.orderNumber) {
        setOrderNumber(response.data.orderNumber);
        setSubmitted(true);
        
        // Clear cart after successful order
        cart.forEach(item => {
          dispatch({ type: 'REMOVE', payload: item.id });
        });
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
    cart.forEach(item => {
      dispatch({ type: 'REMOVE', payload: item.id });
    });
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    alert(error);
    setShowPaymentForm(false);
  };

  if (submitted) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-4 rounded mb-6">
          <h2 className="text-2xl font-bold mb-2">✅ Order Submitted Successfully!</h2>
          <p className="mb-2">Your order number is: <strong>{orderNumber}</strong></p>
          <p>We will contact you soon to confirm delivery details.</p>
          {paymentMethod === 'visa' && (
            <p className="mt-2 text-sm">Payment has been processed successfully.</p>
          )}
        </div>
        
        <div className="text-center space-y-4">
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-white px-6 py-3 rounded hover:bg-secondary transition mr-4"
          >
            Continue Shopping
          </button>
          
          <button
            onClick={() => navigate('/contact')}
            className="border border-primary text-primary px-6 py-3 rounded hover:bg-primary hover:text-white transition"
          >
            Contact Us
          </button>
        </div>
      </div>
    );
  }

  if (showPaymentForm) {
    const orderData = {
      items: cart.map(item => ({
        id: item.id,
        name: item.name || item.ItemName,
        price: typeof item.price === 'string' ? parseFloat(item.price.replace(/[^\d.]/g, '')) : item.price,
        quantity: item.quantity
      })),
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address
      }
    };

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setShowPaymentForm(false)}
            className="text-primary hover:text-secondary mb-4"
          >
            ← Back to Order Details
          </button>
          
          <h2 className="text-3xl font-bold mb-2 text-primary">Complete Your Payment</h2>
          <p className="text-gray-600">Total Amount: <strong>EGP {total.toFixed(2)}</strong></p>
        </div>

        <PaymentForm
          amount={total}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          orderData={orderData}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-primary">Checkout</h2>

      {cart.length === 0 ? (
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Your cart is empty.</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-primary text-white px-6 py-2 rounded hover:bg-secondary transition"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <>
          {/* Cart items summary */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <span className="font-medium">{item.name || item.ItemName}</span>
                    <span className="text-gray-500 ml-2">x{item.quantity}</span>
                  </div>
                  <span className="font-semibold">
                    EGP {(
                      (typeof item.price === 'string' ? parseFloat(item.price.replace(/[^\d.]/g, '')) : item.price) * 
                      item.quantity
                    ).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center text-xl font-bold text-primary">
                <span>Total:</span>
                <span>EGP {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Information Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Customer Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={customer.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={customer.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
              <input
                type="email"
                name="email"
                value={customer.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address *</label>
              <textarea
                name="address"
                value={customer.address}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
              <div className="space-y-3">
                <div className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    id="cash"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <label htmlFor="cash" className="text-gray-700 font-medium cursor-pointer">
                      💵 Cash on Delivery
                    </label>
                    <p className="text-sm text-gray-500">Pay when your order is delivered</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    id="visa"
                    name="paymentMethod"
                    value="visa"
                    checked={paymentMethod === 'visa'}
                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <label htmlFor="visa" className="text-gray-700 font-medium cursor-pointer">
                      💳 Credit/Debit Card
                    </label>
                    <p className="text-sm text-gray-500">Secure payment with Visa, Mastercard</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    id="bank_transfer"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <label htmlFor="bank_transfer" className="text-gray-700 font-medium cursor-pointer">
                      🏦 Bank Transfer
                    </label>
                    <p className="text-sm text-gray-500">Transfer payment to our bank account</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition"
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
                `Proceed to Payment - EGP ${total.toFixed(2)}`
              ) : (
                `Confirm Order - EGP ${total.toFixed(2)}`
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default Checkout;
