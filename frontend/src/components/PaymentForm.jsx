import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import axios from 'axios';
import { API_URL, API_HEADERS } from '../config/api';

// Initialize Stripe (replace with your actual publishable key)
const stripePromise = loadStripe('pk_test_your_stripe_publishable_key');

const CheckoutForm = ({ amount, onSuccess, onError, orderData }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Create payment intent on the server
      const { data } = await axios.post(`${API_URL}/api/payments/create-intent`, {
        amount: amount,
        currency: 'egp'
      }, { headers: API_HEADERS });

      const cardElement = elements.getElement(CardElement);

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: orderData.customer.name,
              email: orderData.customer.email,
              phone: orderData.customer.phone,
              address: {
                line1: orderData.customer.address,
                country: 'EG',
              },
            },
          },
        }
      );

      if (error) {
        setErrorMessage(error.message);
        onError(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        // Payment successful, create the order
        try {
          const orderResponse = await axios.post(`${API_URL}/api/orders`, {
            ...orderData,
            paymentMethod: 'visa',
            paymentId: paymentIntent.id
          });
          
          onSuccess({
            paymentIntent,
            orderNumber: orderResponse.data.orderNumber
          });
        } catch (orderError) {
          console.error('Order creation error:', orderError);
          onError('Payment successful but order creation failed. Please contact support.');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage('Payment processing failed. Please try again.');
      onError('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Details
          </label>
          <div className="p-3 border border-gray-300 rounded-md bg-white">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorMessage}
          </div>
        )}

        <div className="text-sm text-gray-600 mb-4">
          <p>💳 Test card numbers:</p>
          <p>• 4242 4242 4242 4242 (Visa)</p>
          <p>• 5555 5555 5555 4444 (Mastercard)</p>
          <p>• Use any future date for expiry and any 3-digit CVC</p>
        </div>

        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing Payment...
            </span>
          ) : (
            `Pay EGP ${amount.toFixed(2)}`
          )}
        </button>
      </div>
    </form>
  );
};

const PaymentForm = ({ amount, onSuccess, onError, orderData }) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm 
        amount={amount} 
        onSuccess={onSuccess} 
        onError={onError} 
        orderData={orderData}
      />
    </Elements>
  );
};

export default PaymentForm; 