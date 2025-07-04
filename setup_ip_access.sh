#!/bin/bash

# Quick Setup Script for IP Access
# Run this script on your server after deployment

set -e

echo "🔧 Setting up NestConnect for IP access..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)
print_status "Detected server IP: $SERVER_IP"

# Step 1: Update backend environment
print_status "Updating backend environment..."
cd /var/www/nestconnect/backend

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    cp env.example .env
fi

# Update CORS_ORIGIN in .env
sed -i "s|CORS_ORIGIN=.*|CORS_ORIGIN=http://$SERVER_IP|" .env

# Step 2: Update frontend environment
print_status "Updating frontend environment..."
cd /var/www/nestconnect/frontend

# Create .env.production
echo "REACT_APP_API_BASE_URL=http://$SERVER_IP:5000/api" > .env.production
echo "NODE_ENV=production" >> .env.production

# Rebuild frontend
print_status "Rebuilding frontend..."
npm run build

# Step 3: Update Nginx configuration
print_status "Updating Nginx configuration..."
sudo tee /etc/nginx/sites-available/nestconnect > /dev/null <<EOF
server {
    listen 80;
    server_name $SERVER_IP;

    # Frontend (React build files)
    location / {
        root /var/www/nestconnect/frontend/build;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)\$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # File uploads
    location /uploads/ {
        alias /var/www/nestconnect/backend/uploads/;
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

# Step 4: Configure firewall
print_status "Configuring firewall..."
sudo ufw allow 80
sudo ufw allow 443

# Step 5: Restart services
print_status "Restarting services..."
sudo nginx -t
sudo systemctl restart nginx
pm2 restart nestconnect-backend
pm2 save

# Step 6: Test configuration
print_status "Testing configuration..."
sleep 3

# Test backend
if curl -s http://localhost:5000/api/health > /dev/null; then
    print_status "✅ Backend is running"
else
    print_warning "⚠️  Backend health check failed"
fi

# Test frontend
if curl -s http://localhost > /dev/null; then
    print_status "✅ Frontend is accessible"
else
    print_warning "⚠️  Frontend access failed"
fi

# Step 7: Display access information
echo ""
print_status "🎉 Setup completed successfully!"
echo ""
echo "Your NestConnect application is now accessible at:"
echo "  🌐 Frontend: http://$SERVER_IP"
echo "  🔧 API: http://$SERVER_IP/api"
echo "  📊 Health Check: http://$SERVER_IP/api/health"
echo ""
print_warning "Make sure your MongoDB is running and accessible!"
echo ""
print_status "To test from your local machine:"
echo "  curl http://$SERVER_IP/api/health"
echo "" 