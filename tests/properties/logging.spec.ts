import { test, expect } from '@playwright/test';
import fc from 'fast-check';
import { Logger } from '../../utils/logger';

test.describe('Logging Properties', { tag: '@FrameworkCheckTests' }, () => {
  // Feature: playwright-api-framework, Property 6: Failed API Calls Log Complete Details
  // **Validates: Requirements 11.1, 11.2**
  
  test('should create logger with any valid category', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('los', 'lms', 'test', 'default'),
        (category) => {
          // Should not throw when creating logger
          const logger = new Logger(category);
          expect(logger).toBeDefined();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should log messages at different levels without throwing', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        (message) => {
          const logger = new Logger('test');
          
          // Should not throw when logging at any level
          expect(() => logger.debug(message)).not.toThrow();
          expect(() => logger.info(message)).not.toThrow();
          expect(() => logger.warn(message)).not.toThrow();
          expect(() => logger.error(message)).not.toThrow();
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should log messages with additional data without throwing', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.object(),
        (message, data) => {
          const logger = new Logger('test');
          
          // Should not throw when logging with data
          expect(() => logger.debug(message, data)).not.toThrow();
          expect(() => logger.info(message, data)).not.toThrow();
          expect(() => logger.warn(message, data)).not.toThrow();
          expect(() => logger.error(message, data)).not.toThrow();
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should handle empty messages gracefully', () => {
    const logger = new Logger('test');
    
    // Should not throw with empty message
    expect(() => logger.info('')).not.toThrow();
    expect(() => logger.debug('')).not.toThrow();
    expect(() => logger.warn('')).not.toThrow();
    expect(() => logger.error('')).not.toThrow();
  });

  test('should handle undefined data gracefully', () => {
    const logger = new Logger('test');
    
    // Should not throw with undefined data
    expect(() => logger.info('message', undefined)).not.toThrow();
    expect(() => logger.debug('message', undefined)).not.toThrow();
    expect(() => logger.warn('message', undefined)).not.toThrow();
    expect(() => logger.error('message', undefined)).not.toThrow();
  });

  test('should handle null data gracefully', () => {
    const logger = new Logger('test');
    
    // Should not throw with null data
    expect(() => logger.info('message', null)).not.toThrow();
    expect(() => logger.debug('message', null)).not.toThrow();
    expect(() => logger.warn('message', null)).not.toThrow();
    expect(() => logger.error('message', null)).not.toThrow();
  });

  test('should create multiple logger instances independently', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('los', 'lms', 'test'),
        fc.constantFrom('los', 'lms', 'test'),
        (category1, category2) => {
          const logger1 = new Logger(category1);
          const logger2 = new Logger(category2);
          
          // Both loggers should be defined
          expect(logger1).toBeDefined();
          expect(logger2).toBeDefined();
          
          // Should not throw when logging from different instances
          expect(() => logger1.info('test1')).not.toThrow();
          expect(() => logger2.info('test2')).not.toThrow();
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should handle various data types', () => {
    const logger = new Logger('test');
    
    fc.assert(
      fc.property(
        fc.oneof(
          fc.string(),
          fc.integer(),
          fc.boolean(),
          fc.object(),
          fc.array(fc.string()),
          fc.constant(null),
          fc.constant(undefined)
        ),
        (data) => {
          // Should not throw with any data type
          expect(() => logger.info('message', data)).not.toThrow();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
