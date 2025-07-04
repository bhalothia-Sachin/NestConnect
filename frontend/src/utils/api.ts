import axios from 'axios';
import config from '../config/config';

// Configure axios with base URL from config
const api = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login for 401 errors if user was previously authenticated
    // This prevents redirecting during login attempts with wrong credentials
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Property API functions
export const propertyAPI = {
  // Get all properties with filters
  getProperties: (params = {}) => api.get('api/properties', { params }),
  
  // Get all properties with limited view (public access)
  getPublicProperties: (params = {}) => api.get('api/properties/public', { params }),
  
  // Get featured properties with limited view (public access)
  getPublicFeaturedProperties: () => api.get('api/properties/public/featured'),
  
  // Get property by ID
  getProperty: (id: string) => api.get(`api/properties/${id}`),
  
  // Get featured properties
  getFeaturedProperties: () => api.get('api/properties/featured'),
  
  // Get user's properties
  getMyProperties: () => api.get('api/properties/my-properties'),
  
  // Create new property
  createProperty: (data: FormData) => api.post('api/properties', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // Update property
  updateProperty: (id: string, data: FormData) => api.put(`/properties/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // Delete property
  deleteProperty: (id: string) => api.delete(`api/properties/${id}`),
  
  // Toggle property availability (list/delist)
  toggleAvailability: (id: string) => api.patch(`api/properties/${id}/toggle-availability`),
  
  // List property (make available)
  listProperty: (id: string) => api.patch(`api/properties/${id}/list`),
  
  // Delist property (make unavailable)
  delistProperty: (id: string) => api.patch(`api/properties/${id}/delist`),
  
  // Get facilities list
  getFacilities: () => api.get('api/properties/facilities/list'),
  
  // Get properties for map
  getMapProperties: (params = {}) => api.get('/properties/map', { params }),
};

// Auth API functions
export const authAPI = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) => 
    api.put('/auth/change-password', data),
};

// Message API functions
export const messageAPI = {
  getMessages: () => api.get('/messages'),
  getConversation: (propertyId: string) => api.get(`/messages/${propertyId}`),
  sendMessage: (data: { propertyId: string; message: string }) => api.post('/messages', data),
};

export default api; 