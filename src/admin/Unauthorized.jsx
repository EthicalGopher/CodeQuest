import React from 'react';

const Unauthorized = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-red-100 text-red-700">
      <h1 className="text-3xl font-bold">401 - Unauthorized</h1>
      <p className="text-lg">You do not have permission to access this page.</p>
    </div>
  );
};

export default Unauthorized;
