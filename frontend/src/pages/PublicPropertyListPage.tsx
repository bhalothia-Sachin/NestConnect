import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { propertyAPI } from '../utils/api';
import PublicPropertyCard from '../components/property/PublicPropertyCard';
import SearchFilters from '../components/property/SearchFilters';
import { Grid, Map, Filter, Home, Lock, Users, ArrowRight } from 'lucide-react';
import { ViewMode } from '../constants/enums';

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

const PublicPropertyListPage: React.FC = () => {
  const [properties, setProperties] = useState<PublicProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.GRID);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12
  });
  const [searchParams] = useSearchParams();

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      searchParams.forEach((value, key) => {
        filters[key] = value;
      });
      
      const response = await propertyAPI.getPublicProperties(filters);
      setProperties(response.data.properties);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Login CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Find Your Perfect Home</h1>
            <p className="text-xl mb-8 text-blue-100">
              Browse thousands of verified properties. Login to see full details and contact owners.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/login"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center"
              >
                <Lock className="w-5 h-5 mr-2" />
                Login to See Details
              </Link>
              <Link
                to="/register"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200 flex items-center"
              >
                <Users className="w-5 h-5 mr-2" />
                Join Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <div className="text-sm text-gray-500">
              Login to see rent, contact info, and full details
            </div>
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

        {/* Login Reminder Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Lock className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-blue-900">
                  Want to see full property details?
                </h3>
                <p className="text-sm text-blue-700">
                  Login to view rent, contact information, facilities, and more
                </p>
              </div>
            </div>
            <Link
              to="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center"
            >
              Login Now
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Properties Grid */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PublicPropertyCard key={property._id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Properties Found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set('page', page.toString());
                    window.history.pushState({}, '', `?${newParams.toString()}`);
                    fetchProperties();
                  }}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    page === pagination.currentPage
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicPropertyListPage; 