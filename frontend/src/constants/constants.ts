// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
    PROFILE: '/api/auth/profile',
    CHANGE_PASSWORD: '/api/auth/change-password',
  },
  
  // Properties
  PROPERTIES: {
    LIST: 'api/properties',
    FEATURED: '/api/properties/featured',
    MY_PROPERTIES: '/api/properties/my-properties',
    DETAIL: (id: string) => `/api/properties/${id}`,
    CREATE: '/api/properties',
    UPDATE: (id: string) => `/api/properties/${id}`,
    DELETE: (id: string) => `/api/properties/${id}`,
  },
  
  // Messages
  MESSAGES: {
    LIST: '/api/messages',
    SEND: '/api/messages',
    MARK_READ: (id: string) => `/api/messages/${id}/read`,
  },
  
  // Upload
  UPLOAD: {
    IMAGE: '/api/upload/image',
  },
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 128,
  },
  PHONE: {
    PATTERN: /^[0-9]{10}$/,
    LENGTH: 10,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
} as const;

// UI Constants
export const UI_CONSTANTS = {
  // Loading States
  LOADING_DELAY: 300,
  
  // Toast Durations
  TOAST_DURATION: 4000,
  TOAST_DURATION_SHORT: 2000,
  
  // Debounce Delays
  SEARCH_DEBOUNCE: 300,
  FORM_DEBOUNCE: 500,
  
  // Pagination
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
  
  // File Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  
  // Map
  DEFAULT_ZOOM: 12,
  DEFAULT_CENTER: {
    lat: 20.5937,
    lng: 78.9629, // India center
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  REGISTER: 'Registration successful!',
  LOGOUT: 'Logged out successfully',
  PROFILE_UPDATE: 'Profile updated successfully',
  PASSWORD_CHANGE: 'Password changed successfully',
  PROPERTY_CREATE: 'Property created successfully!',
  PROPERTY_UPDATE: 'Property updated successfully!',
  PROPERTY_DELETE: 'Property deleted successfully!',
  MESSAGE_SENT: 'Message sent successfully!',
} as const;

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROPERTIES: '/properties',
  PROPERTY_DETAIL: (id: string) => `/properties/${id}`,
  ADD_PROPERTY: '/add-property',
  EDIT_PROPERTY: (id: string) => `/edit-property/${id}`,
  MESSAGES: '/messages',
  PROFILE: '/profile',
} as const; 