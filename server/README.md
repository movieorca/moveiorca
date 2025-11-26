# Mini Browser Server

Backend server for the Remote Mini Browser system.

## Quick Start

### Development
```bash
npm install
npm run dev
```

### Production
```bash
npm install
npm run build
npm start
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

## API Documentation

See main [MINI_BROWSER_README.md](../MINI_BROWSER_README.md) for complete API documentation.

## Project Structure

```
server/
├── src/
│   ├── BrowserSession.ts      # Individual browser session handler
│   ├── SessionManager.ts      # Manages multiple sessions
│   ├── SecurityManager.ts     # Security and rate limiting
│   └── server.ts              # Main server entry point
├── dist/                      # Compiled JavaScript (generated)
├── package.json
└── tsconfig.json
```

## Dependencies

- **puppeteer** - Headless Chromium automation
- **express** - HTTP server framework
- **ws** - WebSocket server
- **cors** - CORS middleware
- **express-rate-limit** - Rate limiting
- **uuid** - Session ID generation

## Architecture

Each browser session is isolated and managed independently:

1. Client requests new session via HTTP POST
2. Server creates isolated Puppeteer browser instance
3. WebSocket connection established for real-time communication
4. Screenshots streamed at configured FPS
5. User inputs sent via WebSocket and injected into browser
6. Session auto-destroys after idle timeout

## Security Features

- IP-based rate limiting
- URL validation (blocks internal IPs)
- Protocol filtering (only HTTP/HTTPS allowed)
- Sandboxed browser execution
- Session isolation
- Automatic cleanup of idle sessions

## Performance Tips

1. **Reduce FPS** for lower bandwidth usage
2. **Lower screenshot quality** for faster streaming
3. **Limit MAX_SESSIONS** based on available resources
4. **Use PM2** for process management in production
5. **Enable clustering** for multi-core utilization

## Monitoring

The server logs important events:
- Session creation/destruction
- Navigation events
- Errors and warnings
- Active session count

Monitor these logs for debugging and optimization.

## Health Check

```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "ok",
  "sessions": 5,
  "maxSessions": 50
}
```
