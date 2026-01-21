/**
 * Property-Based Tests for Path Parameter Replacement
 * 
 * Tests Property 8: Path Parameters Are Correctly Replaced
 * Validates: Requirements 5.4
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
    // No-op for testing
  }

  /**
   * Expose replacePathParams for testing
   */
  public testReplacePathParams(endpoint: string, params: Record<string, string>): string {
    return this.replacePathParams(endpoint, params);
  }
}

test.describe('Path Parameter Replacement Properties', { tag: '@FrameworkCheckTests' }, () => {
  let testHelper: TestHelper;

  test.beforeAll(async ({ request }) => {
    testHelper = new TestHelper(request);
  });

  // Feature: playwright-api-framework, Property 8: Path Parameters Are Correctly Replaced
  test('should replace all path parameters with their corresponding values', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate parameter names and values together
        fc.array(
          fc.record({
            name: fc.stringMatching(/^[a-z]+$/),
            value: fc.stringMatching(/^[a-zA-Z0-9_-]+$/)
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (paramPairs) => {
          // Build the endpoint with placeholders
          const endpoint = `/${paramPairs.map(p => `{${p.name}}`).join('/')}`;
          
          // Build the params object
          const paramsObj: Record<string, string> = {};
          paramPairs.forEach(pair => {
            paramsObj[pair.name] = pair.value;
          });

          // Replace parameters
          const result = testHelper.testReplacePathParams(endpoint, paramsObj);

          // Verify all placeholders are replaced
          for (const [key, value] of Object.entries(paramsObj)) {
            expect(result).toContain(value);
            expect(result).not.toContain(`{${key}}`);
          }

          // Verify the structure is correct
          const expectedPath = `/${paramPairs.map(p => p.value).join('/')}`;
          expect(result).toBe(expectedPath);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should handle single parameter replacement', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.stringMatching(/^[a-z]+$/),
        fc.stringMatching(/^[a-zA-Z0-9_-]+$/),
        async (paramName, paramValue) => {
          const endpoint = `/api/resource/{${paramName}}`;
          const params = { [paramName]: paramValue };

          const result = testHelper.testReplacePathParams(endpoint, params);

          expect(result).toBe(`/api/resource/${paramValue}`);
          expect(result).not.toContain(`{${paramName}}`);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should handle multiple parameters in different positions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.stringMatching(/^[a-zA-Z0-9_-]+$/),
        fc.stringMatching(/^[a-zA-Z0-9_-]+$/),
        fc.stringMatching(/^[a-zA-Z0-9_-]+$/),
        async (id, subId, action) => {
          const endpoint = '/api/resource/{id}/sub/{subId}/action/{action}';
          const params = { id, subId, action };

          const result = testHelper.testReplacePathParams(endpoint, params);

          expect(result).toBe(`/api/resource/${id}/sub/${subId}/action/${action}`);
          expect(result).not.toContain('{id}');
          expect(result).not.toContain('{subId}');
          expect(result).not.toContain('{action}');
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should not modify endpoint without parameters', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.stringMatching(/^\/api\/[a-z]+\/[a-z]+$/),
        async (endpoint) => {
          const params = {};
          const result = testHelper.testReplacePathParams(endpoint, params);
          expect(result).toBe(endpoint);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should handle empty params object gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.stringMatching(/^[a-z]+$/),
        async (paramName) => {
          const endpoint = `/api/resource/{${paramName}}`;
          const params = {};

          const result = testHelper.testReplacePathParams(endpoint, params);

          // Should leave placeholder unchanged if no matching param
          expect(result).toBe(endpoint);
        }
      ),
      { numRuns: 100 }
    );
  });
});
