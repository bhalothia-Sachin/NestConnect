# Navigation Feature Documentation

## Overview

The navigation feature allows users to get their current location and find directions to properties on the map. This feature includes:

- **Current Location Detection**: Get user's GPS coordinates
- **Distance Calculation**: Calculate distance between user and property
- **Route Planning**: Show turn-by-turn directions to the property
- **Interactive Map**: Visual route display with alternative routes

## Features

### 1. Current Location Detection
- Uses browser's Geolocation API
- High accuracy GPS positioning
- Fallback error handling for location access issues
- Visual indicator showing user's location on map

### 2. Distance Calculation
- Uses Haversine formula for accurate distance calculation
- Displays distance in meters (for < 1km) or kilometers
- Real-time distance updates

### 3. Route Planning
- Integration with OpenStreetMap routing service
- Turn-by-turn directions
- Multiple route alternatives
- Estimated travel time
- Route optimization

### 4. User Interface
- Clean, intuitive navigation controls
- Loading states and error handling
- Responsive design for mobile and desktop
- Clear visual feedback

## How to Use

### For Property Viewers

1. **Navigate to a Property Detail Page**
   - Go to any property listing
   - Scroll down to the "Location & Navigation" section

2. **Get Your Location**
   - Click the "Get My Location" button
   - Allow location access when prompted
   - Your location will appear as a green marker on the map

3. **Get Directions**
   - Once your location is detected, click "Get Directions"
   - The map will show the route from your location to the property
   - Route details will appear in a panel on the map

4. **Clear Route**
   - Click the "X" button to clear the current route
   - Reset your location if needed

### For Property Listings (Map View)

1. **Switch to Map View**
   - On property listing pages, click the map icon
   - Properties will be displayed as markers on the map

2. **Select a Property**
   - Click on any property marker
   - Navigation controls will appear on the left side

3. **Follow the same steps as above**
   - Get your location
   - Get directions to the selected property

## Technical Implementation

### Components

- **NavigationControls**: Main navigation interface component
- **PropertyMap**: Enhanced map component with navigation support
- **User Location Marker**: Custom animated marker for user location

### Dependencies

- `leaflet`: Base mapping library
- `react-leaflet`: React wrapper for Leaflet
- `leaflet-routing-machine`: Routing and directions functionality
- `@types/leaflet-routing-machine`: TypeScript definitions

### Key Features

#### Geolocation API Integration
```typescript
navigator.geolocation.getCurrentPosition(
  (position) => {
    // Handle successful location detection
  },
  (error) => {
    // Handle location errors
  },
  {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000
  }
);
```

#### Distance Calculation
```typescript
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
```

#### Routing Integration
```typescript
import('leaflet-routing-machine').then((module) => {
  const Routing = (module as any).default;
  const control = Routing.control({
    waypoints: [
      L.latLng(userLat, userLng),
      L.latLng(propertyLat, propertyLng)
    ],
    routeWhileDragging: true,
    showAlternatives: true,
    fitSelectedRoutes: true
  }).addTo(map);
});
```

## Error Handling

### Location Access Issues
- Permission denied: User needs to enable location services
- Position unavailable: Network or GPS issues
- Timeout: Location request takes too long

### Routing Issues
- Network connectivity problems
- Routing service unavailability
- Invalid coordinates

## Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile browsers**: Full support with GPS

## Privacy Considerations

- Location data is only used for navigation
- No location data is stored or transmitted to servers
- User must explicitly grant location permission
- Clear privacy controls and user consent

## Future Enhancements

1. **Offline Support**: Cache routes for offline use
2. **Transport Modes**: Walking, cycling, public transport
3. **Real-time Traffic**: Live traffic updates
4. **Voice Navigation**: Audio turn-by-turn directions
5. **Route Sharing**: Share routes with others
6. **Favorite Routes**: Save frequently used routes

## Troubleshooting

### Common Issues

1. **Location not working**
   - Check browser permissions
   - Ensure GPS is enabled on mobile
   - Try refreshing the page

2. **Routes not loading**
   - Check internet connection
   - Try again in a few minutes
   - Clear browser cache

3. **Map not displaying**
   - Check if JavaScript is enabled
   - Ensure all dependencies are loaded
   - Try a different browser

### Support

For technical issues or feature requests, please contact the development team or create an issue in the project repository. 