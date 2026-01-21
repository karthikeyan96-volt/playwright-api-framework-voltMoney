import { test, expect } from '@playwright/test';
import { Logger, LogLevel } from '../../../utils/logger';

test.describe('Logger', () => {
  test('should create logger with default INFO log level', () => {
    const logger = new Logger('test-context');
    expect(logger).toBeDefined();
  });

  test('should create logger with custom log level', () => {
    const logger = new Logger('test-context', LogLevel.DEBUG);
    expect(logger).toBeDefined();
  });

  test('should log debug messages when log level is DEBUG', () => {
    const logger = new Logger('test-context', LogLevel.DEBUG);
    const originalLog = console.log;
    const messages: string[] = [];
    console.log = (...args: any[]) => {
      messages.push(args.join(' '));
    };

    logger.debug('Debug message');

    console.log = originalLog;

    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0]).toContain('[DEBUG]');
    expect(messages[0]).toContain('[test-context]');
    expect(messages[0]).toContain('Debug message');
  });

  test('should not log debug messages when log level is INFO', () => {
    const logger = new Logger('test-context', LogLevel.INFO);
    const originalLog = console.log;
    const messages: string[] = [];
    console.log = (...args: any[]) => {
      messages.push(args.join(' '));
    };

    logger.debug('Debug message');

    console.log = originalLog;

    expect(messages.length).toBe(0);
  });

  test('should log info messages when log level is INFO', () => {
    const logger = new Logger('test-context', LogLevel.INFO);
    const originalLog = console.log;
    const messages: string[] = [];
    console.log = (...args: any[]) => {
      messages.push(args.join(' '));
    };

    logger.info('Info message');

    console.log = originalLog;

    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0]).toContain('[INFO]');
    expect(messages[0]).toContain('[test-context]');
    expect(messages[0]).toContain('Info message');
  });

  test('should log warn messages when log level is WARN', () => {
    const logger = new Logger('test-context', LogLevel.WARN);
    const originalWarn = console.warn;
    const messages: string[] = [];
    console.warn = (...args: any[]) => {
      messages.push(args.join(' '));
    };

    logger.warn('Warning message');

    console.warn = originalWarn;

    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0]).toContain('[WARN]');
    expect(messages[0]).toContain('[test-context]');
    expect(messages[0]).toContain('Warning message');
  });

  test('should not log info messages when log level is WARN', () => {
    const logger = new Logger('test-context', LogLevel.WARN);
    const originalLog = console.log;
    const messages: string[] = [];
    console.log = (...args: any[]) => {
      messages.push(args.join(' '));
    };

    logger.info('Info message');

    console.log = originalLog;

    expect(messages.length).toBe(0);
  });

  test('should log error messages at any log level', () => {
    const logger = new Logger('test-context', LogLevel.ERROR);
    const originalError = console.error;
    const messages: string[] = [];
    console.error = (...args: any[]) => {
      messages.push(args.join(' '));
    };

    logger.error('Error message');

    console.error = originalError;

    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0]).toContain('[ERROR]');
    expect(messages[0]).toContain('[test-context]');
    expect(messages[0]).toContain('Error message');
  });

  test('should include timestamp in log messages', () => {
    const logger = new Logger('test-context', LogLevel.INFO);
    const originalLog = console.log;
    const messages: string[] = [];
    console.log = (...args: any[]) => {
      messages.push(args.join(' '));
    };

    logger.info('Test message');

    console.log = originalLog;

    expect(messages.length).toBeGreaterThan(0);
    // Check for ISO timestamp format (YYYY-MM-DDTHH:mm:ss)
    expect(messages[0]).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  test('should log message with additional data object', () => {
    const logger = new Logger('test-context', LogLevel.INFO);
    const originalLog = console.log;
    const messages: any[][] = [];
    console.log = (...args: any[]) => {
      messages.push(args);
    };

    const testData = { key: 'value', number: 42 };
    logger.info('Test message', testData);

    console.log = originalLog;

    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0][0]).toContain('Test message');
    expect(messages[0][1]).toEqual(testData);
  });

  test('should format log messages with level, context, and timestamp', () => {
    const logger = new Logger('my-pod', LogLevel.DEBUG);
    const originalLog = console.log;
    const messages: string[] = [];
    console.log = (...args: any[]) => {
      messages.push(args.join(' '));
    };

    logger.debug('Test debug');
    logger.info('Test info');

    console.log = originalLog;

    expect(messages.length).toBe(2);
    
    // Verify DEBUG message format
    expect(messages[0]).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*\]\[DEBUG\]\[my-pod\] Test debug/);
    
    // Verify INFO message format
    expect(messages[1]).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*\]\[INFO\]\[my-pod\] Test info/);
  });
});
