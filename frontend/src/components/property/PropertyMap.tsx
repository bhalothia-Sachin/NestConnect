import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Property } from '../../types';
import { Home, Building, Users, Map as MapIcon } from 'lucide-react';
import MapLegend from './MapLegend';
import NavigationControls from './NavigationControls';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface PropertyMapProps {
  properties: Property[];
  onPropertyClick?: (property: Property) => void;
  center?: [number, number];
  zoom?: number;
  showNavigation?: boolean;
  selectedProperty?: Property | null;
}

// Custom marker icons for different property types
const createPropertyIcon = (propertyType: string) => {
  const iconSize: [number, number] = [32, 32];
  const iconAnchor: [number, number] = [16, 32];
  const popupAnchor: [number, number] = [0, -32];

  let iconColor = '#3B82F6'; // Default blue
  let iconSymbol = '🏠'; // Default house

  switch (propertyType.toLowerCase()) {
    case 'flat':
      iconColor = '#10B981'; // Green
      iconSymbol = '🏢';
      break;
    case 'pg':
      iconColor = '#F59E0B'; // Amber
      iconSymbol = '👥';
      break;
    case 'house':
      iconColor = '#8B5CF6'; // Purple
      iconSymbol = '🏡';
      break;
    default:
      iconColor = '#3B82F6'; // Blue
      iconSymbol = '🏠';
  }

  return L.divIcon({
    className: 'custom-property-marker',
    html: `
      <div style="
        background-color: ${iconColor};
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
      ">
        ${iconSymbol}
      </div>
    `,
    iconSize,
    iconAnchor,
    popupAnchor,
  });
};

// Component to handle map bounds changes
const MapBoundsHandler: React.FC<{ onBoundsChange?: (bounds: string) => void }> = ({ onBoundsChange }) => {
  const map = useMap();

  useEffect(() => {
    const handleMoveEnd = () => {
      const bounds = map.getBounds();
      const boundsString = `${bounds.getSouthWest().lat},${bounds.getSouthWest().lng},${bounds.getNorthEast().lat},${bounds.getNorthEast().lng}`;
      onBoundsChange?.(boundsString);
    };

    map.on('moveend', handleMoveEnd);
    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map, onBoundsChange]);

  return null;
};

const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  onPropertyClick,
  center = [20.5937, 78.9629], // India center
  zoom = 5,
  showNavigation = false,
  selectedProperty = null
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [routingControl, setRoutingControl] = useState<any>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Update map center when properties change
  useEffect(() => {
    if (properties.length > 0) {
      const validProperties = properties.filter(
        p => p.location.coordinates?.latitude && p.location.coordinates?.longitude
      );
      
      if (validProperties.length > 0) {
        const avgLat = validProperties.reduce((sum, p) => sum + p.location.coordinates!.latitude, 0) / validProperties.length;
        const avgLng = validProperties.reduce((sum, p) => sum + p.location.coordinates!.longitude, 0) / validProperties.length;
        setMapCenter([avgLat, avgLng]);
      }
    }
  }, [properties]);

  // Handle getting directions
  const handleGetDirections = (userCoords: { latitude: number; longitude: number }) => {
    if (!selectedProperty?.location.coordinates || !mapRef.current) return;

    setIsRouting(true);
    setUserLocation([userCoords.latitude, userCoords.longitude]);

    // Remove existing routing control
    if (routingControl) {
      mapRef.current.removeControl(routingControl);
    }

    try {
      // Dynamically import routing machine
      import('leaflet-routing-machine').then((module) => {
        const Routing = (module as any).default;
        const control = Routing.control({
          waypoints: [
            L.latLng(userCoords.latitude, userCoords.longitude),
            L.latLng(selectedProperty!.location.coordinates!.latitude, selectedProperty!.location.coordinates!.longitude)
          ],
          routeWhileDragging: true,
          showAlternatives: true,
          fitSelectedRoutes: true,
          lineOptions: {
            styles: [
              { color: '#3B82F6', opacity: 0.8, weight: 6 }
            ]
          },
          createMarker: function() { return null; } // Don't create default markers
        }).addTo(mapRef.current);

        setRoutingControl(control);
        setIsRouting(false);
      }).catch((error) => {
        console.error('Error loading routing machine:', error);
        setIsRouting(false);
      });
    } catch (error) {
      console.error('Error creating routing:', error);
      setIsRouting(false);
    }
  };

  // Handle clearing route
  const handleClearRoute = () => {
    if (routingControl && mapRef.current) {
      mapRef.current.removeControl(routingControl);
      setRoutingControl(null);
    }
    setUserLocation(null);
    setIsRouting(false);
  };

  // If no properties with coordinates, show a message
  const propertiesWithCoordinates = properties.filter(
    p => p.location.coordinates?.latitude && p.location.coordinates?.longitude && p.showOnMap
  );

  if (properties.length > 0 && propertiesWithCoordinates.length === 0) {
    return (
      <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <MapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Properties on Map</h3>
          <p className="text-gray-500">Properties need coordinates to be displayed on the map</p>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyTypeIcon = (propertyType: string) => {
    switch (propertyType.toLowerCase()) {
      case 'flat':
        return <Building className="w-4 h-4" />;
      case 'pg':
        return <Users className="w-4 h-4" />;
      case 'house':
        return <Home className="w-4 h-4" />;
      default:
        return <Home className="w-4 h-4" />;
    }
  };

  // Create user location marker icon
  const createUserLocationIcon = () => {
    return L.divIcon({
      className: 'user-location-marker',
      html: `
        <div style="
          background-color: #10B981;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          animation: pulse 2s infinite;
        ">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
        </style>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg relative">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        ref={(map) => {
          if (map) {
            mapRef.current = map;
          }
        }}
      >
        {/* OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Map bounds handler */}
        <MapBoundsHandler />

        {/* Property markers */}
        {propertiesWithCoordinates.map((property) => (
            <Marker
              key={property._id}
              position={[
                property.location.coordinates!.latitude,
                property.location.coordinates!.longitude
              ]}
              icon={createPropertyIcon(property.propertyType)}
              eventHandlers={{
                click: () => onPropertyClick?.(property),
              }}
            >
              <Popup>
                <div className="property-popup min-w-[200px]">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={property.images[0].url}
                          alt={property.title}
                          className="w-16 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                          {getPropertyTypeIcon(property.propertyType)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {property.title}
                      </h3>
                      <p className="text-xs text-gray-600 mb-1">
                        {property.location.area}, {property.location.city}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-blue-600">
                          {formatPrice(property.rent)}
                        </span>
                        <span className="text-xs text-gray-500 uppercase">
                          {property.propertyType}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={createUserLocationIcon()}
          >
            <Popup>
              <div className="text-sm">
                <strong>Your Location</strong>
                <br />
                <span className="text-gray-600">
                  {userLocation[0].toFixed(6)}, {userLocation[1].toFixed(6)}
                </span>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      {/* Navigation Controls */}
      {showNavigation && selectedProperty?.location.coordinates && (
        <NavigationControls
          propertyLocation={{
            latitude: selectedProperty.location.coordinates.latitude,
            longitude: selectedProperty.location.coordinates.longitude
          }}
          onGetDirections={handleGetDirections}
          onClearRoute={handleClearRoute}
          isRouting={isRouting}
        />
      )}
      
      <MapLegend />
    </div>
  );
};

export default PropertyMap; 