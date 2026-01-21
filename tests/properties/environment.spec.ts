import { test, expect } from '@playwright/test';
import fc from 'fast-check';
import { getBaseUrl, envConfig } from '../../config/envconfig';

test.describe('Environment Configuration Properties', { tag: '@FrameworkCheckTests' }, () => {
  // Feature: playwright-api-framework, Property 1: Environment Selection Returns Correct Base URL
  // **Validates: Requirements 2.3, 2.4**
  test('should return correct base URL for any valid environment', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('dev', 'staging', 'prod'),
        (env) => {
          const baseUrl = getBaseUrl(env);
          const expectedUrl = envConfig[env as keyof typeof envConfig].baseUrl;
          return baseUrl === expectedUrl;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should return dev base URL when no environment is specified', () => {
    const originalEnv = process.env.TEST_ENV;
    delete process.env.TEST_ENV;
    
    const baseUrl = getBaseUrl();
    expect(baseUrl).toBe(envConfig.dev.baseUrl);
    
    // Restore original environment
    if (originalEnv) {
      process.env.TEST_ENV = originalEnv;
    }
  });

  test('should return correct base URL for dev environment', () => {
    const baseUrl = getBaseUrl('dev');
    expect(baseUrl).toBe(envConfig.dev.baseUrl);
  });

  test('should return correct base URL for staging environment', () => {
    const baseUrl = getBaseUrl('staging');
    expect(baseUrl).toBe(envConfig.staging.baseUrl);
  });

  test('should return correct base URL for prod environment', () => {
    const baseUrl = getBaseUrl('prod');
    expect(baseUrl).toBe(envConfig.prod.baseUrl);
  });

  test('should throw error for invalid environment', () => {
    expect(() => getBaseUrl('invalid')).toThrow('Invalid environment: invalid');
  });

  test('should use TEST_ENV environment variable when set', () => {
    const originalEnv = process.env.TEST_ENV;
    
    process.env.TEST_ENV = 'staging';
    const baseUrl = getBaseUrl();
    expect(baseUrl).toBe(envConfig.staging.baseUrl);
    
    // Restore original environment
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
    fc.assert(
      fc.property(
        fc.constantFrom('dev', 'staging', 'prod'),
        (env) => {
          const baseUrl = envConfig[env as keyof typeof envConfig].baseUrl;
          return baseUrl.startsWith('https://');
        }
      ),
      { numRuns: 100 }
    );
  });
});
