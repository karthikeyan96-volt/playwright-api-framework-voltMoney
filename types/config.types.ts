/**
 * Configuration Type Definitions
 * 
 * This file contains TypeScript interfaces for configuration files used throughout
 * the Playwright API automation framework. These types ensure type safety when
 * working with credentials, endpoints, and environment configurations.
 * 
 * Requirements: 10.1, 10.2
 */

/**
 * Credentials for a single pod
 * Contains authentication information required to access a pod's API
 */
export interface PodCredentials {
  /** User ID for authentication */
  userid: string;
  
  /** Email address for authentication */
  email: string;
  
  /** Password for authentication */
  password: string;
  
  /** Authentication token (optional, populated after login) */
  authToken?: string;
  
  /** Phone number for OTP-based authentication (optional) */
  phoneNo?: string;
  
  /** OTP code for verification (optional) */
  otp?: string;
}

/**
 * Configuration structure for all pod credentials
 * Maps pod names to their respective credentials
 */
export interface CredentialsConfig {
  [podName: string]: PodCredentials;
}

/**
 * Endpoints for a single pod
 * Organizes API endpoints by category (e.g., auth, loans, payments)
 * Each category contains named endpoints with their relative paths
 */
export interface PodEndpoints {
  [category: string]: {
    [endpoint: string]: string;
  };
}

/**
 * Configuration structure for all pod endpoints
 * Maps pod names to their respective endpoint collections
 */
export interface EndpointsConfig {
  [podName: string]: PodEndpoints;
}
