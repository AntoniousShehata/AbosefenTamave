import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Toast from '../components/Toast';
import axios from 'axios';

function Products() {
  const { category } = useParams();
  const { dispatch } = useCart();
  const [products, setProducts] = useState([]);
  const [toastMsg, setToastMsg] = useState('');

  // Get products from API
  useEffect(() => {
    axios.get('http://localhost:3003/products')
      .then(res => setProducts(res.data.products || res.data))
      .catch(err => console.error('❌ Error fetching products:', err));
  }, []);

  const handleViewDetails = (productName) => {
    alert(`ℹ️ Details for: ${productName}`);
  };

  return (
    <>
      {toastMsg && <Toast message={toastMsg} />}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-primary">
          Products in: {category}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products
            .filter(p => p.CategoryName === category) // or use p.category depending on your DB schema
            .map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                <img
                  src={product.PhotoPath}
                  alt={product.ItemName}
                  className="w-full h-48 object-contain object-center bg-white"
                />
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-semibold">{product.ItemName}</h4>
                    <p className="text-secondary font-bold">EGP {product.Price}</p>
                  </div>
                  <div className="flex flex-col gap-2 mt-3">
                    <button
                      onClick={() => {
                        dispatch({ type: 'ADD', payload: product });
                        setToastMsg(`${product.ItemName} added to cart!`);
                        setTimeout(() => setToastMsg(''), 3000);
                      }}
                      className="bg-primary text-white py-2 px-4 rounded hover:bg-secondary transition"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleViewDetails(product.ItemName)}
                      className="border border-primary text-primary py-2 px-4 rounded hover:bg-primary hover:text-white transition"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}

export default Products;
