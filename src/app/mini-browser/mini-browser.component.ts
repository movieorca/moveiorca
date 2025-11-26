import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';

interface Message {
  type: string;
  [key: string]: any;
}

@Component({
  selector: 'app-mini-browser',
  templateUrl: './mini-browser.component.html',
  styleUrls: ['./mini-browser.component.css']
})
export class MiniBrowserComponent implements OnInit, OnDestroy {
  @ViewChild('browserCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private ws: WebSocket | null = null;
  private sessionId: string | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  // UI State
  currentUrl: string = '';
  addressBarUrl: string = '';
  isLoading: boolean = false;
  isConnected: boolean = false;
  errorMessage: string = '';
  canGoBack: boolean = false;
  canGoForward: boolean = false;

  // Server configuration
  private readonly SERVER_URL = 'http://localhost:3001';
  private readonly WS_URL = 'ws://localhost:3001';

  // Canvas dimensions
  private readonly CANVAS_WIDTH = 1280;
  private readonly CANVAS_HEIGHT = 720;

  // Auto-load configuration
  private readonly AUTO_LOAD_URL = 'https://www.fcm.org.co/simit/';
  private readonly SHOW_CONTROLS = false; // Set to false to hide address bar
  private readonly ALLOW_NAVIGATION = false; // Set to false to lock to one site

  ngOnInit(): void {
    this.initializeCanvas();
    this.createSession();
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  private initializeCanvas(): void {
    this.canvas = this.canvasRef.nativeElement;
    if (this.canvas) {
      this.canvas.width = this.CANVAS_WIDTH;
      this.canvas.height = this.CANVAS_HEIGHT;
      this.ctx = this.canvas.getContext('2d');

      // Draw placeholder
      if (this.ctx) {
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
          'Connecting to browser...',
          this.CANVAS_WIDTH / 2,
          this.CANVAS_HEIGHT / 2
        );
      }
    }
  }

  private async createSession(): Promise<void> {
    try {
      this.isLoading = true;
      this.errorMessage = '';

      const response = await fetch(`${this.SERVER_URL}/api/session/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success && data.sessionId) {
        this.sessionId = data.sessionId;
        this.connectWebSocket();
      } else {
        throw new Error(data.error || 'Failed to create session');
      }
    } catch (error: any) {
      console.error('Failed to create session:', error);
      this.errorMessage = `Failed to create session: ${error.message}`;
      this.isLoading = false;
    }
  }

  private connectWebSocket(): void {
    if (!this.sessionId) return;

    try {
      this.ws = new WebSocket(this.WS_URL);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;

        // Send connect message
        this.sendMessage({
          type: 'connect',
          sessionId: this.sessionId,
        });
      };

      this.ws.onmessage = (event) => {
        this.handleWebSocketMessage(event.data);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.errorMessage = 'WebSocket connection error';
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
      };
    } catch (error: any) {
      console.error('Failed to connect WebSocket:', error);
      this.errorMessage = `Failed to connect: ${error.message}`;
    }
  }

  private handleWebSocketMessage(data: string): void {
    try {
      const message: Message = JSON.parse(data);

      switch (message.type) {
        case 'connected':
          console.log('Session connected:', message.sessionId);
          this.isLoading = false;
          // Auto-load the configured URL
          if (this.AUTO_LOAD_URL) {
            setTimeout(() => {
              this.navigate(this.AUTO_LOAD_URL);
            }, 500);
          }
          break;

        case 'screenshot':
          this.renderScreenshot(message.data);
          break;

        case 'navigation':
          this.currentUrl = message.url;
          this.addressBarUrl = message.url;
          this.isLoading = false;
          break;

        case 'currentUrl':
          this.currentUrl = message.url;
          this.addressBarUrl = message.url;
          break;

        case 'error':
          console.error('Server error:', message.message);
          this.errorMessage = message.message;
          this.isLoading = false;
          break;

        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Failed to handle WebSocket message:', error);
    }
  }

  private renderScreenshot(base64Image: string): void {
    if (!this.ctx || !this.canvas) return;

    const img = new Image();
    img.onload = () => {
      if (this.ctx && this.canvas) {
        this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
      }
    };
    img.src = `data:image/jpeg;base64,${base64Image}`;
  }

  private sendMessage(message: Message): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  // Navigation controls
  navigate(url?: string): void {
    const targetUrl = url || this.addressBarUrl;

    if (!targetUrl) {
      this.errorMessage = 'Please enter a URL';
      return;
    }

    // If navigation is locked and trying to navigate to different URL, block it
    if (!this.ALLOW_NAVIGATION && url !== this.AUTO_LOAD_URL && this.currentUrl) {
      this.errorMessage = 'Navigation is locked to the configured website';
      return;
    }

    // Add protocol if missing
    let formattedUrl = targetUrl;
    if (!formattedUrl.match(/^https?:\/\//i)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.sendMessage({
      type: 'navigate',
      url: formattedUrl,
    });
  }

  // Check if controls should be shown
  shouldShowControls(): boolean {
    return this.SHOW_CONTROLS;
  }

  goBack(): void {
    this.isLoading = true;
    this.sendMessage({ type: 'back' });
  }

  goForward(): void {
    this.isLoading = true;
    this.sendMessage({ type: 'forward' });
  }

  reload(): void {
    this.isLoading = true;
    this.sendMessage({ type: 'reload' });
  }

  // Mouse event handlers
  onCanvasClick(event: MouseEvent): void {
    if (!this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.CANVAS_WIDTH / rect.width;
    const scaleY = this.CANVAS_HEIGHT / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    this.sendMessage({
      type: 'click',
      x: Math.round(x),
      y: Math.round(y),
      button: event.button === 2 ? 'right' : event.button === 1 ? 'middle' : 'left',
    });
  }

  onCanvasContextMenu(event: MouseEvent): void {
    event.preventDefault();
    this.onCanvasClick(event);
  }

  onCanvasWheel(event: WheelEvent): void {
    event.preventDefault();

    this.sendMessage({
      type: 'scroll',
      deltaX: event.deltaX,
      deltaY: event.deltaY,
    });
  }

  // Keyboard event handlers
  onKeyDown(event: KeyboardEvent): void {
    // Handle special keys
    if (event.key === 'Enter') {
      event.preventDefault();
      this.navigate();
    } else if (event.ctrlKey || event.metaKey) {
      // Allow some shortcuts
      if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        this.reload();
      }
    }
  }

  onCanvasKeyPress(event: KeyboardEvent): void {
    if (!this.isConnected) return;

    // Don't send if typing in address bar
    if (document.activeElement?.tagName === 'INPUT') return;

    // Send regular key presses to browser
    if (event.key.length === 1) {
      this.sendMessage({
        type: 'type',
        text: event.key,
      });
    } else {
      // Send special keys (Enter, Tab, etc.)
      this.sendMessage({
        type: 'keypress',
        key: event.key,
      });
    }
  }

  // Session management
  private async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.sessionId) {
      try {
        await fetch(`${this.SERVER_URL}/api/session/${this.sessionId}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Failed to destroy session:', error);
      }
      this.sessionId = null;
    }
  }

  // Quick navigation shortcuts
  loadGoogle(): void {
    this.addressBarUrl = 'https://www.google.com';
    this.navigate();
  }

  loadGitHub(): void {
    this.addressBarUrl = 'https://github.com';
    this.navigate();
  }

  loadExample(): void {
    this.addressBarUrl = 'https://example.com';
    this.navigate();
  }
}
