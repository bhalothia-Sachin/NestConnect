import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Wifi, Car, Snowflake } from 'lucide-react';
import { Property } from '../../types';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getFacilityIcon = (facility: string) => {
    switch (facility) {
      case 'wifi':
        return <Wifi className="w-4 h-4" />;
      case 'parking':
        return <Car className="w-4 h-4" />;
      case 'ac':
        return <Snowflake className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getActiveFacilities = () => {
    const facilities = [];
    if (property.facilities.wifi) facilities.push('wifi');
    if (property.facilities.parking) facilities.push('parking');
    if (property.facilities.ac) facilities.push('ac');
    return facilities.slice(0, 3); // Show only first 3 facilities
  };

  return (
    <Link to={`/properties/${property._id}`} className="block">
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        {/* Property Image */}
        <div className="relative h-48 bg-gray-200">
          {property.images && property.images.length > 0 ? (
            <img
              src={property.images[0].url}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
          
          {/* Property Type Badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold uppercase">
              {property.propertyType}
            </span>
          </div>

          {/* Price Badge */}
          <div className="absolute top-3 right-3">
            <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-bold shadow-md">
              {formatPrice(property.rent)}
              <span className="text-xs text-gray-500 ml-1">
                /{property.rentType}
              </span>
            </span>
          </div>
        </div>

        {/* Property Details */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
            {property.title}
          </h3>
          
          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">
              {property.location.area}, {property.location.city}
            </span>
          </div>

          {/* Property Stats */}
          <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
            {property.propertyDetails.bedrooms > 0 && (
              <div className="flex items-center">
                <Bed className="w-4 h-4 mr-1" />
                <span>{property.propertyDetails.bedrooms} Beds</span>
              </div>
            )}
            {property.propertyDetails.bathrooms > 0 && (
              <div className="flex items-center">
                <Bath className="w-4 h-4 mr-1" />
                <span>{property.propertyDetails.bathrooms} Baths</span>
              </div>
            )}
            {property.propertyDetails.area > 0 && (
              <div className="flex items-center">
                <Square className="w-4 h-4 mr-1" />
                <span>{property.propertyDetails.area} sq ft</span>
              </div>
            )}
          </div>

          {/* Facilities */}
          {getActiveFacilities().length > 0 && (
            <div className="flex items-center space-x-2 mb-3">
              {getActiveFacilities().map((facility) => (
                <div key={facility} className="text-blue-600">
                  {getFacilityIcon(facility)}
                </div>
              ))}
            </div>
          )}

          {/* Owner Info */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {property.owner.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-900">{property.owner.name}</p>
                <p className="text-xs text-gray-500 capitalize">{property.owner.role}</p>
              </div>
            </div>
            
            {property.isVerified && (
              <div className="flex items-center text-green-600">
                <span className="text-xs font-medium">✓ Verified</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard; 