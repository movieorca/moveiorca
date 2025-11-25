# Deployment Guide - RDP E-Commerce Platform

This guide provides detailed instructions for deploying the RDP E-Commerce Platform to production.

## Pre-Deployment Checklist

- [ ] VPS with at least 2GB RAM, 2 CPU cores
- [ ] Domain name configured
- [ ] MySQL database credentials
- [ ] SMTP email service credentials
- [ ] Easypaisa merchant account (if using)
- [ ] JazzCash merchant account (if using)
- [ ] SSL certificate (Let's Encrypt recommended)

## Server Requirements

- **OS**: Ubuntu 20.04 LTS or higher
- **Node.js**: 18.x or higher
- **MySQL**: 5.7 or 8.0+
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: 20GB minimum
- **Nginx**: Latest stable version

## Step-by-Step Deployment

### 1. Initial Server Setup

```bash
# Connect to your VPS
ssh root@your-server-ip

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y git curl wget build-essential
```

### 2. Install Node.js

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version
```

### 3. Install and Configure MySQL

```bash
# Install MySQL
sudo apt install mysql-server -y

# Secure MySQL installation
sudo mysql_secure_installation

# Login to MySQL
sudo mysql

# Create database and user
CREATE DATABASE rdp_ecommerce;
CREATE USER 'rdp_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON rdp_ecommerce.* TO 'rdp_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Clone and Setup Application

```bash
# Create application directory
sudo mkdir -p /var/www
cd /var/www

# Clone repository
sudo git clone <your-repository-url> rdp-platform
cd rdp-platform

# Set ownership
sudo chown -R $USER:$USER /var/www/rdp-platform

# Install dependencies
npm install
```

### 5. Configure Environment Variables

```bash
# Create production environment file
cp .env.example .env

# Edit environment file
nano .env
```

**Production `.env` configuration:**

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=rdp_user
DB_PASSWORD=strong_password_here
DB_NAME=rdp_ecommerce

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# Authentication (Generate strong random keys)
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<generate-random-32-char-string>
JWT_SECRET=<generate-random-32-char-string>

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@your-domain.com

# Payment Gateway - Easypaisa (Production)
EASYPAISA_MERCHANT_ID=your_production_merchant_id
EASYPAISA_API_KEY=your_production_api_key
EASYPAISA_SECRET_KEY=your_production_secret_key
EASYPAISA_STORE_ID=your_production_store_id
EASYPAISA_API_URL=https://easypaisa.com.pk/api/v1

# Payment Gateway - JazzCash (Production)
JAZZCASH_MERCHANT_ID=your_production_merchant_id
JAZZCASH_PASSWORD=your_production_password
JAZZCASH_INTEGRITY_SALT=your_production_integrity_salt
JAZZCASH_API_URL=https://payments.jazzcash.com.pk
```

**To generate random secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6. Import Database Schema

```bash
# Import database schema
mysql -u rdp_user -p rdp_ecommerce < database/schema.sql

# Verify tables were created
mysql -u rdp_user -p -e "USE rdp_ecommerce; SHOW TABLES;"
```

### 7. Build Application

```bash
# Build Next.js application
npm run build

# Test production build locally
npm start &

# Check if running on port 3000
curl http://localhost:3000

# Stop test
pkill node
```

### 8. Install and Configure PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start application with PM2
pm2 start npm --name "rdp-platform" -- start

# Configure PM2 to start on boot
pm2 startup systemd
pm2 save

# View logs
pm2 logs rdp-platform

# Monitor
pm2 monit
```

**PM2 Management Commands:**
```bash
# Restart application
pm2 restart rdp-platform

# Stop application
pm2 stop rdp-platform

# View status
pm2 status

# View logs
pm2 logs rdp-platform --lines 100
```

### 9. Install and Configure Nginx

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/rdp-platform
```

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration (will be added by Certbot)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Client max body size
    client_max_body_size 10M;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/rdp-platform /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 10. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 11. Configure Firewall

```bash
# Install UFW if not installed
sudo apt install ufw -y

# Allow SSH
sudo ufw allow OpenSSH

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## Post-Deployment

### 1. Change Default Admin Password

1. Navigate to `https://your-domain.com/auth/login`
2. Login with default credentials:
   - Email: admin@rdphosting.com
   - Password: admin123
3. Go to admin panel and change password immediately

### 2. Configure Payment Gateways

1. Login to admin panel
2. Navigate to Payment Settings
3. Configure Easypaisa and JazzCash credentials
4. Set to live mode (disable test mode)
5. Test with small transaction

### 3. Verify Email Functionality

1. Register test account
2. Check if verification email arrives
3. Test password reset
4. Check email logs in database

### 4. Setup Database Backups

```bash
# Create backup directory
sudo mkdir -p /var/backups/mysql

# Create backup script
sudo nano /usr/local/bin/backup-db.sh
```

**Backup script:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/mysql"
DB_NAME="rdp_ecommerce"
DB_USER="rdp_user"
DB_PASS="your_password"

mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/rdp_ecommerce_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-db.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-db.sh
```

### 5. Setup Monitoring

```bash
# Install monitoring tools
sudo npm install -g pm2-logrotate

# Configure log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## Maintenance

### Update Application

```bash
cd /var/www/rdp-platform

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Rebuild
npm run build

# Restart with PM2
pm2 restart rdp-platform
```

### Monitor Logs

```bash
# Application logs
pm2 logs rdp-platform

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# MySQL logs
sudo tail -f /var/log/mysql/error.log
```

### Database Maintenance

```bash
# Manual backup
mysqldump -u rdp_user -p rdp_ecommerce > backup_$(date +%Y%m%d).sql

# Restore from backup
mysql -u rdp_user -p rdp_ecommerce < backup_20240101.sql

# Optimize tables
mysql -u rdp_user -p -e "USE rdp_ecommerce; OPTIMIZE TABLE users, orders, subscriptions;"
```

## Troubleshooting

### Application Won't Start

```bash
# Check PM2 status
pm2 status

# View errors
pm2 logs rdp-platform --err

# Restart
pm2 restart rdp-platform
```

### Database Connection Issues

```bash
# Check MySQL status
sudo systemctl status mysql

# Test connection
mysql -u rdp_user -p -e "SELECT 1"

# Check .env file
cat .env | grep DB_
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### SSL Certificate Issues

```bash
# Renew certificates
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

## Security Recommendations

1. **Keep system updated**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Monitor logs regularly**
   - Check PM2 logs daily
   - Review Nginx access logs
   - Monitor database for suspicious activity

3. **Database security**
   - Use strong passwords
   - Regular backups
   - Limit remote access

4. **Application security**
   - Keep dependencies updated: `npm audit fix`
   - Use environment variables for secrets
   - Implement rate limiting

5. **Server security**
   - Disable root login
   - Use SSH keys
   - Configure fail2ban
   - Regular security updates

## Performance Optimization

### 1. Enable Nginx Caching

Add to Nginx config:
```nginx
# Cache static files
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 2. Database Optimization

```sql
# Add indexes for frequently queried columns
ALTER TABLE orders ADD INDEX idx_user_created (user_id, created_at);
ALTER TABLE subscriptions ADD INDEX idx_status_expiry (status, expiry_date);
```

### 3. Enable Gzip Compression

Add to Nginx config:
```nginx
gzip on;
gzip_vary on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

## Support

For issues or questions:
1. Check logs: `pm2 logs rdp-platform`
2. Review error messages
3. Check database connectivity
4. Verify environment variables
5. Contact development team

## Rollback Procedure

If deployment fails:

```bash
# Stop application
pm2 stop rdp-platform

# Restore database
mysql -u rdp_user -p rdp_ecommerce < /var/backups/mysql/latest_backup.sql

# Revert code
git reset --hard previous_commit_hash

# Rebuild
npm run build

# Restart
pm2 restart rdp-platform
```
