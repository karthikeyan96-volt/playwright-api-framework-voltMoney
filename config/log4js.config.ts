/**
 * log4js Configuration
 * 
 * Configures logging for the entire framework with:
 * - Console appender for real-time monitoring
 * - Date-based file appenders for persistent logs
 * - Separate log files per pod (LOS, LMS)
 * - Error-only log file for quick error tracking
 */

import { Configuration } from 'log4js';

export const log4jsConfig: Configuration = {
  appenders: {
    // Console appender - shows logs in terminal
    console: {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '%[[%d{yyyy-MM-dd hh:mm:ss}] [%p] [%c]%] %m'
      }
    },
    
    // Date-based file appender for LOS logs
    losFile: {
      type: 'dateFile',
      filename: 'logs/los/los',
      pattern: '-yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      layout: {
        type: 'pattern',
        pattern: '[%d{yyyy-MM-dd hh:mm:ss}] [%p] [%c] %m'
      }
    },
    
    // Date-based file appender for LMS logs
    lmsFile: {
      type: 'dateFile',
      filename: 'logs/lms/lms',
      pattern: '-yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      layout: {
        type: 'pattern',
        pattern: '[%d{yyyy-MM-dd hh:mm:ss}] [%p] [%c] %m'
      }
    },
    
    // Date-based file appender for all logs
    allFile: {
      type: 'dateFile',
      filename: 'logs/all/all',
      pattern: '-yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      layout: {
        type: 'pattern',
        pattern: '[%d{yyyy-MM-dd hh:mm:ss}] [%p] [%c] %m'
      }
    },
    
    // Error-only file appender
    errorFile: {
      type: 'dateFile',
      filename: 'logs/errors/error',
      pattern: '-yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      layout: {
        type: 'pattern',
        pattern: '[%d{yyyy-MM-dd hh:mm:ss}] [%p] [%c] %m'
      }
    },
    
    // Filtered error appender
    errors: {
      type: 'logLevelFilter',
      appender: 'errorFile',
      level: 'error'
    }
  },
  
  categories: {
    // Default category
    default: {
      appenders: ['console', 'allFile', 'errors'],
      level: 'info'
    },
    
    // LOS category
    los: {
      appenders: ['console', 'losFile', 'allFile', 'errors'],
      level: 'debug'
    },
    
    // LMS category
    lms: {
      appenders: ['console', 'lmsFile', 'allFile', 'errors'],
      level: 'debug'
    },
    
    // Test category
    test: {
      appenders: ['console', 'allFile', 'errors'],
      level: 'info'
    }
  }
};
