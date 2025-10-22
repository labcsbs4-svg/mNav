import { Location, Road } from '../mapTypes/map';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
}

class Logger {
  private static instance: Logger;
  private logs: LogMessage[] = [];
  private subscribers: Array<(logs: LogMessage[]) => void> = [];
  private originalConsole: Partial<typeof console> = {};

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: LogLevel, message: string, data?: any): LogMessage {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data: this.serializeForLog(data),
    };
  }

  // Convert Error and other non-serializable things into plain objects
  private serializeForLog(value: any): any {
    if (value === null || value === undefined) return value;
    if (value instanceof Error) {
      return { name: value.name, message: value.message, stack: value.stack };
    }
    // DOMException and other Error-like objects
    if (typeof (value as any).message === 'string' && typeof (value as any).name === 'string' && (value as any).stack) {
      return { name: (value as any).name, message: (value as any).message, stack: (value as any).stack };
    }
    // For responses or complex objects, attempt structured clone via JSON stringify with replacer
    try {
      return JSON.parse(JSON.stringify(value, (_k, v) => {
        if (v instanceof Error) return { name: v.name, message: v.message, stack: v.stack };
        // avoid circular references by replacing functions and symbols
        if (typeof v === 'function') return `[Function: ${v.name || 'anonymous'}]`;
        if (typeof v === 'symbol') return v.toString();
        return v;
      }));
    } catch (e) {
      // fallback to toString
      try { return String(value); } catch { return '<unserializable>'; }
    }
  }

  private async sendToServer(logMessage: LogMessage) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logMessage),
      });
    } catch (error) {
      // preserve original console.error if available
      (this.originalConsole.error || console.error).call(console, 'Failed to send log to server:', error);
    }
  }

  // Subscribe / unsubscribe for real-time UI updates
  subscribe(fn: (logs: LogMessage[]) => void) {
    this.subscribers.push(fn);
    // send current snapshot immediately
    fn(this.getLogs());
    return () => this.unsubscribe(fn);
  }

  unsubscribe(fn: (logs: LogMessage[]) => void) {
    this.subscribers = this.subscribers.filter(f => f !== fn);
  }

  private notify() {
    const snapshot = this.getLogs();
    this.subscribers.forEach(fn => {
      try { fn(snapshot); } catch (e) {
        (this.originalConsole.error || console.error).call(console, 'Error in log subscriber', e);
      }
    });
  }

  // Intercept console methods so console.log/warn/error/debug/info appear in the UI
  attachConsoleInterceptors() {
    if ((this.originalConsole as any)._attached) return;
    this.originalConsole.log = console.log;
    this.originalConsole.info = console.info;
    this.originalConsole.warn = console.warn;
    this.originalConsole.error = console.error;
    this.originalConsole.debug = console.debug;
    (this.originalConsole as any)._attached = true;

    console.log = (...args: any[]) => {
      this.info('console.log', { args });
      (this.originalConsole.log || console.log).apply(console, args);
    };
    console.info = (...args: any[]) => {
      this.info('console.info', { args });
      (this.originalConsole.info || console.info).apply(console, args);
    };
    console.warn = (...args: any[]) => {
      this.warn('console.warn', { args });
      (this.originalConsole.warn || console.warn).apply(console, args);
    };
    console.error = (...args: any[]) => {
      this.error('console.error', { args });
      (this.originalConsole.error || console.error).apply(console, args);
    };
    console.debug = (...args: any[]) => {
      this.debug('console.debug', { args });
      (this.originalConsole.debug || console.debug).apply(console, args);
    };
  }

  info(message: string, data?: any) {
    const logMessage = this.formatMessage('info', message, data);
    this.logs.push(logMessage);
    this.sendToServer(logMessage);
    this.notify();
  }

  warn(message: string, data?: any) {
    const logMessage = this.formatMessage('warn', message, data);
    this.logs.push(logMessage);
    this.sendToServer(logMessage);
    this.notify();
  }

  error(message: string, data?: any) {
    const logMessage = this.formatMessage('error', message, data);
    this.logs.push(logMessage);
    this.sendToServer(logMessage);
    this.notify();
  }

  debug(message: string, data?: any) {
    const logMessage = this.formatMessage('debug', message, data);
    this.logs.push(logMessage);
    this.sendToServer(logMessage);
    this.notify();
  }

  // Map-specific logging methods
  logLocationDeletion(location: Location | null, clickedPosition: [number, number]) {
    if (location) {
      this.info('Location deleted', {
        action: 'delete_location',
        locationId: location.id,
        locationName: location.name,
        locationCategory: location.category,
        coordinates: [location.lat, location.lng]
      });
    } else {
      this.warn('Failed to delete location - no location found at click position', {
        action: 'delete_location_failed',
        clickedPosition
      });
    }
  }

  logRoadDeletion(road: Road | null, clickedPosition: [number, number]) {
    if (road) {
      this.info('Road deleted', {
        action: 'delete_road',
        roadId: road.id,
        roadName: road.name,
        roadType: road.type,
        coordinates: road.coordinates
      });
    } else {
      this.warn('Failed to delete road - no road found at click position', {
        action: 'delete_road_failed',
        clickedPosition
      });
    }
  }

  getLogs(): LogMessage[] {
    return this.logs;
  }
}

export const logger = Logger.getInstance();