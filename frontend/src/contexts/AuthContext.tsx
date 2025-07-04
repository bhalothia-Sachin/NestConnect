import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { User, RegisterData, AuthState, AuthContextType } from '../types';
import { API_ENDPOINTS, STORAGE_KEYS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants/constants';

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem(STORAGE_KEYS.TOKEN),
  isAuthenticated: false,
  loading: true,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true };
    case 'LOGIN_SUCCESS':
      localStorage.setItem(STORAGE_KEYS.TOKEN, action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'LOGOUT':
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'CLEAR_ERROR':
      return { ...state };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Note: Authorization headers are now handled by the api interceptor

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (state.token) {
        try {
          const response = await api.get(API_ENDPOINTS.AUTH.ME);
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: response.data.user, token: state.token! },
          });
        } catch (error) {
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: response.data.user, token: response.data.token },
      });
      toast.success(SUCCESS_MESSAGES.LOGIN);
    } catch (error: any) {
      let message = error.response?.data?.message || ERROR_MESSAGES.UNKNOWN_ERROR;
      
      // Handle validation errors
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const validationErrors = error.response.data.errors
          .map((err: any) => `${err.path}: ${err.msg}`)
          .join(', ');
        message = `Validation failed: ${validationErrors}`;
      }
      
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      // Don't show toast error for login failures - let the UI handle it
      throw error; // Re-throw the error so the login page can handle it
    }
  };

  const register = async (userData: RegisterData) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: response.data.user, token: response.data.token },
      });
      toast.success(SUCCESS_MESSAGES.REGISTER);
    } catch (error: any) {
      let message = error.response?.data?.message || ERROR_MESSAGES.UNKNOWN_ERROR;
      
      // Handle validation errors
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const validationErrors = error.response.data.errors
          .map((err: any) => `${err.path}: ${err.msg}`)
          .join(', ');
        message = `Validation failed: ${validationErrors}`;
      }
      
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      toast.error(message);
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    toast.success(SUCCESS_MESSAGES.LOGOUT);
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const response = await api.put(API_ENDPOINTS.AUTH.PROFILE, userData);
      dispatch({ type: 'UPDATE_USER', payload: response.data.user });
      toast.success(SUCCESS_MESSAGES.PROFILE_UPDATE);
    } catch (error: any) {
      const message = error.response?.data?.message || ERROR_MESSAGES.UNKNOWN_ERROR;
      toast.error(message);
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 