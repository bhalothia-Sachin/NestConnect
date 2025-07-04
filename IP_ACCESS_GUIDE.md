# Accessing NestConnect App via Server IP Address

This guide will help you access your NestConnect application using your server's IP address instead of a domain name.

## Prerequisites

- Your Server4You server IP address
- NestConnect application deployed and running
- SSH access to your server

## Step 1: Get Your Server IP Address

### Find Your Server IP:
```bash
# On your server, run:
curl ifconfig.me
# or
curl ipinfo.io/ip
# or
hostname -I
```

### Common IP Addresses:
- **Public IP**: Your server's external IP (e.g., `203.0.113.10`)
- **Local IP**: Your server's internal IP (e.g., `192.168.1.100`)

## Step 2: Configure Backend for IP Access

### 2.1 Update Backend Environment
```bash
cd /var/www/nestconnect/backend
nano .env
```

Update your `.env` file:
```env
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Configuration (use your actual MongoDB port)
MONGODB_URI=mongodb://localhost:27017/nestconnect

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# CORS Configuration - Allow your server IP
CORS_ORIGIN=http://YOUR_SERVER_IP:8000
```

### 2.2 Update Server.js for IP Binding
```bash
cd /var/www/nestconnect/backend
nano server.js
```

Modify the server listening part (around line 70):
```javascript
// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nestconnect')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    
    const PORT = process.env.PORT || 5000;
    const HOST = process.env.HOST || '0.0.0.0'; // Allow external connections
    
    app.listen(PORT, HOST, () => {
      console.log(`🚀 NESTCONNECT API running on ${HOST}:${PORT}`);
      console.log(`📱 Frontend: http://YOUR_SERVER_IP:8000`);
      console.log(`🔧 API: http://YOUR_SERVER_IP:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });
```

## Step 3: Configure Frontend for IP Access

### 3.1 Update Frontend Environment
```bash
cd /var/www/nestconnect/frontend
nano .env.production
```

Add your server IP:
```env
REACT_APP_API_BASE_URL=http://YOUR_SERVER_IP:5000/api
NODE_ENV=production
```

### 3.2 Rebuild Frontend
```bash
cd /var/www/nestconnect/frontend
npm run build
```

## Step 4: Configure Nginx for IP Access

### 4.1 Update Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/nestconnect
```

Replace the server block with:
```nginx
server {
    listen 80;
    server_name YOUR_SERVER_IP;  # Replace with your actual IP

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

### 4.2 Test and Restart Nginx
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## Step 5: Configure Firewall

### 5.1 Open Required Ports
```bash
# Allow HTTP (port 80)
sudo ufw allow 80

# Allow HTTPS (port 443) if using SSL
sudo ufw allow 443

# Allow direct backend access (optional)
sudo ufw allow 5000

# Check firewall status
sudo ufw status
```

## Step 6: Restart Application

### 6.1 Restart Backend
```bash
cd /var/www/nestconnect
pm2 restart nestconnect-backend
pm2 save
```

### 6.2 Check Application Status
```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs nestconnect-backend

# Check if ports are listening
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :5000
```

## Step 7: Access Your Application

### 7.1 Access URLs
Once configured, you can access your application at:

- **Frontend**: `http://YOUR_SERVER_IP`
- **Backend API**: `http://YOUR_SERVER_IP/api`
- **Health Check**: `http://YOUR_SERVER_IP/api/health`

### 7.2 Test Access
```bash
# Test from your local machine
curl http://YOUR_SERVER_IP/api/health

# Test from server
curl http://localhost/api/health
```

## Step 8: Troubleshooting

### 8.1 Common Issues and Solutions

#### Issue: Cannot access from external network
**Solution:**
```bash
# Check if application is listening on all interfaces
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :5000

# Check firewall rules
sudo ufw status

# Check Nginx status
sudo systemctl status nginx
```

#### Issue: CORS errors in browser
**Solution:**
```bash
# Update CORS_ORIGIN in backend/.env
CORS_ORIGIN=http://YOUR_SERVER_IP

# Restart backend
pm2 restart nestconnect-backend
```

#### Issue: Frontend not loading
**Solution:**
```bash
# Check if build files exist
ls -la /var/www/nestconnect/frontend/build/

# Rebuild frontend
cd /var/www/nestconnect/frontend
npm run build

# Check Nginx configuration
sudo nginx -t
```

#### Issue: Database connection fails
**Solution:**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB connection
mongo --eval "db.runCommand('ping')"

# Check backend logs
pm2 logs nestconnect-backend
```

### 8.2 Debug Commands
```bash
# Check all running processes
ps aux | grep node
ps aux | grep nginx

# Check system resources
free -h
df -h

# Check application logs
pm2 logs nestconnect-backend
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## Step 9: Security Considerations

### 9.1 Basic Security
```bash
# Change default SSH port
sudo nano /etc/ssh/sshd_config
# Change Port 22 to Port 2222 (or another port)

# Restart SSH
sudo systemctl restart sshd

# Update firewall
sudo ufw allow 2222
sudo ufw deny 22
```

### 9.2 Rate Limiting
The application already includes rate limiting, but you can adjust it in `backend/server.js`:
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

## Step 10: Monitoring

### 10.1 Check Application Health
```bash
# Monitor application
pm2 monit

# Check system resources
htop

# Monitor network connections
sudo netstat -tlnp
```

### 10.2 Set up Monitoring Script
```bash
nano /var/www/nestconnect/monitor.sh
```

```bash
#!/bin/bash
# Simple monitoring script

echo "=== NestConnect Status Check ==="
echo "Date: $(date)"
echo ""

# Check PM2 status
echo "PM2 Status:"
pm2 status
echo ""

# Check Nginx status
echo "Nginx Status:"
sudo systemctl status nginx --no-pager
echo ""

# Check disk usage
echo "Disk Usage:"
df -h
echo ""

# Check memory usage
echo "Memory Usage:"
free -h
echo ""

# Test application endpoints
echo "Application Health Check:"
curl -s http://localhost/api/health || echo "Health check failed"
echo ""
```

```bash
chmod +x /var/www/nestconnect/monitor.sh
```

## Quick Access Summary

After following all steps, your application will be accessible at:

- **Main Application**: `http://YOUR_SERVER_IP`
- **API Endpoint**: `http://YOUR_SERVER_IP/api`
- **File Uploads**: `http://YOUR_SERVER_IP/uploads`

Replace `YOUR_SERVER_IP` with your actual server IP address.

## Example with Real IP

If your server IP is `203.0.113.10`, you would access:
- Frontend: `http://203.0.113.10`
- API: `http://203.0.113.10/api`
- Health Check: `http://203.0.113.10/api/health`

Your NestConnect application should now be fully accessible via your server's IP address! 🎉 