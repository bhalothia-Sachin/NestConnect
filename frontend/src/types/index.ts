import { UserRole, PropertyType, RentType, ViewMode, PropertyStatus, MessageStatus } from '../constants/enums';

// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  profileImage?: string;
  isVerified: boolean;
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
}

// Property Types
export interface PropertyLocation {
  city: string;
  area: string;
  pinCode: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface PropertyFacilities {
  wifi: boolean;
  parking: boolean;
  ac: boolean;
  kitchen: boolean;
  laundry: boolean;
  security: boolean;
  gym: boolean;
  pool: boolean;
  garden: boolean;
  balcony: boolean;
  furnished: boolean;
  petFriendly: boolean;
}

export interface PropertyDetails {
  bedrooms: number;
  bathrooms: number;
  area: number;
  floor: number;
  totalFloors: number;
}

export interface PropertyImage {
  url: string;
  caption: string;
}

export interface PropertyContactInfo {
  showPhone: boolean;
  showEmail: boolean;
}

export interface PropertyOwner {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

export interface Property {
  _id: string;
  owner: PropertyOwner;
  title: string;
  description: string;
  propertyType: PropertyType;
  rent: number;
  rentType: RentType;
  location: PropertyLocation;
  facilities: PropertyFacilities;
  propertyDetails: PropertyDetails;
  images: PropertyImage[];
  isAvailable: boolean;
  isVerified: boolean;
  showOnMap: boolean;
  views: number;
  contactInfo: PropertyContactInfo;
  status?: PropertyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFilters {
  city?: string;
  area?: string;
  propertyType?: PropertyType;
  minRent?: number;
  maxRent?: number;
  facilities?: string[];
  bedrooms?: number;
  bathrooms?: number;
  rentType?: RentType;
  isAvailable?: boolean;
}

export interface PropertyFormData {
  title: string;
  description: string;
  propertyType: PropertyType;
  rent: number;
  rentType: RentType;
  location: PropertyLocation;
  facilities: PropertyFacilities;
  propertyDetails: PropertyDetails;
  contactInfo: PropertyContactInfo;
  showOnMap: boolean;
}

// Message Types
export interface Message {
  _id: string;
  sender: User;
  recipient: User;
  property?: Property;
  subject: string;
  content: string;
  status: MessageStatus;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageFormData {
  recipientId: string;
  propertyId?: string;
  subject: string;
  content: string;
}

// Auth Types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
}

// Property Context Types
export interface PropertyState {
  properties: Property[];
  featuredProperties: Property[];
  userProperties: Property[];
  currentProperty: Property | null;
  loading: boolean;
  filters: PropertyFilters;
  viewMode: ViewMode;
  totalCount: number;
  currentPage: number;
  hasMore: boolean;
}

export interface PropertyContextType extends PropertyState {
  fetchProperties: (filters?: PropertyFilters, page?: number) => Promise<void>;
  fetchFeaturedProperties: () => Promise<void>;
  fetchUserProperties: () => Promise<void>;
  fetchPropertyById: (id: string) => Promise<void>;
  createProperty: (propertyData: PropertyFormData) => Promise<void>;
  updateProperty: (id: string, propertyData: Partial<PropertyFormData>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  setFilters: (filters: PropertyFilters) => void;
  setViewMode: (mode: ViewMode) => void;
  clearFilters: () => void;
}

// API Response Types
export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  error?: string;
  errors?: any[];
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PropertyListResponse extends PaginatedResponse<Property> {
  properties: Property[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'tel' | 'number' | 'select' | 'textarea' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | undefined;
  };
}

// UI Types
export interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  style?: React.CSSProperties;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  location?: string;
  propertyType?: PropertyType;
  priceRange?: {
    min: number;
    max: number;
  };
  bedrooms?: number;
  bathrooms?: number;
  facilities?: string[];
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
  label: string;
}

// File Upload Types
export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

// Dashboard Types
export interface DashboardStats {
  totalProperties: number;
  totalViews: number;
  totalMessages: number;
  activeListings: number;
  monthlyViews: number;
  monthlyInquiries: number;
}

// Map Types
export interface MapMarker {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  title: string;
  property: Property;
}

// Pagination Types
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
  pageSize: number;
} 