import { test, expect } from '@playwright/test';
import { Logger } from '../../../utils/logger';

test.describe('Logger', { tag: '@FrameworkCheckTests' }, () => {
  test('should create logger with category', () => {
    const logger = new Logger('test');
    expect(logger).toBeDefined();
  });

  test('should create logger with los category', () => {
    const logger = new Logger('los');
    expect(logger).toBeDefined();
  });

  test('should create logger with lms category', () => {
    const logger = new Logger('lms');
    expect(logger).toBeDefined();
  });

  test('should log debug message without crashing', () => {
    const logger = new Logger('test');
    expect(() => logger.debug('Debug message')).not.toThrow();
  });

  test('should log info message without crashing', () => {
    const logger = new Logger('test');
    expect(() => logger.info('Info message')).not.toThrow();
  });

  test('should log warn message without crashing', () => {
    const logger = new Logger('test');
    expect(() => logger.warn('Warning message')).not.toThrow();
  });

  test('should log error message without crashing', () => {
    const logger = new Logger('test');
    expect(() => logger.error('Error message')).not.toThrow();
  });

  test('should log message with additional data object', () => {
    const logger = new Logger('test');
    const testData = { key: 'value', number: 42 };
    expect(() => logger.info('Test message', testData)).not.toThrow();
  });

  test('should log message with null data', () => {
    const logger = new Logger('test');
    expect(() => logger.info('Test message', null)).not.toThrow();
  });

  test('should log message with undefined data', () => {
    const logger = new Logger('test');
    expect(() => logger.info('Test message', undefined)).not.toThrow();
  });

  test('should log empty message', () => {
    const logger = new Logger('test');
    expect(() => logger.info('')).not.toThrow();
  });

  test('should log message with complex nested object', () => {
    const logger = new Logger('test');
    const complexData = {
      user: { id: 123, name: 'Test User' },
      response: { status: 200, body: { success: true } },
      array: [1, 2, 3]
    };
    expect(() => logger.info('Complex data', complexData)).not.toThrow();
  });

  test('should handle multiple log calls in sequence', () => {
    const logger = new Logger('test');
    expect(() => {
      logger.debug('First message');
      logger.info('Second message');
      logger.warn('Third message');
      logger.error('Fourth message');
    }).not.toThrow();
  });

  test('should create multiple independent logger instances', () => {
    const logger1 = new Logger('los');
    const logger2 = new Logger('lms');
    
    expect(logger1).toBeDefined();
    expect(logger2).toBeDefined();
    
    expect(() => {
      logger1.info('LOS message');
      logger2.info('LMS message');
    }).not.toThrow();
  });
});
