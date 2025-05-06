import React from 'react';
import ProductsPage from './ProductsPage';
import cover from '../pictures/cover.jpg'; 

function Home() {
  return (
    <div className="p-0">

      <div className="w-full overflow-hidden shadow-md">
        <img
          src={cover}
          alt="Store Banner"
          className="w-full object-contain max-h-[400px] md:max-h-[500px] mx-auto"
        />
      </div>

      <div className="p-6">
        <ProductsPage />
      </div>
    </div>
  );
}

export default Home;
