import { test, expect } from '@playwright/test';
import fc from 'fast-check';
import endpoints from '../../config/endpoints.json';
import { EndpointsConfig } from '../../types/config.types';

test.describe('Endpoints Configuration Properties', { tag: '@FrameworkCheckTests' }, () => {
  // Feature: playwright-api-framework, Property 2: All Endpoints Use Relative Paths
  // **Validates: Requirements 3.4**
  test('should use relative paths for all endpoints (no protocol or domain)', () => {
    const endpointsConfig = endpoints as EndpointsConfig;
    
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(endpointsConfig)),
        (podName) => {
          const podEndpoints = endpointsConfig[podName];
          
          // Iterate through all categories and endpoints
          for (const category of Object.keys(podEndpoints)) {
            for (const endpointName of Object.keys(podEndpoints[category])) {
              const endpointPath = podEndpoints[category][endpointName];
              
              // Verify no protocol (http:// or https://)
              expect(endpointPath).not.toMatch(/^https?:\/\//);
              
              // Verify no domain name (should start with /)
              expect(endpointPath).toMatch(/^\//);
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should have endpoints organized by pod', () => {
    const endpointsConfig = endpoints as EndpointsConfig;
    
    // Verify LOS pod exists
    expect(endpointsConfig).toHaveProperty('los');
    expect(typeof endpointsConfig.los).toBe('object');
    
    // Verify LMS pod exists
    expect(endpointsConfig).toHaveProperty('lms');
    expect(typeof endpointsConfig.lms).toBe('object');
  });

  test('should have auth endpoints for all pods', () => {
    const endpointsConfig = endpoints as EndpointsConfig;
    
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(endpointsConfig)),
        (podName) => {
          const podEndpoints = endpointsConfig[podName];
          
          // Verify auth category exists
          expect(podEndpoints).toHaveProperty('auth');
          expect(typeof podEndpoints.auth).toBe('object');
          
          // Verify at least one auth endpoint exists
          const authEndpoints = Object.keys(podEndpoints.auth);
          expect(authEndpoints.length).toBeGreaterThan(0);
          
          // Each pod may have different auth endpoints
          // LOS: requestOtp, verifyOtp, getUserData, logout
          // LMS: login, logout
          for (const endpoint of authEndpoints) {
            expect(typeof podEndpoints.auth[endpoint]).toBe('string');
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should have valid endpoint paths (start with /)', () => {
    const endpointsConfig = endpoints as EndpointsConfig;
    
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(endpointsConfig)),
        (podName) => {
          const podEndpoints = endpointsConfig[podName];
          
          for (const category of Object.keys(podEndpoints)) {
            for (const endpointName of Object.keys(podEndpoints[category])) {
              const endpointPath = podEndpoints[category][endpointName];
              
              // Verify path starts with /
              expect(endpointPath).toMatch(/^\//);
              
              // Verify path is not empty
              expect(endpointPath.length).toBeGreaterThan(1);
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should have LOS-specific endpoints', () => {
    const endpointsConfig = endpoints as EndpointsConfig;
    
    // Verify LOS has auth endpoints (used in login tests)
    expect(endpointsConfig.los).toHaveProperty('auth');
    expect(endpointsConfig.los.auth).toHaveProperty('requestOtp');
    expect(endpointsConfig.los.auth).toHaveProperty('verifyOtp');
    expect(endpointsConfig.los.auth).toHaveProperty('getUserData');
    expect(endpointsConfig.los.auth).toHaveProperty('logout');
  });

  test('should have LMS-specific endpoints', () => {
    const endpointsConfig = endpoints as EndpointsConfig;
    
    // Verify LMS has auth endpoints
    expect(endpointsConfig.lms).toHaveProperty('auth');
    expect(endpointsConfig.lms.auth).toHaveProperty('login');
    expect(endpointsConfig.lms.auth).toHaveProperty('logout');
  });

  test('should not contain query parameters in endpoint paths', () => {
    const endpointsConfig = endpoints as EndpointsConfig;
    
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(endpointsConfig)),
        (podName) => {
          const podEndpoints = endpointsConfig[podName];
          
          for (const category of Object.keys(podEndpoints)) {
            for (const endpointName of Object.keys(podEndpoints[category])) {
              const endpointPath = podEndpoints[category][endpointName];
              
              // Verify no query parameters (?)
              expect(endpointPath).not.toContain('?');
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should not contain fragments in endpoint paths', () => {
    const endpointsConfig = endpoints as EndpointsConfig;
    
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(endpointsConfig)),
        (podName) => {
          const podEndpoints = endpointsConfig[podName];
          
          for (const category of Object.keys(podEndpoints)) {
            for (const endpointName of Object.keys(podEndpoints[category])) {
              const endpointPath = podEndpoints[category][endpointName];
              
              // Verify no fragments (#)
              expect(endpointPath).not.toContain('#');
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
