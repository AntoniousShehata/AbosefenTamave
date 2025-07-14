import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

function Cart() {
  const { cart, dispatch } = useCart();

  const totalPrice = cart.reduce((sum, item) => {
    const numericPrice = parseFloat(item.price.replace(/[^\d.]/g, ''));
    return sum + numericPrice * item.quantity;
  }, 0);

  if (cart.length === 0) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4 text-primary">Your cart is empty 🛒</h2>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-primary mb-6">Your Shopping Cart</h2>

      <div className="space-y-6">
        {cart.map(item => (
          <div key={item.id} className="flex flex-col md:flex-row items-center gap-6 bg-white p-4 shadow rounded-lg">
            <img src={item.image} alt={item.name} className="w-32 h-32 object-contain" />
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{item.name}</h3>
              <p className="text-secondary font-bold">{item.price}</p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => dispatch({ type: 'DECREMENT', payload: item.id })}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  -
                </button>
                <span className="font-bold">{item.quantity}</span>
                <button
                  onClick={() => dispatch({ type: 'INCREMENT', payload: item.id })}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  +
                </button>
                <button
                  onClick={() => dispatch({ type: 'REMOVE', payload: item.id })}
                  className="ml-4 text-red-600 hover:text-red-800"
                >
                  🗑 Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-right mt-8">
        <p className="text-xl font-bold text-dark">
          Total: <span className="text-primary">EGP {totalPrice.toFixed(2)}</span>
        </p>

        <Link
          to="/checkout"
          className="inline-block mt-4 bg-primary text-white px-6 py-2 rounded hover:bg-secondary transition"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}

export default Cart;
