# NESTCONNECT Setup Guide

This guide will help you set up and run the NESTCONNECT property listing platform.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

## Quick Start

### 1. Install Dependencies

From the project root directory, run:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

### 2. Set Up Environment Variables

```bash
# Copy the environment example file
cp backend/env.example backend/.env

# Edit the .env file with your configuration
# You can use any text editor or run:
nano backend/.env
```

**Required environment variables in `backend/.env`:**

```env
# Server Configuration
PORT=8787 // update the port
NODE_ENV=development

# MongoDB Configuration (please update the mongoDB path)
MONGODB_URI=mongodb://localhost:27017/nestconnect

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# CORS Configuration
CORS_ORIGIN=http://localhost/
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

**macOS (with Homebrew):**
```bash
brew services start mongodb-community
```

**Windows:**
```bash
# Start MongoDB service
net start MongoDB
```

**Linux:**
```bash
sudo systemctl start mongod
```

### 4. Run the Application

#### Option A: Run Both Frontend and Backend Together

From the project root:
```bash
npm run dev
```

This will start:
- Backend API on http://localhost:8787
- Frontend on http://localhost:8000

#### Option B: Run Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### 5. Verify Installation

1. **Backend API**: Visit http://localhost:8787/api/health
   - Should return: `{"status":"OK","message":"NESTCONNECT API is running"}`

2. **Frontend**: Visit http://localhost:8000
   - Should show the NESTCONNECT homepage

## Development Workflow

### Backend Development

- **API Documentation**: All endpoints are documented in the route files
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based with bcrypt password hashing
- **File Uploads**: Multer for property images
- **Validation**: Express-validator for input validation

### Frontend Development

- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand for global state
- **API Client**: Axios for HTTP requests
- **Maps**: Leaflet with OpenStreetMap integration

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

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file
   - Verify MongoDB is accessible on localhost:27017

2. **Port Already in Use**
   - Change PORT in backend/.env
   - Kill processes using the ports: `lsof -ti:8787 | xargs kill -9`

3. **Frontend Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run build`

4. **CORS Errors**
   - Ensure CORS_ORIGIN in .env matches frontend URL
   - Check that frontend is running on http://localhost:8000

### Database Setup

The application will automatically create the necessary collections when you first use it. No manual database setup is required.

### File Uploads

Property images are stored in the `backend/uploads/` directory. Make sure this directory exists and has write permissions.

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in environment variables
2. Use a production MongoDB instance
3. Set a strong JWT_SECRET
4. Configure proper CORS settings
5. Set up a reverse proxy (nginx) for the frontend
6. Use PM2 or similar for process management

## Support

If you encounter any issues:

1. Check the console logs for error messages
2. Verify all prerequisites are installed
3. Ensure environment variables are correctly set
4. Check that MongoDB is running and accessible

## Next Steps

Once the application is running:

1. Register a new user account
2. Create your first property listing
3. Explore the search and filter features
4. Test the messaging system
5. Try the map view functionality 