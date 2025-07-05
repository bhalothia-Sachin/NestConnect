import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProperty } from '../contexts/PropertyContext';
import PropertyImageGallery from '../components/property/PropertyImageGallery';
import PropertyMap from '../components/property/PropertyMap';
import { MapPin, Bed, Bath, Square, Wifi, Car, Snowflake, Phone, Mail, MessageSquare } from 'lucide-react';

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentProperty, loading, fetchPropertyById } = useProperty();

  useEffect(() => {
    if (id) {
      fetchPropertyById(id);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentProperty) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600">The property you're looking for doesn't exist.</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Property Images */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <PropertyImageGallery 
            images={currentProperty.images}
            title={currentProperty.title}
            showThumbnails={true}
            autoPlay={false}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Property Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {currentProperty.title}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>
                      {currentProperty.location.address}, {currentProperty.location.area}, {currentProperty.location.city} - {currentProperty.location.pinCode}
                    </span>
                  </div>
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold uppercase">
                    {currentProperty.propertyType}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {formatPrice(currentProperty.rent)}
                  </div>
                  <div className="text-gray-500">
                    per {currentProperty.rentType}
                  </div>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">
                {currentProperty.description}
              </p>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {currentProperty.propertyDetails.bedrooms > 0 && (
                  <div className="text-center">
                    <Bed className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-lg font-semibold">{currentProperty.propertyDetails.bedrooms}</div>
                    <div className="text-sm text-gray-600">Bedrooms</div>
                  </div>
                )}
                {currentProperty.propertyDetails.bathrooms > 0 && (
                  <div className="text-center">
                    <Bath className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-lg font-semibold">{currentProperty.propertyDetails.bathrooms}</div>
                    <div className="text-sm text-gray-600">Bathrooms</div>
                  </div>
                )}
                {currentProperty.propertyDetails.area > 0 && (
                  <div className="text-center">
                    <Square className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-lg font-semibold">{currentProperty.propertyDetails.area}</div>
                    <div className="text-sm text-gray-600">Sq Ft</div>
                  </div>
                )}
                {currentProperty.propertyDetails.floor > 0 && (
                  <div className="text-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">{currentProperty.propertyDetails.floor}</span>
                    </div>
                    <div className="text-sm text-gray-600">Floor</div>
                  </div>
                )}
              </div>
            </div>

            {/* Facilities */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Facilities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(currentProperty.facilities).map(([facility, available]) => (
                  available && (
                    <div key={facility} className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <span className="text-gray-700 capitalize">{facility}</span>
                    </div>
                  )
                ))}
              </div>
            </div>

            {/* Property Location & Navigation */}
            {currentProperty.location.coordinates && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Location & Navigation</h2>
                <div className="mb-4">
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span className="font-medium">Property Location</span>
                  </div>
                  <p className="text-gray-700">
                    {currentProperty.location.address}, {currentProperty.location.area}, {currentProperty.location.city} - {currentProperty.location.pinCode}
                  </p>
                </div>
                <PropertyMap
                  properties={[currentProperty]}
                  showNavigation={true}
                  selectedProperty={currentProperty}
                  center={[
                    currentProperty.location.coordinates.latitude,
                    currentProperty.location.coordinates.longitude
                  ]}
                  zoom={15}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Contact Owner */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Owner</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {currentProperty.owner.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{currentProperty.owner.name}</div>
                    <div className="text-sm text-gray-600 capitalize">{currentProperty.owner.role}</div>
                  </div>
                </div>

                {currentProperty.contactInfo.showPhone && (
                  <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                    <Phone className="w-4 h-4" />
                    <span>Call Owner</span>
                  </button>
                )}

                {currentProperty.contactInfo.showEmail && (
                  <button className="w-full flex items-center justify-center space-x-2 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">
                    <Mail className="w-4 h-4" />
                    <span>Send Email</span>
                  </button>
                )}

                <button className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </div>
            </div>

            {/* Property Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Availability</span>
                  <span className={`font-semibold ${currentProperty.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                    {currentProperty.isAvailable ? 'Available' : 'Not Available'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Verification</span>
                  <span className={`font-semibold ${currentProperty.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                    {currentProperty.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-semibold">{currentProperty.views}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Listed</span>
                  <span className="font-semibold">
                    {new Date(currentProperty.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage; 