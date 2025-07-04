// User Roles
export enum UserRole {
  HOMEOWNER = 'homeowner',
  BROKER = 'broker',
  TENANT = 'tenant',
}

// Property Types
export enum PropertyType {
  PG = 'PG',
  HOUSE = 'house',
  FLAT = 'flat',
}

// Rent Types
export enum RentType {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

// View Modes
export enum ViewMode {
  GRID = 'grid',
  MAP = 'map',
}

// Property Status
export enum PropertyStatus {
  AVAILABLE = 'available',
  RENTED = 'rented',
  UNDER_MAINTENANCE = 'under_maintenance',
}

// Message Status
export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

// Notification Types
export enum NotificationType {
  NEW_MESSAGE = 'new_message',
  PROPERTY_VIEW = 'property_view',
  RENTAL_INQUIRY = 'rental_inquiry',
  SYSTEM_UPDATE = 'system_update',
}

// Sort Options
export enum SortOption {
  PRICE_LOW_TO_HIGH = 'price_low_to_high',
  PRICE_HIGH_TO_LOW = 'price_high_to_low',
  DATE_NEWEST = 'date_newest',
  DATE_OLDEST = 'date_oldest',
  POPULARITY = 'popularity',
}

// Filter Types
export enum FilterType {
  CITY = 'city',
  AREA = 'area',
  PROPERTY_TYPE = 'propertyType',
  RENT_RANGE = 'rentRange',
  BEDROOMS = 'bedrooms',
  BATHROOMS = 'bathrooms',
  FACILITIES = 'facilities',
} 