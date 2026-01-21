import { test, expect } from '@playwright/test';
import fc from 'fast-check';
import losTestData from '../../testdata/los/testdata.json';
import lmsTestData from '../../testdata/lms/testdata.json';
import { PodTestData } from '../../types/testdata.types';

test.describe('Test Data Structure Properties', { tag: '@FrameworkCheckTests' }, () => {
  // Feature: playwright-api-framework, Property 5: Test Data Files Contain Required Structure
  // **Validates: Requirements 7.2, 7.3**
  test('should contain headers object with required fields for any pod', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          { name: 'los', data: losTestData },
          { name: 'lms', data: lmsTestData }
        ),
        (pod) => {
          const testData = pod.data as PodTestData;
          
          // Verify headers object exists
          expect(testData).toHaveProperty('headers');
          expect(typeof testData.headers).toBe('object');
          
          // Verify required header fields
          expect(testData.headers).toHaveProperty('Content-Type');
          expect(testData.headers).toHaveProperty('Accept');
          
          // Verify header values are strings
          expect(typeof testData.headers['Content-Type']).toBe('string');
          expect(typeof testData.headers['Accept']).toBe('string');
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should contain config object with required fields for any pod', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          { name: 'los', data: losTestData },
          { name: 'lms', data: lmsTestData }
        ),
        (pod) => {
          const testData = pod.data as PodTestData;
          
          // Verify config object exists
          expect(testData).toHaveProperty('config');
          expect(typeof testData.config).toBe('object');
          
          // Verify required config fields
          expect(testData.config).toHaveProperty('timeout');
          expect(testData.config).toHaveProperty('retries');
          
          // Verify config values are numbers
          expect(typeof testData.config.timeout).toBe('number');
          expect(typeof testData.config.retries).toBe('number');
          
          // Verify reasonable values
          expect(testData.config.timeout).toBeGreaterThan(0);
          expect(testData.config.retries).toBeGreaterThanOrEqual(0);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should contain both headers and config objects for any pod', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          { name: 'los', data: losTestData },
          { name: 'lms', data: lmsTestData }
        ),
        (pod) => {
          const testData = pod.data as PodTestData;
          
          // Verify both required top-level objects exist
          expect(testData).toHaveProperty('headers');
          expect(testData).toHaveProperty('config');
          
          // Verify they are objects
          expect(typeof testData.headers).toBe('object');
          expect(typeof testData.config).toBe('object');
          
          // Verify they are not null
          expect(testData.headers).not.toBeNull();
          expect(testData.config).not.toBeNull();
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should have valid Content-Type header for any pod', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          { name: 'los', data: losTestData },
          { name: 'lms', data: lmsTestData }
        ),
        (pod) => {
          const testData = pod.data as PodTestData;
          
          // Verify Content-Type exists and is a string
          expect(testData.headers).toHaveProperty('Content-Type');
          expect(typeof testData.headers['Content-Type']).toBe('string');
          expect(testData.headers['Content-Type']).toContain('application/json');
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should have valid Accept header for any pod', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          { name: 'los', data: losTestData },
          { name: 'lms', data: lmsTestData }
        ),
        (pod) => {
          const testData = pod.data as PodTestData;
          
          // Verify Accept exists and is a string
          expect(testData.headers).toHaveProperty('Accept');
          expect(typeof testData.headers['Accept']).toBe('string');
          expect(testData.headers['Accept']).toContain('application/json');
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should have payloads object for any pod', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          { name: 'los', data: losTestData },
          { name: 'lms', data: lmsTestData }
        ),
        (pod) => {
          const testData = pod.data as PodTestData;
          
          // Verify payloads object exists
          expect(testData).toHaveProperty('payloads');
          expect(typeof testData.payloads).toBe('object');
          expect(testData.payloads).not.toBeNull();
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should have reasonable timeout values for any pod', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          { name: 'los', data: losTestData },
          { name: 'lms', data: lmsTestData }
        ),
        (pod) => {
          const testData = pod.data as PodTestData;
          
          // Verify timeout is reasonable (between 1 second and 5 minutes)
          expect(testData.config.timeout).toBeGreaterThanOrEqual(1000);
          expect(testData.config.timeout).toBeLessThanOrEqual(300000);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should have reasonable retry values for any pod', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          { name: 'los', data: losTestData },
          { name: 'lms', data: lmsTestData }
        ),
        (pod) => {
          const testData = pod.data as PodTestData;
          
          // Verify retries is reasonable (between 0 and 10)
          expect(testData.config.retries).toBeGreaterThanOrEqual(0);
          expect(testData.config.retries).toBeLessThanOrEqual(10);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
