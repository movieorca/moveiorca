import puppeteer, { Browser, Page } from 'puppeteer';
import { EventEmitter } from 'events';

export interface BrowserSessionConfig {
  sessionId: string;
  maxIdleTime?: number; // milliseconds
  screenshotQuality?: number; // 0-100
  fps?: number; // frames per second
}

export interface ClickEvent {
  x: number;
  y: number;
  button?: 'left' | 'right' | 'middle';
}

export interface KeyboardEvent {
  type: 'keydown' | 'keyup' | 'keypress';
  key: string;
}

export interface ScrollEvent {
  deltaX: number;
  deltaY: number;
}

export class BrowserSession extends EventEmitter {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private sessionId: string;
  private isActive: boolean = false;
  private lastActivityTime: number = Date.now();
  private screenshotInterval: NodeJS.Timeout | null = null;
  private config: Required<BrowserSessionConfig>;
  private viewport = { width: 1280, height: 720 };

  constructor(config: BrowserSessionConfig) {
    super();
    this.sessionId = config.sessionId;
    this.config = {
      sessionId: config.sessionId,
      maxIdleTime: config.maxIdleTime || 600000, // 10 minutes
      screenshotQuality: config.screenshotQuality || 60,
      fps: config.fps || 30,
    };
  }

  async initialize(): Promise<void> {
    try {
      // Launch browser with security settings
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          // Security: Prevent accessing local files
          '--disable-file-system',
          // Block certain protocols
          '--disable-features=TranslateUI',
        ],
      });

      this.page = await this.browser.newPage();

      // Set viewport
      await this.page.setViewport(this.viewport);

      // Set user agent to avoid detection
      await this.page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // Enable JavaScript
      await this.page.setJavaScriptEnabled(true);

      // Set default navigation timeout
      await this.page.setDefaultNavigationTimeout(30000);

      this.isActive = true;
      this.updateActivity();

      console.log(`Browser session ${this.sessionId} initialized`);
    } catch (error) {
      console.error(`Failed to initialize session ${this.sessionId}:`, error);
      throw error;
    }
  }

  async navigate(url: string): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');

    this.updateActivity();

    try {
      // Validate URL and prevent internal network access
      const parsedUrl = new URL(url);

      // Block internal/private IPs
      const blockedHosts = [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        '10.',
        '172.16.',
        '192.168.',
        '169.254.',
      ];

      if (blockedHosts.some(blocked => parsedUrl.hostname.startsWith(blocked))) {
        throw new Error('Access to internal networks is blocked');
      }

      // Only allow http and https
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Only HTTP and HTTPS protocols are allowed');
      }

      await this.page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      this.emit('navigation', { url: this.page.url() });
    } catch (error: any) {
      console.error(`Navigation error in session ${this.sessionId}:`, error.message);
      this.emit('error', { message: error.message });
      throw error;
    }
  }

  async click(event: ClickEvent): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');

    this.updateActivity();

    try {
      const button = event.button === 'right' ? 'right' :
                     event.button === 'middle' ? 'middle' : 'left';

      await this.page.mouse.click(event.x, event.y, { button });
    } catch (error: any) {
      console.error(`Click error in session ${this.sessionId}:`, error.message);
      this.emit('error', { message: error.message });
    }
  }

  async type(text: string): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');

    this.updateActivity();

    try {
      await this.page.keyboard.type(text, { delay: 10 });
    } catch (error: any) {
      console.error(`Type error in session ${this.sessionId}:`, error.message);
      this.emit('error', { message: error.message });
    }
  }

  async keyPress(key: string): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');

    this.updateActivity();

    try {
      await this.page.keyboard.press(key);
    } catch (error: any) {
      console.error(`Key press error in session ${this.sessionId}:`, error.message);
      this.emit('error', { message: error.message });
    }
  }

  async scroll(event: ScrollEvent): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');

    this.updateActivity();

    try {
      await this.page.evaluate((deltaX, deltaY) => {
        window.scrollBy(deltaX, deltaY);
      }, event.deltaX, event.deltaY);
    } catch (error: any) {
      console.error(`Scroll error in session ${this.sessionId}:`, error.message);
      this.emit('error', { message: error.message });
    }
  }

  async goBack(): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');

    this.updateActivity();

    try {
      await this.page.goBack({ waitUntil: 'networkidle2' });
      this.emit('navigation', { url: this.page.url() });
    } catch (error: any) {
      console.error(`Go back error in session ${this.sessionId}:`, error.message);
      this.emit('error', { message: error.message });
    }
  }

  async goForward(): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');

    this.updateActivity();

    try {
      await this.page.goForward({ waitUntil: 'networkidle2' });
      this.emit('navigation', { url: this.page.url() });
    } catch (error: any) {
      console.error(`Go forward error in session ${this.sessionId}:`, error.message);
      this.emit('error', { message: error.message });
    }
  }

  async reload(): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');

    this.updateActivity();

    try {
      await this.page.reload({ waitUntil: 'networkidle2' });
      this.emit('navigation', { url: this.page.url() });
    } catch (error: any) {
      console.error(`Reload error in session ${this.sessionId}:`, error.message);
      this.emit('error', { message: error.message });
    }
  }

  async captureScreenshot(): Promise<string> {
    if (!this.page) throw new Error('Browser not initialized');

    try {
      const screenshot = await this.page.screenshot({
        type: 'jpeg',
        quality: this.config.screenshotQuality,
        encoding: 'base64',
      });

      return screenshot as string;
    } catch (error: any) {
      console.error(`Screenshot error in session ${this.sessionId}:`, error.message);
      throw error;
    }
  }

  startScreenshotStreaming(): void {
    if (this.screenshotInterval) return;

    const intervalMs = 1000 / this.config.fps;

    this.screenshotInterval = setInterval(async () => {
      try {
        const screenshot = await this.captureScreenshot();
        this.emit('screenshot', { screenshot });
      } catch (error) {
        console.error('Screenshot streaming error:', error);
      }
    }, intervalMs);

    console.log(`Screenshot streaming started for session ${this.sessionId} at ${this.config.fps} FPS`);
  }

  stopScreenshotStreaming(): void {
    if (this.screenshotInterval) {
      clearInterval(this.screenshotInterval);
      this.screenshotInterval = null;
      console.log(`Screenshot streaming stopped for session ${this.sessionId}`);
    }
  }

  async setViewport(width: number, height: number): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');

    this.viewport = { width, height };
    await this.page.setViewport(this.viewport);
    this.updateActivity();
  }

  async getCurrentUrl(): Promise<string> {
    if (!this.page) throw new Error('Browser not initialized');
    return this.page.url();
  }

  async getTitle(): Promise<string> {
    if (!this.page) throw new Error('Browser not initialized');
    return this.page.title();
  }

  private updateActivity(): void {
    this.lastActivityTime = Date.now();
  }

  isIdle(): boolean {
    return Date.now() - this.lastActivityTime > this.config.maxIdleTime;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  isActiveSession(): boolean {
    return this.isActive;
  }

  async destroy(): Promise<void> {
    this.stopScreenshotStreaming();
    this.isActive = false;

    if (this.browser) {
      try {
        await this.browser.close();
        console.log(`Browser session ${this.sessionId} destroyed`);
      } catch (error) {
        console.error(`Error destroying session ${this.sessionId}:`, error);
      }
    }

    this.browser = null;
    this.page = null;
    this.removeAllListeners();
  }
}
