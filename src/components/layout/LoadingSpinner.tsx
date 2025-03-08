import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="relative">
        {/* Spinner externe */}
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        {/* Spinner interne */}
        <div className="absolute top-1/2 left-1/2 w-8 h-8 -mt-4 -ml-4 border-4 border-blue-100 border-b-blue-400 rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
