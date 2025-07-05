#!/bin/bash

# Fix NestConnect Deployment Script
# Configure backend on port 8787 and frontend on port 8000

set -e

echo "🔧 Fixing NestConnect deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Stop existing processes
print_status "Stopping existing PM2 processes..."
pm2 stop NestConnect 2>/dev/null || true
pm2 delete NestConnect 2>/dev/null || true
pm2 stop nestconnect-frontend 2>/dev/null || true
pm2 delete nestconnect-frontend 2>/dev/null || true

# Step 2: Create PM2 ecosystem file
print_status "Creating PM2 ecosystem configuration..."
cat > /root/NestConnect/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'nestconnect-backend',
      script: './server.js',
      cwd: '/root/NestConnect/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 8787
      },
      error_file: '/root/.pm2/logs/nestconnect-backend-error.log',
      out_file: '/root/.pm2/logs/nestconnect-backend-out.log',
      log_file: '/root/.pm2/logs/nestconnect-backend-combined.log',
      time: true
    },
    {
      name: 'nestconnect-frontend',
      script: 'serve',
      args: '-s build -l 8000',
      cwd: '/root/NestConnect/frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/root/.pm2/logs/nestconnect-frontend-error.log',
      out_file: '/root/.pm2/logs/nestconnect-frontend-out.log',
      time: true
    }
  ]
};
EOF

# Step 3: Configure backend environment
print_status "Configuring backend environment..."
cd /root/NestConnect/backend

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    cp env.example .env
fi

# Update .env with correct settings
cat > .env << 'EOF'
# Server Configuration
PORT=8787
NODE_ENV=production

# MongoDB Configuration (please update the mongodb path before run the deployment.sh
MONGODB_URI=mongodb://localhost/db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# CORS Configuration
CORS_ORIGIN=http://188.138.38.147:8000
EOF

# Step 4: Configure frontend
print_status "Configuring frontend..."
cd /root/NestConnect/frontend

# Create production environment
cat > .env.production << 'EOF'
REACT_APP_API_BASE_URL=http://188.138.38.147:8787/
NODE_ENV=production
PORT=8000
EOF

# Build frontend
print_status "Building frontend..."
npm run build

# Step 5: Install serve globally if not installed
print_status "Installing serve for frontend..."
npm install -g serve

# Step 6: Configure Nginx
print_status "Configuring Nginx..."
 tee /etc/nginx/sites-available/nestconnect > /dev/null << 'EOF'
server {
    listen 80;
    server_name 188.138.38.147;

    # Frontend (React build files) - port 8000
    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API - port 8787
    location /api/ {
        proxy_pass http://localhost:8787;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # File uploads
    location /uploads/ {
        alias /root/NestConnect/backend/uploads/;
        expires 1y;
        add_header Cache-Control "public";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF

# Step 7: Configure firewall
print_status "Configuring firewall..."
 ufw allow 80
 ufw allow 8000
 ufw allow 8787

# Step 8: Start services
print_status "Starting services..."
cd /root/NestConnect

# Start backend
pm2 start ecosystem.config.js

# Start frontend separately
cd /root/NestConnect/frontend
pm2 start "serve -s build -l 8000" --name "nestconnect-frontend"

# Save PM2 configuration
pm2 save

# Step 9: Restart Nginx
print_status "Restarting Nginx..."
 nginx -t
 systemctl restart nginx

# Step 10: Test configuration
print_status "Testing configuration..."
sleep 5

# Test backend
if curl -s http://localhost:8787/api/health > /dev/null; then
    print_status "✅ Backend is running on port 8787"
else
    print_warning "⚠️  Backend health check failed"
fi

# Test frontend
if curl -s http://localhost:8000 > /dev/null; then
    print_status "✅ Frontend is running on port 8000"
else
    print_warning "⚠️  Frontend access failed"
fi

# Test through Nginx
if curl -s http://188.138.38.147/api/health > /dev/null; then
    print_status "✅ Nginx proxy is working"
else
    print_warning "⚠️  Nginx proxy test failed"
fi

# Step 11: Display final status
echo ""
print_status "🎉 Deployment fix completed!"
echo ""
echo "Your NestConnect application is now accessible at:"
echo "  🌐 Frontend: http://188.138.38.147"
echo "  🔧 API: http://188.138.38.147/api"
echo "  📊 Health Check: http://188.138.38.147/api/health"
echo ""
echo "Direct access:"
echo "  🌐 Frontend: http://188.138.38.147:8000"
echo "  🔧 API: http://188.138.38.147:8787/api"
echo ""
print_status "PM2 Status:"
pm2 status
echo ""
print_warning "Make sure your MongoDB is running and accessible!" 
