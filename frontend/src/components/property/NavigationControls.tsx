import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, Route, X, Loader2 } from 'lucide-react';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface NavigationControlsProps {
  propertyLocation: Coordinates;
  onGetDirections: (userLocation: Coordinates) => void;
  onClearRoute: () => void;
  isRouting: boolean;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  propertyLocation,
  onGetDirections,
  onClearRoute,
  isRouting
}) => {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  // Get user's current location
  const getUserLocation = () => {
    setIsGettingLocation(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setUserLocation(coords);
        
        // Calculate distance
        const dist = calculateDistance(
          coords.latitude,
          coords.longitude,
          propertyLocation.latitude,
          propertyLocation.longitude
        );
        setDistance(dist);
        
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMessage = 'Unable to get your location.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        
        setError(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Format distance for display
  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-[1000] max-w-xs">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
        <Navigation className="w-4 h-4 mr-2" />
        Navigation
      </h3>
      
      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
          {error}
        </div>
      )}

      {!userLocation ? (
        <button
          onClick={getUserLocation}
          disabled={isGettingLocation}
          className="w-full flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isGettingLocation ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Getting Location...
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 mr-2" />
              Get My Location
            </>
          )}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="text-xs text-gray-600">
            <div className="flex items-center justify-between">
              <span>Distance:</span>
              <span className="font-semibold text-gray-900">
                {distance ? formatDistance(distance) : 'Calculating...'}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => onGetDirections(userLocation)}
              disabled={isRouting}
              className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isRouting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Route className="w-4 h-4 mr-2" />
                  Get Directions
                </>
              )}
            </button>
            
            <button
              onClick={() => {
                setUserLocation(null);
                setDistance(null);
                setError(null);
                onClearRoute();
              }}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              title="Clear location"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="text-xs text-gray-500">
            <div className="flex items-center mb-1">
              <MapPin className="w-3 h-3 mr-1" />
              Your Location
            </div>
            <div className="text-gray-400">
              {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigationControls; 