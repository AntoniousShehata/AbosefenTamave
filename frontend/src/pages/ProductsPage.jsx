import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const placeholderImages = [
  '/pictures/CERAMIC.jpg',
  '/pictures/ACCESSORIES.jpg',
  '/pictures/FURNITURE.jpg',
  '/pictures/PREWALL.jpg',
  '/pictures/BATHROOM_FITTINGS.jpg',
  '/pictures/KITCHEN_FITTINGS.jpg',
  '/pictures/BATHTUBS.jpg',
];

function ProductsPage() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:3003/categories')
      .then(response => {
        const categories = response.data.categories || response.data;
        const withImages = categories.map((cat, index) => ({
          name: cat.name?.en || cat.Category_Desc,
          code: cat.slug || cat.Category_Code,
          image: placeholderImages[index % placeholderImages.length],
        }));
        setCategories(withImages);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-primary">Shop by Category</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div
            key={cat.code}
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
