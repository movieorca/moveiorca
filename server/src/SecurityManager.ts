import { Request } from 'express';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export class SecurityManager {
  private ipRequestCounts: Map<string, { count: number; resetTime: number }> = new Map();
  private rateLimitConfig: RateLimitConfig;

  constructor(config?: Partial<RateLimitConfig>) {
    this.rateLimitConfig = {
      windowMs: config?.windowMs || 60000, // 1 minute
      maxRequests: config?.maxRequests || 100,
    };

    // Clean up old entries every minute
    setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = this.ipRequestCounts.get(ip);

    if (!record || now > record.resetTime) {
      // Create new record
      this.ipRequestCounts.set(ip, {
        count: 1,
        resetTime: now + this.rateLimitConfig.windowMs,
      });
      return true;
    }

    if (record.count >= this.rateLimitConfig.maxRequests) {
      return false; // Rate limit exceeded
    }

    record.count++;
    return true;
  }

  validateUrl(url: string): { valid: boolean; error?: string } {
    try {
      const parsedUrl = new URL(url);

      // Only allow http and https
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return {
          valid: false,
          error: 'Only HTTP and HTTPS protocols are allowed',
        };
      }

      // Block internal/private IPs
      const blockedPatterns = [
        /^localhost$/i,
        /^127\.\d+\.\d+\.\d+$/,
        /^0\.0\.0\.0$/,
        /^10\.\d+\.\d+\.\d+$/,
        /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
        /^192\.168\.\d+\.\d+$/,
        /^169\.254\.\d+\.\d+$/,
        /^\[?::1\]?$/,
        /^\[?fe80:/i,
        /^\[?fc00:/i,
      ];

      for (const pattern of blockedPatterns) {
        if (pattern.test(parsedUrl.hostname)) {
          return {
            valid: false,
            error: 'Access to internal networks is blocked',
          };
        }
      }

      // Block file:// and other dangerous protocols
      const dangerousProtocols = ['file:', 'ftp:', 'data:', 'javascript:'];
      if (dangerousProtocols.includes(parsedUrl.protocol)) {
        return {
          valid: false,
          error: 'Protocol not allowed',
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid URL format',
      };
    }
  }

  getClientIp(req: Request): string {
    // Try to get real IP from various headers (considering proxies)
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }

    const realIp = req.headers['x-real-ip'];
    if (typeof realIp === 'string') {
      return realIp;
    }

    return req.socket.remoteAddress || 'unknown';
  }

  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [ip, record] of this.ipRequestCounts.entries()) {
      if (now > record.resetTime) {
        toDelete.push(ip);
      }
    }

    toDelete.forEach(ip => this.ipRequestCounts.delete(ip));
  }
}
