#!/bin/bash

# Add Domain with SSL to NestConnect Script (Fixed Version)
# This script properly handles SSL setup order

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

print_blue() {
    echo -e "${BLUE}[DOMAIN]${NC} $1"
}

# Check if domain is provided
if [ $# -eq 0 ]; then
    print_error "Please provide your domain name"
    echo "Usage: ./add_domain_ssl_fixed.sh yourdomain.com"
    echo "Example: ./add_domain_ssl_fixed.sh bhalothia.org"
    exit 1
fi

DOMAIN=$1
IP_ADDRESS="188.138.38.147"

print_blue "Adding domain: $DOMAIN with SSL support (Fixed Version)"
echo ""

# Step 1: Install Certbot if not installed
print_status "Installing Certbot for SSL certificates..."
apt update
apt install -y certbot python3-certbot-nginx

# Step 2: Create initial HTTP-only Nginx configuration
print_status "Creating initial HTTP Nginx configuration for $DOMAIN"

cat > /etc/nginx/sites-available/nestconnect << EOF
# HTTP server block (temporary, will be updated after SSL)
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN $IP_ADDRESS;

    # Frontend (React build files) - port 8000
    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API - port 8787
    location /api/ {
        proxy_pass http://localhost:8787;
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
        alias /root/NestConnect/backend/uploads/;
        expires 1y;
        add_header Cache-Control "public";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Step 3: Test and reload Nginx with HTTP config
print_status "Testing and reloading Nginx with HTTP configuration..."
nginx -t
systemctl reload nginx


# Step 5: Update frontend environment for HTTP first
print_status "Updating frontend environment configuration..."
cd /root/NestConnect/frontend


# Step 6: Rebuild frontend
print_status "Rebuilding frontend with new domain configuration..."
npm run build

# Step 7: Restart services
print_status "Restarting services..."
cd /root/NestConnect/backend
pm2 restart nestconnect-backend

cd /root/NestConnect/frontend
pm2 restart nestconnect-frontend

# Step 8: Test HTTP access first
print_status "Testing HTTP access..."
sleep 5

if curl -s http://$DOMAIN > /dev/null; then
    print_status "✅ HTTP domain $DOMAIN is accessible"
else
    print_warning "⚠️  HTTP domain $DOMAIN access failed - check DNS configuration"
fi

# Step 9: Get SSL certificates
print_status "Obtaining SSL certificates from Let's Encrypt..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect

# Step 10: Update backend environment for HTTPS
print_status "Updating backend environment for HTTPS..."
cd /root/NestConnect/backend



# Step 11: Update frontend environment for HTTPS
print_status "Updating frontend environment for HTTPS..."
cd /root/NestConnect/frontend



# Step 12: Rebuild frontend with HTTPS configuration
print_status "Rebuilding frontend with HTTPS configuration..."
npm run build

# Step 13: Restart services with HTTPS config
print_status "Restarting services with HTTPS configuration..."
cd /root/NestConnect/backend
pm2 restart nestconnect-backend

cd /root/NestConnect/frontend
pm2 restart nestconnect-frontend

# Step 14: Test HTTPS configuration
print_status "Testing HTTPS configuration..."
sleep 5

# Test HTTPS domain access
if curl -s https://$DOMAIN > /dev/null; then
    print_status "✅ HTTPS domain $DOMAIN is accessible"
else
    print_warning "⚠️  HTTPS domain $DOMAIN access failed"
fi

# Test www subdomain
if curl -s https://www.$DOMAIN > /dev/null; then
    print_status "✅ HTTPS www.$DOMAIN is accessible"
else
    print_warning "⚠️  HTTPS www.$DOMAIN access failed"
fi

# Test API through HTTPS domain
if curl -s https://$DOMAIN/api/health > /dev/null; then
    print_status "✅ API is accessible through HTTPS domain"
else
    print_warning "⚠️  API access through HTTPS domain failed"
fi

# Step 15: Set up automatic SSL renewal
print_status "Setting up automatic SSL certificate renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Step 16: Display final status
echo ""
print_status "🎉 Domain and SSL configuration completed!"
echo ""
echo "Your NestConnect application is now accessible at:"
echo "  🌐 Frontend (HTTPS): https://$DOMAIN"
echo "  🌐 Frontend (WWW): https://www.$DOMAIN"
echo "  🔧 API (HTTPS): https://$DOMAIN/api"
echo "  📊 Health Check: https://$DOMAIN/api/health"
echo ""
echo "HTTP redirects to HTTPS automatically!"
echo ""
echo "IP access still works:"
echo "  🌐 Frontend: http://$IP_ADDRESS"
echo "  🔧 API: http://$IP_ADDRESS/api"
echo ""
print_warning "IMPORTANT: Make sure to configure your DNS settings!"
echo "  - Add an A record for $DOMAIN pointing to $IP_ADDRESS"
echo "  - Add an A record for www.$DOMAIN pointing to $IP_ADDRESS"
echo "  - DNS propagation may take up to 24-48 hours"
echo ""
print_status "SSL certificates will auto-renew every 60 days"
print_status "PM2 Status:"
pm2 status 
