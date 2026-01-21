/**
 * Logger Utility using log4js
 * 
 * Provides logging functionality with:
 * - Multiple log levels (DEBUG, INFO, WARN, ERROR)
 * - File-based logging with automatic rotation
 * - Console logging for real-time monitoring
 * - Category-based logging (los, lms, test)
 */

import log4js from 'log4js';
import { log4jsConfig } from '../config/log4js.config';

// Configure log4js
log4js.configure(log4jsConfig);

/**
 * Logger class wrapper around log4js
 * 
 * Usage:
 * const logger = new Logger('los');
 * logger.info('Request sent');
 * logger.debug('Response data:', responseBody);
 * logger.error('Request failed:', error);
 */
export class Logger {
  private logger: log4js.Logger;

  /**
   * Constructor for Logger
   * 
   * @param category - Log category (los, lms, test, or default)
   */
  constructor(category: string) {
    this.logger = log4js.getLogger(category);
  }

  /**
   * Log debug message
   * 
   * @param message - Log message
   * @param data - Optional data to log
   */
  debug(message: string, data?: any): void {
    if (data !== undefined) {
      this.logger.debug(message, data);
    } else {
      this.logger.debug(message);
    }
  }

  /**
   * Log info message
   * 
   * @param message - Log message
   * @param data - Optional data to log
   */
  info(message: string, data?: any): void {
    if (data !== undefined) {
      this.logger.info(message, data);
    } else {
      this.logger.info(message);
    }
  }

  /**
   * Log warning message
   * 
   * @param message - Log message
   * @param data - Optional data to log
   */
  warn(message: string, data?: any): void {
    if (data !== undefined) {
      this.logger.warn(message, data);
    } else {
      this.logger.warn(message);
    }
  }

  /**
   * Log error message
   * 
   * @param message - Log message
   * @param data - Optional data to log
   */
  error(message: string, data?: any): void {
    if (data !== undefined) {
      this.logger.error(message, data);
    } else {
      this.logger.error(message);
    }
  }
}

/**
 * Shutdown log4js gracefully
 * Call this at the end of test execution
 */
export function shutdownLogger(): void {
  log4js.shutdown();
}
