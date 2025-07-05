import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { propertyAPI } from '../utils/api';
import PropertyForm from '../components/property/PropertyForm';

const AddPropertyPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    try {
      setLoading(true);
      await propertyAPI.createProperty(formData);
      toast.success('Property created successfully!');
      navigate('/my-properties');
    } catch (error: any) {
      console.error('Error creating property:', error);
      toast.error(error.response?.data?.message || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PropertyForm
        mode="add"
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
};

export default AddPropertyPage; 