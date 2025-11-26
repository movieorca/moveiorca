# 🚀 Deployment Guide - Mini Browser

Complete guide to deploying the mini browser to production.

## 📋 Pre-Deployment Checklist

- [ ] Node.js 16+ installed on server
- [ ] Domain name configured (optional but recommended)
- [ ] SSL certificate (Let's Encrypt recommended)
- [ ] Sufficient server resources (see requirements below)
- [ ] Firewall configured
- [ ] MongoDB/Redis for session persistence (optional)

## 🖥️ Server Requirements

### Minimum (1-5 concurrent users)
- 2 CPU cores
- 2GB RAM
- 20GB SSD storage
- 5 Mbps bandwidth

### Recommended (10-25 concurrent users)
- 4 CPU cores
- 8GB RAM
- 50GB SSD storage
- 25 Mbps bandwidth

### High Load (50+ concurrent users)
- 8+ CPU cores
- 16GB+ RAM
- 100GB SSD storage
- 100 Mbps bandwidth

## 🐧 Linux Server Setup (Ubuntu/Debian)

### 1. Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Install Node.js

```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 3. Install Chromium Dependencies

```bash
sudo apt-get install -y \
    gconf-service \
    libasound2 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    libappindicator1 \
    libnss3 \
    lsb-release \
    xdg-utils \
    wget
```

### 4. Install PM2

```bash
sudo npm install -g pm2
```

## 📦 Deploy Backend Server

### 1. Clone/Upload Project

```bash
# Create directory
sudo mkdir -p /var/www/mini-browser
sudo chown $USER:$USER /var/www/mini-browser

# Upload or clone your project
cd /var/www/mini-browser
```

### 2. Install Dependencies

```bash
cd server
npm ci --only=production
```

### 3. Build TypeScript

```bash
npm run build
```

### 4. Configure Environment

```bash
cp .env.example .env
nano .env
```

Edit `.env`:
```
PORT=3001
MAX_SESSIONS=25
SCREENSHOT_QUALITY=60
FPS=30
NODE_ENV=production
```

### 5. Start with PM2

```bash
pm2 start dist/server.js --name mini-browser-server

# Configure PM2 to start on boot
pm2 startup
pm2 save
```

### 6. Configure PM2 for Multiple Instances (Optional)

For better performance on multi-core systems:

```bash
pm2 start dist/server.js --name mini-browser-server -i max
```

This will spawn one instance per CPU core.

## 🌐 Deploy Frontend

### Option 1: Netlify (Recommended for Static Hosting)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build Angular app
npm run build

# Deploy
netlify deploy --prod --dir=dist/angular-quickstart
```

Configure `netlify.toml`:
```toml
[build]
  publish = "dist/angular-quickstart"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 2: Nginx

#### Install Nginx

```bash
sudo apt install nginx -y
```

#### Configure Nginx

Create `/etc/nginx/sites-available/mini-browser`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    root /var/www/mini-browser/dist/angular-quickstart;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 86400;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/mini-browser /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 Setup SSL with Let's Encrypt

### Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Get Certificate

```bash
sudo certbot --nginx -d your-domain.com
```

Certbot will automatically configure Nginx for HTTPS.

### Auto-Renewal

Certbot automatically sets up renewal. Test it:

```bash
sudo certbot renew --dry-run
```

## 🔥 Configure Firewall

```bash
# Allow SSH
sudo ufw allow 22

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Enable firewall
sudo ufw enable
```

**Note:** Backend port 3001 should NOT be exposed directly. Access it only through Nginx proxy.

## 📊 Monitoring

### PM2 Monitoring

```bash
# View logs
pm2 logs mini-browser-server

# Monitor resources
pm2 monit

# Status
pm2 status
```

### System Monitoring

```bash
# Install htop
sudo apt install htop -y

# Monitor
htop
```

### Log Rotation

PM2 handles log rotation automatically, but you can configure it:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## 🔧 Performance Tuning

### 1. Optimize Node.js

Increase Node.js memory limit if handling many sessions:

```bash
pm2 start dist/server.js --name mini-browser-server --node-args="--max-old-space-size=4096"
```

### 2. Enable Nginx Caching

Add to Nginx config:

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Enable Gzip Compression

In Nginx config:

```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
```

### 4. Limit Session Resources

Edit `server/src/BrowserSession.ts`:

```typescript
// Reduce quality for production
screenshotQuality: 50,  // Lower quality
fps: 20,                 // Lower FPS

// Reduce viewport size
viewport: { width: 1024, height: 768 }
```

## 🐳 Docker Deployment (Alternative)

### Create Dockerfile

`server/Dockerfile`:

```dockerfile
FROM node:18-slim

# Install Chromium
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/server.js"]
```

### Build and Run

```bash
# Build image
docker build -t mini-browser-server ./server

# Run container
docker run -d \
  --name mini-browser \
  -p 3001:3001 \
  --restart unless-stopped \
  --memory="2g" \
  --cpus="2" \
  mini-browser-server
```

### Docker Compose

`docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: ./server
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - MAX_SESSIONS=25
      - SCREENSHOT_QUALITY=60
      - FPS=30
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 4G
```

Run:
```bash
docker-compose up -d
```

## 🛡️ Security Hardening

### 1. Enable Fail2Ban

```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 2. Regular Updates

```bash
# Create update script
cat > ~/update-mini-browser.sh << 'EOF'
#!/bin/bash
cd /var/www/mini-browser
git pull
cd server
npm ci --only=production
npm run build
pm2 restart mini-browser-server
EOF

chmod +x ~/update-mini-browser.sh
```

### 3. Backup Strategy

```bash
# Backup script
cat > ~/backup-mini-browser.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=~/backups
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/mini-browser-$(date +%Y%m%d).tar.gz \
  /var/www/mini-browser \
  --exclude=node_modules \
  --exclude=dist
# Keep only last 7 days
find $BACKUP_DIR -name "mini-browser-*.tar.gz" -mtime +7 -delete
EOF

chmod +x ~/backup-mini-browser.sh

# Add to crontab
crontab -e
# Add: 0 2 * * * /home/user/backup-mini-browser.sh
```

## 📱 Load Balancing (High Traffic)

For high traffic, use multiple backend servers:

### Nginx Load Balancer Config

```nginx
upstream mini_browser_backend {
    least_conn;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}

server {
    listen 80;
    server_name your-domain.com;

    location /api/ {
        proxy_pass http://mini_browser_backend;
        # ... other proxy settings
    }
}
```

Start multiple instances:
```bash
PORT=3001 pm2 start dist/server.js --name mini-browser-1
PORT=3002 pm2 start dist/server.js --name mini-browser-2
PORT=3003 pm2 start dist/server.js --name mini-browser-3
```

## ✅ Post-Deployment Checklist

- [ ] Backend server running and accessible
- [ ] Frontend deployed and loading
- [ ] WebSocket connection working
- [ ] SSL certificate valid
- [ ] Firewall configured
- [ ] PM2 auto-start enabled
- [ ] Monitoring setup
- [ ] Backups configured
- [ ] Performance tested
- [ ] Security hardened

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check logs
pm2 logs mini-browser-server

# Check if port is in use
sudo lsof -i :3001
```

### High memory usage
```bash
# Restart PM2
pm2 restart mini-browser-server

# Check memory
free -h

# Reduce MAX_SESSIONS
```

### WebSocket connection fails
```bash
# Check Nginx config
sudo nginx -t

# Check WebSocket headers
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" http://localhost:3001
```

## 📞 Support

For issues, check:
1. Server logs: `pm2 logs mini-browser-server`
2. Nginx logs: `/var/log/nginx/error.log`
3. System logs: `journalctl -xe`

---

**Happy Deploying! 🎉**
