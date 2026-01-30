

import { Configuration } from 'log4js';

export const log4jsConfig: Configuration = {
  appenders: {

    console: {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '%[[%d{yyyy-MM-dd hh:mm:ss}] [%p] [%c]%] %m'
      }
    },
    

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
    

    errors: {
      type: 'logLevelFilter',
      appender: 'errorFile',
      level: 'error'
    }
  },
  
  categories: {

    default: {
      appenders: ['console', 'allFile', 'errors'],
      level: 'info'
    },
    

    los: {
      appenders: ['console', 'losFile', 'allFile', 'errors'],
      level: 'debug'
    },
    

    lms: {
      appenders: ['console', 'lmsFile', 'allFile', 'errors'],
      level: 'debug'
    },
    

    test: {
      appenders: ['console', 'allFile', 'errors'],
      level: 'info'
    }
  }
};
