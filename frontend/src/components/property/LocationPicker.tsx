import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Search, X, Check } from 'lucide-react';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface LocationPickerProps {
  onLocationSelect: (coordinates: { latitude: number; longitude: number; address?: string }) => void;
  initialCoordinates?: { latitude: number; longitude: number };
  onClose: () => void;
}

interface Coordinates {
  latitude: number;
  longitude: number;
  address?: string;
}

// Custom marker icon for location picker
const createLocationIcon = () => {
  return L.divIcon({
    className: 'location-picker-marker',
    html: `
      <div style="
        background-color: #EF4444;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
      ">
        📍
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Component to handle map clicks
const MapClickHandler: React.FC<{
  onLocationSelect: (coordinates: Coordinates) => void;
  selectedLocation: Coordinates | null;
}> = ({ onLocationSelect, selectedLocation }) => {
  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      
      try {
        // Reverse geocoding to get address
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address
        });
      } catch (error) {
        console.error('Error getting address:', error);
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        });
      }
    },
  });

  return null;
};

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialCoordinates,
  onClose
}) => {
  const [selectedLocation, setSelectedLocation] = useState<Coordinates | null>(
    initialCoordinates ? {
      latitude: initialCoordinates.latitude,
      longitude: initialCoordinates.longitude
    } : null
  );
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]); // India center
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [activeTab, setActiveTab] = useState<'map' | 'search' | 'manual'>('map');

  // Get current location
  const getCurrentLocation = () => {
    setIsLoading(true);
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding to get address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          
          const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          
          const location = {
            latitude,
            longitude,
            address
          };
          
          setSelectedLocation(location);
          setMapCenter([latitude, longitude]);
          onLocationSelect(location);
        } catch (error) {
          console.error('Error getting address:', error);
          const location = {
            latitude,
            longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          };
          setSelectedLocation(location);
          setMapCenter([latitude, longitude]);
          onLocationSelect(location);
        }
        
        setIsLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your current location. Please try again or select manually.');
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  // Search for location
  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setShowSearchResults(false);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`
      );
      const data = await response.json();
      
      setSearchResults(data);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching location:', error);
      alert('Error searching for location. Please try again.');
    }
    
    setIsLoading(false);
  };

  // Select search result
  const selectSearchResult = (result: any) => {
    const location = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      address: result.display_name
    };
    
    setSelectedLocation(location);
    setMapCenter([location.latitude, location.longitude]);
    onLocationSelect(location);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  // Set manual coordinates
  const setManualCoordinates = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    
    if (isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid coordinates.');
      return;
    }
    
    if (lat < -90 || lat > 90) {
      alert('Latitude must be between -90 and 90.');
      return;
    }
    
    if (lng < -180 || lng > 180) {
      alert('Longitude must be between -180 and 180.');
      return;
    }
    
    const location = {
      latitude: lat,
      longitude: lng,
      address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    };
    
    setSelectedLocation(location);
    setMapCenter([lat, lng]);
    onLocationSelect(location);
  };

  // Handle location selection from map
  const handleMapLocationSelect = (coordinates: Coordinates) => {
    setSelectedLocation(coordinates);
    onLocationSelect(coordinates);
  };

  // Confirm selection
  const confirmSelection = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Select Property Location</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[600px]">
          {/* Left Panel - Controls */}
          <div className="w-80 border-r bg-gray-50 p-6 overflow-y-auto">
            {/* Tabs */}
            <div className="flex space-x-1 mb-6">
              <button
                onClick={() => setActiveTab('map')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'map'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Map
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'search'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Search
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'manual'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Manual
              </button>
            </div>

            {/* Current Location Button */}
            <div className="mb-6">
              <button
                onClick={getCurrentLocation}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <Navigation className="w-5 h-5 mr-2" />
                )}
                Get Current Location
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'map' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Click on Map</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Click anywhere on the map to select the property location. The address will be automatically detected.
                </p>
              </div>
            )}

            {activeTab === 'search' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Search Location</h3>
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                      placeholder="Search for a location..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={searchLocation}
                    disabled={isLoading || !searchQuery.trim()}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    Search
                  </button>

                  {/* Search Results */}
                  {showSearchResults && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Search Results:</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {searchResults.map((result, index) => (
                          <button
                            key={index}
                            onClick={() => selectSearchResult(result)}
                            className="w-full text-left p-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {result.display_name.split(',')[0]}
                            </div>
                            <div className="text-xs text-gray-600 truncate">
                              {result.display_name}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'manual' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Enter Coordinates</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      value={manualLat}
                      onChange={(e) => setManualLat(e.target.value)}
                      placeholder="e.g., 20.5937"
                      step="any"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      value={manualLng}
                      onChange={(e) => setManualLng(e.target.value)}
                      placeholder="e.g., 78.9629"
                      step="any"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={setManualCoordinates}
                    disabled={!manualLat || !manualLng}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Set Coordinates
                  </button>
                </div>
              </div>
            )}

            {/* Selected Location Display */}
            {selectedLocation && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Selected Location:</h4>
                <div className="text-sm text-blue-800">
                  <div className="mb-1">
                    <strong>Latitude:</strong> {selectedLocation.latitude.toFixed(6)}
                  </div>
                  <div className="mb-1">
                    <strong>Longitude:</strong> {selectedLocation.longitude.toFixed(6)}
                  </div>
                  {selectedLocation.address && (
                    <div className="text-xs text-blue-700 mt-2">
                      <strong>Address:</strong> {selectedLocation.address}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Confirm Button */}
            {selectedLocation && (
              <div className="mt-6">
                <button
                  onClick={confirmSelection}
                  className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Confirm Location
                </button>
              </div>
            )}
          </div>

          {/* Right Panel - Map */}
          <div className="flex-1">
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <MapClickHandler
                onLocationSelect={handleMapLocationSelect}
                selectedLocation={selectedLocation}
              />

              {selectedLocation && (
                <Marker
                  position={[selectedLocation.latitude, selectedLocation.longitude]}
                  icon={createLocationIcon()}
                />
              )}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker; 