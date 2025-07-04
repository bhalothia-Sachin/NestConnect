import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Property, PropertyFilters, PropertyState, PropertyContextType, PropertyFormData } from '../types';
import { API_ENDPOINTS, SUCCESS_MESSAGES, ERROR_MESSAGES, UI_CONSTANTS } from '../constants/constants';
import { ViewMode } from '../constants/enums';

type PropertyAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PROPERTIES'; payload: Property[] }
  | { type: 'SET_FEATURED_PROPERTIES'; payload: Property[] }
  | { type: 'SET_USER_PROPERTIES'; payload: Property[] }
  | { type: 'SET_CURRENT_PROPERTY'; payload: Property | null }
  | { type: 'ADD_PROPERTY'; payload: Property }
  | { type: 'UPDATE_PROPERTY'; payload: Property }
  | { type: 'DELETE_PROPERTY'; payload: string }
  | { type: 'SET_FILTERS'; payload: PropertyFilters }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_TOTAL_COUNT'; payload: number }
  | { type: 'SET_CURRENT_PAGE'; payload: number }
  | { type: 'SET_HAS_MORE'; payload: boolean }
  | { type: 'APPEND_PROPERTIES'; payload: Property[] };

const initialState: PropertyState = {
  properties: [],
  featuredProperties: [],
  userProperties: [],
  currentProperty: null,
  loading: false,
  filters: {},
  viewMode: ViewMode.GRID,
  totalCount: 0,
  currentPage: 1,
  hasMore: true,
};

const propertyReducer = (state: PropertyState, action: PropertyAction): PropertyState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_PROPERTIES':
      return { ...state, properties: action.payload };
    case 'SET_FEATURED_PROPERTIES':
      return { ...state, featuredProperties: action.payload };
    case 'SET_USER_PROPERTIES':
      return { ...state, userProperties: action.payload };
    case 'SET_CURRENT_PROPERTY':
      return { ...state, currentProperty: action.payload };
    case 'ADD_PROPERTY':
      return { ...state, properties: [action.payload, ...state.properties] };
    case 'UPDATE_PROPERTY':
      return {
        ...state,
        properties: state.properties.map(p => 
          p._id === action.payload._id ? action.payload : p
        ),
        userProperties: state.userProperties.map(p => 
          p._id === action.payload._id ? action.payload : p
        ),
        currentProperty: state.currentProperty?._id === action.payload._id 
          ? action.payload 
          : state.currentProperty,
      };
    case 'DELETE_PROPERTY':
      return {
        ...state,
        properties: state.properties.filter(p => p._id !== action.payload),
        userProperties: state.userProperties.filter(p => p._id !== action.payload),
      };
    case 'SET_FILTERS':
      return { ...state, filters: action.payload, currentPage: 1 };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'SET_TOTAL_COUNT':
      return { ...state, totalCount: action.payload };
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_HAS_MORE':
      return { ...state, hasMore: action.payload };
    case 'APPEND_PROPERTIES':
      return { ...state, properties: [...state.properties, ...action.payload] };
    default:
      return state;
  }
};

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const useProperty = () => {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
};

interface PropertyProviderProps {
  children: ReactNode;
}

export const PropertyProvider: React.FC<PropertyProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(propertyReducer, initialState);

  const fetchProperties = async (filters: PropertyFilters = {}, page: number = 1) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, String(value));
          }
        }
      });
      params.append('page', String(page));
      params.append('limit', String(UI_CONSTANTS.DEFAULT_PAGE_SIZE));

      const response = await api.get(`${API_ENDPOINTS.PROPERTIES.LIST}?${params.toString()}`);
      
      if (page === 1) {
        dispatch({ type: 'SET_PROPERTIES', payload: response.data.properties });
      } else {
        dispatch({ type: 'APPEND_PROPERTIES', payload: response.data.properties });
      }
      
      dispatch({ type: 'SET_TOTAL_COUNT', payload: response.data.totalCount });
      dispatch({ type: 'SET_CURRENT_PAGE', payload: page });
      dispatch({ type: 'SET_HAS_MORE', payload: response.data.hasMore });
    } catch (error: any) {
      toast.error(error.response?.data?.message || ERROR_MESSAGES.UNKNOWN_ERROR);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchFeaturedProperties = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.PROPERTIES.FEATURED);
      dispatch({ type: 'SET_FEATURED_PROPERTIES', payload: response.data.properties });
    } catch (error: any) {
      console.error('Failed to fetch featured properties:', error);
    }
  };

  const fetchUserProperties = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.PROPERTIES.MY_PROPERTIES);
      dispatch({ type: 'SET_USER_PROPERTIES', payload: response.data.properties });
    } catch (error: any) {
      toast.error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  };

  const fetchPropertyById = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await api.get(API_ENDPOINTS.PROPERTIES.DETAIL(id));
      dispatch({ type: 'SET_CURRENT_PROPERTY', payload: response.data.property });
    } catch (error: any) {
      toast.error(ERROR_MESSAGES.UNKNOWN_ERROR);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createProperty = async (propertyData: PropertyFormData) => {
    try {
      const response = await api.post(API_ENDPOINTS.PROPERTIES.CREATE, propertyData);
      dispatch({ type: 'ADD_PROPERTY', payload: response.data.property });
      toast.success(SUCCESS_MESSAGES.PROPERTY_CREATE);
    } catch (error: any) {
      toast.error(error.response?.data?.message || ERROR_MESSAGES.UNKNOWN_ERROR);
      throw error;
    }
  };

  const updateProperty = async (id: string, propertyData: Partial<PropertyFormData>) => {
    try {
      const response = await api.put(API_ENDPOINTS.PROPERTIES.UPDATE(id), propertyData);
      dispatch({ type: 'UPDATE_PROPERTY', payload: response.data.property });
      toast.success(SUCCESS_MESSAGES.PROPERTY_UPDATE);
    } catch (error: any) {
      toast.error(error.response?.data?.message || ERROR_MESSAGES.UNKNOWN_ERROR);
      throw error;
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      await api.delete(API_ENDPOINTS.PROPERTIES.DELETE(id));
      dispatch({ type: 'DELETE_PROPERTY', payload: id });
      toast.success(SUCCESS_MESSAGES.PROPERTY_DELETE);
    } catch (error: any) {
      toast.error(error.response?.data?.message || ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  };

  const setFilters = (filters: PropertyFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const setViewMode = (mode: ViewMode) => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  };

  const clearFilters = () => {
    dispatch({ type: 'SET_FILTERS', payload: {} });
  };

  const value: PropertyContextType = {
    ...state,
    fetchProperties,
    fetchFeaturedProperties,
    fetchUserProperties,
    fetchPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    setFilters,
    setViewMode,
    clearFilters,
  };

  return <PropertyContext.Provider value={value}>{children}</PropertyContext.Provider>;
}; 