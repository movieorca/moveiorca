# aaPanel Deployment Guide for rdp.sale

Complete step-by-step guide to deploy your RDP E-Commerce Platform on aaPanel.

## Prerequisites

- ✅ aaPanel installed on your VPS
- ✅ Domain: rdp.sale pointed to your server IP
- ✅ Root or sudo access
- ✅ At least 2GB RAM, 2 CPU cores

## Step 1: Access aaPanel

1. Login to aaPanel web interface:
   ```
   http://your-server-ip:7800
   ```

2. Use your aaPanel credentials to login

## Step 2: Install Required Software

### Install Node.js via aaPanel

1. Go to **App Store** in aaPanel
2. Search for **"PM2 Manager"**
3. Click **Install**
4. After installation, verify Node.js version (should be 18+)

### Install MySQL (if not installed)

1. Go to **App Store**
2. Search for **"MySQL"**
3. Install **MySQL 5.7** or **8.0**
4. Remember the root password shown after installation

## Step 3: Create Database via aaPanel

1. Click **Database** in left sidebar
2. Click **Add Database**
3. Fill in details:
   - **Database Name**: `rdp_ecommerce`
   - **Username**: `rdp_user` (or any name you prefer)
   - **Password**: Create a strong password
   - **Access Permissions**: Select "Local Server"
4. Click **Submit**

**📝 Note down these credentials - you'll need them later!**

## Step 4: Create Website in aaPanel

1. Click **Website** in left sidebar
2. Click **Add Site**
3. Configure:
   - **Domain**: `rdp.sale` and `www.rdp.sale`
   - **Project Type**: Select **"Node Project"**
   - **Node Version**: Select latest (18.x or higher)
   - **Project Path**: `/www/wwwroot/rdp.sale`
   - **Port**: `3000` (or any available port)
   - **PHP**: Not required (leave empty)
4. Click **Submit**

## Step 5: Upload Your Code

### Option A: Using Git (Recommended)

1. SSH into your server:
   ```bash
   ssh root@your-server-ip
   ```

2. Navigate to website directory:
   ```bash
   cd /www/wwwroot/rdp.sale
   ```

3. Clone your repository:
   ```bash
   git clone https://github.com/your-username/moveiorca.git .
   ```

   Or if you have the code locally, use **SFTP** via aaPanel:
   - Go to **Files** in aaPanel
   - Navigate to `/www/wwwroot/rdp.sale`
   - Click **Upload** and select your project folder

### Option B: Using aaPanel File Manager

1. Zip your project folder on your local machine
2. In aaPanel, go to **Files**
3. Navigate to `/www/wwwroot/rdp.sale`
4. Click **Upload**
5. Upload the zip file
6. Right-click and select **Decompress**

## Step 6: Set Correct Permissions

In SSH or aaPanel Terminal:

```bash
cd /www/wwwroot/rdp.sale
chmod -R 755 .
chown -R www:www .
```

## Step 7: Configure Environment Variables

1. In aaPanel File Manager, navigate to `/www/wwwroot/rdp.sale`

2. Create `.env` file:
   - Click **New File**
   - Name it `.env`
   - Edit and add:

```env
# Database Configuration (Use credentials from Step 3)
DB_HOST=localhost
DB_PORT=3306
DB_USER=rdp_user
DB_PASSWORD=your_database_password_from_step3
DB_NAME=rdp_ecommerce

# Application
NEXT_PUBLIC_APP_URL=https://rdp.sale
NODE_ENV=production

# Authentication (Generate random secrets)
NEXTAUTH_URL=https://rdp.sale
NEXTAUTH_SECRET=REPLACE_WITH_RANDOM_32_CHAR_STRING
JWT_SECRET=REPLACE_WITH_RANDOM_32_CHAR_STRING

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=noreply@rdp.sale

# WhatsApp for Live Chat
WHATSAPP_NUMBER=923156035039

# Payment Gateway - Easypaisa (Leave empty for now, configure later)
EASYPAISA_MERCHANT_ID=
EASYPAISA_API_KEY=
EASYPAISA_SECRET_KEY=
EASYPAISA_STORE_ID=

# Payment Gateway - JazzCash (Leave empty for now)
JAZZCASH_MERCHANT_ID=
JAZZCASH_PASSWORD=
JAZZCASH_INTEGRITY_SALT=

# Payment Gateway - Binance (Leave empty for now)
BINANCE_WALLET_ADDRESS=

# Referral Commission (10%)
REFERRAL_COMMISSION_PERCENT=10
```

**Generate random secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Run this twice to get two different secrets for NEXTAUTH_SECRET and JWT_SECRET.

## Step 8: Import Database Schema

### Using aaPanel phpMyAdmin:

1. In aaPanel, click **Database**
2. Click **phpMyAdmin** button next to your database
3. Login (username: `root`, password: your MySQL root password)
4. Select `rdp_ecommerce` database from left sidebar
5. Click **SQL** tab at the top
6. Open `/www/wwwroot/rdp.sale/database/schema.sql` file
7. Copy entire content
8. Paste into SQL tab
9. Click **Go** button

### Using SSH:

```bash
mysql -u rdp_user -p rdp_ecommerce < /www/wwwroot/rdp.sale/database/schema.sql
```
Enter database password when prompted.

## Step 9: Install Dependencies

SSH into your server:

```bash
cd /www/wwwroot/rdp.sale
npm install
```

This will install all required packages. It may take 5-10 minutes.

## Step 10: Build the Application

```bash
npm run build
```

Wait for the build to complete. You'll see "Compiled successfully" when done.

## Step 11: Configure PM2 in aaPanel

1. In aaPanel, go to **App Store**
2. Find **PM2 Manager**
3. Click **Settings**
4. Click **Add Project**

Configure:
- **Project Name**: `rdp-sale`
- **Startup File**: `/www/wwwroot/rdp.sale/node_modules/.bin/next`
- **Run Directory**: `/www/wwwroot/rdp.sale`
- **Args**: `start`
- **Instances**: `1`
- **Max Memory**: `1024MB`
- **Error Log**: `/www/wwwroot/rdp.sale/logs/error.log`
- **Output Log**: `/www/wwwroot/rdp.sale/logs/output.log`
- **Environment Variables**: Leave empty (using .env file)

Click **Submit**

## Step 12: Start Application

In PM2 Manager:
1. Find your `rdp-sale` project
2. Click **Start**
3. Wait a few seconds
4. Status should show **"Online"**

**Verify it's running:**
```bash
curl http://localhost:3000
```
You should see HTML output.

## Step 13: Configure Reverse Proxy (Important!)

1. In aaPanel, go to **Website**
2. Find `rdp.sale`
3. Click **Settings**
4. Go to **Reverse Proxy** tab
5. Click **Add Reverse Proxy**

Configure:
- **Proxy Name**: `Next.js App`
- **Target URL**: `http://127.0.0.1:3000`
- **Enable Proxy**: ✅ Check
- **Content Replace**: Leave empty
- **Send Domain**: `$host`

Advanced Settings (click "Show Advanced"):
```nginx
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

Click **Submit**

## Step 14: Configure SSL Certificate

1. In aaPanel Website Settings for `rdp.sale`
2. Go to **SSL** tab
3. Select **Let's Encrypt**
4. Check both `rdp.sale` and `www.rdp.sale`
5. Enter your email address
6. Click **Apply**

Wait for certificate to be issued (usually 1-2 minutes).

After successful installation:
- **Force HTTPS**: Enable this option
- **HSTS**: Enable for security

## Step 15: Configure Firewall

1. In aaPanel, go to **Security**
2. Ensure these ports are open:
   - **80** (HTTP)
   - **443** (HTTPS)
   - **7800** (aaPanel - restrict to your IP only)
   - **3306** (MySQL - should be blocked from outside)

3. **Block MySQL from outside:**
   - Find port 3306
   - Click **Delete** or ensure it's not in the allowed list

## Step 16: Test Your Website

1. Visit: **https://rdp.sale**
2. You should see the homepage
3. Try registering a new account
4. Login as admin:
   - Email: `admin@rdp.sale`
   - Password: `admin123`

**⚠️ IMMEDIATELY CHANGE ADMIN PASSWORD!**

## Step 17: Configure Email (Gmail Example)

### Setup Gmail for SMTP:

1. Go to Google Account: https://myaccount.google.com/
2. Security → 2-Step Verification (enable if not enabled)
3. Security → App passwords
4. Generate new app password for "Mail"
5. Copy the 16-character password
6. Update `.env` file:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```
7. Restart PM2:
   ```bash
   pm2 restart rdp-sale
   ```

**Test email:**
- Register new account on your site
- Check if verification email arrives

## Step 18: Setup Automated Database Backups

1. In aaPanel, go to **Database**
2. Click **Backup** tab
3. Configure:
   - **Backup Type**: Select databases to backup
   - **Select Database**: Check `rdp_ecommerce`
   - **Backup Cycle**: Daily at 2:00 AM
   - **Keep**: 30 backups
   - **Backup to**: Local + Cloud (if available)

4. Click **Submit**

## Step 19: Configure Cron Jobs

### Setup Expiry Notifications

1. In aaPanel, go to **Cron**
2. Click **Add Cron**
3. Configure:
   - **Name**: `Check Expiring Subscriptions`
   - **Type**: Shell Script
   - **Execute Cycle**: Every day at 9:00 AM
   - **Script Content**:
     ```bash
     cd /www/wwwroot/rdp.sale && node scripts/check-expiry.js
     ```

(Note: We'll create this script in the code updates)

## Step 20: Monitor Application

### View Logs:

**PM2 Logs in aaPanel:**
1. PM2 Manager → Find rdp-sale → Click **Logs**

**Or via SSH:**
```bash
pm2 logs rdp-sale
pm2 logs rdp-sale --lines 100
```

**Monitor Performance:**
```bash
pm2 monit
```

### Common PM2 Commands:

```bash
# Restart application
pm2 restart rdp-sale

# Stop application
pm2 stop rdp-sale

# View status
pm2 status

# View detailed info
pm2 show rdp-sale
```

## Troubleshooting

### Issue: Site not loading

**Check if PM2 is running:**
```bash
pm2 status
```

**Restart if needed:**
```bash
pm2 restart rdp-sale
```

**Check logs:**
```bash
pm2 logs rdp-sale --err
```

### Issue: Database connection error

**Verify database exists:**
```bash
mysql -u rdp_user -p -e "SHOW DATABASES;"
```

**Check .env file has correct credentials**

**Test connection:**
```bash
mysql -u rdp_user -p rdp_ecommerce -e "SELECT 1;"
```

### Issue: 502 Bad Gateway

**Ensure app is running on port 3000:**
```bash
curl http://localhost:3000
```

**Check reverse proxy configuration in aaPanel**

**Restart Nginx:**
```bash
systemctl restart nginx
```

### Issue: SSL Certificate not working

**Re-apply Let's Encrypt certificate in aaPanel**

**Check domain DNS is correctly pointed to server**

**Verify in terminal:**
```bash
nslookup rdp.sale
```

### Issue: Email not sending

**Check email logs in database:**
```sql
SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 10;
```

**Verify SMTP credentials in .env**

**Test SMTP connection:**
```bash
telnet smtp.gmail.com 587
```

## Performance Optimization

### 1. Enable Caching

In aaPanel Website Settings:
- Go to **Performance** tab
- Enable **Page Caching**
- Enable **Browser Caching**

### 2. Enable Gzip Compression

Already enabled by default in aaPanel, but verify:
- Website Settings → **Performance**
- Ensure **Gzip** is enabled

### 3. Optimize PM2

Edit PM2 configuration:
```bash
pm2 delete rdp-sale
pm2 start npm --name "rdp-sale" --max-memory-restart 500M -- start
pm2 save
```

### 4. Database Optimization

Run monthly:
```bash
mysql -u rdp_user -p rdp_ecommerce -e "OPTIMIZE TABLE users, orders, subscriptions, plans;"
```

## Security Best Practices

### 1. Secure aaPanel Access

- **Change default port** from 7800 to custom port
- **Restrict access** to your IP only
- **Enable two-factor authentication**

### 2. Firewall Configuration

**Using aaPanel Security:**
- Block all unnecessary ports
- Allow only 80, 443, and your custom aaPanel port
- Enable **DDoS Protection** if available

### 3. Regular Updates

```bash
# Update system packages
apt update && apt upgrade -y

# Update Node.js packages
cd /www/wwwroot/rdp.sale
npm update

# Rebuild after updates
npm run build
pm2 restart rdp-sale
```

### 4. Secure File Permissions

```bash
cd /www/wwwroot/rdp.sale
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
chmod 600 .env
```

## Monitoring & Maintenance

### Daily Tasks
- ✅ Check PM2 status
- ✅ Review error logs
- ✅ Monitor disk space

### Weekly Tasks
- ✅ Check database backups
- ✅ Review email logs
- ✅ Check for failed payments

### Monthly Tasks
- ✅ Update Node.js packages
- ✅ Optimize database tables
- ✅ Review security logs
- ✅ Test backup restore

## Upgrading Application

When you need to deploy new code:

```bash
# 1. Navigate to project
cd /www/wwwroot/rdp.sale

# 2. Backup current version
cp -r . ../rdp.sale.backup

# 3. Pull latest changes (if using git)
git pull origin main

# 4. Install any new dependencies
npm install

# 5. Rebuild application
npm run build

# 6. Restart PM2
pm2 restart rdp-sale

# 7. Verify it's working
pm2 logs rdp-sale --lines 50
```

## Additional Configuration

### WhatsApp Integration

The live chat button is already configured to open WhatsApp with your number (+923156035039). No additional setup needed!

### Payment Gateways

Configure via Admin Panel:
1. Login as admin
2. Go to **Payment Settings**
3. Add credentials for:
   - Easypaisa
   - JazzCash
   - Binance wallet address

### Referral System

Referral system is automatically active. Each new user gets a unique referral code. They earn 10% commission on referred purchases (configurable in .env).

## Support

If you encounter issues:

1. **Check logs first:**
   ```bash
   pm2 logs rdp-sale
   ```

2. **Check database connectivity:**
   ```bash
   mysql -u rdp_user -p rdp_ecommerce -e "SELECT COUNT(*) FROM users;"
   ```

3. **Restart services:**
   ```bash
   pm2 restart rdp-sale
   systemctl restart nginx
   ```

4. **Review aaPanel error logs:**
   - Panel Logs in aaPanel interface

---

## Quick Reference

**Important Directories:**
- Website Root: `/www/wwwroot/rdp.sale`
- Database Backups: `/www/backup/database/`
- Logs: `/www/wwwroot/rdp.sale/logs/`

**Important Commands:**
```bash
# Restart application
pm2 restart rdp-sale

# View logs
pm2 logs rdp-sale

# Rebuild application
cd /www/wwwroot/rdp.sale && npm run build

# Database backup
mysqldump -u rdp_user -p rdp_ecommerce > backup.sql
```

**Admin Access:**
- URL: https://rdp.sale/auth/login
- Email: admin@rdp.sale
- Default Password: admin123 (CHANGE THIS!)

---

**Your RDP E-Commerce Platform is now live on rdp.sale! 🚀**
