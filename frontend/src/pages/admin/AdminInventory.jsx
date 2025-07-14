import React from 'react';

function AdminInventory() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Inventory Management</h2>
        <p className="text-gray-600">
          Track stock levels across your stores and manage inventory efficiently.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Inventory Management</h3>
          <p className="text-gray-500 mb-4">
            This feature is coming soon. You'll be able to:
          </p>
          <ul className="text-left max-w-md mx-auto space-y-2 text-gray-500">
            <li>• Track stock levels by store location</li>
            <li>• Set minimum stock alerts</li>
            <li>• Manage product transfers</li>
            <li>• View inventory reports</li>
            <li>• Update stock quantities</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminInventory; 