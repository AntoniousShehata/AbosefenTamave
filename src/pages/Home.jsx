import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductsPage from './ProductsPage';

const categories = [
  {
    name: 'Bathroom Sets',
    image: '/pictures/ideal_toilets.jpg',
  },
  {
    name: 'Mixers',
    image: '/pictures/kitchen_mixer.jpg',
  },
  {
    name: 'Sinks',
    image: '/pictures/ceramic_sink.jpg',
  },
];

function Home() {
  return (
    <div className="p-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-primary mb-2">
          Welcome to Abosefen & Tamav Irini
        </h1>
        <p className="text-lg text-gray-600">
          Your trusted store for quality sanitaryware products in Egypt.
        </p>
      </div>

      <ProductsPage />
    </div>
  );
}

export default Home;
