// components/NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="text-center w-full max-w-md mx-auto">
        {/* Error Code */}
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-gray-900 mb-4">
          404
        </h1>
        
        {/* Main Heading */}
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-700 mb-3">
          Page Not Found
        </h2>
        
        {/* Description */}
        <p className="text-base sm:text-lg text-gray-500 mb-6 sm:mb-8 px-4">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          <Link 
            to="/dashboard"
            className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium text-sm sm:text-base"
          >
            Go to Dashboard
          </Link>
        
        </div>
    
      </div>
    </div>
  );
};

export default NotFound;