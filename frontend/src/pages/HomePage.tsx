import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProperty } from '../contexts/PropertyContext';
import { useAuth } from '../contexts/AuthContext';
import { propertyAPI } from '../utils/api';
import { Search, MapPin, Home, Shield, Users, Map } from 'lucide-react';
import PropertyCard from '../components/property/PropertyCard';
import PublicPropertyCard from '../components/property/PublicPropertyCard';
import SearchFilters from '../components/property/SearchFilters';

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

const HomePage: React.FC = () => {
  const { properties, fetchProperties, loading } = useProperty();
  const { isAuthenticated } = useAuth();
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [publicFeaturedProperties, setPublicFeaturedProperties] = useState<PublicProperty[]>([]);
  const [publicLoading, setPublicLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProperties();
    } else {
      fetchPublicFeaturedProperties();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      // Show first 6 properties as featured for authenticated users
      setFeaturedProperties(properties.slice(0, 6));
    }
  }, [properties, isAuthenticated]);

  const fetchPublicFeaturedProperties = async () => {
    try {
      setPublicLoading(true);
      const response = await propertyAPI.getPublicFeaturedProperties();
      setPublicFeaturedProperties(response.data.properties);
    } catch (error) {
      console.error('Error fetching public featured properties:', error);
    } finally {
      setPublicLoading(false);
    }
  };

  const browseLink = isAuthenticated ? '/properties' : '/browse';

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect Home
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Discover properties in your area with our location-based listing platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={browseLink}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Browse Properties
              </Link>
              <Link
                to="/register"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                List Your Property
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-center mb-6">Find Your Perfect Property</h2>
            <SearchFilters />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose NestConnect?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform connects homeowners, brokers, and tenants with a seamless 
              experience for property discovery and listing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Location-Based Search</h3>
              <p className="text-gray-600">
                Find properties in your preferred area with our advanced location filtering system.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Listings</h3>
              <p className="text-gray-600">
                All properties are verified to ensure you get authentic and reliable information.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Direct Communication</h3>
              <p className="text-gray-600">
                Connect directly with property owners and brokers without revealing personal details.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
            <Link
              to={browseLink}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1"
            >
              <span>View All</span>
              <Search className="w-4 h-4" />
            </Link>
          </div>

          {isAuthenticated ? (
            // Show full property cards for authenticated users
            <>
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
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredProperties.map((property) => (
                    <PropertyCard key={property._id} property={property} />
                  ))}
                </div>
              )}

              {!loading && featuredProperties.length === 0 && (
                <div className="text-center py-12">
                  <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Properties Found</h3>
                  <p className="text-gray-500">Be the first to list a property in your area!</p>
                </div>
              )}
            </>
          ) : (
            // Show public property cards for non-authenticated users
            <>
              {publicLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                      <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {publicFeaturedProperties.map((property) => (
                    <PublicPropertyCard key={property._id} property={property} />
                  ))}
                </div>
              )}

              {!publicLoading && publicFeaturedProperties.length === 0 && (
                <div className="text-center py-12">
                  <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Properties Found</h3>
                  <p className="text-gray-500">Be the first to list a property in your area!</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to List Your Property?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of homeowners and brokers who trust NestConnect
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started
            </Link>
            <Link
              to={browseLink}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Browse Properties
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 