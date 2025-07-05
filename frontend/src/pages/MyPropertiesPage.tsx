import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { propertyAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { 
  Home, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  MapPin, 
  IndianRupee,
  Calendar,
  Users,
  Wifi,
  Car,
  Snowflake,
  Utensils,
  Shield,
  Dumbbell,
  Waves,
  TreePine,
  Sofa,
  Heart,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Property } from '../types';

const MyPropertiesPage: React.FC = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [imageIndices, setImageIndices] = useState<Record<string, number>>({});
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    propertyId: string | null;
    propertyTitle: string;
  }>({
    isOpen: false,
    propertyId: null,
    propertyTitle: ''
  });

  useEffect(() => {
    fetchMyProperties();
  }, []);

  const fetchMyProperties = async () => {
    try {
      setLoading(true);
      const response = await propertyAPI.getMyProperties();
      setProperties(response.data.properties);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (propertyId: string) => {
    try {
      setUpdating(propertyId);
      const response = await propertyAPI.toggleAvailability(propertyId);
      
      setProperties(prev => 
        prev.map(property => 
          property._id === propertyId 
            ? { ...property, isAvailable: response.data.property.isAvailable }
            : property
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update property');
    } finally {
      setUpdating(null);
    }
  };



  const openDeleteModal = (propertyId: string, propertyTitle: string) => {
    setDeleteModal({
      isOpen: true,
      propertyId,
      propertyTitle
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      propertyId: null,
      propertyTitle: ''
    });
  };

  const confirmDeleteProperty = async () => {
    if (!deleteModal.propertyId) return;

    try {
      setUpdating(deleteModal.propertyId);
      await propertyAPI.deleteProperty(deleteModal.propertyId);
      setProperties(prev => prev.filter(property => property._id !== deleteModal.propertyId));
      closeDeleteModal();
      toast.success('Property deleted successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete property');
      toast.error(err.response?.data?.message || 'Failed to delete property');
    } finally {
      setUpdating(null);
    }
  };

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'house':
        return <Home className="w-4 h-4" />;
      case 'flat':
        return <Home className="w-4 h-4" />;
      case 'PG':
        return <Users className="w-4 h-4" />;
      default:
        return <Home className="w-4 h-4" />;
    }
  };

  const getFacilityIcon = (facility: string) => {
    switch (facility) {
      case 'wifi':
        return <Wifi className="w-4 h-4" />;
      case 'parking':
        return <Car className="w-4 h-4" />;
      case 'ac':
        return <Snowflake className="w-4 h-4" />;
      case 'kitchen':
        return <Utensils className="w-4 h-4" />;
      case 'security':
        return <Shield className="w-4 h-4" />;
      case 'gym':
        return <Dumbbell className="w-4 h-4" />;
      case 'pool':
        return <Waves className="w-4 h-4" />;
      case 'garden':
        return <TreePine className="w-4 h-4" />;
      case 'furnished':
        return <Sofa className="w-4 h-4" />;
      case 'petFriendly':
        return <Heart className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getAvailableFacilities = (facilities: any) => {
    return Object.entries(facilities)
      .filter(([_, value]) => value === true)
      .map(([key, _]) => key);
  };

  const goToNextImage = (propertyId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const property = properties.find(p => p._id === propertyId);
    if (property && property.images && property.images.length > 1) {
      const currentIndex = imageIndices[propertyId] || 0;
      const nextIndex = (currentIndex + 1) % property.images.length;
      setImageIndices(prev => ({ ...prev, [propertyId]: nextIndex }));
    }
  };

  const goToPreviousImage = (propertyId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const property = properties.find(p => p._id === propertyId);
    if (property && property.images && property.images.length > 1) {
      const currentIndex = imageIndices[propertyId] || 0;
      const prevIndex = (currentIndex - 1 + property.images.length) % property.images.length;
      setImageIndices(prev => ({ ...prev, [propertyId]: prevIndex }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Properties</h1>
              <p className="text-gray-600">Manage your property listings</p>
            </div>
            <Link
              to="/add-property"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-2xl font-semibold text-gray-900">{properties.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Listed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {properties.filter(p => p.isAvailable).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <EyeOff className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Delisted</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {properties.filter(p => !p.isAvailable).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {properties.reduce((sum, p) => sum + (p.views || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Properties List */}
        {properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Properties Yet</h3>
            <p className="text-gray-500 mb-6">Start by adding your first property listing</p>
            <Link
              to="/add-property"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {properties.map((property) => (
              <div key={property._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Property Image */}
                <div className="relative h-48 bg-gray-200">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={property.images[imageIndices[property._id] || 0].url}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Image Navigation */}
                  {property.images && property.images.length > 1 && (
                    <>
                      {/* Image Counter */}
                      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                        {(imageIndices[property._id] || 0) + 1} / {property.images.length}
                      </div>

                      {/* Navigation Arrows */}
                      <button
                        onClick={(e) => goToPreviousImage(property._id, e)}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => goToNextImage(property._id, e)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute bottom-4 left-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      property.isAvailable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {property.isAvailable ? 'Listed' : 'Delisted'}
                    </span>
                  </div>

                  {/* Views Badge */}
                  <div className="absolute bottom-4 right-4">
                    <span className="px-2 py-1 bg-black bg-opacity-50 text-white rounded-full text-xs">
                      {property.views || 0} views
                    </span>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      {getPropertyTypeIcon(property.propertyType)}
                      <span className="ml-2 text-sm text-gray-500 capitalize">
                        {property.propertyType}
                      </span>
                    </div>
                    <div className="flex items-center text-lg font-semibold text-gray-900">
                      <IndianRupee className="w-4 h-4 mr-1" />
                      {property.rent?.toLocaleString()}
                      <span className="text-sm text-gray-500 ml-1">
                        /{property.rentType}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {property.title}
                  </h3>

                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                      {property.location?.area}, {property.location?.city}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {property.description}
                  </p>

                  {/* Property Details */}
                  <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                    {property.propertyDetails?.bedrooms && (
                      <span>{property.propertyDetails.bedrooms} Beds</span>
                    )}
                    {property.propertyDetails?.bathrooms && (
                      <span>{property.propertyDetails.bathrooms} Baths</span>
                    )}
                    {property.propertyDetails?.area && (
                      <span>{property.propertyDetails.area} sq ft</span>
                    )}
                  </div>

                  {/* Facilities */}
                  {property.facilities && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {getAvailableFacilities(property.facilities).slice(0, 5).map((facility) => (
                          <div key={facility} className="flex items-center text-xs text-gray-600">
                            {getFacilityIcon(facility)}
                            <span className="ml-1 capitalize">{facility}</span>
                          </div>
                        ))}
                        {getAvailableFacilities(property.facilities).length > 5 && (
                          <span className="text-xs text-gray-500">
                            +{getAvailableFacilities(property.facilities).length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <Link
                        to={`/properties/${property._id}`}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View
                      </Link>
                      <Link
                        to={`/edit-property/${property._id}`}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700 font-medium"
                      >
                        Edit
                      </Link>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleToggleAvailability(property._id)}
                        disabled={updating === property._id}
                        className={`px-3 py-1 text-sm font-medium rounded ${
                          property.isAvailable
                            ? 'text-orange-600 hover:text-orange-700'
                            : 'text-green-600 hover:text-green-700'
                        } ${updating === property._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {updating === property._id ? (
                          'Updating...'
                        ) : property.isAvailable ? (
                          'Delist'
                        ) : (
                          'List'
                        )}
                      </button>

                      <button
                        onClick={() => openDeleteModal(property._id, property.title)}
                        disabled={updating === property._id}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDeleteProperty}
          title="Delete Property"
          message={`Are you sure you want to delete "${deleteModal.propertyTitle}"? This action cannot be undone and all property data will be permanently removed.`}
          confirmText="Delete Property"
          cancelText="Cancel"
          type="danger"
          loading={updating === deleteModal.propertyId}
        />
      </div>
    </div>
  );
};

export default MyPropertiesPage; 