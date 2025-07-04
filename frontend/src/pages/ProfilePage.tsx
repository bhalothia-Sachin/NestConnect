import React from 'react';
import { User } from 'lucide-react';

const ProfilePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account settings and information</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Profile Management Coming Soon</h3>
            <p className="text-gray-500 mb-4">This feature is under development</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 