/**
 * API Types
 * 
 * Type definitions for API request and response structures.
 * These interfaces provide type safety for API interactions across the framework.
 */

/**
 * Generic API response wrapper
 * 
 * @template T - The type of the response body
 */
export interface ApiResponse<T = any> {
  /** HTTP status code (e.g., 200, 404, 500) */
  status: number;
  
  /** Response headers as key-value pairs */
  headers: Record<string, string>;
  
  /** Parsed response body */
  body: T;
  
  /** Whether the response status indicates success (2xx) */
  ok: boolean;
}

/**
 * Login request structure
 * 
 * Used for authenticating users across all pods
 */
export interface LoginRequest {
  /** User's email address */
  email: string;
  
  /** User's password */
  password: string;
}

/**
 * Login response structure
 * 
 * Returned after successful authentication
 */
export interface LoginResponse {
  /** Authentication token for subsequent requests */
  token: string;
  
  /** Unique identifier for the authenticated user */
  userId: string;
  
  /** Token expiration time in seconds */
  expiresIn: number;
}
