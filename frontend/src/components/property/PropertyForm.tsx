import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  MapPin, 
  IndianRupee, 
  Upload, 
  X, 
  Plus,
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
  Bed,
  Bath,
  Square,
  Building,
  Navigation,
  Map,
  Check
} from 'lucide-react';
import { PropertyType, RentType } from '../../constants/enums';
import { Property, PropertyFormData } from '../../types';
import LocationPicker from './LocationPicker';

interface PropertyFormProps {
  property?: Property;
  onSubmit: (data: FormData) => Promise<void>;
  loading?: boolean;
  mode: 'add' | 'edit';
}

const PropertyForm: React.FC<PropertyFormProps> = ({ 
  property, 
  onSubmit, 
  loading = false, 
  mode 
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    propertyType: PropertyType.FLAT,
    rent: 0,
    rentType: RentType.MONTHLY,
    location: {
      city: '',
      area: '',
      pinCode: '',
      address: ''
    },
    facilities: {
      wifi: false,
      parking: false,
      ac: false,
      kitchen: false,
      laundry: false,
      security: false,
      gym: false,
      pool: false,
      garden: false,
      balcony: false,
      furnished: false,
      petFriendly: false
    },
    propertyDetails: {
      bedrooms: 0,
      bathrooms: 0,
      area: 0,
      floor: 0,
      totalFloors: 0
    },
    contactInfo: {
      showPhone: true,
      showEmail: false
    },
    showOnMap: true
  });

  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  useEffect(() => {
    if (property && mode === 'edit') {
      setFormData({
        title: property.title,
        description: property.description,
        propertyType: property.propertyType,
        rent: property.rent,
        rentType: property.rentType,
        location: property.location,
        facilities: property.facilities,
        propertyDetails: property.propertyDetails,
        contactInfo: property.contactInfo,
        showOnMap: property.showOnMap
      });
      setImageUrls(property.images.map(img => img.url));
    }
  }, [property, mode]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear server errors when user makes changes
    if (serverErrors.length > 0) {
      setServerErrors([]);
    }
  };

  const handleLocationChange = (field: string, value: string) => {
    let processedValue = value;
    
    // Special handling for pin code - only allow numbers and limit to 6 digits
    if (field === 'pinCode') {
      processedValue = value.replace(/\D/g, '').slice(0, 6);
    }
    
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: processedValue
      }
    }));
    if (errors[`location.${field}`]) {
      setErrors(prev => ({ ...prev, [`location.${field}`]: '' }));
    }
    // Clear server errors when user makes changes
    if (serverErrors.length > 0) {
      setServerErrors([]);
    }
  };

  const handleLocationSelect = (coordinates: { latitude: number; longitude: number; address?: string }) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
        },
        // Update address if provided, otherwise keep existing
        address: coordinates.address || prev.location.address
      }
    }));
    
    setShowLocationPicker(false);
    
    // Clear coordinate errors
    if (errors['location.coordinates']) {
      setErrors(prev => ({ ...prev, ['location.coordinates']: '' }));
    }
  };

  const handleFacilityChange = (facility: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      facilities: {
        ...prev.facilities,
        [facility]: value
      }
    }));
  };

  const handlePropertyDetailChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      propertyDetails: {
        ...prev.propertyDetails,
        [field]: value
      }
    }));
    if (errors[`propertyDetails.${field}`]) {
      setErrors(prev => ({ ...prev, [`propertyDetails.${field}`]: '' }));
    }
    // Clear server errors when user makes changes
    if (serverErrors.length > 0) {
      setServerErrors([]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file types and sizes
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];
    
    files.forEach(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValidType) {
        invalidFiles.push(`${file.name} - Invalid file type. Only JPEG, PNG, and WebP are allowed.`);
      } else if (!isValidSize) {
        invalidFiles.push(`${file.name} - File too large. Maximum size is 5MB.`);
      } else {
        validFiles.push(file);
      }
    });

    // Check total image count
    if (validFiles.length + images.length > 10) {
      setErrors(prev => ({ 
        ...prev, 
        images: `Maximum 10 images allowed. You can add ${10 - images.length} more images.` 
      }));
      return;
    }

    // Show errors for invalid files
    if (invalidFiles.length > 0) {
      setErrors(prev => ({ 
        ...prev, 
        images: invalidFiles.join(' ') 
      }));
      return;
    }

    setImages(prev => [...prev, ...validFiles]);
    setErrors(prev => ({ ...prev, images: '' }));
    
    // Clear server errors when user makes changes
    if (serverErrors.length > 0) {
      setServerErrors([]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllErrors = () => {
    setErrors({});
    setServerErrors([]);
    setShowSuccess(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Title validation (5-100 characters)
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }

    // Description validation (20-1000 characters)
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters long';
    } else if (formData.description.trim().length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }

    // Property type validation
    if (!formData.propertyType) {
      newErrors.propertyType = 'Property type is required';
    } else if (!['PG', 'house', 'flat'].includes(formData.propertyType)) {
      newErrors.propertyType = 'Property type must be PG, house, or flat';
    }

    // Rent validation
    if (!formData.rent || formData.rent <= 0) {
      newErrors.rent = 'Rent must be greater than 0';
    } else if (!Number.isFinite(formData.rent)) {
      newErrors.rent = 'Rent must be a valid number';
    }

    // Rent type validation
    if (!formData.rentType || !['monthly', 'yearly'].includes(formData.rentType)) {
      newErrors.rentType = 'Rent type must be monthly or yearly';
    }

    // Location validation
    if (!formData.location.city.trim()) {
      newErrors['location.city'] = 'City is required';
    }

    if (!formData.location.area.trim()) {
      newErrors['location.area'] = 'Area is required';
    }

    if (!formData.location.pinCode.trim()) {
      newErrors['location.pinCode'] = 'Pin code is required';
    } else if (!/^[0-9]{6}$/.test(formData.location.pinCode)) {
      newErrors['location.pinCode'] = 'Please enter a valid 6-digit pin code';
    }

    if (!formData.location.address.trim()) {
      newErrors['location.address'] = 'Address is required';
    }

    // Coordinate validation (optional but if provided, both must be valid)
    if (formData.location.coordinates) {
      const { latitude, longitude } = formData.location.coordinates;
      
      if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
        newErrors['location.coordinates'] = 'Latitude must be a valid number between -90 and 90';
      }
      
      if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
        newErrors['location.coordinates'] = 'Longitude must be a valid number between -180 and 180';
      }
    }

    // Property details validation (non-negative numbers)
    if (formData.propertyDetails.bedrooms < 0) {
      newErrors['propertyDetails.bedrooms'] = 'Bedrooms cannot be negative';
    }
    if (formData.propertyDetails.bathrooms < 0) {
      newErrors['propertyDetails.bathrooms'] = 'Bathrooms cannot be negative';
    }
    if (formData.propertyDetails.area < 0) {
      newErrors['propertyDetails.area'] = 'Area cannot be negative';
    }
    if (formData.propertyDetails.floor < 0) {
      newErrors['propertyDetails.floor'] = 'Floor cannot be negative';
    }
    if (formData.propertyDetails.totalFloors < 0) {
      newErrors['propertyDetails.totalFloors'] = 'Total floors cannot be negative';
    }

    // Floor validation logic
    if (formData.propertyDetails.floor > formData.propertyDetails.totalFloors && formData.propertyDetails.totalFloors > 0) {
      newErrors['propertyDetails.floor'] = 'Floor number cannot be greater than total floors';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    clearAllErrors();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      // Add basic property data
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('propertyType', formData.propertyType);
      formDataToSend.append('rent', formData.rent.toString());
      formDataToSend.append('rentType', formData.rentType);
      formDataToSend.append('showOnMap', formData.showOnMap.toString());
      
      // Add location data
      formDataToSend.append('location[city]', formData.location.city.trim());
      formDataToSend.append('location[area]', formData.location.area.trim());
      formDataToSend.append('location[pinCode]', formData.location.pinCode.trim());
      formDataToSend.append('location[address]', formData.location.address.trim());
      
      // Add coordinates if available
      if (formData.location.coordinates?.latitude && formData.location.coordinates?.longitude) {
        formDataToSend.append('location[coordinates][latitude]', formData.location.coordinates.latitude.toString());
        formDataToSend.append('location[coordinates][longitude]', formData.location.coordinates.longitude.toString());
      }
      
      // Add facilities
      formDataToSend.append('facilities', JSON.stringify(formData.facilities));
      
      // Add property details
      formDataToSend.append('propertyDetails', JSON.stringify(formData.propertyDetails));
      
      // Add contact info
      formDataToSend.append('contactInfo', JSON.stringify(formData.contactInfo));
      
      // Add images
      images.forEach((image, index) => {
        formDataToSend.append('images', image);
      });

      await onSubmit(formDataToSend);
      setShowSuccess(true);
      // Reset form after successful submission
      setTimeout(() => {
        navigate('/my-properties');
      }, 2000);
    } catch (error: any) {
      console.error('Form submission error:', error);
      
      // Handle different types of errors
      if (error.response?.data?.errors) {
        // Backend validation errors
        const backendErrors = error.response.data.errors;
        const fieldErrors: Record<string, string> = {};
        
        backendErrors.forEach((err: any) => {
          const field = err.path || err.param;
          if (field) {
            fieldErrors[field] = err.msg;
          }
        });
        
        setErrors(fieldErrors);
      } else if (error.response?.data?.message) {
        // General server error message
        setServerErrors([error.response.data.message]);
      } else if (error.message) {
        // Network or other errors
        setServerErrors([error.message]);
      } else {
        // Fallback error
        setServerErrors(['An unexpected error occurred. Please try again.']);
      }
      
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const facilityOptions = [
    { key: 'wifi', label: 'WiFi', icon: Wifi },
    { key: 'parking', label: 'Parking', icon: Car },
    { key: 'ac', label: 'Air Conditioning', icon: Snowflake },
    { key: 'kitchen', label: 'Kitchen', icon: Utensils },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'gym', label: 'Gym', icon: Dumbbell },
    { key: 'pool', label: 'Swimming Pool', icon: Waves },
    { key: 'garden', label: 'Garden', icon: TreePine },
    { key: 'furnished', label: 'Furnished', icon: Sofa },
    { key: 'petFriendly', label: 'Pet Friendly', icon: Heart }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {mode === 'add' ? 'Add New Property' : 'Edit Property'}
        </h1>
        <p className="text-gray-600">
          {mode === 'add' 
            ? 'List your property and reach potential tenants' 
            : 'Update your property information'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Property {mode === 'add' ? 'created' : 'updated'} successfully!
                </h3>
                <p className="text-sm text-green-700">
                  Redirecting to your properties...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Server Errors */}
        {serverErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  There were errors with your submission
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {serverErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Home className="w-5 h-5 mr-2" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter property title"
                maxLength={100}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                <p className={`text-xs ${formData.title.length > 90 ? 'text-orange-600' : 'text-gray-500'}`}>
                  {formData.title.length}/100 characters
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type *
              </label>
              <select
                value={formData.propertyType}
                onChange={(e) => handleInputChange('propertyType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={PropertyType.FLAT}>Flat</option>
                <option value={PropertyType.HOUSE}>House</option>
                <option value={PropertyType.PG}>PG</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rent Amount *
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={formData.rent}
                  onChange={(e) => handleInputChange('rent', parseFloat(e.target.value) || 0)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.rent ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                />
              </div>
              {errors.rent && <p className="text-red-500 text-sm mt-1">{errors.rent}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rent Type
              </label>
              <select
                value={formData.rentType}
                onChange={(e) => handleInputChange('rentType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={RentType.MONTHLY}>Monthly</option>
                <option value={RentType.YEARLY}>Yearly</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe your property in detail..."
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
              <p className={`text-xs ${formData.description.length > 900 ? 'text-orange-600' : 'text-gray-500'}`}>
                {formData.description.length}/1000 characters
              </p>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Location Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                value={formData.location.city}
                onChange={(e) => handleLocationChange('city', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors['location.city'] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter city name"
              />
              {errors['location.city'] && <p className="text-red-500 text-sm mt-1">{errors['location.city']}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area/Locality *
              </label>
              <input
                type="text"
                value={formData.location.area}
                onChange={(e) => handleLocationChange('area', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors['location.area'] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter area or locality"
              />
              {errors['location.area'] && <p className="text-red-500 text-sm mt-1">{errors['location.area']}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pin Code *
              </label>
              <input
                type="text"
                value={formData.location.pinCode}
                onChange={(e) => handleLocationChange('pinCode', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors['location.pinCode'] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter 6-digit pin code"
                maxLength={6}
                pattern="[0-9]*"
                inputMode="numeric"
              />
              <div className="flex justify-between items-center mt-1">
                {errors['location.pinCode'] && <p className="text-red-500 text-sm">{errors['location.pinCode']}</p>}
                {formData.location.pinCode.length === 6 && !errors['location.pinCode'] && (
                  <p className="text-green-600 text-xs">✓ Valid pin code format</p>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complete Address *
              </label>
              <textarea
                value={formData.location.address}
                onChange={(e) => handleLocationChange('address', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors['location.address'] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter complete address"
              />
              {errors['location.address'] && <p className="text-red-500 text-sm mt-1">{errors['location.address']}</p>}
            </div>

            {/* Coordinates Section */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Property Coordinates
                </label>
                <button
                  type="button"
                  onClick={() => setShowLocationPicker(true)}
                  className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Map className="w-4 h-4 mr-1" />
                  Set Location
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    value={formData.location.coordinates?.latitude || ''}
                    onChange={(e) => {
                      const lat = parseFloat(e.target.value);
                      if (!isNaN(lat)) {
                        setFormData(prev => ({
                          ...prev,
                          location: {
                            ...prev.location,
                            coordinates: {
                              latitude: lat,
                              longitude: prev.location.coordinates?.longitude || 0
                            }
                          }
                        }));
                      }
                    }}
                    step="any"
                    placeholder="e.g., 20.5937"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    value={formData.location.coordinates?.longitude || ''}
                    onChange={(e) => {
                      const lng = parseFloat(e.target.value);
                      if (!isNaN(lng)) {
                        setFormData(prev => ({
                          ...prev,
                          location: {
                            ...prev.location,
                            coordinates: {
                              latitude: prev.location.coordinates?.latitude || 0,
                              longitude: lng
                            }
                          }
                        }));
                      }
                    }}
                    step="any"
                    placeholder="e.g., 78.9629"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-2 flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const { latitude, longitude } = position.coords;
                          setFormData(prev => ({
                            ...prev,
                            location: {
                              ...prev.location,
                              coordinates: { latitude, longitude }
                            }
                          }));
                        },
                        (error) => {
                          console.error('Error getting location:', error);
                          alert('Unable to get your current location. Please use the map to set location.');
                        }
                      );
                    } else {
                      alert('Geolocation is not supported by this browser.');
                    }
                  }}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Navigation className="w-4 h-4 mr-1" />
                  Use Current Location
                </button>
                
                {formData.location.coordinates?.latitude && formData.location.coordinates?.longitude && (
                  <span className="text-sm text-green-600 flex items-center">
                    <Check className="w-4 h-4 mr-1" />
                    Coordinates set
                  </span>
                )}
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                Coordinates help display your property on the map. You can set them using the map, current location, or enter manually.
              </p>
              {errors['location.coordinates'] && (
                <p className="text-red-500 text-sm mt-1">{errors['location.coordinates']}</p>
              )}
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Property Details
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Bed className="w-4 h-4 mr-1" />
                Bedrooms
              </label>
              <input
                type="number"
                value={formData.propertyDetails.bedrooms}
                onChange={(e) => handlePropertyDetailChange('bedrooms', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors['propertyDetails.bedrooms'] ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                placeholder="0"
              />
              {errors['propertyDetails.bedrooms'] && <p className="text-red-500 text-sm mt-1">{errors['propertyDetails.bedrooms']}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Bath className="w-4 h-4 mr-1" />
                Bathrooms
              </label>
              <input
                type="number"
                value={formData.propertyDetails.bathrooms}
                onChange={(e) => handlePropertyDetailChange('bathrooms', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors['propertyDetails.bathrooms'] ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                placeholder="0"
              />
              {errors['propertyDetails.bathrooms'] && <p className="text-red-500 text-sm mt-1">{errors['propertyDetails.bathrooms']}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Square className="w-4 h-4 mr-1" />
                Area (sq ft)
              </label>
              <input
                type="number"
                value={formData.propertyDetails.area}
                onChange={(e) => handlePropertyDetailChange('area', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors['propertyDetails.area'] ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                placeholder="0"
              />
              {errors['propertyDetails.area'] && <p className="text-red-500 text-sm mt-1">{errors['propertyDetails.area']}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Floor
              </label>
              <input
                type="number"
                value={formData.propertyDetails.floor}
                onChange={(e) => handlePropertyDetailChange('floor', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors['propertyDetails.floor'] ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                placeholder="0"
              />
              {errors['propertyDetails.floor'] && <p className="text-red-500 text-sm mt-1">{errors['propertyDetails.floor']}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Floors
              </label>
              <input
                type="number"
                value={formData.propertyDetails.totalFloors}
                onChange={(e) => handlePropertyDetailChange('totalFloors', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors['propertyDetails.totalFloors'] ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                placeholder="0"
              />
              {errors['propertyDetails.totalFloors'] && <p className="text-red-500 text-sm mt-1">{errors['propertyDetails.totalFloors']}</p>}
            </div>
          </div>
        </div>

        {/* Facilities */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Facilities</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {facilityOptions.map(({ key, label, icon: Icon }) => (
              <label key={key} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.facilities[key as keyof typeof formData.facilities]}
                  onChange={(e) => handleFacilityChange(key, e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Icon className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Preferences</h2>
          
          <div className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.contactInfo.showPhone}
                onChange={(e) => handleInputChange('contactInfo', { ...formData.contactInfo, showPhone: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show phone number to potential tenants</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.contactInfo.showEmail}
                onChange={(e) => handleInputChange('contactInfo', { ...formData.contactInfo, showEmail: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show email address to potential tenants</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showOnMap}
                onChange={(e) => handleInputChange('showOnMap', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show property on map</span>
            </label>
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Property Images</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images (Max 10, 5MB each)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
            </div>

            {/* Display uploaded images */}
            {(images.length > 0 || imageUrls.length > 0) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imageUrls.map((url, index) => (
                  <div key={`url-${index}`} className="relative">
                    <img
                      src={url}
                      alt={`Property ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImageUrl(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {images.map((image, index) => (
                  <div key={`file-${index}`} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Property ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/my-properties')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading || isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {mode === 'add' ? 'Creating...' : 'Updating...'}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                {mode === 'add' ? 'Create Property' : 'Update Property'}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <LocationPicker
          onLocationSelect={handleLocationSelect}
          initialCoordinates={formData.location.coordinates || undefined}
          onClose={() => setShowLocationPicker(false)}
        />
      )}
    </div>
  );
};

export default PropertyForm; 