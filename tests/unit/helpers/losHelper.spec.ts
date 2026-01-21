import { test, expect } from '@playwright/test';
import { LOSHelper } from '../../../helpers/los/losHelper';

test.describe('LOSHelper Authentication', () => {
  test('should throw descriptive error when login fails with 401', async ({ request }) => {
    const losHelper = new LOSHelper(request);
    
    // Mock the makeRequest to simulate authentication failure
    const originalMakeRequest = losHelper['makeRequest'].bind(losHelper);
    losHelper['makeRequest'] = async (method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH', endpoint: string, options?: any) => {
      if (endpoint.includes('/auth/login')) {
        return {
          status: 401,
          headers: {},
          body: { error: 'Invalid credentials' },
          ok: false
        };
      }
      return originalMakeRequest(method, endpoint, options);
    };

    await expect(losHelper.login()).rejects.toThrow(/LOS login failed: 401/);
  });

  test('should throw descriptive error when login fails with 500', async ({ request }) => {
    const losHelper = new LOSHelper(request);
    
    // Mock the makeRequest to simulate server error
    const originalMakeRequest = losHelper['makeRequest'].bind(losHelper);
    losHelper['makeRequest'] = async (method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH', endpoint: string, options?: any) => {
      if (endpoint.includes('/auth/login')) {
        return {
          status: 500,
          headers: {},
          body: { error: 'Internal server error' },
          ok: false
        };
      }
      return originalMakeRequest(method, endpoint, options);
    };

    await expect(losHelper.login()).rejects.toThrow(/LOS login failed: 500/);
  });

  test('should throw error with response body details on authentication failure', async ({ request }) => {
    const losHelper = new LOSHelper(request);
    
    const errorBody = { error: 'Invalid credentials', code: 'AUTH_FAILED' };
    
    // Mock the makeRequest to simulate authentication failure with detailed error
    const originalMakeRequest = losHelper['makeRequest'].bind(losHelper);
    losHelper['makeRequest'] = async (method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH', endpoint: string, options?: any) => {
      if (endpoint.includes('/auth/login')) {
        return {
          status: 403,
          headers: {},
          body: errorBody,
          ok: false
        };
      }
      return originalMakeRequest(method, endpoint, options);
    };

    await expect(losHelper.login()).rejects.toThrow(
      new RegExp(`LOS login failed: 403 - ${JSON.stringify(errorBody).replace(/[{}]/g, '\\$&')}`)
    );
  });
});
