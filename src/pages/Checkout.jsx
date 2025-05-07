import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

function Checkout() {
  const { cart, dispatch } = useCart();

  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const total = cart.reduce(
    (acc, item) => acc + parseFloat(item.price.replace('EGP ', '')) * item.quantity,
    0
  );

  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customer.name || !customer.phone || !customer.address) {
      alert("Please fill in all customer details.");
      return;
    }

    console.log("Order submitted:", { cart, customer });
    setSubmitted(true);
    dispatch({ type: 'CLEAR_CART' }); // optional: clear cart after order
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-primary">Checkout</h2>

      {submitted ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-4 rounded">
          ✅ Your order has been submitted successfully! We will contact you soon.
        </div>
      ) : (
        <>
          {cart.length === 0 ? (
            <p className="text-lg text-gray-600">Your cart is empty.</p>
          ) : (
            <>
              {/* Cart items table */}
              <table className="w-full mb-6 border border-gray-300">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-2">Product</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2">Price</th>
                    <th className="p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(item => (
                    <tr key={item.id} className="border-t">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2 flex items-center gap-2">
                        <button
                          onClick={() => dispatch({ type: 'DECREASE', payload: item.id })}
                          className="px-2 bg-gray-200 hover:bg-gray-300 rounded"
                        >-</button>
                        {item.quantity}
                        <button
                          onClick={() => dispatch({ type: 'INCREASE', payload: item.id })}
                          className="px-2 bg-gray-200 hover:bg-gray-300 rounded"
                        >+</button>
                      </td>
                      <td className="p-2">{item.price}</td>
                      <td className="p-2">
                        EGP {parseFloat(item.price.replace('EGP ', '')) * item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total Price */}
              <div className="text-xl font-semibold mb-6 text-right text-primary">
                Total: EGP {total.toFixed(2)}
              </div>

              {/* Customer Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  value={customer.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                />
                <input
                  type="tel"
                  name="phone"
                  value={customer.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                />
                <textarea
                  name="address"
                  value={customer.address}
                  onChange={handleChange}
                  placeholder="Delivery Address"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                ></textarea>
                <button
                  type="submit"
                  className="bg-primary text-white px-6 py-2 rounded hover:bg-secondary transition"
                >
                  Confirm Order
                </button>
              </form>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Checkout;
