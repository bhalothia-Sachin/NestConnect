#!/bin/bash

# NestConnect Deployment Script for Server4You Debian 12
# Run this script as root or with sudo privileges

set -e  # Exit on any error

echo "🚀 Starting NestConnect deployment on Server4You..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root or with sudo"
   exit 1
fi

# Step 1: Update system
print_status "Updating system packages..."
apt update && apt upgrade -y

# Step 2: Install required software
print_status "Installing required software..."

# Install Node.js 18.x
print_status "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PM2
print_status "Installing PM2..."
npm install -g pm2

# Install other required packages
print_status "Installing additional packages..."
apt install -y nginx git build-essential ufw certbot python3-certbot-nginx

# Step 3: Create application directory
print_status "Creating application directory..."
mkdir -p /var/www/nestconnect
chown $SUDO_USER:$SUDO_USER /var/www/nestconnect

# Step 4: Create PM2 log directory
print_status "Setting up PM2 logging..."
mkdir -p /var/log/pm2
chown $SUDO_USER:$SUDO_USER /var/log/pm2

# Step 5: Configure firewall
print_status "Configuring firewall..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 5000

# Step 6: Create Nginx configuration
print_status "Creating Nginx configuration..."
cat > /etc/nginx/sites-available/nestconnect << 'EOF'
server {
    listen 80;
    server_name _;

    # Frontend (React build files)
    location / {
        root /var/www/nestconnect/frontend/build;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
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

# Enable the site
ln -sf /etc/nginx/sites-available/nestconnect /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t
systemctl restart nginx
systemctl enable nginx

# Step 7: Create PM2 ecosystem file
print_status "Creating PM2 configuration..."
cat > /var/www/nestconnect/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'nestconnect-backend',
      script: './backend/server.js',
      cwd: '/var/www/nestconnect/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: '/var/log/pm2/nestconnect-backend-error.log',
      out_file: '/var/log/pm2/nestconnect-backend-out.log',
      log_file: '/var/log/pm2/nestconnect-backend-combined.log',
      time: true
    }
  ]
};
EOF

# Step 8: Create backup script
print_status "Creating backup script..."
cat > /var/www/nestconnect/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/nestconnect"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/nestconnect

# Backup MongoDB (adjust connection string as needed)
mongodump --uri="mongodb://localhost:27017/nestconnect" --out=$BACKUP_DIR/mongodb_$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "mongodb_*" -mtime +7 -exec rm -rf {} \;

echo "Backup completed: $DATE"
EOF

chmod +x /var/www/nestconnect/backup.sh

# Step 9: Create deployment instructions
print_status "Creating deployment instructions..."
cat > /var/www/nestconnect/DEPLOYMENT_INSTRUCTIONS.md << 'EOF'
# Next Steps for NestConnect Deployment

## 1. Clone Your Repository
```bash
cd /var/www/nestconnect
git clone <your-repository-url> .
```

## 2. Configure Backend
```bash
cd backend
npm install --production
cp env.example .env
nano .env  # Edit with your production settings
```

## 3. Configure Frontend
```bash
cd ../frontend
npm install
echo "REACT_APP_API_BASE_URL=http://yourdomain.com/api" > .env.production
npm run build
```

## 4. Start Application
```bash
cd /var/www/nestconnect
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 5. Configure Domain (Optional)
Edit /etc/nginx/sites-available/nestconnect and replace server_name _; with your domain.

## 6. Setup SSL (Optional)
```bash
certbot --nginx -d yourdomain.com
```

## 7. Setup Backups
```bash
crontab -e
# Add: 0 2 * * * /var/www/nestconnect/backup.sh
```

## Important Notes:
- Update MongoDB connection string in backend/.env
- Generate a strong JWT_SECRET
- Update CORS_ORIGIN with your domain
- Ensure MongoDB is running and accessible
EOF

# Step 10: Set proper permissions
print_status "Setting proper permissions..."
chown -R $SUDO_USER:$SUDO_USER /var/www/nestconnect

# Step 11: Display final status
print_status "Deployment script completed successfully!"
echo ""
print_status "Installed versions:"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "PM2: $(pm2 --version)"
echo "Nginx: $(nginx -v 2>&1)"
echo ""
print_warning "Next steps:"
echo "1. Clone your repository to /var/www/nestconnect"
echo "2. Configure environment files"
echo "3. Build frontend and start application"
echo "4. See /var/www/nestconnect/DEPLOYMENT_INSTRUCTIONS.md for details"
echo ""
print_status "Server is ready for NestConnect deployment! 🎉" 