import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { propertyAPI } from '../utils/api';
import PropertyForm from '../components/property/PropertyForm';
import { Property } from '../types';

const EditPropertyPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      setFetching(true);
      const response = await propertyAPI.getProperty(id!);
      setProperty(response.data.property);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch property');
      toast.error(error.response?.data?.message || 'Failed to fetch property');
      console.error('Error fetching property:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      setLoading(true);
      await propertyAPI.updateProperty(id!, formData);
      toast.success('Property updated successfully!');
      navigate('/my-properties');
    } catch (error: any) {
      console.error('Error updating property:', error);
      toast.error(error.response?.data?.message || 'Failed to update property');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/my-properties')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to My Properties
          </button>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-4">The property you're trying to edit doesn't exist.</p>
          <button
            onClick={() => navigate('/my-properties')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to My Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PropertyForm
        property={property}
        mode="edit"
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
};

export default EditPropertyPage; 