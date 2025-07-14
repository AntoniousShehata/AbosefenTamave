import React from 'react';

function AdminUsers() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">User Management</h2>
        <p className="text-gray-600">
          Manage customer accounts and employee access to the system.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
          <p className="text-gray-500 mb-4">
            This feature is coming soon. You'll be able to:
          </p>
          <ul className="text-left max-w-md mx-auto space-y-2 text-gray-500">
            <li>• View all registered customers</li>
            <li>• Manage user roles and permissions</li>
            <li>• Add new admin accounts</li>
            <li>• View customer order history</li>
            <li>• Deactivate user accounts</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminUsers; 