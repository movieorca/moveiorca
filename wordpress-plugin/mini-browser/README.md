# Mini Browser WordPress Plugin

Install a remote mini-browser in your WordPress site using a simple shortcode.

## Installation

1. Copy the `mini-browser` folder to `/wp-content/plugins/`
2. Activate the plugin in WordPress admin panel
3. Go to Settings > Mini Browser to configure
4. Add `[mini_browser]` shortcode to any page/post

## Configuration

### Settings Page (WordPress Admin)

Navigate to **Settings > Mini Browser** to configure:

- **Server URL**: Your backend server URL (e.g., `https://your-server.com:3002`)
- **WebSocket URL**: WebSocket connection URL (e.g., `wss://your-server.com:3002`)
- **Default URL**: The website to display (e.g., `https://www.fcm.org.co/simit/`)
- **Browser Mode**:
  - **Shared** (Recommended for 100+ users): One browser for everyone
  - **Individual** (For <50 users): Separate browser per user
- **Show Controls**: Enable/disable address bar and navigation

## Shortcode Usage

### Basic Usage

```
[mini_browser]
```

### With Custom Parameters

```
[mini_browser url="https://example.com" mode="shared" width="100%" height="800px"]
```

### Parameters

- `url` - URL to load (default: from settings)
- `mode` - `shared` or `individual` (default: from settings)
- `width` - Container width (default: `100%`)
- `height` - Container height (default: `600px`)
- `show_controls` - `true` or `false` (default: from settings)

## Server Requirements

### For Shared Mode (1000+ users)
- 1 CPU core
- 2GB RAM
- Run SharedBrowserServer.ts

### For Individual Mode (<50 users)
- 2+ CPU cores per 10 users
- 4GB+ RAM per 10 users
- Run server.ts

## Server Setup

### 1. Run Shared Browser Server (Recommended)

```bash
cd server
npm install
npm run build

# Start shared browser server
PORT=3002 TARGET_URL="https://www.fcm.org.co/simit/" node dist/SharedBrowserServer.js
```

### 2. Or Run Individual Session Server

```bash
cd server
npm install
npm run build
npm start
```

## Example Page

Create a new WordPress page with:

```
<!-- Page content -->
<h1>View SIMIT System</h1>
<p>Interact with the system below:</p>

[mini_browser mode="shared" height="700px"]

<p>Click on the viewer to interact with the website.</p>
```

## Troubleshooting

### Server Status Not Green

1. Check server is running: `curl http://localhost:3002/health`
2. Verify firewall allows the port
3. Update URLs in settings to match your server

### Browser Not Loading

1. Check browser console for errors
2. Verify WebSocket URL is correct (wss:// for HTTPS sites)
3. Ensure CORS is enabled on server

### High Resource Usage

- Use **Shared mode** instead of Individual
- Lower FPS on server (set `FPS=15`)
- Reduce screenshot quality (`SCREENSHOT_QUALITY=40`)

## Production Deployment

### Update Settings for Production

1. Server URL: `https://browser-server.your-domain.com`
2. WebSocket URL: `wss://browser-server.your-domain.com`
3. Mode: `shared` (for high traffic)

### Nginx Configuration

```nginx
location /browser/ {
    proxy_pass http://localhost:3002/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

## Support

For issues, check the main documentation in the server folder.
