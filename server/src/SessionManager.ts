import { BrowserSession, BrowserSessionConfig } from './BrowserSession';
import { v4 as uuidv4 } from 'uuid';

export class SessionManager {
  private sessions: Map<string, BrowserSession> = new Map();
  private maxSessions: number;
  private cleanupInterval: NodeJS.Timeout;

  constructor(maxSessions: number = 50) {
    this.maxSessions = maxSessions;

    // Cleanup idle sessions every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanupIdleSessions();
    }, 60000);
  }

  async createSession(config?: Partial<BrowserSessionConfig>): Promise<string> {
    // Check if we've reached max sessions
    if (this.sessions.size >= this.maxSessions) {
      // Try to clean up idle sessions first
      await this.cleanupIdleSessions();

      // If still at max, reject
      if (this.sessions.size >= this.maxSessions) {
        throw new Error('Maximum number of sessions reached');
      }
    }

    const sessionId = uuidv4();

    const sessionConfig: BrowserSessionConfig = {
      sessionId,
      maxIdleTime: config?.maxIdleTime || 600000, // 10 minutes
      screenshotQuality: config?.screenshotQuality || 60,
      fps: config?.fps || 30,
    };

    const session = new BrowserSession(sessionConfig);

    try {
      await session.initialize();
      this.sessions.set(sessionId, session);

      console.log(`Session created: ${sessionId} (Total: ${this.sessions.size}/${this.maxSessions})`);

      return sessionId;
    } catch (error) {
      await session.destroy();
      throw error;
    }
  }

  getSession(sessionId: string): BrowserSession | undefined {
    return this.sessions.get(sessionId);
  }

  hasSession(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  async destroySession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);

    if (session) {
      await session.destroy();
      this.sessions.delete(sessionId);
      console.log(`Session destroyed: ${sessionId} (Total: ${this.sessions.size}/${this.maxSessions})`);
    }
  }

  async destroyAllSessions(): Promise<void> {
    const destroyPromises = Array.from(this.sessions.keys()).map(sessionId =>
      this.destroySession(sessionId)
    );

    await Promise.all(destroyPromises);
    console.log('All sessions destroyed');
  }

  private async cleanupIdleSessions(): Promise<void> {
    const idleSessions: string[] = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.isIdle()) {
        idleSessions.push(sessionId);
      }
    }

    if (idleSessions.length > 0) {
      console.log(`Cleaning up ${idleSessions.length} idle sessions`);

      for (const sessionId of idleSessions) {
        await this.destroySession(sessionId);
      }
    }
  }

  getActiveSessions(): number {
    return this.sessions.size;
  }

  getMaxSessions(): number {
    return this.maxSessions;
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.destroyAllSessions();
  }
}
