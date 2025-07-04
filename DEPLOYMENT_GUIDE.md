# NestConnect Deployment Guide for Server4You (Debian 12)

This guide will help you deploy your NestConnect application on a Server4You Debian 12 server with MongoDB already running.

## Prerequisites

- Server4You Debian 12 server
- MongoDB already running on a specific port
- Root or sudo access to the server
- Domain name (optional but recommended)

## Step 1: Server Setup

### 1.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Install Required Software
```bash
# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install Git
sudo apt install git -y

# Install build tools for native dependencies
sudo apt install build-essential -y
```

### 1.3 Verify Installations
```bash
node --version
npm --version
pm2 --version
nginx --version
```

## Step 2: Project Deployment

### 2.1 Clone Your Project
```bash
# Create application directory
sudo mkdir -p /var/www/nestconnect
sudo chown $USER:$USER /var/www/nestconnect
cd /var/www/nestconnect

# Clone your repository (replace with your actual repo URL)
git clone <your-repository-url> .
```

### 2.2 Backend Setup

```bash
cd /var/www/nestconnect/backend

# Install dependencies
npm install --production

# Create environment file
cp env.example .env
```

Edit the `.env` file with your production settings:
```bash
nano .env
```

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Configuration (replace with your actual MongoDB connection)
MONGODB_URI=mongodb://localhost:27017/nestconnect

# JWT Configuration (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# CORS Configuration (replace with your domain)
CORS_ORIGIN=https://yourdomain.com
```

### 2.3 Frontend Setup

```bash
cd /var/www/nestconnect/frontend

# Install dependencies
npm install

# Create production environment file
nano .env.production
```

Add the following to `.env.production`:
```env
REACT_APP_API_BASE_URL=https://yourdomain.com/api
NODE_ENV=production
```

Build the frontend:
```bash
npm run build
```

## Step 3: Process Management with PM2

### 3.1 Create PM2 Configuration
```bash
cd /var/www/nestconnect
nano ecosystem.config.js
```

Add the following configuration:
```javascript
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
```

### 3.2 Start Application with PM2
```bash
# Create log directory
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## Step 4: Nginx Configuration

### 4.1 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/nestconnect
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS (uncomment after SSL setup)
    # return 301 https://$server_name$request_uri;

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
```

### 4.2 Enable the Site
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/nestconnect /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## Step 5: SSL Certificate (Optional but Recommended)

### 5.1 Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 5.2 Obtain SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 5.3 Auto-renewal
```bash
sudo crontab -e
```

Add this line for auto-renewal:
```
0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 6: Firewall Configuration

```bash
# Install UFW if not installed
sudo apt install ufw -y

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 5000  # If you need direct access to backend

# Enable firewall
sudo ufw enable
```

## Step 7: Monitoring and Maintenance

### 7.1 PM2 Monitoring
```bash
# View application status
pm2 status

# View logs
pm2 logs nestconnect-backend

# Monitor resources
pm2 monit
```

### 7.2 Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### 7.3 Application Logs
```bash
# PM2 logs
pm2 logs nestconnect-backend

# System logs
sudo journalctl -u nginx -f
```

## Step 8: Backup Strategy

### 8.1 Create Backup Script
```bash
nano /var/www/nestconnect/backup.sh
```

```bash
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
```

```bash
chmod +x /var/www/nestconnect/backup.sh
```

### 8.2 Setup Daily Backups
```bash
sudo crontab -e
```

Add this line for daily backups at 2 AM:
```
0 2 * * * /var/www/nestconnect/backup.sh
```

## Step 9: Performance Optimization

### 9.1 Enable Gzip Compression
Add to your Nginx configuration:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_proxied expired no-cache no-store private must-revalidate auth;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
```

### 9.2 Optimize Node.js
Add to your PM2 ecosystem config:
```javascript
node_args: '--max-old-space-size=1024'
```

## Troubleshooting

### Common Issues:

1. **Port already in use**: Check if MongoDB is running on the expected port
2. **Permission denied**: Ensure proper file permissions
3. **Build fails**: Check Node.js version compatibility
4. **Database connection fails**: Verify MongoDB connection string

### Useful Commands:
```bash
# Check service status
sudo systemctl status nginx
pm2 status

# Restart services
sudo systemctl restart nginx
pm2 restart all

# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
ps aux | grep node
```

## Security Checklist

- [ ] Change default SSH port
- [ ] Use SSH keys instead of passwords
- [ ] Configure firewall
- [ ] Install SSL certificate
- [ ] Keep system updated
- [ ] Use strong JWT secrets
- [ ] Configure proper file permissions
- [ ] Enable security headers
- [ ] Regular backups
- [ ] Monitor logs

## Maintenance Commands

```bash
# Update application
cd /var/www/nestconnect
git pull
cd backend && npm install
cd ../frontend && npm install && npm run build
pm2 restart all

# Update system
sudo apt update && sudo apt upgrade -y

# Clean old logs
sudo journalctl --vacuum-time=7d
```

Your NestConnect application should now be successfully deployed and running on your Server4You Debian 12 server! 