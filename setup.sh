#!/bin/bash

echo "🏠 NESTCONNECT Setup Script"
echo "=========================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB before continuing."
    echo "   macOS: brew services start mongodb-community"
    echo "   Linux: sudo systemctl start mongod"
    echo "   Windows: net start MongoDB"
    echo ""
    read -p "Press Enter to continue anyway..."
fi

echo "📦 Installing dependencies..."

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Create .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating .env file..."
    cp backend/env.example backend/.env
    echo "✅ .env file created. Please edit backend/.env with your configuration."
else
    echo "✅ .env file already exists"
fi

# Create uploads directory
mkdir -p backend/uploads

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your configuration"
echo "2. Start MongoDB if not already running"
echo "3. Run 'npm run dev' to start both frontend and backend"
echo ""
echo "Or run separately:"
echo "  Backend: cd backend && npm run dev"
echo "  Frontend: cd frontend && npm start"
echo ""
echo "Frontend will be available at: http://localhost:8000"
echo "Backend API will be available at: http://localhost:8787" 