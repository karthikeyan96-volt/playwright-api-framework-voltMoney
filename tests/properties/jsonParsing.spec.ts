/**
 * Property-Based Tests for JSON Response Parsing
 * 
 * Tests Property 7: JSON Responses Are Automatically Parsed
 * Validates: Requirements 12.2
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
   * Expose parseResponse for testing
   */
  public async testParseResponse(response: any): Promise<any> {
    return this.parseResponse(response);
  }
}

/**
 * Mock response object for testing
 */
class MockResponse {
  private contentType: string;
  private body: any;

  constructor(contentType: string, body: any) {
    this.contentType = contentType;
    this.body = body;
  }

  headers(): Record<string, string> {
    return {
      'content-type': this.contentType
    };
  }

  async json(): Promise<any> {
    return JSON.parse(this.body);
  }

  async text(): Promise<string> {
    return this.body;
  }
}

test.describe('JSON Response Parsing Properties', { tag: '@FrameworkCheckTests' }, () => {
  let testHelper: TestHelper;

  test.beforeAll(async ({ request }) => {
    testHelper = new TestHelper(request);
  });

  // Feature: playwright-api-framework, Property 7: JSON Responses Are Automatically Parsed
  test('should automatically parse JSON responses with application/json content type', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary JSON objects
        fc.jsonValue(),
        async (jsonData) => {
          const jsonString = JSON.stringify(jsonData);
          const mockResponse = new MockResponse('application/json', jsonString);

          const result = await testHelper.testParseResponse(mockResponse);

          // Verify the result matches the original data after JSON parsing
          // Note: JSON strings remain strings after parsing, which is correct behavior
          expect(result).toEqual(jsonData);
          
          // Verify that the response was parsed (not returned as the raw JSON string)
          if (typeof jsonData === 'object' && jsonData !== null) {
            expect(typeof result).toBe('object');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should parse JSON with charset in content type', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.jsonValue(),
        fc.constantFrom('utf-8', 'UTF-8', 'iso-8859-1'),
        async (jsonData, charset) => {
          const jsonString = JSON.stringify(jsonData);
          const contentType = `application/json; charset=${charset}`;
          const mockResponse = new MockResponse(contentType, jsonString);

          const result = await testHelper.testParseResponse(mockResponse);

          expect(result).toEqual(jsonData);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should return text for non-JSON content types', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string(),
        fc.constantFrom('text/plain', 'text/html', 'text/xml', 'application/xml'),
        async (textData, contentType) => {
          const mockResponse = new MockResponse(contentType, textData);

          const result = await testHelper.testParseResponse(mockResponse);

          // Verify the result is returned as text
          expect(result).toBe(textData);
          expect(typeof result).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should handle empty JSON objects', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant({}),
        async (emptyObj) => {
          const jsonString = JSON.stringify(emptyObj);
          const mockResponse = new MockResponse('application/json', jsonString);

          const result = await testHelper.testParseResponse(mockResponse);

          expect(result).toEqual({});
          expect(typeof result).toBe('object');
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should handle JSON arrays', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.jsonValue()),
        async (arrayData) => {
          const jsonString = JSON.stringify(arrayData);
          const mockResponse = new MockResponse('application/json', jsonString);

          const result = await testHelper.testParseResponse(mockResponse);

          expect(Array.isArray(result)).toBe(true);
          expect(result).toEqual(arrayData);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should handle nested JSON objects', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          user: fc.record({
            id: fc.integer(),
            name: fc.string(),
            email: fc.emailAddress()
          }),
          metadata: fc.record({
            timestamp: fc.integer(),
            version: fc.string()
          })
        }),
        async (nestedData) => {
          const jsonString = JSON.stringify(nestedData);
          const mockResponse = new MockResponse('application/json', jsonString);

          const result = await testHelper.testParseResponse(mockResponse);

          expect(result).toEqual(nestedData);
          expect(result.user).toBeDefined();
          expect(result.metadata).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should handle JSON with various data types', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          stringField: fc.string(),
          numberField: fc.integer(),
          booleanField: fc.boolean(),
          nullField: fc.constant(null),
          arrayField: fc.array(fc.integer()),
          objectField: fc.record({
            nested: fc.string()
          })
        }),
        async (complexData) => {
          const jsonString = JSON.stringify(complexData);
          const mockResponse = new MockResponse('application/json', jsonString);

          const result = await testHelper.testParseResponse(mockResponse);

          expect(result).toEqual(complexData);
          expect(typeof result.stringField).toBe('string');
          expect(typeof result.numberField).toBe('number');
          expect(typeof result.booleanField).toBe('boolean');
          expect(result.nullField).toBeNull();
          expect(Array.isArray(result.arrayField)).toBe(true);
          expect(typeof result.objectField).toBe('object');
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should handle missing content-type header', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string(),
        async (textData) => {
          // Mock response with no content-type header
          const mockResponse = {
            headers: () => ({}),
            text: async () => textData,
            json: async () => { throw new Error('Should not be called'); }
          };

          const result = await testHelper.testParseResponse(mockResponse);

          // Should default to text parsing when content-type is missing
          expect(result).toBe(textData);
        }
      ),
      { numRuns: 100 }
    );
  });
});
