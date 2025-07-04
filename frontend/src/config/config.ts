// Environment configuration
const config = {
  // API Configuration
  api: {
    baseURL: process.env.REACT_APP_API_BASE_URL || '',
    timeout: 10000,
  },
  
  // App Configuration
  app: {
    name: 'NestConnect',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },
  
  // Feature Flags
  features: {
    enableMapView: true,
    enableFileUpload: true,
    enableNotifications: true,
  },
  
  // Pagination
  pagination: {
    defaultPageSize: 12,
    maxPageSize: 50,
  },
  
  // File Upload
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
};

export default config; 