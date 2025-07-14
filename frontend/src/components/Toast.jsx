import React from 'react';

function Toast({ message }) {
  return (
    <div className="fixed bottom-5 right-5 bg-green-600 text-white py-2 px-4 rounded shadow-lg z-50 animate-fade-in-out">
      {message}
    </div>
  );
}

export default Toast;