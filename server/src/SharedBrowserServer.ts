/**
 * SharedBrowserServer - Optimized for HIGH TRAFFIC (1000+ users)
 *
 * This uses a SINGLE browser instance that multiple users can view.
 * Perfect for showing ONE specific website to many users simultaneously.
 *
 * Resource usage: ~200MB RAM total (vs 150GB for 1000 individual sessions)
 */

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import puppeteer, { Browser, Page } from 'puppeteer';
import { SecurityManager } from './SecurityManager';

// Configuration
const PORT = process.env.PORT || 3002;
const TARGET_URL = process.env.TARGET_URL || 'https://www.fcm.org.co/simit/';
const SCREENSHOT_QUALITY = parseInt(process.env.SCREENSHOT_QUALITY || '50');
const FPS = parseInt(process.env.FPS || '20'); // Lower FPS for more users
const MAX_VIEWERS = parseInt(process.env.MAX_VIEWERS || '10000');

// Shared browser instance
let browser: Browser | null = null;
let page: Page | null = null;
let screenshotInterval: NodeJS.Timeout | null = null;
let currentScreenshot: string | null = null;
let viewerCount = 0;

// Connected clients
const clients = new Set<WebSocket>();

// Initialize security
const securityManager = new SecurityManager({
  windowMs: 60000,
  maxRequests: 200,
});

// Initialize shared browser
async function initializeBrowser(): Promise<void> {
  try {
    console.log('Initializing shared browser...');

    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-file-system',
      ],
    });

    page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1280, height: 720 });

    // Set user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Navigate to target URL
    console.log(`Loading ${TARGET_URL}...`);
    await page.goto(TARGET_URL, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    console.log('Browser initialized and page loaded');

    // Start screenshot streaming
    startScreenshotStreaming();
  } catch (error) {
    console.error('Failed to initialize browser:', error);
    throw error;
  }
}

// Capture screenshot
async function captureScreenshot(): Promise<string | null> {
  if (!page) return null;

  try {
    const screenshot = await page.screenshot({
      type: 'jpeg',
      quality: SCREENSHOT_QUALITY,
      encoding: 'base64',
    });

    return screenshot as string;
  } catch (error) {
    console.error('Screenshot error:', error);
    return null;
  }
}

// Start streaming screenshots
function startScreenshotStreaming(): void {
  if (screenshotInterval) return;

  const intervalMs = 1000 / FPS;

  screenshotInterval = setInterval(async () => {
    currentScreenshot = await captureScreenshot();

    if (currentScreenshot && clients.size > 0) {
      const message = JSON.stringify({
        type: 'screenshot',
        data: currentScreenshot,
      });

      // Broadcast to all connected clients
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }, intervalMs);

  console.log(`Screenshot streaming started at ${FPS} FPS`);
}

// Stop streaming
function stopScreenshotStreaming(): void {
  if (screenshotInterval) {
    clearInterval(screenshotInterval);
    screenshotInterval = null;
    console.log('Screenshot streaming stopped');
  }
}

// Inject click (admin only feature - can be enabled/disabled)
async function injectClick(x: number, y: number): Promise<void> {
  if (!page) return;

  try {
    await page.mouse.click(x, y);
  } catch (error) {
    console.error('Click injection error:', error);
  }
}

// Inject scroll
async function injectScroll(deltaX: number, deltaY: number): Promise<void> {
  if (!page) return;

  try {
    await page.evaluate((dx, dy) => {
      window.scrollBy(dx, dy);
    }, deltaX, deltaY);
  } catch (error) {
    console.error('Scroll injection error:', error);
  }
}

// Reload page
async function reloadPage(): Promise<void> {
  if (!page) return;

  try {
    await page.reload({ waitUntil: 'networkidle2' });
  } catch (error) {
    console.error('Reload error:', error);
  }
}

// Create Express app
const app = express();

app.use(cors());
app.use(express.json());

// Rate limiting middleware
app.use((req, res, next) => {
  const clientIp = securityManager.getClientIp(req);

  if (!securityManager.checkRateLimit(clientIp)) {
    return res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded',
    });
  }

  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    viewers: viewerCount,
    maxViewers: MAX_VIEWERS,
    targetUrl: TARGET_URL,
    fps: FPS,
  });
});

// Stats endpoint
app.get('/stats', (req, res) => {
  res.json({
    viewers: viewerCount,
    maxViewers: MAX_VIEWERS,
    targetUrl: TARGET_URL,
    fps: FPS,
    quality: SCREENSHOT_QUALITY,
    browserActive: browser !== null,
  });
});

// Admin endpoint to reload page (optional - can require authentication)
app.post('/admin/reload', async (req, res) => {
  try {
    await reloadPage();
    res.json({ success: true, message: 'Page reloaded' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// WebSocket connection handler
wss.on('connection', (ws: WebSocket, req) => {
  const clientIp = req.socket.remoteAddress || 'unknown';

  // Check viewer limit
  if (viewerCount >= MAX_VIEWERS) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Maximum viewers reached. Please try again later.',
    }));
    ws.close();
    return;
  }

  viewerCount++;
  clients.add(ws);

  console.log(`Viewer connected from ${clientIp} (Total: ${viewerCount})`);

  // Send connected message
  ws.send(JSON.stringify({
    type: 'connected',
    targetUrl: TARGET_URL,
  }));

  // Send current screenshot immediately if available
  if (currentScreenshot) {
    ws.send(JSON.stringify({
      type: 'screenshot',
      data: currentScreenshot,
    }));
  }

  // Handle incoming messages
  ws.on('message', async (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());

      // For shared browser, we typically DON'T allow user interactions
      // But you can enable these for admin users with authentication
      switch (message.type) {
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }));
          break;

        // OPTIONAL: Enable these for admin users only
        // case 'click':
        //   await injectClick(message.x, message.y);
        //   break;
        //
        // case 'scroll':
        //   await injectScroll(message.deltaX || 0, message.deltaY || 0);
        //   break;
        //
        // case 'reload':
        //   await reloadPage();
        //   break;

        default:
          // Ignore unknown messages (viewers can't control the browser)
          break;
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  // Handle disconnect
  ws.on('close', () => {
    viewerCount--;
    clients.delete(ws);
    console.log(`Viewer disconnected from ${clientIp} (Total: ${viewerCount})`);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Start server
async function start(): Promise<void> {
  try {
    // Initialize browser first
    await initializeBrowser();

    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║       Shared Browser Server Started (HIGH TRAFFIC)        ║
║                                                           ║
║  Server:       http://localhost:${PORT}                     ║
║  WebSocket:    ws://localhost:${PORT}                       ║
║  Target URL:   ${TARGET_URL.substring(0, 35)}...║
║  Max Viewers:  ${MAX_VIEWERS.toString().padEnd(10)}                               ║
║  FPS:          ${FPS.toString().padEnd(10)}                               ║
║  Quality:      ${SCREENSHOT_QUALITY}%                                       ║
║                                                           ║
║  This server uses ONE browser for ALL users               ║
║  Perfect for high traffic scenarios!                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown(): Promise<void> {
  console.log('\nShutting down gracefully...');

  stopScreenshotStreaming();

  // Close all WebSocket connections
  clients.forEach((client) => {
    client.close();
  });
  clients.clear();

  // Close browser
  if (browser) {
    await browser.close();
    browser = null;
    page = null;
  }

  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start the server
start();
