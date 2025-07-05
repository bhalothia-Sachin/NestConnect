# Property Coordinates Feature

## Overview
The NestConnect platform now supports property coordinates, allowing users to set precise locations for their properties. This enables properties to be displayed on maps and improves location-based search functionality.

## Features

### 1. Multiple Location Selection Methods

#### Current Location
- Users can automatically get their current location using browser geolocation
- Automatically fills in coordinates and attempts to get the address
- Requires user permission for location access

#### Map Pinning
- Interactive map interface for selecting property location
- Click anywhere on the map to set coordinates
- Automatic reverse geocoding to get address from coordinates
- Visual marker showing selected location

#### Manual Entry
- Direct input of latitude and longitude coordinates
- Validation for coordinate ranges (latitude: -90 to 90, longitude: -180 to 180)
- Real-time coordinate validation

#### Location Search
- Search for locations using OpenStreetMap Nominatim API
- Search results with addresses
- Click to select and automatically set coordinates

### 2. User Interface

#### Property Form Integration
- New "Property Coordinates" section in the property creation/editing form
- Manual coordinate input fields
- "Set Location" button to open the map picker
- "Use Current Location" button for quick geolocation
- Visual indicator when coordinates are set

#### Location Picker Modal
- Full-screen modal with map interface
- Three tabs: Map, Search, Manual
- Real-time coordinate display
- Address preview from reverse geocoding
- Confirm/Cancel actions

### 3. Technical Implementation

#### Frontend Components
- `LocationPicker.tsx`: Main modal component for location selection
- Updated `PropertyForm.tsx`: Integrated coordinates section
- Uses React Leaflet for map functionality
- OpenStreetMap tiles for map display

#### Backend Support
- Property model already supports coordinates (latitude/longitude)
- Geospatial indexing for efficient location queries
- Coordinates stored as optional fields in location object

#### APIs Used
- **OpenStreetMap Nominatim**: For geocoding and reverse geocoding
- **Browser Geolocation API**: For current location detection
- **React Leaflet**: For interactive map functionality

### 4. Data Structure

```typescript
interface PropertyLocation {
  city: string;
  area: string;
  pinCode: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}
```

### 5. Validation

#### Coordinate Validation
- Latitude must be between -90 and 90
- Longitude must be between -180 and 180
- Both coordinates must be valid numbers
- Optional field - properties can be created without coordinates

#### Form Validation
- Real-time validation feedback
- Error messages for invalid coordinates
- Prevents form submission with invalid coordinates

### 6. User Experience

#### Benefits
- Properties with coordinates appear on map views
- Improved location-based search
- Better property discovery for tenants
- Visual representation of property locations

#### User Flow
1. User creates/edits a property
2. In the location section, they can:
   - Click "Set Location" to open map picker
   - Click "Use Current Location" for automatic detection
   - Manually enter coordinates
   - Search for a location
3. Coordinates are validated and saved with the property
4. Property appears on map views if coordinates are set

### 7. Map Integration

#### Property Display
- Properties with coordinates appear as markers on maps
- Different marker styles for different property types
- Popup information with property details
- Click to view property details

#### Map Features
- Interactive property markers
- Property type color coding
- Address and price information in popups
- Responsive map design

### 8. Privacy and Security

#### Location Privacy
- User consent required for geolocation
- Coordinates are optional
- Users can manually set coordinates without sharing location
- No automatic location tracking

#### Data Protection
- Coordinates stored securely in database
- No third-party location tracking
- User controls what location data is shared

## Usage Instructions

### For Property Owners

1. **Creating a Property with Coordinates:**
   - Fill out the property form
   - In the "Location Information" section, find "Property Coordinates"
   - Choose one of the following methods:
     - Click "Set Location" to open the map picker
     - Click "Use Current Location" for automatic detection
     - Manually enter latitude and longitude

2. **Using the Map Picker:**
   - Click "Set Location" button
   - Choose from three tabs:
     - **Map**: Click anywhere on the map to set location
     - **Search**: Enter location name and select from results
     - **Manual**: Enter coordinates directly
   - Click "Confirm Location" to save

3. **Manual Coordinate Entry:**
   - Enter latitude (e.g., 20.5937)
   - Enter longitude (e.g., 78.9629)
   - Coordinates are validated automatically

### For Developers

#### Adding Coordinates to Existing Properties
```javascript
// Update property with coordinates
const updatedProperty = await Property.findByIdAndUpdate(
  propertyId,
  {
    'location.coordinates': {
      latitude: 20.5937,
      longitude: 78.9629
    }
  },
  { new: true }
);
```

#### Querying Properties by Location
```javascript
// Find properties within geographic bounds
const properties = await Property.find({
  'location.coordinates': {
    $geoWithin: {
      $box: [
        [swLng, swLat], // Southwest coordinates
        [neLng, neLat]  // Northeast coordinates
      ]
    }
  }
});
```

## Future Enhancements

1. **Google Places Integration**: Add Google Places API for more accurate location search
2. **Bulk Coordinate Import**: Allow CSV import of coordinates for multiple properties
3. **Advanced Map Features**: Add clustering, heatmaps, and route planning
4. **Location Analytics**: Track popular areas and market trends
5. **Mobile Optimization**: Enhanced mobile map experience

## Troubleshooting

### Common Issues

1. **Geolocation Not Working:**
   - Ensure HTTPS is enabled (required for geolocation)
   - Check browser permissions
   - Try manual coordinate entry as alternative

2. **Map Not Loading:**
   - Check internet connection
   - Verify Leaflet CSS is loaded
   - Clear browser cache

3. **Coordinates Not Saving:**
   - Verify coordinate validation
   - Check form submission
   - Ensure backend route handles coordinates

### Support

For technical issues or feature requests, please refer to the project documentation or create an issue in the repository. 