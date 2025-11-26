import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { SessionManager } from './SessionManager';
import { SecurityManager } from './SecurityManager';
import { BrowserSession } from './BrowserSession';

// Configuration
const PORT = process.env.PORT || 3001;
const MAX_SESSIONS = parseInt(process.env.MAX_SESSIONS || '50');
const SCREENSHOT_QUALITY = parseInt(process.env.SCREENSHOT_QUALITY || '60');
const FPS = parseInt(process.env.FPS || '30');

// Initialize managers
const sessionManager = new SessionManager(MAX_SESSIONS);
const securityManager = new SecurityManager({
  windowMs: 60000, // 1 minute
  maxRequests: 100, // 100 requests per minute per IP
});

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting middleware
app.use((req, res, next) => {
  const clientIp = securityManager.getClientIp(req);

  if (!securityManager.checkRateLimit(clientIp)) {
    return res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
    });
  }

  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    sessions: sessionManager.getActiveSessions(),
    maxSessions: sessionManager.getMaxSessions(),
  });
});

// Create session endpoint
app.post('/api/session/create', async (req, res) => {
  try {
    const sessionId = await sessionManager.createSession({
      screenshotQuality: SCREENSHOT_QUALITY,
      fps: FPS,
    });

    res.json({
      success: true,
      sessionId,
    });
  } catch (error: any) {
    console.error('Failed to create session:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create session',
    });
  }
});

// Destroy session endpoint
app.delete('/api/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionManager.hasSession(sessionId)) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    await sessionManager.destroySession(sessionId);

    res.json({
      success: true,
      message: 'Session destroyed',
    });
  } catch (error: any) {
    console.error('Failed to destroy session:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to destroy session',
    });
  }
});

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// WebSocket connection handler
wss.on('connection', (ws: WebSocket, req) => {
  const clientIp = req.socket.remoteAddress || 'unknown';
  console.log(`WebSocket connection from ${clientIp}`);

  let currentSession: BrowserSession | null = null;
  let sessionId: string | null = null;

  // Handle incoming messages
  ws.on('message', async (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());

      // Handle different message types
      switch (message.type) {
        case 'connect':
          sessionId = message.sessionId;

          if (!sessionId) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Session ID required',
            }));
            return;
          }

          currentSession = sessionManager.getSession(sessionId) || null;

          if (!currentSession) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Session not found',
            }));
            return;
          }

          // Set up session event listeners
          currentSession.on('screenshot', ({ screenshot }) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'screenshot',
                data: screenshot,
              }));
            }
          });

          currentSession.on('navigation', ({ url }) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'navigation',
                url,
              }));
            }
          });

          currentSession.on('error', ({ message: errorMessage }) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'error',
                message: errorMessage,
              }));
            }
          });

          // Start screenshot streaming
          currentSession.startScreenshotStreaming();

          ws.send(JSON.stringify({
            type: 'connected',
            sessionId,
          }));

          break;

        case 'navigate':
          if (!currentSession) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'No active session',
            }));
            return;
          }

          const urlValidation = securityManager.validateUrl(message.url);
          if (!urlValidation.valid) {
            ws.send(JSON.stringify({
              type: 'error',
              message: urlValidation.error,
            }));
            return;
          }

          await currentSession.navigate(message.url);
          break;

        case 'click':
          if (!currentSession) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'No active session',
            }));
            return;
          }

          await currentSession.click({
            x: message.x,
            y: message.y,
            button: message.button,
          });
          break;

        case 'type':
          if (!currentSession) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'No active session',
            }));
            return;
          }

          await currentSession.type(message.text);
          break;

        case 'keypress':
          if (!currentSession) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'No active session',
            }));
            return;
          }

          await currentSession.keyPress(message.key);
          break;

        case 'scroll':
          if (!currentSession) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'No active session',
            }));
            return;
          }

          await currentSession.scroll({
            deltaX: message.deltaX || 0,
            deltaY: message.deltaY || 0,
          });
          break;

        case 'back':
          if (!currentSession) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'No active session',
            }));
            return;
          }

          await currentSession.goBack();
          break;

        case 'forward':
          if (!currentSession) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'No active session',
            }));
            return;
          }

          await currentSession.goForward();
          break;

        case 'reload':
          if (!currentSession) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'No active session',
            }));
            return;
          }

          await currentSession.reload();
          break;

        case 'viewport':
          if (!currentSession) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'No active session',
            }));
            return;
          }

          await currentSession.setViewport(message.width, message.height);
          break;

        case 'getUrl':
          if (!currentSession) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'No active session',
            }));
            return;
          }

          const url = await currentSession.getCurrentUrl();
          ws.send(JSON.stringify({
            type: 'currentUrl',
            url,
          }));
          break;

        default:
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Unknown message type',
          }));
      }
    } catch (error: any) {
      console.error('WebSocket message error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message || 'Internal server error',
      }));
    }
  });

  // Handle connection close
  ws.on('close', () => {
    console.log(`WebSocket disconnected from ${clientIp}`);

    if (currentSession) {
      currentSession.stopScreenshotStreaming();
    }
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║          Mini Browser Server Started                      ║
║                                                           ║
║  Server:    http://localhost:${PORT}                     ║
║  WebSocket: ws://localhost:${PORT}                       ║
║  Max Sessions: ${MAX_SESSIONS}                                      ║
║  FPS: ${FPS}                                                  ║
║  Screenshot Quality: ${SCREENSHOT_QUALITY}%                         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');

  await sessionManager.destroyAllSessions();

  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');

  await sessionManager.destroyAllSessions();

  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
