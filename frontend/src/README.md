# Frontend Configuration & Constants

This document describes the centralized configuration and constants structure used in the NestConnect frontend.

## Directory Structure

```
src/
├── config/
│   └── config.ts          # Environment and app configuration
├── constants/
│   ├── constants.ts       # Static constants and API endpoints
│   └── enums.ts          # TypeScript enums
├── types/
│   └── index.ts          # TypeScript interfaces and types
└── utils/
    └── api.ts            # Centralized API configuration
```

## Configuration Files

### 1. `config/config.ts`
Centralized configuration for environment-specific settings:

```typescript
const config = {
  api: {
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8787',
    timeout: 10000,
  },
  app: {
    name: 'NestConnect',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },
  // ... other configurations
};
```

**Usage:**
```typescript
import config from '../config/config';

// Use in components
const apiUrl = config.api.baseURL;
const appName = config.app.name;
```

### 2. `constants/constants.ts`
Static constants and API endpoints:

```typescript
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    // ...
  },
  PROPERTIES: {
    LIST: '/api/properties',
    // ...
  },
};

export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  REGISTER: 'Registration successful!',
  // ...
};
```

**Usage:**
```typescript
import { API_ENDPOINTS, SUCCESS_MESSAGES } from '../constants/constants';

// In API calls
const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, data);

// In toast messages
toast.success(SUCCESS_MESSAGES.LOGIN);
```

### 3. `constants/enums.ts`
TypeScript enums for type safety:

```typescript
export enum UserRole {
  HOMEOWNER = 'homeowner',
  BROKER = 'broker',
  TENANT = 'tenant',
}

export enum PropertyType {
  PG = 'PG',
  HOUSE = 'house',
  FLAT = 'flat',
}
```

**Usage:**
```typescript
import { UserRole, PropertyType } from '../constants/enums';

// Type-safe usage
const userRole: UserRole = UserRole.HOMEOWNER;
const propertyType: PropertyType = PropertyType.HOUSE;
```

### 4. `types/index.ts`
Centralized TypeScript interfaces and types:

```typescript
export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  // ...
}

export interface Property {
  _id: string;
  title: string;
  propertyType: PropertyType;
  // ...
}
```

**Usage:**
```typescript
import { User, Property, AuthState } from '../types';

// In components and contexts
const [user, setUser] = useState<User | null>(null);
const [properties, setProperties] = useState<Property[]>([]);
```

### 5. `utils/api.ts`
Centralized API configuration with interceptors:

```typescript
import config from '../config/config';

const api = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Benefits

1. **Centralized Configuration**: All environment-specific settings in one place
2. **Type Safety**: Strong typing with TypeScript enums and interfaces
3. **Maintainability**: Easy to update constants and configurations
4. **Consistency**: Standardized API endpoints and messages
5. **Environment Support**: Easy switching between development, staging, and production
6. **Code Reusability**: Shared types and constants across components

## Environment Variables

Create a `.env` file in the frontend root:

```env
REACT_APP_API_BASE_URL=http://localhost:8787
REACT_APP_NAME=NestConnect
REACT_APP_VERSION=1.0.0
```

## Migration Guide

When adding new features:

1. **Add new enums** to `constants/enums.ts`
2. **Add new constants** to `constants/constants.ts`
3. **Add new types** to `types/index.ts`
4. **Add new config** to `config/config.ts` if environment-specific
5. **Update API endpoints** in `constants/constants.ts`
6. **Use centralized imports** in components

## Best Practices

1. Always use enums for fixed values (roles, types, statuses)
2. Use constants for API endpoints and messages
3. Define interfaces for all data structures
4. Use the centralized API configuration
5. Keep environment-specific values in config
6. Use TypeScript for type safety 