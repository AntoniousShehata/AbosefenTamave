import React from 'react';
import ProductsPage from './ProductsPage';
import SmartRecommendations from '../components/SmartRecommendations';

function Home() {
  return (
    <div className="p-0">

      <div className="w-full overflow-hidden shadow-md">
        <img
          src="/images/cover.jpg"
          alt="Abosefen & TamaveIrini Store Banner"
          className="w-full object-contain max-h-[500px] md:max-h-[300px] mx-auto"
        />
      </div>

      <div className="p-6">
        <ProductsPage />
        
        {/* Personalized Recommendations */}
        <div className="mt-12">
          <SmartRecommendations
            type="personalized"
            limit={8}
            className="mb-12"
          />
        </div>
      </div>
    </div>
  );
}

export default Home;
