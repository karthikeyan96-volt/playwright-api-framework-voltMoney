import { ApiResponse } from '../types/api.types';

/**
 * Response Validator
 * 
 * Provides static methods for validating API responses.
 * All validation methods throw descriptive errors when validation fails.
 */
export class ResponseValidator {
  /**
   * Validates that the response status matches the expected status code
   * 
   * @param response - The API response to validate
   * @param expectedStatus - The expected HTTP status code
   * @throws Error if status does not match expected value
   * 
   * @example
   * ResponseValidator.validateStatus(response, 200);
   */
  static validateStatus(response: ApiResponse, expectedStatus: number): void {
    if (response.status !== expectedStatus) {
      throw new Error(
        `Expected status ${expectedStatus}, but got ${response.status}. Body: ${JSON.stringify(response.body)}`
      );
    }
  }

  /**
   * Validates that the response indicates success (2xx status code)
   * 
   * @param response - The API response to validate
   * @throws Error if response is not successful
   * 
   * @example
   * ResponseValidator.validateStatusOk(response);
   */
  static validateStatusOk(response: ApiResponse): void {
    if (!response.ok) {
      throw new Error(
        `Expected successful response, but got ${response.status}. Body: ${JSON.stringify(response.body)}`
      );
    }
  }

  /**
   * Validates that a specific field exists in the response body
   * Optionally validates that the field has an expected value
   * 
   * Supports nested field paths using dot notation (e.g., "user.address.city")
   * 
   * @param response - The API response to validate
   * @param fieldPath - The path to the field (supports dot notation for nested fields)
   * @param expectedValue - Optional expected value for the field
   * @throws Error if field is not found or value does not match
   * 
   * @example
   * // Check field exists
   * ResponseValidator.validateField(response, 'id');
   * 
   * // Check field has specific value
   * ResponseValidator.validateField(response, 'status', 'active');
   * 
   * // Check nested field
   * ResponseValidator.validateField(response, 'user.email', 'test@example.com');
   */
  static validateField(response: ApiResponse, fieldPath: string, expectedValue?: any): void {
    const value = this.getNestedField(response.body, fieldPath);
    
    if (value === undefined) {
      throw new Error(`Field '${fieldPath}' not found in response`);
    }

    if (expectedValue !== undefined && value !== expectedValue) {
      throw new Error(
        `Expected field '${fieldPath}' to be '${expectedValue}', but got '${value}'`
      );
    }
  }

  /**
   * Validates that the response body contains all required fields defined in a schema
   * 
   * Basic schema validation - checks for presence of required fields.
   * Can be extended with more sophisticated validation libraries like Ajv.
   * 
   * @param response - The API response to validate
   * @param schema - Schema object with a 'required' array of field names
   * @throws Error if any required field is missing
   * 
   * @example
   * const schema = {
   *   required: ['id', 'name', 'email']
   * };
   * ResponseValidator.validateSchema(response, schema);
   */
  static validateSchema(response: ApiResponse, schema: any): void {
    // Basic schema validation - can be extended with libraries like Ajv
    const requiredFields = schema.required || [];
    
    for (const field of requiredFields) {
      if (!(field in response.body)) {
        throw new Error(`Required field '${field}' missing from response`);
      }
    }
  }

  /**
   * Helper method to retrieve a nested field from an object using dot notation
   * 
   * @param obj - The object to traverse
   * @param path - The path to the field (e.g., "user.address.city")
   * @returns The value at the specified path, or undefined if not found
   * 
   * @private
   */
  private static getNestedField(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}
