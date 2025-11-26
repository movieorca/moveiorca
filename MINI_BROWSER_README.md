# 🌐 Remote Mini Browser

A true mini-browser implementation using headless Chromium that runs on your server and streams to your website. No iframes, no proxies - just real-time browser streaming.

## 🎯 Features

✅ **Real Headless Browser** - Uses Puppeteer to control actual Chromium
✅ **Live Streaming** - 30 FPS screenshot streaming via WebSocket
✅ **Full Interaction** - Click, type, scroll, navigate
✅ **Session Management** - Multiple isolated browser sessions
✅ **Security Built-in** - Rate limiting, IP filtering, sandboxing
✅ **Production Ready** - Optimized for performance and scalability

## 🏗️ Architecture

```
┌─────────────────┐         WebSocket          ┌──────────────────┐
│  Angular        │◄──────────────────────────►│  Node.js Server  │
│  Frontend       │   Screenshots + Events     │                  │
│  (Canvas View)  │                            │  Session Manager │
└─────────────────┘                            └──────────────────┘
                                                         │
                                                         ▼
                                                ┌──────────────────┐
                                                │  Puppeteer       │
                                                │  Headless Chrome │
                                                └──────────────────┘
```

## 📦 Installation

### Prerequisites

- Node.js 16+
- npm or yarn
- Linux/MacOS (Windows with WSL2)
- 2GB+ RAM per concurrent session

### Step 1: Install Backend Dependencies

```bash
cd server
npm install
```

This will install:
- `puppeteer` - Headless browser automation
- `express` - HTTP server
- `ws` - WebSocket server
- `cors` - Cross-origin support
- `express-rate-limit` - Rate limiting

### Step 2: Install Frontend Dependencies

```bash
cd ..
npm install
```

### Step 3: Build Backend

```bash
cd server
npm run build
```

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
```

The server will start on `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
npm start
```

The Angular app will start on `http://localhost:4200`

### Production Mode

**Build Backend:**
```bash
cd server
npm run build
npm start
```

**Build Frontend:**
```bash
npm run build
```

Serve the `dist/` folder with a web server (nginx, Apache, etc.)

## 🔧 Configuration

### Backend Configuration

Edit `server/src/server.ts` or set environment variables:

```bash
# Server port
PORT=3001

# Maximum concurrent sessions
MAX_SESSIONS=50

# Screenshot quality (0-100)
SCREENSHOT_QUALITY=60

# Frames per second
FPS=30
```

### Frontend Configuration

Edit `src/app/mini-browser/mini-browser.component.ts`:

```typescript
private readonly SERVER_URL = 'http://localhost:3001';
private readonly WS_URL = 'ws://localhost:3001';
```

For production, update these to your server's URL.

## 🌍 Deployment

### Deploy Backend (VPS/Cloud)

#### Option 1: PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start the server
cd server
npm run build
pm2 start dist/server.js --name mini-browser

# Make it run on boot
pm2 startup
pm2 save
```

#### Option 2: Docker

Create `server/Dockerfile`:

```dockerfile
FROM node:18-alpine

# Install Chromium dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/server.js"]
```

Build and run:
```bash
docker build -t mini-browser-server .
docker run -p 3001:3001 -d mini-browser-server
```

#### Option 3: systemd Service

Create `/etc/systemd/system/mini-browser.service`:

```ini
[Unit]
Description=Mini Browser Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/server
ExecStart=/usr/bin/node /path/to/server/dist/server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable mini-browser
sudo systemctl start mini-browser
```

### Deploy Frontend

#### Option 1: Netlify (Easiest)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist/angular-quickstart
```

#### Option 2: Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/dist/angular-quickstart;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy WebSocket and API to backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

## 🔒 Security Considerations

### Built-in Security Features

1. **Rate Limiting** - 100 requests/minute per IP
2. **URL Validation** - Blocks internal IPs and dangerous protocols
3. **Sandboxing** - Chromium runs in sandboxed mode
4. **Session Isolation** - Each user gets isolated browser session
5. **Auto-cleanup** - Idle sessions destroyed after 10 minutes

### Additional Recommendations

1. **Use HTTPS** - Always use SSL/TLS in production
2. **Firewall** - Restrict server access
3. **Resource Limits** - Limit RAM/CPU per session
4. **Authentication** - Add user authentication
5. **Monitoring** - Monitor resource usage

### Blocked by Default

- Internal networks (localhost, 127.0.0.1, 192.168.x.x, etc.)
- File protocol (file://)
- Data URLs (data:)
- JavaScript protocol (javascript:)

## ⚡ Performance Optimization

### Reduce Screenshot Quality

Lower quality = faster streaming, less bandwidth:

```bash
SCREENSHOT_QUALITY=40  # Lower quality (faster)
SCREENSHOT_QUALITY=80  # Higher quality (slower)
```

### Adjust FPS

```bash
FPS=15   # Lower FPS (less CPU, less bandwidth)
FPS=60   # Higher FPS (more CPU, more bandwidth)
```

### Optimize for Multiple Sessions

```bash
# Limit concurrent sessions
MAX_SESSIONS=20

# Reduce idle timeout (milliseconds)
# Edit BrowserSession.ts:
maxIdleTime: 300000  # 5 minutes instead of 10
```

### Server Requirements

For 10 concurrent sessions:
- CPU: 2+ cores
- RAM: 4GB minimum
- Bandwidth: 10 Mbps+

For 50 concurrent sessions:
- CPU: 8+ cores
- RAM: 16GB minimum
- Bandwidth: 50 Mbps+

## 🐛 Troubleshooting

### Issue: Chromium fails to launch

**Linux:**
```bash
# Install dependencies
sudo apt-get update
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

### Issue: WebSocket connection fails

Check CORS settings and ensure both frontend and backend are running.

Update `server/src/server.ts`:
```typescript
app.use(cors({
  origin: 'http://localhost:4200',  // Your frontend URL
  credentials: true
}));
```

### Issue: High memory usage

1. Reduce MAX_SESSIONS
2. Lower FPS
3. Reduce screenshot quality
4. Enable automatic cleanup

### Issue: Can't access certain websites

Some sites block headless browsers. Try:
1. Setting custom user agent (already done in BrowserSession.ts)
2. Using stealth plugins (not included by default)

## 📊 API Reference

### HTTP Endpoints

#### Create Session
```http
POST /api/session/create
```

Response:
```json
{
  "success": true,
  "sessionId": "uuid-here"
}
```

#### Destroy Session
```http
DELETE /api/session/:sessionId
```

### WebSocket Messages

#### Connect to Session
```json
{
  "type": "connect",
  "sessionId": "uuid-here"
}
```

#### Navigate to URL
```json
{
  "type": "navigate",
  "url": "https://example.com"
}
```

#### Click
```json
{
  "type": "click",
  "x": 100,
  "y": 200,
  "button": "left"
}
```

#### Type Text
```json
{
  "type": "type",
  "text": "Hello World"
}
```

#### Scroll
```json
{
  "type": "scroll",
  "deltaX": 0,
  "deltaY": 100
}
```

#### Navigation
```json
{ "type": "back" }
{ "type": "forward" }
{ "type": "reload" }
```

## 🤝 Contributing

Feel free to submit issues and pull requests!

## 📄 License

MIT License - feel free to use in your projects!

## 🎉 Credits

Built with:
- [Puppeteer](https://pptr.dev/) - Headless browser automation
- [Angular](https://angular.io/) - Frontend framework
- [Express](https://expressjs.com/) - Backend server
- [ws](https://github.com/websockets/ws) - WebSocket library

---

**Enjoy your mini browser! 🚀**
