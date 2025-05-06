import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import Ceramic from '../pictures/CERAMIC.jpg';
import ACCESSORIES from '../pictures/ACCESSORIES.jpg';
import FURNITURE from '../pictures/FURNITURE.jpg';
import PREWALL from '../pictures/PREWALL.jpg';
import BATHROOM_FITTINGS from '../pictures/BATHROOM_FITTINGS.jpg';
import KITCHEN_FITTINGS from '../pictures/KITCHEN_FITTINGS.jpg';
import BATHTUBS from '../pictures/BATHTUBS.jpg';

const categories = [
  {
    name: 'CERAMIC',
    image: Ceramic,
  },
  {
    name: 'ACCESSORIES',
    image: ACCESSORIES,
  },
  {
    name: 'BATHROOM FURNITURE',
    image: FURNITURE,
  },
  {
    name: 'PREWALL INSTALLATION SYSTEMS',
    image: PREWALL,
  },
  {
    name: 'BATHROOM FITTINGS',
    image: BATHROOM_FITTINGS,
  },
  {
    name: 'KITCHEN FITTINGS',
    image: KITCHEN_FITTINGS,
  },
  {
    name: 'BATHTUBS AND SHOWERING',
    image: BATHTUBS,
  },
];

function ProductsPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-primary">Shop by Category</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div
            key={cat.name}
            onClick={() => navigate(`/products/${encodeURIComponent(cat.name)}`)}
            className="cursor-pointer bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
          >
            <img
              src={cat.image}
              alt={cat.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 text-center font-semibold text-lg text-dark">
              {cat.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductsPage;
