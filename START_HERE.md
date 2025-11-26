# 🚀 Quick Start - Mini Browser

Get up and running in 5 minutes!

## ⚡ Quick Setup

### Step 1: Install Backend Dependencies (1 minute)

```bash
cd server
npm install
```

### Step 2: Start Backend Server (30 seconds)

```bash
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║          Mini Browser Server Started                      ║
║                                                           ║
║  Server:    http://localhost:3001                        ║
║  WebSocket: ws://localhost:3001                          ║
║  Max Sessions: 50                                         ║
║  FPS: 30                                                  ║
║  Screenshot Quality: 60%                                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

### Step 3: Start Frontend (New Terminal - 30 seconds)

```bash
# Go back to root directory
cd ..

# Start Angular app
npm start
```

### Step 4: Open Browser (10 seconds)

Navigate to:
```
http://localhost:4200
```

## 🎮 Try It Out!

1. Enter a URL in the address bar (e.g., `google.com`)
2. Click "Go" or press Enter
3. Wait for the page to load
4. Click on the canvas to interact
5. Type, scroll, click - it's a real browser!

## 📚 Next Steps

- **Read Full Docs**: [MINI_BROWSER_README.md](./MINI_BROWSER_README.md)
- **Deploy to Production**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Backend Details**: [server/README.md](./server/README.md)

## ⚠️ Common Issues

### Issue: "npm: command not found"

Install Node.js:
```bash
# Visit https://nodejs.org/
# Or use package manager:
# Ubuntu/Debian: sudo apt install nodejs npm
# Mac: brew install node
# Windows: Download from nodejs.org
```

### Issue: Backend fails to start

Make sure you're in the `server` directory:
```bash
cd server
npm install
npm run dev
```

### Issue: Frontend fails to start

Install Angular dependencies:
```bash
npm install
```

### Issue: Chromium download fails

Puppeteer will download Chromium automatically. If it fails:
```bash
# Linux: Install dependencies
sudo apt-get install -y chromium-browser

# Or reinstall puppeteer
cd server
npm install puppeteer --force
```

## 🎯 What's Happening?

1. **Backend Server** (Port 3001)
   - Launches headless Chromium browsers
   - Manages browser sessions
   - Streams screenshots via WebSocket
   - Handles user input (clicks, typing, scrolling)

2. **Frontend App** (Port 4200)
   - Angular application
   - Canvas-based viewer
   - WebSocket client
   - Browser controls (address bar, back/forward)

3. **The Magic**
   - No iframes!
   - No proxies!
   - Real headless browser
   - 30 FPS streaming
   - Full JavaScript support
   - Login sessions work
   - Real interactions

## 🔥 Features You Can Try

- **Login to websites** - Sessions are maintained
- **Click buttons** - Full interaction support
- **Type in forms** - Keyboard input works
- **Scroll pages** - Mouse wheel supported
- **Navigate** - Back, forward, reload buttons
- **Multiple tabs** - Each session is isolated

## 🛠️ Customization

### Change Screenshot Quality

Edit `server/src/server.ts`:
```typescript
const SCREENSHOT_QUALITY = 80; // Higher = better quality, slower
```

### Change FPS

Edit `server/src/server.ts`:
```typescript
const FPS = 60; // Higher = smoother, more CPU usage
```

### Change Server URL

Edit `src/app/mini-browser/mini-browser.component.ts`:
```typescript
private readonly SERVER_URL = 'http://your-server:3001';
private readonly WS_URL = 'ws://your-server:3001';
```

## 📖 Documentation

- **Main README**: Complete features and architecture
- **Deployment Guide**: Production deployment instructions
- **API Reference**: WebSocket and HTTP API docs
- **Performance Tips**: Optimization guidelines

## 🎉 Have Fun!

You now have a fully functional remote-controlled browser!

Try visiting:
- https://google.com
- https://github.com
- https://reddit.com
- Your favorite websites!

---

**Need help?** Check the documentation or create an issue!
