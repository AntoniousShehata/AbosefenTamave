import React from 'react';
import idealToilet from '../pictures/ideal_toilets.jpg';
import kitchenMixer from '../pictures/kitchen_mixer.jpg';
import ceramicSink from '../pictures/ceramic_sink.jpg';

const dummyProducts = [
  {
    id: 1,
    name: 'طقم حمام أبيض',
    price: '1200 جنيه',
    image: idealToilet,
    className: "w-full h-48 object-cover object-center",
  },
  {
    id: 2,
    name: 'خلاط مطبخ',
    price: '450 جنيه',
    image: kitchenMixer,
  },
  {
    id: 3,
    name: 'حوض سيراميك',
    price: '800 جنيه',
    image: ceramicSink,
  },
];

function Products() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-primary">المنتجات المتوفرة</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dummyProducts.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full h-58 object-contain object-center bg-white" />
            <div className="p-4">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-secondary font-bold">{product.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;
