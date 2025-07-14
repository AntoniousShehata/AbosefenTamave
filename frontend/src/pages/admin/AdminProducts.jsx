import React from 'react';

function AdminProducts() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Management</h2>
        <p className="text-gray-600">
          Manage your product catalog here. Add new products, update existing ones, and manage pricing.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🛍️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Product Management</h3>
          <p className="text-gray-500 mb-4">
            This feature is coming soon. You'll be able to:
          </p>
          <ul className="text-left max-w-md mx-auto space-y-2 text-gray-500">
            <li>• Add new products with images</li>
            <li>• Update product details and pricing</li>
            <li>• Manage product categories</li>
            <li>• Set product availability</li>
            <li>• Bulk product operations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminProducts; 