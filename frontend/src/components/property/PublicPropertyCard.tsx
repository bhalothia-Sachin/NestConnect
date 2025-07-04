import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Lock, Eye, User, ChevronLeft, ChevronRight } from 'lucide-react';

interface PublicProperty {
  _id: string;
  title: string;
  propertyType: string;
  location: {
    city: string;
  };
  images: Array<{
    url: string;
    caption?: string;
  }>;
  owner: {
    name: string;
    role: string;
  };
  views: number;
  createdAt: string;
}

interface PublicPropertyCardProps {
  property: PublicProperty;
}

const PublicPropertyCard: React.FC<PublicPropertyCardProps> = ({ property }) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleCardClick = () => {
    navigate('/login');
  };

  const goToNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (property.images && property.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const goToPreviousImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (property.images && property.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  const hasMultipleImages = property.images && property.images.length > 1;

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden relative cursor-pointer"
    >
      {/* Property Image */}
      <div className="relative h-48 bg-gray-200">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[currentImageIndex].url}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
        
        {/* Image Navigation */}
        {hasMultipleImages && (
          <>
            {/* Image Counter */}
            <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs z-10">
              {currentImageIndex + 1} / {property.images.length}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={goToPreviousImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-colors z-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToNextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-colors z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
        
        {/* Property Type Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold uppercase">
            {property.propertyType}
          </span>
        </div>

        {/* Login Required Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 z-20">
          <div className="text-center text-white">
            <Lock className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Click to login and see details</p>
          </div>
        </div>

        {/* Views Badge */}
        <div className="absolute bottom-3 right-3 z-10">
          <div className="bg-white bg-opacity-90 text-gray-700 px-2 py-1 rounded-full text-xs flex items-center">
            <Eye className="w-3 h-3 mr-1" />
            {property.views}
          </div>
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
            {property.location.city}
          </span>
        </div>

        {/* Owner Info */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium text-gray-900">{property.owner.name}</p>
              <p className="text-xs text-gray-500 capitalize">{property.owner.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicPropertyCard; 