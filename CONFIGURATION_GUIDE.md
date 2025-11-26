# ⚙️ Configuration Guide

Complete guide to configure the mini browser for your specific needs.

## 🎯 Quick Configuration for Your Use Case

### Your Requirements
- ✅ Auto-load: `https://www.fcm.org.co/simit/`
- ✅ No URL bar or controls
- ✅ Users can't change URL
- ✅ Container/embedded view
- ✅ 1000 concurrent users

### Solution: Use Shared Browser + Angular Component

## 📝 Configuration Files

### 1. Angular Component (Frontend)

**File:** `src/app/mini-browser/mini-browser.component.ts`

```typescript
// Auto-load configuration
private readonly AUTO_LOAD_URL = 'https://www.fcm.org.co/simit/';
private readonly SHOW_CONTROLS = false; // Hide address bar
private readonly ALLOW_NAVIGATION = false; // Lock to one site

// Server configuration (UPDATE FOR PRODUCTION)
private readonly SERVER_URL = 'https://your-server.com:3002';
private readonly WS_URL = 'wss://your-server.com:3002';
```

### 2. Shared Browser Server (Backend)

**File:** `server/src/SharedBrowserServer.ts` (or `.env`)

```env
PORT=3002
TARGET_URL=https://www.fcm.org.co/simit/
SCREENSHOT_QUALITY=40
FPS=15
MAX_VIEWERS=10000
```

## 🔧 Configuration Options

### Frontend Settings

#### AUTO_LOAD_URL
**Purpose:** URL to load automatically when browser opens

```typescript
private readonly AUTO_LOAD_URL = 'https://www.fcm.org.co/simit/';
```

Options:
- Set to your target URL
- Leave empty (`''`) to not auto-load
- Must include `http://` or `https://`

#### SHOW_CONTROLS
**Purpose:** Show/hide address bar and navigation buttons

```typescript
private readonly SHOW_CONTROLS = false;
```

Options:
- `true` = Show address bar, back/forward buttons, etc.
- `false` = Hide all controls, show only browser canvas

#### ALLOW_NAVIGATION
**Purpose:** Allow/prevent users from navigating to different URLs

```typescript
private readonly ALLOW_NAVIGATION = false;
```

Options:
- `true` = Users can navigate to different sites
- `false` = Locked to AUTO_LOAD_URL only

#### SERVER_URL and WS_URL
**Purpose:** Backend server addresses

```typescript
private readonly SERVER_URL = 'http://localhost:3002';
private readonly WS_URL = 'ws://localhost:3002';
```

Production:
```typescript
private readonly SERVER_URL = 'https://browser.your-domain.com';
private readonly WS_URL = 'wss://browser.your-domain.com';
```

#### CANVAS_WIDTH and CANVAS_HEIGHT
**Purpose:** Browser viewport resolution

```typescript
private readonly CANVAS_WIDTH = 1280;
private readonly CANVAS_HEIGHT = 720;
```

Options:
- `1920x1080` = Full HD (more bandwidth)
- `1280x720` = HD (balanced)
- `1024x768` = Standard (less bandwidth)
- `800x600` = Compact (lowest bandwidth)

### Backend Settings

#### PORT
**Purpose:** Server port number

```env
PORT=3002
```

Options:
- Any available port
- Use 3002 for shared browser (to differentiate from individual sessions on 3001)

#### TARGET_URL
**Purpose:** Website to load in shared browser

```env
TARGET_URL=https://www.fcm.org.co/simit/
```

Options:
- Any valid HTTP/HTTPS URL
- This is what ALL users will see

#### SCREENSHOT_QUALITY
**Purpose:** JPEG quality (0-100)

```env
SCREENSHOT_QUALITY=40
```

Options:
- `100` = Highest quality, largest file size, most bandwidth
- `60` = Good quality, balanced
- `40` = Medium quality, lower bandwidth (recommended for 1000 users)
- `20` = Low quality, minimal bandwidth

Impact on bandwidth:
- Quality 100: ~50 KB per frame
- Quality 60: ~25 KB per frame
- Quality 40: ~15 KB per frame
- Quality 20: ~8 KB per frame

#### FPS (Frames Per Second)
**Purpose:** How many screenshots per second

```env
FPS=15
```

Options:
- `60` = Smooth, high CPU/bandwidth
- `30` = Smooth, moderate CPU/bandwidth
- `20` = Good, balanced
- `15` = Acceptable, lower CPU/bandwidth (recommended for 1000 users)
- `10` = Laggy but minimal resources

Bandwidth impact:
- FPS 30 + Quality 40 = 450 KB/s per user
- FPS 15 + Quality 40 = 225 KB/s per user
- FPS 10 + Quality 40 = 150 KB/s per user

#### MAX_VIEWERS
**Purpose:** Maximum concurrent viewers

```env
MAX_VIEWERS=10000
```

Options:
- Set based on your bandwidth capacity
- Formula: `Bandwidth (Mbps) / (FPS × Quality × 8)` = Max users

Example:
- 1 Gbps bandwidth
- FPS 15, Quality 40 (= 225 KB/s per user)
- Max users: 1000 Mbps / 1.8 Mbps = ~555 users

## 🎨 UI Customization

### Minimal UI (Your Use Case)

**What shows:**
- ✅ Browser canvas only
- ✅ Minimal loading indicator
- ✅ Error messages (if any)

**What's hidden:**
- ❌ Address bar
- ❌ Navigation buttons
- ❌ URL display
- ❌ Instructions panel

**Configuration:**
```typescript
SHOW_CONTROLS = false
```

### Full UI

**What shows:**
- ✅ Address bar
- ✅ Back/forward/reload buttons
- ✅ Quick links
- ✅ Current URL display
- ✅ Instructions panel

**Configuration:**
```typescript
SHOW_CONTROLS = true
ALLOW_NAVIGATION = true
```

## 📱 WordPress Integration

### Plugin Configuration

**File:** `wordpress-plugin/mini-browser/mini-browser.php`

Configure via WordPress Admin (Settings > Mini Browser):

1. **Server URL:** `https://browser.your-domain.com`
2. **WebSocket URL:** `wss://browser.your-domain.com`
3. **Default URL:** `https://www.fcm.org.co/simit/`
4. **Mode:** `shared` (for 1000 users)
5. **Show Controls:** Unchecked

### Shortcode Usage

```
[mini_browser]
```

Or with custom settings:
```
[mini_browser mode="shared" width="100%" height="700px"]
```

## 🌐 Production Configuration

### Step 1: Update Frontend URLs

**File:** `src/app/mini-browser/mini-browser.component.ts`

```typescript
private readonly SERVER_URL = 'https://browser.your-domain.com';
private readonly WS_URL = 'wss://browser.your-domain.com';
```

### Step 2: Update Backend Settings

**File:** `server/.env`

```env
PORT=3002
TARGET_URL=https://www.fcm.org.co/simit/
SCREENSHOT_QUALITY=40
FPS=15
MAX_VIEWERS=10000
NODE_ENV=production
```

### Step 3: Build for Production

```bash
# Build backend
cd server
npm run build

# Build frontend
cd ..
npm run build --prod
```

### Step 4: Deploy

See `DEPLOYMENT_GUIDE.md` for complete deployment instructions.

## 🔍 Testing Different Configurations

### Test Local Setup

1. Start backend:
   ```bash
   cd server
   FPS=30 SCREENSHOT_QUALITY=60 node dist/SharedBrowserServer.js
   ```

2. Start frontend:
   ```bash
   npm start
   ```

3. Open: `http://localhost:4200`

### Test Different FPS/Quality

```bash
# High quality
FPS=30 SCREENSHOT_QUALITY=80 node dist/SharedBrowserServer.js

# Balanced
FPS=20 SCREENSHOT_QUALITY=50 node dist/SharedBrowserServer.js

# Low bandwidth
FPS=10 SCREENSHOT_QUALITY=30 node dist/SharedBrowserServer.js
```

## 📊 Recommended Configurations

### For 1000 Users (Your Case)

```env
# Backend
PORT=3002
TARGET_URL=https://www.fcm.org.co/simit/
SCREENSHOT_QUALITY=40
FPS=15
MAX_VIEWERS=10000
```

```typescript
// Frontend
AUTO_LOAD_URL = 'https://www.fcm.org.co/simit/'
SHOW_CONTROLS = false
ALLOW_NAVIGATION = false
CANVAS_WIDTH = 1280
CANVAS_HEIGHT = 720
```

### For 100 Users (Balanced)

```env
# Backend
PORT=3002
TARGET_URL=https://www.fcm.org.co/simit/
SCREENSHOT_QUALITY=60
FPS=20
MAX_VIEWERS=1000
```

### For 10-50 Users (High Quality)

Use Individual Sessions instead:

```typescript
// Frontend
AUTO_LOAD_URL = 'https://www.fcm.org.co/simit/'
SHOW_CONTROLS = true
ALLOW_NAVIGATION = false
SERVER_URL = 'http://localhost:3001'
WS_URL = 'ws://localhost:3001'
```

## 🎯 Configuration Checklist

Before going live with 1000 users:

- [ ] Backend: Set `TARGET_URL=https://www.fcm.org.co/simit/`
- [ ] Backend: Set `FPS=15` (or lower)
- [ ] Backend: Set `SCREENSHOT_QUALITY=40` (or lower)
- [ ] Backend: Set `MAX_VIEWERS=10000`
- [ ] Frontend: Set `AUTO_LOAD_URL` to your URL
- [ ] Frontend: Set `SHOW_CONTROLS=false`
- [ ] Frontend: Set `ALLOW_NAVIGATION=false`
- [ ] Frontend: Update `SERVER_URL` to production
- [ ] Frontend: Update `WS_URL` to production (wss://)
- [ ] Deploy backend with PM2
- [ ] Deploy frontend to CDN or web server
- [ ] Configure Nginx reverse proxy
- [ ] Set up SSL certificates
- [ ] Test with 10 concurrent users
- [ ] Monitor bandwidth usage
- [ ] Set up health monitoring

## 💡 Pro Tips

1. **Start conservative**: Begin with FPS=10, Quality=30
2. **Monitor first**: Watch bandwidth and CPU usage
3. **Increase gradually**: If resources allow, increase FPS/quality
4. **Use CDN**: Serve Angular app from CDN
5. **Enable compression**: Gzip in Nginx
6. **Test thoroughly**: Simulate 100 users before going live

## 🔄 Switching Configurations

### Development to Production

1. Update URLs in component
2. Build Angular: `npm run build --prod`
3. Update server settings
4. Deploy to server
5. Test thoroughly

### Shared to Individual

1. Change `mode="shared"` to `mode="individual"` in WordPress
2. Or update Angular routing to use different server
3. Restart appropriate server

### Individual to Shared

1. Deploy SharedBrowserServer
2. Update URLs to point to port 3002
3. Update mode to `shared`

---

**You're all set!** For your specific case with 1000 users, the configuration is straightforward:
- Use Shared Browser Server
- Hide controls
- Auto-load your URL
- Optimize for bandwidth (FPS=15, Quality=40)
