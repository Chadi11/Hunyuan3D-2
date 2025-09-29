import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState = ({ progress }) => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium">Generating 3D Model</p>
        {progress && (
          <p className="text-gray-500 text-sm mt-2">{progress}</p>
        )}
        <div className="mt-4 text-xs text-gray-400">
          This may take a few minutes depending on image complexity
        </div>
      </div>
    </div>
  );
};

export default LoadingState;