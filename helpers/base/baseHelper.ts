/**
 * Base Helper Class
 * 
 * Abstract base class providing common functionality for all pod-specific helper classes.
 * Handles HTTP requests, authentication token management, URL building, and response parsing.
 * 
 * Requirements: 5.3, 5.5, 6.1, 6.2, 11.1, 11.2, 12.2
 */

import { APIRequestContext } from '@playwright/test';
import { getBaseUrl } from '../../config/envconfig';
import { Logger } from '../../utils/logger';
import { ApiResponse } from '../../types/api.types';
import { attachRequest, attachResponse, attachCurlCommand } from '../../utils/allureHelper';

/**
 * Abstract base helper class for pod-specific API helpers
 * 
 * Provides common functionality including:
 * - HTTP request methods (GET, POST, PUT, DELETE, PATCH)
 * - URL building with query parameters
 * - Header building with authentication token injection
 * - Response parsing with automatic JSON handling
 * - Path parameter substitution
 * - Authentication token management
 * - Comprehensive error logging
 * - Allure report attachments
 */
export abstract class BaseHelper {
  /** Playwright API request context for making HTTP requests */
  protected request: APIRequestContext;
  
  /** Base URL for the current environment */
  protected baseUrl: string;
  
  /** Authentication token for API requests */
  protected authToken: string = '';
  
  /** Logger instance for this helper */
  protected logger: Logger;
  
  /** Name of the pod this helper is for */
  protected podName: string;

  /**
   * Constructor for BaseHelper
   * 
   * @param request - Playwright APIRequestContext for making HTTP requests
   * @param podName - Name of the pod (used for logging context)
   */
  constructor(request: APIRequestContext, podName: string) {
    this.request = request;
    this.podName = podName;
    this.baseUrl = getBaseUrl();
    this.logger = new Logger(podName);
  }

  /**
   * Make an HTTP request to the API
   * 
   * Handles all HTTP methods, builds URLs and headers, logs request/response details,
   * attaches data to Allure report, and provides comprehensive error handling.
   * 
   * @param method - HTTP method (GET, POST, PUT, DELETE, PATCH)
   * @param endpoint - API endpoint path (relative to baseUrl)
   * @param options - Request options including data, params, and headers
   * @returns Promise resolving to ApiResponse with status, headers, body, and ok flag
   * 
   * Requirements: 11.1, 11.2 - Logs request and response details on failure
   */
  protected async makeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    options: {
      data?: any;
      params?: Record<string, string>;
      headers?: Record<string, string>;
    } = {}
  ): Promise<ApiResponse> {
    const url = this.buildUrl(endpoint, options.params);
    const headers = this.buildHeaders(options.headers);

    this.logger.info(`${method} ${url}`);
    if (options.data) {
      this.logger.debug('Request body:', options.data);
    }

    try {
      // Attach request details to Allure
      attachRequest(method, url, headers, options.data);
      attachCurlCommand(method, url, headers, options.data);

      const response = await this.request[method.toLowerCase() as Lowercase<typeof method>](url, {
        data: options.data,
        headers: headers
      });

      const body = await this.parseResponse(response);
      const result: ApiResponse = {
        status: response.status(),
        headers: response.headers(),
        body: body,
        ok: response.ok()
      };

      this.logger.info(`Response status: ${result.status}`);
      this.logger.debug('Response body:', result.body);

      // Attach response details to Allure
      attachResponse(result.status, result.headers, result.body);

      return result;
    } catch (error: any) {
      // Comprehensive error logging as per Requirements 11.1, 11.2
      this.logger.error(`Request failed: ${method} ${url}`);
      this.logger.error(`Request headers:`, headers);
      if (options.data) {
        this.logger.error(`Request body:`, options.data);
      }
      this.logger.error(`Error message: ${error.message}`);
      throw error;
    }
  }

  /**
   * Build complete URL with query parameters
   * 
   * Combines base URL, endpoint path, and optional query parameters.
   * 
   * @param endpoint - API endpoint path (relative to baseUrl)
   * @param params - Optional query parameters as key-value pairs
   * @returns Complete URL with query string if params provided
   */
  protected buildUrl(endpoint: string, params?: Record<string, string>): string {
    let url = `${this.baseUrl}${endpoint}`;
    
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      url += `?${queryString}`;
    }
    
    return url;
  }

  /**
   * Build request headers with authentication token injection
   * 
   * Creates default headers (Content-Type, Accept) and adds Authorization header
   * if auth token is present. Merges with any additional headers provided.
   * 
   * @param additionalHeaders - Optional additional headers to include
   * @returns Complete headers object with defaults, auth token, and additional headers
   * 
   * Requirements: 6.2 - Includes authentication token in request headers
   */
  protected buildHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return { ...headers, ...additionalHeaders };
  }

  /**
   * Parse API response based on content type
   * 
   * Automatically parses JSON responses and returns text for other content types.
   * 
   * @param response - Playwright API response object
   * @returns Parsed response body (object for JSON, string for text)
   * 
   * Requirements: 12.2 - Automatic JSON parsing for JSON responses
   */
  protected async parseResponse(response: any): Promise<any> {
    const contentType = response.headers()['content-type'] || '';
    
    if (contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  }

  /**
   * Replace path parameters in endpoint URL
   * 
   * Substitutes placeholders like {id} with actual values from params object.
   * Example: "/api/loans/{id}" with {id: "123"} becomes "/api/loans/123"
   * 
   * @param endpoint - Endpoint path with parameter placeholders
   * @param params - Object mapping parameter names to values
   * @returns Endpoint path with parameters replaced
   */
  protected replacePathParams(endpoint: string, params: Record<string, string>): string {
    let result = endpoint;
    for (const [key, value] of Object.entries(params)) {
      result = result.replace(`{${key}}`, value);
    }
    return result;
  }

  /**
   * Set authentication token
   * 
   * Stores the authentication token for use in subsequent API requests.
   * 
   * @param token - Authentication token to store
   * 
   * Requirements: 6.1 - Stores authentication token
   */
  public setAuthToken(token: string): void {
    this.authToken = token;
    this.logger.info('Auth token updated');
  }

  /**
   * Get current authentication token
   * 
   * @returns Current authentication token (empty string if not set)
   */
  public getAuthToken(): string {
    return this.authToken;
  }

  /**
   * Abstract login method
   * 
   * Must be implemented by each pod-specific helper class to handle
   * authentication for that pod's API.
   * 
   * Requirements: 6.3 - Each helper class must provide a login method
   */
  abstract login(): Promise<void>;
}
