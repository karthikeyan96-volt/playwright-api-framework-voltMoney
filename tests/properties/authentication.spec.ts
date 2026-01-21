/**
 * Property-Based Tests for Authentication Token Storage and Usage
 * 
 * Tests Property 4: Authentication Stores and Uses Token
 * Validates: Requirements 6.1, 6.2
 */

import { test, expect } from '@playwright/test';
import fc from 'fast-check';
import { APIRequestContext } from '@playwright/test';
import { BaseHelper } from '../../helpers/base/baseHelper';

/**
 * Concrete implementation of BaseHelper for testing purposes
 */
class TestHelper extends BaseHelper {
  constructor(request: APIRequestContext) {
    super(request, 'test');
  }

  async login(): Promise<void> {
    // Simulate login by setting a token
    this.setAuthToken('test-token-from-login');
  }

  /**
   * Expose buildHeaders for testing
   */
  public testBuildHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
    return this.buildHeaders(additionalHeaders);
  }
}

test.describe('Authentication Token Storage and Usage Properties', { tag: '@FrameworkCheckTests' }, () => {
  // Feature: playwright-api-framework, Property 4: Authentication Stores and Uses Token
  test('should store authentication token after login', async ({ request }) => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 100 }),
        async (token) => {
          // Create a fresh helper for each iteration
          const testHelper = new TestHelper(request);
          
          // Initially, token should be empty
          expect(testHelper.getAuthToken()).toBe('');

          // Set token (simulating successful login)
          testHelper.setAuthToken(token);

          // Verify token is stored
          expect(testHelper.getAuthToken()).toBe(token);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should include authentication token in request headers after login', async ({ request }) => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 100 }),
        async (token) => {
          // Create a fresh helper for each iteration
          const testHelper = new TestHelper(request);
          
          // Set token (simulating successful login)
          testHelper.setAuthToken(token);

          // Build headers for a request
          const headers = testHelper.testBuildHeaders();

          // Verify Authorization header is present with Bearer token
          expect(headers['Authorization']).toBe(`Bearer ${token}`);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should not include Authorization header before authentication', async ({ request }) => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null),
        async () => {
          // Create a fresh helper for each iteration
          const testHelper = new TestHelper(request);
          
          // Ensure no token is set
          expect(testHelper.getAuthToken()).toBe('');

          // Build headers
          const headers = testHelper.testBuildHeaders();

          // Verify Authorization header is not present
          expect(headers['Authorization']).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should update token when set multiple times', async ({ request }) => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.string({ minLength: 10, maxLength: 100 }), { minLength: 2, maxLength: 5 }),
        async (tokens) => {
          // Create a fresh helper for each iteration
          const testHelper = new TestHelper(request);
          
          // Set each token in sequence
          for (const token of tokens) {
            testHelper.setAuthToken(token);
            expect(testHelper.getAuthToken()).toBe(token);

            // Verify it's used in headers
            const headers = testHelper.testBuildHeaders();
            expect(headers['Authorization']).toBe(`Bearer ${token}`);
          }

          // Final token should be the last one set
          const lastToken = tokens[tokens.length - 1];
          expect(testHelper.getAuthToken()).toBe(lastToken);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should clear token when set to empty string', async ({ request }) => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 100 }),
        async (token) => {
          // Create a fresh helper for each iteration
          const testHelper = new TestHelper(request);
          
          // Set a token
          testHelper.setAuthToken(token);
          expect(testHelper.getAuthToken()).toBe(token);

          // Clear the token
          testHelper.setAuthToken('');
          expect(testHelper.getAuthToken()).toBe('');

          // Verify Authorization header is not present after clearing
          const headers = testHelper.testBuildHeaders();
          expect(headers['Authorization']).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should preserve token across multiple header builds', async ({ request }) => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 100 }),
        fc.integer({ min: 2, max: 10 }),
        async (token, numRequests) => {
          // Create a fresh helper for each iteration
          const testHelper = new TestHelper(request);
          
          // Set token once
          testHelper.setAuthToken(token);

          // Build headers multiple times
          for (let i = 0; i < numRequests; i++) {
            const headers = testHelper.testBuildHeaders();
            expect(headers['Authorization']).toBe(`Bearer ${token}`);
          }

          // Token should still be the same
          expect(testHelper.getAuthToken()).toBe(token);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should include token with additional headers', async ({ request }) => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 100 }),
        fc.record({
          'X-Custom-Header': fc.string(),
          'X-Request-Id': fc.uuid()
        }),
        async (token, additionalHeaders) => {
          // Create a fresh helper for each iteration
          const testHelper = new TestHelper(request);
          
          // Set token
          testHelper.setAuthToken(token);

          // Build headers with additional headers
          const headers = testHelper.testBuildHeaders(additionalHeaders);

          // Verify both token and additional headers are present
          expect(headers['Authorization']).toBe(`Bearer ${token}`);
          expect(headers['X-Custom-Header']).toBe(additionalHeaders['X-Custom-Header']);
          expect(headers['X-Request-Id']).toBe(additionalHeaders['X-Request-Id']);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should handle various token formats', async ({ request }) => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          // JWT-like tokens
          fc.string({ minLength: 100, maxLength: 200 }),
          // UUID tokens
          fc.uuid(),
          // Alphanumeric tokens
          fc.stringMatching(/^[a-zA-Z0-9]+$/),
          // Base64-like tokens
          fc.stringMatching(/^[a-zA-Z0-9+/=]+$/)
        ),
        async (token) => {
          // Create a fresh helper for each iteration
          const testHelper = new TestHelper(request);
          
          testHelper.setAuthToken(token);

          // Verify token is stored correctly
          expect(testHelper.getAuthToken()).toBe(token);

          // Verify it's used in headers correctly
          const headers = testHelper.testBuildHeaders();
          expect(headers['Authorization']).toBe(`Bearer ${token}`);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should maintain token isolation between helper instances', async ({ request }) => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 100 }),
        fc.string({ minLength: 10, maxLength: 100 }),
        async (token1, token2) => {
          // Create two separate helper instances
          const helper1 = new TestHelper(request);
          const helper2 = new TestHelper(request);

          // Set different tokens
          helper1.setAuthToken(token1);
          helper2.setAuthToken(token2);

          // Verify each helper has its own token
          expect(helper1.getAuthToken()).toBe(token1);
          expect(helper2.getAuthToken()).toBe(token2);

          // Verify headers are independent
          const headers1 = helper1.testBuildHeaders();
          const headers2 = helper2.testBuildHeaders();

          expect(headers1['Authorization']).toBe(`Bearer ${token1}`);
          expect(headers2['Authorization']).toBe(`Bearer ${token2}`);
        }
      ),
      { numRuns: 100 }
    );
  });
});
