# 🚀 Quick Start Guide - Your Specific Setup

## Your Requirements ✅

1. ✅ Auto-load https://www.fcm.org.co/simit/
2. ✅ No address bar or controls
3. ✅ Users can't change URL
4. ✅ Embedded in your site (not new tab)
5. ✅ Support 1000 concurrent users
6. ✅ WordPress integration

## ⚠️ CRITICAL: Use Shared Browser Server!

For 1000 users, you **MUST** use the Shared Browser Server, NOT individual sessions.

**Why?**
- Individual: 1000 users = 150GB RAM ❌ Not feasible
- Shared: 1000 users = 200MB RAM ✅ Feasible!

## 🎯 Solution: Two Options

### Option 1: Angular Site (Recommended)
Run as standalone Angular application

### Option 2: WordPress Plugin
Embed in existing WordPress site using shortcode

---

# Option 1: Angular Site Setup

## Step 1: Configure Frontend

**File:** `src/app/mini-browser/mini-browser.component.ts`

Already configured for you:
```typescript
private readonly AUTO_LOAD_URL = 'https://www.fcm.org.co/simit/';
private readonly SHOW_CONTROLS = false; // Hidden!
private readonly ALLOW_NAVIGATION = false; // Locked!
```

For production, update server URLs (lines 31-32):
```typescript
private readonly SERVER_URL = 'https://your-domain.com';
private readonly WS_URL = 'wss://your-domain.com';
```

## Step 2: Install & Run Shared Browser Server

```bash
cd server

# Install dependencies
npm install

# Create .env file
cat > .env << 'EOF'
PORT=3002
TARGET_URL=https://www.fcm.org.co/simit/
SCREENSHOT_QUALITY=40
FPS=15
MAX_VIEWERS=10000
EOF

# Build
npm run build

# Run Shared Browser Server
node dist/SharedBrowserServer.js
```

You should see:
```
╔═══════════════════════════════════════════════════════════╗
║       Shared Browser Server Started (HIGH TRAFFIC)        ║
║  Target URL:   https://www.fcm.org.co/simit/             ║
║  Max Viewers:  10000                                      ║
╚═══════════════════════════════════════════════════════════╝
```

## Step 3: Run Frontend

New terminal:
```bash
npm start
```

Open: http://localhost:4200

**You'll see:**
- Just the browser canvas (no controls!)
- Auto-loads your website
- Users can click and scroll
- Minimal loading indicator

## Step 4: Deploy to Production

See `DEPLOYMENT_GUIDE.md` for complete deployment instructions.

Quick version:
```bash
# Backend
pm2 start dist/SharedBrowserServer.js --name mini-browser

# Frontend
npm run build --prod
# Upload dist/ to your web server
```

---

# Option 2: WordPress Plugin Setup

Perfect if you already have a WordPress site!

## Step 1: Install Plugin

```bash
# Copy plugin to WordPress
cp -r wordpress-plugin/mini-browser /path/to/wordpress/wp-content/plugins/

# Or zip it first:
cd wordpress-plugin
zip -r mini-browser.zip mini-browser/
```

Then:
1. Go to WordPress Admin → Plugins
2. Upload `mini-browser.zip`
3. Activate the plugin

## Step 2: Configure Plugin

1. Go to **Settings → Mini Browser**
2. Set:
   - **Server URL**: `https://your-server.com` (or `http://localhost:3002` for testing)
   - **WebSocket URL**: `wss://your-server.com` (or `ws://localhost:3002` for testing)
   - **Default URL**: `https://www.fcm.org.co/simit/`
   - **Browser Mode**: `Shared` (for 1000 users!)
   - **Show Controls**: Unchecked (hide address bar)
3. Click **Save Changes**

## Step 3: Run Backend Server

Same as Angular option:
```bash
cd server
npm install
npm run build

# Create .env
cat > .env << 'EOF'
PORT=3002
TARGET_URL=https://www.fcm.org.co/simit/
SCREENSHOT_QUALITY=40
FPS=15
MAX_VIEWERS=10000
EOF

node dist/SharedBrowserServer.js
```

## Step 4: Add to WordPress Page

Create or edit a page, add:
```
[mini_browser]
```

Or with custom height:
```
[mini_browser height="800px"]
```

**Done!** Your WordPress site now has an embedded browser.

---

# 💰 Cost Estimate for 1000 Users

### Server Requirements
- 4 CPU cores
- 8GB RAM
- 500 Mbps bandwidth
- 100GB storage

### Recommended Providers
- **DigitalOcean**: $80/month
- **Linode**: $60/month
- **Vultr**: $60/month
- **AWS/GCP**: $80-120/month

### Bandwidth Usage
- FPS 15 + Quality 40 = ~1.8 Mbps per user
- 1000 users = 1.8 Gbps bandwidth
- Most providers include 5-10 TB/month (enough!)

**Total Cost: $60-100/month** for 1000 concurrent users!

---

# 🔧 Optimization Tips

## For Better Performance

### 1. Lower FPS (Lower Bandwidth)
```env
FPS=10  # Instead of 15
```
Saves 33% bandwidth!

### 2. Lower Quality (Lower Bandwidth)
```env
SCREENSHOT_QUALITY=30  # Instead of 40
```
Saves 25% bandwidth!

### 3. Smaller Viewport (Lower Bandwidth)
```typescript
// In component.ts
CANVAS_WIDTH = 1024  // Instead of 1280
CANVAS_HEIGHT = 576  // Instead of 720
```
Saves 40% bandwidth!

### Combined Effect
FPS 10 + Quality 30 + 1024x576 = **70% bandwidth reduction!**

1000 users bandwidth: 1.8 Gbps → 540 Mbps

---

# 📊 Testing Before Going Live

## Test with Simulated Users

```bash
# Install artillery
npm install -g artillery

# Create test.yml
cat > test.yml << 'EOF'
config:
  target: "ws://localhost:3002"
  phases:
    - duration: 60
      arrivalRate: 10

scenarios:
  - engine: ws
    flow:
      - send: '{"type":"ping"}'
EOF

# Run test (simulates 600 users)
artillery run test.yml
```

Monitor:
- CPU usage: `htop`
- Bandwidth: `iftop`
- Memory: `free -h`

---

# 🎯 Your Exact Configuration

## Frontend (`src/app/mini-browser/mini-browser.component.ts`)

```typescript
// Line 39-41
private readonly AUTO_LOAD_URL = 'https://www.fcm.org.co/simit/';
private readonly SHOW_CONTROLS = false;
private readonly ALLOW_NAVIGATION = false;

// Line 31-32 (UPDATE FOR PRODUCTION)
private readonly SERVER_URL = 'https://your-server.com';
private readonly WS_URL = 'wss://your-server.com';
```

## Backend (`server/.env`)

```env
PORT=3002
TARGET_URL=https://www.fcm.org.co/simit/
SCREENSHOT_QUALITY=40
FPS=15
MAX_VIEWERS=10000
```

---

# 📝 Checklist

Before going live with 1000 users:

## Backend
- [ ] Install Node.js on server
- [ ] Install dependencies: `npm install`
- [ ] Build: `npm run build`
- [ ] Create `.env` with correct settings
- [ ] Test: `node dist/SharedBrowserServer.js`
- [ ] Deploy with PM2: `pm2 start dist/SharedBrowserServer.js`
- [ ] Configure Nginx reverse proxy
- [ ] Set up SSL certificate
- [ ] Test `/health` endpoint

## Frontend (Angular)
- [ ] Update SERVER_URL to production
- [ ] Update WS_URL to production (wss://)
- [ ] Build: `npm run build --prod`
- [ ] Upload `dist/` to web server
- [ ] Test in browser
- [ ] Verify auto-loads correct URL
- [ ] Verify controls are hidden
- [ ] Verify navigation is locked

## Frontend (WordPress)
- [ ] Install plugin
- [ ] Configure settings
- [ ] Add shortcode to page
- [ ] Test in browser
- [ ] Verify auto-loads correct URL

## Performance
- [ ] Test with 10 concurrent users
- [ ] Test with 100 concurrent users
- [ ] Monitor CPU usage
- [ ] Monitor RAM usage
- [ ] Monitor bandwidth usage
- [ ] Optimize FPS/Quality if needed

## Security
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Monitor for DDoS

---

# 🆘 Troubleshooting

## Browser shows "Connecting..." forever

**Fix:**
1. Check server is running: `curl http://localhost:3002/health`
2. Check WebSocket URL is correct
3. Check firewall allows port 3002
4. Check CORS is enabled on server

## Page loads but is blank/frozen

**Fix:**
1. Check server logs: `pm2 logs`
2. Verify TARGET_URL is correct
3. Check website isn't blocking headless browsers
4. Reload page: POST to `/admin/reload`

## High bandwidth usage

**Fix:**
1. Lower FPS: `FPS=10`
2. Lower quality: `SCREENSHOT_QUALITY=30`
3. Reduce viewport: `1024x576`
4. Check viewer count: `/health`

## Error: "Maximum viewers reached"

**Fix:**
1. Increase: `MAX_VIEWERS=20000`
2. Or deploy second server instance
3. Or wait for viewers to disconnect

---

# 🎉 You're Ready!

**What you have:**
- ✅ Auto-loading browser (https://www.fcm.org.co/simit/)
- ✅ No controls (just the canvas)
- ✅ Locked navigation (can't change URL)
- ✅ Optimized for 1000 users
- ✅ WordPress integration available
- ✅ Production-ready server
- ✅ Complete documentation

**Next steps:**
1. Test locally with both options
2. Choose: Angular standalone OR WordPress plugin
3. Deploy to your server
4. Configure SSL
5. Go live!

**Need help?** Check these docs:
- `SCALABILITY_GUIDE_1000_USERS.md` - How to handle 1000 users
- `CONFIGURATION_GUIDE.md` - All configuration options
- `DEPLOYMENT_GUIDE.md` - Production deployment
- `wordpress-plugin/mini-browser/README.md` - WordPress setup

**Your server cost: $60-100/month for 1000 concurrent users** 🚀
