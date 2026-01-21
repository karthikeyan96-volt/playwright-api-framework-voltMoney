import { test, expect } from '@playwright/test';
import fc from 'fast-check';
import creds from '../../config/creds.json';
import { CredentialsConfig } from '../../types/config.types';

test.describe('Credentials Configuration Properties', { tag: '@FrameworkCheckTests' }, () => {
  // Feature: playwright-api-framework, Property 3: All Pod Credentials Contain Required Fields
  // **Validates: Requirements 4.3**
  test('should contain all required fields for any pod credentials', () => {
    const credsConfig = creds as CredentialsConfig;
    
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(credsConfig)),
        (podName) => {
          const podCreds = credsConfig[podName];
          
          // Verify all required fields exist
          expect(podCreds).toHaveProperty('userid');
          expect(podCreds).toHaveProperty('email');
          expect(podCreds).toHaveProperty('password');
          expect(podCreds).toHaveProperty('authToken');
          
          // Verify field types
          expect(typeof podCreds.userid).toBe('string');
          expect(typeof podCreds.email).toBe('string');
          expect(typeof podCreds.password).toBe('string');
          expect(typeof podCreds.authToken).toBe('string');
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should have credentials organized by pod', () => {
    const credsConfig = creds as CredentialsConfig;
    
    // Verify LOS pod exists
    expect(credsConfig).toHaveProperty('los');
    expect(typeof credsConfig.los).toBe('object');
    
    // Verify LMS pod exists
    expect(credsConfig).toHaveProperty('lms');
    expect(typeof credsConfig.lms).toBe('object');
  });

  test('should have non-empty userid for all pods', () => {
    const credsConfig = creds as CredentialsConfig;
    
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(credsConfig)),
        (podName) => {
          const podCreds = credsConfig[podName];
          
          // Verify userid is not empty
          expect(podCreds.userid.length).toBeGreaterThan(0);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should have valid email format for all pods', () => {
    const credsConfig = creds as CredentialsConfig;
    
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(credsConfig)),
        (podName) => {
          const podCreds = credsConfig[podName];
          
          // Verify email contains @ symbol
          expect(podCreds.email).toContain('@');
          
          // Verify email is not empty
          expect(podCreds.email.length).toBeGreaterThan(0);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should have non-empty password for all pods', () => {
    const credsConfig = creds as CredentialsConfig;
    
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(credsConfig)),
        (podName) => {
          const podCreds = credsConfig[podName];
          
          // Verify password is not empty
          expect(podCreds.password.length).toBeGreaterThan(0);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should have authToken field (may be empty initially) for all pods', () => {
    const credsConfig = creds as CredentialsConfig;
    
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(credsConfig)),
        (podName) => {
          const podCreds = credsConfig[podName];
          
          // Verify authToken field exists (can be empty string)
          expect(podCreds).toHaveProperty('authToken');
          expect(typeof podCreds.authToken).toBe('string');
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should have LOS-specific credentials', () => {
    const credsConfig = creds as CredentialsConfig;
    
    expect(credsConfig.los).toHaveProperty('userid');
    expect(credsConfig.los).toHaveProperty('email');
    expect(credsConfig.los).toHaveProperty('password');
    expect(credsConfig.los).toHaveProperty('authToken');
    
    // LOS also has phoneNo and otp for OTP-based authentication
    expect(credsConfig.los).toHaveProperty('phoneNo');
    expect(credsConfig.los).toHaveProperty('otp');
  });

  test('should have LMS-specific credentials', () => {
    const credsConfig = creds as CredentialsConfig;
    
    expect(credsConfig.lms).toHaveProperty('userid');
    expect(credsConfig.lms).toHaveProperty('email');
    expect(credsConfig.lms).toHaveProperty('password');
    expect(credsConfig.lms).toHaveProperty('authToken');
  });

  test('should have unique credentials per pod', () => {
    const credsConfig = creds as CredentialsConfig;
    
    // Verify LOS and LMS have different credentials
    expect(credsConfig.los.userid).not.toBe(credsConfig.lms.userid);
    expect(credsConfig.los.email).not.toBe(credsConfig.lms.email);
  });
});
