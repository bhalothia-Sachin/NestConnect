import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useProperty } from '../contexts/PropertyContext';
import PropertyCard from '../components/property/PropertyCard';
import PropertyMap from '../components/property/PropertyMap';
import SearchFilters from '../components/property/SearchFilters';
import { Grid, Map, Filter, Home } from 'lucide-react';
import { ViewMode } from '../constants/enums';

const PropertyListPage: React.FC = () => {
  const { properties, loading, viewMode, setViewMode, fetchProperties } = useProperty();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const filters: any = {};
    searchParams.forEach((value, key) => {
      filters[key] = value;
    });
    fetchProperties();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Properties</h1>
          <p className="text-gray-600">Find your perfect home from our verified listings</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <SearchFilters />
        </div>

        {/* View Toggle and Results */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              {properties.length} properties found
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(ViewMode.GRID)}
              className={`p-2 rounded-md ${
                viewMode === ViewMode.GRID 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode(ViewMode.MAP)}
              className={`p-2 rounded-md ${
                viewMode === ViewMode.MAP 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <Map className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Properties Grid or Map */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : properties.length > 0 ? (
          viewMode === ViewMode.MAP ? (
            <PropertyMap 
              properties={properties}
              onPropertyClick={(property) => navigate(`/properties/${property._id}`)}
              showNavigation={true}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Properties Found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyListPage; 