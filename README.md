# NESTCONNECT 🏠

A modern, location-based property listing platform connecting homeowners, brokers, and tenants.

## Features

- **Property Listings**: List PGs, houses, and flats with detailed information
- **Location-Based Search**: Find properties by city, area, and pin code
- **Interactive Maps**: View properties on OpenStreetMap with Leaflet integration
- **Advanced Filtering**: Filter by property type, rent range, and facilities
- **Secure Communication**: Contact owners/brokers without revealing personal details
- **Responsive Design**: Works seamlessly on web and mobile devices
- **User Authentication**: Secure registration and login for homeowners and brokers

## Tech Stack

- **Frontend**: React.js with TypeScript
- **Backend**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **Maps**: Leaflet with OpenStreetMap
- **Styling**: Tailwind CSS
- **Authentication**: JWT tokens
- **File Upload**: Multer for image handling

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NestConnect
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your MongoDB URI and JWT secret
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure

```
NestConnect/
├── frontend/          # React frontend application
├── backend/           # Node.js backend API
├── package.json       # Root package.json
└── README.md         # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Properties
- `GET /api/properties` - Get all properties with filters
- `POST /api/properties` - Create new property listing
- `GET /api/properties/:id` - Get property details
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Messages
- `POST /api/messages` - Send message to property owner
- `GET /api/messages` - Get user messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details 