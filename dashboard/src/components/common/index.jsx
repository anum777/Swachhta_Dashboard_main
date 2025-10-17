import React from 'react';

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
  </div>
);

export const ErrorMessage = ({ message }) => (
  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
    <div className="flex items-center">
      <div className="flex-shrink-0">⚠️</div>
      <div className="ml-3">
        <p className="text-red-700">{message}</p>
      </div>
    </div>
  </div>
);

export const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
    {children}
  </div>
);
