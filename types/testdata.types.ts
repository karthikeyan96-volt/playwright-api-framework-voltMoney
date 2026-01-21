/**
 * Test Data Type Definitions
 * 
 * This file contains TypeScript interfaces for test data files used throughout
 * the Playwright API automation framework. These types ensure type safety when
 * working with pod-specific test data, headers, and payloads.
 * 
 * Requirements: 10.2
 */

/**
 * HTTP headers used in test data
 * Contains standard headers like Content-Type and Accept, plus any custom headers
 */
export interface TestDataHeaders {
  /** Content type of the request body */
  'Content-Type': string;
  
  /** Accepted response content type */
  'Accept': string;
  
  /** Additional custom headers (e.g., X-Client-Id, X-API-Key) */
  [key: string]: string;
}

/**
 * Test data structure for a single pod
 * Contains headers, configuration, and test payloads specific to the pod
 */
export interface PodTestData {
  /** HTTP headers to be used in API requests */
  headers: TestDataHeaders;
  
  /** Configuration settings for test execution */
  config: {
    /** Request timeout in milliseconds */
    timeout: number;
    
    /** Number of retry attempts for failed requests */
    retries: number;
    
    /** Additional configuration properties */
    [key: string]: any;
  };
  
  /** Test payloads organized by name (e.g., validLoan, validPayment) */
  payloads: {
    [key: string]: any;
  };
}
