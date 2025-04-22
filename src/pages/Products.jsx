import React from 'react';
import idealToilet from '../pictures/ideal_toilets.jpg';
import kitchenMixer from '../pictures/kitchen_mixer.jpg';
import ceramicSink from '../pictures/ceramic_sink.jpg';

const dummyProducts = [
  {
    id: 1,
    name: 'White Bathroom Set',
    price: 'EGP 1200',
    image: idealToilet,
  },
  {
    id: 2,
    name: 'Kitchen Mixer',
    price: 'EGP 450',
    image: kitchenMixer,
  },
  {
    id: 3,
    name: 'Ceramic Sink',
    price: 'EGP 800',
    image: ceramicSink,
  },
];

function Products() {
  const handleAddToCart = (productName) => {
    alert(`🛒 "${productName}" has been added to your cart.`);
  };

  const handleViewDetails = (productName) => {
    alert(`ℹ️ Details for: ${productName}`);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-primary">Available Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dummyProducts.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-48 object-contain object-center bg-white"
            />
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-secondary font-bold">{product.price}</p>
              </div>
              <div className="flex flex-col gap-2 mt-auto">
                <button 
                  onClick={() => handleAddToCart(product.name)} 
                  className="bg-primary text-white py-2 px-4 rounded hover:bg-secondary transition-all"
                >
                  Add to Cart
                </button>
                <button 
                  onClick={() => handleViewDetails(product.name)} 
                  className="border border-primary text-primary py-2 px-4 rounded hover:bg-primary hover:text-white transition-all"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;
