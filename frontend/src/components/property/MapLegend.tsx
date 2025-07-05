import React from 'react';
import { Home, Building, Users } from 'lucide-react';

const MapLegend: React.FC = () => {
  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000] max-w-xs">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Property Types</h3>
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
            🏢
          </div>
          <span className="text-sm text-gray-700">Flat</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs">
            👥
          </div>
          <span className="text-sm text-gray-700">PG (Paying Guest)</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">
            🏡
          </div>
          <span className="text-sm text-gray-700">House</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
            🏠
          </div>
          <span className="text-sm text-gray-700">Other</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Click on markers to view property details
        </p>
      </div>
    </div>
  );
};

export default MapLegend; 