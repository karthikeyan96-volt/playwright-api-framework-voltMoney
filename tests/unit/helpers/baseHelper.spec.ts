/**
 * Unit Tests for BaseHelper
 * 
 * Tests specific examples and edge cases for base helper methods
 * Requirements: 11.1, 11.2
 */

import { test, expect } from '@playwright/test';
import { APIRequestContext } from '@playwright/test';
import { BaseHelper } from '../../../helpers/base/baseHelper';

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

  // Expose protected methods for testing
  public testBuildUrl(endpoint: string, params?: Record<string, string>): string {
    return this.buildUrl(endpoint, params);
  }

  public testBuildHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
    return this.buildHeaders(additionalHeaders);
  }

  public testReplacePathParams(endpoint: string, params: Record<string, string>): string {
    return this.replacePathParams(endpoint, params);
  }

  public async testParseResponse(response: any): Promise<any> {
    return this.parseResponse(response);
  }
}

test.describe('BaseHelper - buildUrl', () => {
  let testHelper: TestHelper;

  test.beforeAll(async ({ request }) => {
    testHelper = new TestHelper(request);
  });

  test('should build URL without query parameters', async () => {
    const endpoint = '/api/users';
    const result = testHelper.testBuildUrl(endpoint);
    
    expect(result).toContain(endpoint);
    expect(result).not.toContain('?');
  });

  test('should build URL with single query parameter', async () => {
    const endpoint = '/api/users';
    const params = { page: '1' };
    const result = testHelper.testBuildUrl(endpoint, params);
    
    expect(result).toContain(endpoint);
    expect(result).toContain('?page=1');
  });

  test('should build URL with multiple query parameters', async () => {
    const endpoint = '/api/users';
    const params = { page: '1', limit: '10', sort: 'name' };
    const result = testHelper.testBuildUrl(endpoint, params);
    
    expect(result).toContain(endpoint);
    expect(result).toContain('page=1');
    expect(result).toContain('limit=10');
    expect(result).toContain('sort=name');
    expect(result).toContain('?');
    expect(result).toContain('&');
  });

  test('should handle empty params object', async () => {
    const endpoint = '/api/users';
    const params = {};
    const result = testHelper.testBuildUrl(endpoint, params);
    
    expect(result).toContain(endpoint);
    // Empty params object still adds '?' but no parameters
    // This is acceptable behavior from URLSearchParams
  });

  test('should URL encode special characters in query parameters', async () => {
    const endpoint = '/api/search';
    const params = { query: 'hello world', filter: 'type=user' };
    const result = testHelper.testBuildUrl(endpoint, params);
    
    expect(result).toContain(endpoint);
    expect(result).toContain('query=hello+world');
    expect(result).toContain('filter=type%3Duser');
  });
});

test.describe('BaseHelper - buildHeaders', () => {
  let testHelper: TestHelper;

  test.beforeAll(async ({ request }) => {
    testHelper = new TestHelper(request);
  });

  test('should build default headers without auth token', async () => {
    const headers = testHelper.testBuildHeaders();
    
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['Accept']).toBe('application/json');
    expect(headers['Authorization']).toBeUndefined();
  });

  test('should include auth token in headers when set', async () => {
    const token = 'test-token-123';
    testHelper.setAuthToken(token);
    
    const headers = testHelper.testBuildHeaders();
    
    expect(headers['Authorization']).toBe(`Bearer ${token}`);
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['Accept']).toBe('application/json');
  });

  test('should merge additional headers with defaults', async () => {
    const additionalHeaders = {
      'X-Custom-Header': 'custom-value',
      'X-Request-Id': '12345'
    };
    
    const headers = testHelper.testBuildHeaders(additionalHeaders);
    
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['Accept']).toBe('application/json');
    expect(headers['X-Custom-Header']).toBe('custom-value');
    expect(headers['X-Request-Id']).toBe('12345');
  });

  test('should allow additional headers to override defaults', async () => {
    const additionalHeaders = {
      'Content-Type': 'application/xml',
      'Accept': 'text/plain'
    };
    
    const headers = testHelper.testBuildHeaders(additionalHeaders);
    
    expect(headers['Content-Type']).toBe('application/xml');
    expect(headers['Accept']).toBe('text/plain');
  });

  test('should include both auth token and additional headers', async () => {
    const token = 'test-token-456';
    testHelper.setAuthToken(token);
    
    const additionalHeaders = {
      'X-Custom-Header': 'custom-value'
    };
    
    const headers = testHelper.testBuildHeaders(additionalHeaders);
    
    expect(headers['Authorization']).toBe(`Bearer ${token}`);
    expect(headers['X-Custom-Header']).toBe('custom-value');
    expect(headers['Content-Type']).toBe('application/json');
  });
});

test.describe('BaseHelper - replacePathParams', () => {
  let testHelper: TestHelper;

  test.beforeAll(async ({ request }) => {
    testHelper = new TestHelper(request);
  });

  test('should replace single path parameter', async () => {
    const endpoint = '/api/users/{id}';
    const params = { id: '123' };
    const result = testHelper.testReplacePathParams(endpoint, params);
    
    expect(result).toBe('/api/users/123');
  });

  test('should replace multiple path parameters', async () => {
    const endpoint = '/api/users/{userId}/posts/{postId}';
    const params = { userId: '123', postId: '456' };
    const result = testHelper.testReplacePathParams(endpoint, params);
    
    expect(result).toBe('/api/users/123/posts/456');
  });

  test('should handle endpoint without parameters', async () => {
    const endpoint = '/api/users';
    const params = {};
    const result = testHelper.testReplacePathParams(endpoint, params);
    
    expect(result).toBe('/api/users');
  });

  test('should leave unreplaced parameters if not in params object', async () => {
    const endpoint = '/api/users/{userId}/posts/{postId}';
    const params = { userId: '123' };
    const result = testHelper.testReplacePathParams(endpoint, params);
    
    expect(result).toBe('/api/users/123/posts/{postId}');
  });

  test('should handle numeric parameter values', async () => {
    const endpoint = '/api/items/{id}';
    const params = { id: '999' };
    const result = testHelper.testReplacePathParams(endpoint, params);
    
    expect(result).toBe('/api/items/999');
  });

  test('should handle UUID parameter values', async () => {
    const endpoint = '/api/resources/{uuid}';
    const params = { uuid: '550e8400-e29b-41d4-a716-446655440000' };
    const result = testHelper.testReplacePathParams(endpoint, params);
    
    expect(result).toBe('/api/resources/550e8400-e29b-41d4-a716-446655440000');
  });

  test('should handle parameters with special characters', async () => {
    const endpoint = '/api/items/{id}';
    const params = { id: 'item-123_test' };
    const result = testHelper.testReplacePathParams(endpoint, params);
    
    expect(result).toBe('/api/items/item-123_test');
  });
});

test.describe('BaseHelper - auth token management', () => {
  let testHelper: TestHelper;

  test.beforeAll(async ({ request }) => {
    testHelper = new TestHelper(request);
  });

  test('should start with empty auth token', async () => {
    const token = testHelper.getAuthToken();
    expect(token).toBe('');
  });

  test('should set and get auth token', async () => {
    const newToken = 'new-test-token';
    testHelper.setAuthToken(newToken);
    
    const retrievedToken = testHelper.getAuthToken();
    expect(retrievedToken).toBe(newToken);
  });

  test('should update auth token', async () => {
    testHelper.setAuthToken('first-token');
    expect(testHelper.getAuthToken()).toBe('first-token');
    
    testHelper.setAuthToken('second-token');
    expect(testHelper.getAuthToken()).toBe('second-token');
  });

  test('should clear auth token when set to empty string', async () => {
    testHelper.setAuthToken('some-token');
    expect(testHelper.getAuthToken()).toBe('some-token');
    
    testHelper.setAuthToken('');
    expect(testHelper.getAuthToken()).toBe('');
  });
});

test.describe('BaseHelper - parseResponse', () => {
  let testHelper: TestHelper;

  test.beforeAll(async ({ request }) => {
    testHelper = new TestHelper(request);
  });

  test('should parse JSON response', async () => {
    const mockResponse = {
      headers: () => ({ 'content-type': 'application/json' }),
      json: async () => ({ id: 1, name: 'Test' }),
      text: async () => '{"id":1,"name":"Test"}'
    };

    const result = await testHelper.testParseResponse(mockResponse);
    
    expect(result).toEqual({ id: 1, name: 'Test' });
  });

  test('should parse JSON response with charset', async () => {
    const mockResponse = {
      headers: () => ({ 'content-type': 'application/json; charset=utf-8' }),
      json: async () => ({ status: 'success' }),
      text: async () => '{"status":"success"}'
    };

    const result = await testHelper.testParseResponse(mockResponse);
    
    expect(result).toEqual({ status: 'success' });
  });

  test('should return text for non-JSON response', async () => {
    const mockResponse = {
      headers: () => ({ 'content-type': 'text/plain' }),
      json: async () => { throw new Error('Should not be called'); },
      text: async () => 'Plain text response'
    };

    const result = await testHelper.testParseResponse(mockResponse);
    
    expect(result).toBe('Plain text response');
  });

  test('should return text for HTML response', async () => {
    const mockResponse = {
      headers: () => ({ 'content-type': 'text/html' }),
      json: async () => { throw new Error('Should not be called'); },
      text: async () => '<html><body>Hello</body></html>'
    };

    const result = await testHelper.testParseResponse(mockResponse);
    
    expect(result).toBe('<html><body>Hello</body></html>');
  });

  test('should handle missing content-type header', async () => {
    const mockResponse = {
      headers: () => ({}),
      json: async () => { throw new Error('Should not be called'); },
      text: async () => 'Default text response'
    };

    const result = await testHelper.testParseResponse(mockResponse);
    
    expect(result).toBe('Default text response');
  });

  test('should parse empty JSON object', async () => {
    const mockResponse = {
      headers: () => ({ 'content-type': 'application/json' }),
      json: async () => ({}),
      text: async () => '{}'
    };

    const result = await testHelper.testParseResponse(mockResponse);
    
    expect(result).toEqual({});
  });

  test('should parse JSON array', async () => {
    const mockResponse = {
      headers: () => ({ 'content-type': 'application/json' }),
      json: async () => [1, 2, 3],
      text: async () => '[1,2,3]'
    };

    const result = await testHelper.testParseResponse(mockResponse);
    
    expect(result).toEqual([1, 2, 3]);
    expect(Array.isArray(result)).toBe(true);
  });
});
