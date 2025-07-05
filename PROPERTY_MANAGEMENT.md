# Property Management Functionality

This document describes the property management functionality implemented in NestConnect, including adding and editing properties.

## Overview

The property management system allows homeowners and brokers to:
- Add new properties with comprehensive details
- Edit existing properties
- Upload multiple images
- Manage property availability (list/delist)
- Set contact preferences

## Backend API Endpoints

### Property Creation
- **POST** `/api/properties`
- **Access**: Private (homeowner, broker)
- **Features**: 
  - Multipart form data support for image uploads
  - Comprehensive validation
  - Automatic owner assignment

### Property Update
- **PUT** `/api/properties/:id`
- **Access**: Private (property owner only)
- **Features**:
  - Update existing property details
  - Add new images while keeping existing ones
  - Ownership verification

### Property Retrieval
- **GET** `/api/properties/my-properties` - User's properties
- **GET** `/api/properties/:id` - Single property details
- **GET** `/api/properties` - All properties with filters
- **GET** `/api/properties/public` - Public property listings

### Property Management
- **PATCH** `/api/properties/:id/toggle-availability` - Toggle listing status
- **DELETE** `/api/properties/:id` - Delete property

## Frontend Components

### PropertyForm Component
Located at: `frontend/src/components/property/PropertyForm.tsx`

**Features:**
- Comprehensive form with all property fields
- Real-time validation
- Image upload with preview
- Facility selection with icons
- Contact preference settings
- Responsive design

**Form Sections:**
1. **Basic Information**
   - Property title
   - Property type (Flat, House, PG)
   - Rent amount and type
   - Description

2. **Location Information**
   - City, area, pin code
   - Complete address

3. **Property Details**
   - Bedrooms, bathrooms
   - Area (sq ft)
   - Floor and total floors

4. **Facilities**
   - WiFi, parking, AC
   - Kitchen, laundry, security
   - Gym, pool, garden
   - Balcony, furnished, pet-friendly

5. **Contact Preferences**
   - Show/hide phone number
   - Show/hide email
   - Show on map option

6. **Images**
   - Upload up to 10 images
   - 5MB size limit per image
   - Preview and remove functionality

### Pages

#### AddPropertyPage
- **Route**: `/add-property`
- **Access**: Homeowners and brokers
- **Features**: New property creation form

#### EditPropertyPage
- **Route**: `/edit-property/:id`
- **Access**: Property owner only
- **Features**: Edit existing property with pre-filled data

#### PropertyDetailPage
- **Route**: `/properties/:id`
- **Access**: Authenticated users
- **Features**: Full property details with image gallery

#### MyPropertiesPage
- **Route**: `/my-properties`
- **Access**: Property owners
- **Features**: Property management with image navigation

## Property Data Model

```typescript
interface Property {
  _id: string;
  owner: PropertyOwner;
  title: string;
  description: string;
  propertyType: PropertyType; // 'PG' | 'house' | 'flat'
  rent: number;
  rentType: RentType; // 'monthly' | 'yearly'
  location: PropertyLocation;
  facilities: PropertyFacilities;
  propertyDetails: PropertyDetails;
  images: PropertyImage[];
  isAvailable: boolean;
  isVerified: boolean;
  showOnMap: boolean;
  views: number;
  contactInfo: PropertyContactInfo;
  createdAt: string;
  updatedAt: string;
}
```

## Validation Rules

### Required Fields
- Title (5-100 characters)
- Description (20-1000 characters)
- Property type
- Rent amount (> 0)
- City, area, pin code, address

### Format Validation
- Pin code: 6 digits
- Rent: Positive number
- Images: JPEG, JPG, PNG, WebP (max 5MB each)

## User Experience Features

### Image Gallery System
- **PropertyImageGallery Component**: Full-featured image gallery with lightbox
- **Multiple Image Support**: View all property images with navigation
- **Thumbnail Navigation**: Click thumbnails to switch between images
- **Lightbox Mode**: Click images to open full-screen lightbox
- **Keyboard Navigation**: Use arrow keys in lightbox mode
- **Image Counter**: Shows current image position (e.g., "2 / 5")
- **Auto-play Option**: Optional automatic image rotation
- **Responsive Design**: Works on all device sizes

### Image Navigation Features
- **Property Cards**: Navigate through images with arrow buttons
- **Image Counters**: Display current image position
- **Smooth Transitions**: Animated image switching
- **Touch Support**: Swipe gestures on mobile devices
- **Zoom Functionality**: Full-screen view with zoom controls

### Toast Notifications
- Success messages for successful operations
- Error messages for failed operations
- Automatic dismissal after 4 seconds

### Loading States
- Form submission loading indicators
- Image upload progress
- Data fetching states

### Responsive Design
- Mobile-friendly form layout
- Adaptive grid systems
- Touch-friendly controls

## Security Features

### Backend Security
- Authentication required for all operations
- Property ownership verification
- File type and size validation
- Input sanitization and validation

### Frontend Security
- Form validation before submission
- File type checking
- Size limit enforcement
- XSS prevention

## Usage Examples

### Adding a New Property
1. Navigate to `/add-property`
2. Fill in basic information
3. Add location details
4. Set property specifications
5. Select available facilities
6. Configure contact preferences
7. Upload property images
8. Submit form

### Editing a Property
1. Navigate to `/my-properties`
2. Click "Edit" on desired property
3. Modify any fields as needed
4. Add or remove images
5. Update contact preferences
6. Save changes

### Managing Property Status
1. Go to `/my-properties`
2. Use "List" or "Delist" buttons
3. Property availability updates immediately

## Error Handling

### Common Errors
- **Validation Errors**: Displayed inline with form fields
- **Network Errors**: Toast notifications with retry options
- **Permission Errors**: Redirected to appropriate pages
- **File Upload Errors**: Clear error messages with size/type requirements

### Error Recovery
- Form data preservation on validation errors
- Automatic retry for network issues
- Graceful fallbacks for missing data

## Future Enhancements

### Planned Features
- Bulk property operations
- Advanced image editing
- Property templates
- Automated property verification
- Integration with external services

### Performance Optimizations
- Image compression
- Lazy loading for large forms
- Caching strategies
- Progressive enhancement

## Testing

### Manual Testing Checklist
- [ ] Form validation works correctly
- [ ] Image upload functionality
- [ ] Edit mode pre-fills data
- [ ] Error handling displays properly
- [ ] Responsive design on mobile
- [ ] Toast notifications appear
- [ ] Navigation works correctly
- [ ] Image gallery navigation works
- [ ] Lightbox functionality works
- [ ] Multiple images display correctly
- [ ] Image counters show correct position
- [ ] Keyboard navigation in lightbox
- [ ] Thumbnail navigation works
- [ ] Image captions display properly

### Automated Testing
- Unit tests for form validation
- Integration tests for API calls
- E2E tests for complete workflows
- Accessibility testing

## Troubleshooting

### Common Issues
1. **Images not uploading**: Check file size and type
2. **Form not submitting**: Verify all required fields
3. **Edit page not loading**: Check property ownership
4. **Validation errors**: Review field requirements

### Debug Information
- Check browser console for errors
- Verify API responses
- Confirm authentication status
- Validate form data structure 