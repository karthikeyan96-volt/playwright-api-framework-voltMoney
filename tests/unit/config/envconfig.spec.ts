import { test, expect } from '@playwright/test';
import { getBaseUrl, envConfig } from '../../../config/envconfig';

test.describe('Environment Configuration', () => {
  test('should return dev base URL when no environment is specified', () => {
    // Save original env
    const originalEnv = process.env.TEST_ENV;
    delete process.env.TEST_ENV;

    const baseUrl = getBaseUrl();
    expect(baseUrl).toBe(envConfig.dev.baseUrl);

    // Restore original env
    if (originalEnv) {
      process.env.TEST_ENV = originalEnv;
    }
  });

  test('should return correct base URL for dev environment', () => {
    const baseUrl = getBaseUrl('dev');
    expect(baseUrl).toBe(envConfig.dev.baseUrl);
    expect(baseUrl).toBe('https://dev.example.com');
  });

  test('should return correct base URL for staging environment', () => {
    const baseUrl = getBaseUrl('staging');
    expect(baseUrl).toBe(envConfig.staging.baseUrl);
    expect(baseUrl).toBe('https://staging.example.com');
  });

  test('should return correct base URL for prod environment', () => {
    const baseUrl = getBaseUrl('prod');
    expect(baseUrl).toBe(envConfig.prod.baseUrl);
    expect(baseUrl).toBe('https://prod.example.com');
  });

  test('should throw error for invalid environment', () => {
    expect(() => {
      getBaseUrl('invalid');
    }).toThrow('Invalid environment: invalid');
  });

  test('should use TEST_ENV environment variable when set', () => {
    // Save original env
    const originalEnv = process.env.TEST_ENV;
    
    process.env.TEST_ENV = 'staging';
    const baseUrl = getBaseUrl();
    expect(baseUrl).toBe(envConfig.staging.baseUrl);

    // Restore original env
    if (originalEnv) {
      process.env.TEST_ENV = originalEnv;
    } else {
      delete process.env.TEST_ENV;
    }
  });

  test('should have all required environments configured', () => {
    expect(envConfig).toHaveProperty('dev');
    expect(envConfig).toHaveProperty('staging');
    expect(envConfig).toHaveProperty('prod');
    
    expect(envConfig.dev).toHaveProperty('baseUrl');
    expect(envConfig.staging).toHaveProperty('baseUrl');
    expect(envConfig.prod).toHaveProperty('baseUrl');
  });

  test('should have valid HTTPS URLs for all environments', () => {
    expect(envConfig.dev.baseUrl).toMatch(/^https:\/\//);
    expect(envConfig.staging.baseUrl).toMatch(/^https:\/\//);
    expect(envConfig.prod.baseUrl).toMatch(/^https:\/\//);
  });
});
