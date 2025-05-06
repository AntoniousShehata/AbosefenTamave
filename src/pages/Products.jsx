import React from 'react';
import { useParams } from 'react-router-dom';
import idealToilet from '../pictures/ideal_toilets.jpg';
import kitchenMixer from '../pictures/kitchen_mixer.jpg';
import ceramicSink from '../pictures/ceramic_sink.jpg';

const dummyProducts = [
  {
    id: 1,
    name: 'White Bathroom Set',
    price: 'EGP 1200',
    image: idealToilet,
    category: 'CERAMIC',
  },
  {
    id: 2,
    name: 'Kitchen Mixer',
    price: 'EGP 450',
    image: kitchenMixer,
    category: 'KITCHEN FITTINGS',
  },
  {
    id: 3,
    name: 'Ceramic Sink',
    price: 'EGP 800',
    image: ceramicSink,
    category: 'CERAMIC',
  },
];

function Products() {
  const { category } = useParams();

  const filteredProducts = dummyProducts.filter(
    (p) => p.category === category
  );

  const handleAddToCart = (productName) => {
    alert(`🛒 "${productName}" has been added to your cart.`);
  };

  const handleViewDetails = (productName) => {
    alert(`ℹ️ Details for: ${productName}`);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-primary">
        Products in: {category}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            <img 
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-contain object-center bg-white"
            />
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-semibold">{product.name}</h4>
                <p className="text-secondary font-bold">{product.price}</p>
              </div>
              <div className="flex flex-col gap-2 mt-3">
                <button
                  onClick={() => handleAddToCart(product.name)}
                  className="bg-primary text-white py-2 px-4 rounded hover:bg-secondary transition"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => handleViewDetails(product.name)}
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
  );
}

export default Products;