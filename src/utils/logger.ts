import { config } from './config.js';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: any;
  error?: Error;
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;

  private constructor() {
    this.logLevel = this.parseLogLevel(config.LOG_LEVEL);
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private parseLogLevel(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'debug': return LogLevel.DEBUG;
      case 'info': return LogLevel.INFO;
      case 'warn': return LogLevel.WARN;
      case 'error': return LogLevel.ERROR;
      default: return LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatLog(entry: LogEntry): string {
    const formatted = {
      timestamp: entry.timestamp,
      level: entry.level,
      message: entry.message,
      ...(entry.context && { context: entry.context }),
      ...(entry.error && { 
        error: {
          message: entry.error.message,
          stack: config.NODE_ENV === 'development' ? entry.error.stack : undefined
        }
      })
    };

    return JSON.stringify(formatted);
  }

  private log(level: LogLevel, message: string, context?: any, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level].toLowerCase(),
      message,
      context,
      error
    };

    const formattedLog = this.formatLog(entry);

    // Use appropriate console method based on level
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedLog);
        break;
      case LogLevel.INFO:
        console.info(formattedLog);
        break;
      case LogLevel.WARN:
        console.warn(formattedLog);
        break;
      case LogLevel.ERROR:
        console.error(formattedLog);
        break;
    }
  }

  public debug(message: string, context?: any): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  public info(message: string, context?: any): void {
    this.log(LogLevel.INFO, message, context);
  }

  public warn(message: string, context?: any): void {
    this.log(LogLevel.WARN, message, context);
  }

  public error(message: string, context?: any, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  // Specific logging methods for MCP operations
  public toolExecution(toolName: string, args: any, success: boolean, duration?: number): void {
    this.info('Tool execution', {
      tool: toolName,
      args: JSON.stringify(args),
      success,
      duration_ms: duration
    });
  }

  public apiCall(method: string, url: string, status: number, duration?: number): void {
    this.info('API call', {
      method,
      url,
      status,
      duration_ms: duration
    });
  }

  public apiError(method: string, url: string, error: Error, status?: number): void {
    this.error('API error', {
      method,
      url,
      status
    }, error);
  }
}

export const logger = Logger.getInstance();
export default Logger.getInstance(); 