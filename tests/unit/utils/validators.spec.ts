import { test, expect } from '@playwright/test';
import { ResponseValidator } from '../../../utils/validators';
import { ApiResponse } from '../../../types/api.types';

test.describe('ResponseValidator', { tag: '@FrameworkCheckTests' }, () => {
  test.describe('validateStatus', () => {
    test('should not throw when status matches expected', () => {
      const response: ApiResponse = {
        status: 200,
        headers: {},
        body: { data: 'success' },
        ok: true
      };

      expect(() => {
        ResponseValidator.validateStatus(response, 200);
      }).not.toThrow();
    });

    test('should throw error when status does not match expected', () => {
      const response: ApiResponse = {
        status: 404,
        headers: {},
        body: { error: 'Not found' },
        ok: false
      };

      expect(() => {
        ResponseValidator.validateStatus(response, 200);
      }).toThrow('Expected status 200, but got 404. Body: {"error":"Not found"}');
    });

    test('should include response body in error message', () => {
      const response: ApiResponse = {
        status: 500,
        headers: {},
        body: { error: 'Internal server error', details: 'Database connection failed' },
        ok: false
      };

      expect(() => {
        ResponseValidator.validateStatus(response, 200);
      }).toThrow('Expected status 200, but got 500');
      
      try {
        ResponseValidator.validateStatus(response, 200);
      } catch (error: any) {
        expect(error.message).toContain('Database connection failed');
      }
    });

    test('should validate different status codes', () => {
      const response201: ApiResponse = {
        status: 201,
        headers: {},
        body: { id: '123' },
        ok: true
      };

      const response204: ApiResponse = {
        status: 204,
        headers: {},
        body: null,
        ok: true
      };

      expect(() => {
        ResponseValidator.validateStatus(response201, 201);
      }).not.toThrow();

      expect(() => {
        ResponseValidator.validateStatus(response204, 204);
      }).not.toThrow();
    });
  });

  test.describe('validateStatusOk', () => {
    test('should not throw when response is ok (2xx status)', () => {
      const response: ApiResponse = {
        status: 200,
        headers: {},
        body: { data: 'success' },
        ok: true
      };

      expect(() => {
        ResponseValidator.validateStatusOk(response);
      }).not.toThrow();
    });

    test('should throw error when response is not ok', () => {
      const response: ApiResponse = {
        status: 404,
        headers: {},
        body: { error: 'Not found' },
        ok: false
      };

      expect(() => {
        ResponseValidator.validateStatusOk(response);
      }).toThrow('Expected successful response, but got 404. Body: {"error":"Not found"}');
    });

    test('should throw error for 4xx client errors', () => {
      const response: ApiResponse = {
        status: 400,
        headers: {},
        body: { error: 'Bad request' },
        ok: false
      };

      expect(() => {
        ResponseValidator.validateStatusOk(response);
      }).toThrow('Expected successful response, but got 400');
    });

    test('should throw error for 5xx server errors', () => {
      const response: ApiResponse = {
        status: 500,
        headers: {},
        body: { error: 'Internal server error' },
        ok: false
      };

      expect(() => {
        ResponseValidator.validateStatusOk(response);
      }).toThrow('Expected successful response, but got 500');
    });

    test('should include response body in error message', () => {
      const response: ApiResponse = {
        status: 403,
        headers: {},
        body: { error: 'Forbidden', message: 'Insufficient permissions' },
        ok: false
      };

      try {
        ResponseValidator.validateStatusOk(response);
      } catch (error: any) {
        expect(error.message).toContain('403');
        expect(error.message).toContain('Forbidden');
        expect(error.message).toContain('Insufficient permissions');
      }
    });
  });

  test.describe('validateField', () => {
    test('should not throw when field exists', () => {
      const response: ApiResponse = {
        status: 200,
        headers: {},
        body: { id: '123', name: 'Test' },
        ok: true
      };

      expect(() => {
        ResponseValidator.validateField(response, 'id');
      }).not.toThrow();
    });

    test('should throw error when field does not exist', () => {
      const response: ApiResponse = {
        status: 200,
        headers: {},
        body: { id: '123' },
        ok: true
      };

      expect(() => {
        ResponseValidator.validateField(response, 'name');
      }).toThrow("Field 'name' not found in response");
    });

    test('should not throw when field value matches expected', () => {
      const response: ApiResponse = {
        status: 200,
        headers: {},
        body: { status: 'active', count: 42 },
        ok: true
      };

      expect(() => {
        ResponseValidator.validateField(response, 'status', 'active');
      }).not.toThrow();

      expect(() => {
        ResponseValidator.validateField(response, 'count', 42);
      }).not.toThrow();
    });

    test('should throw error when field value does not match expected', () => {
      const response: ApiResponse = {
        status: 200,
        headers: {},
        body: { status: 'inactive' },
        ok: true
      };

      expect(() => {
        ResponseValidator.validateField(response, 'status', 'active');
      }).toThrow("Expected field 'status' to be 'active', but got 'inactive'");
    });

    test('should validate nested fields using dot notation', () => {
      const response: ApiResponse = {
        status: 200,
        headers: {},
        body: {
          user: {
            name: 'John Doe',
            address: {
              city: 'New York',
              zip: '10001'
            }
          }
        },
        ok: true
      };

      expect(() => {
        ResponseValidator.validateField(response, 'user.name');
      }).not.toThrow();

      expect(() => {
        ResponseValidator.validateField(response, 'user.address.city');
      }).not.toThrow();

      expect(() => {
        ResponseValidator.validateField(response, 'user.address.city', 'New York');
      }).not.toThrow();
    });

    test('should throw error when nested field does not exist', () => {
      const response: ApiResponse = {
        status: 200,
        headers: {},
        body: {
          user: {
            name: 'John Doe'
          }
        },
        ok: true
      };

      expect(() => {
        ResponseValidator.validateField(response, 'user.email');
      }).toThrow("Field 'user.email' not found in response");

      expect(() => {
        ResponseValidator.validateField(response, 'user.address.city');
      }).toThrow("Field 'user.address.city' not found in response");
    });

    test('should handle null and undefined values correctly', () => {
      const response: ApiResponse = {
        status: 200,
        headers: {},
        body: {
          nullValue: null,
          zeroValue: 0,
          emptyString: '',
          falseValue: false
        },
        ok: true
      };

      // These fields exist, so should not throw
      expect(() => {
        ResponseValidator.validateField(response, 'nullValue');
      }).not.toThrow();

      expect(() => {
        ResponseValidator.validateField(response, 'zeroValue');
      }).not.toThrow();

      expect(() => {
        ResponseValidator.validateField(response, 'emptyString');
      }).not.toThrow();

      expect(() => {
        ResponseValidator.validateField(response, 'falseValue');
      }).not.toThrow();

      // Validate specific values
      expect(() => {
        ResponseValidator.validateField(response, 'nullValue', null);
      }).not.toThrow();

      expect(() => {
        ResponseValidator.validateField(response, 'zeroValue', 0);
      }).not.toThrow();

      expect(() => {
        ResponseValidator.validateField(response, 'emptyString', '');
      }).not.toThrow();

      expect(() => {
        ResponseValidator.validateField(response, 'falseValue', false);
      }).not.toThrow();
    });

    test('should handle array fields', () => {
      const response: ApiResponse = {
        status: 200,
        headers: {},
        body: {
          items: [1, 2, 3],
          users: [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' }
          ]
        },
        ok: true
      };

      expect(() => {
        ResponseValidator.validateField(response, 'items');
      }).not.toThrow();

      expect(() => {
        ResponseValidator.validateField(response, 'users');
      }).not.toThrow();
    });
  });

  test.describe('validateSchema', () => {
    test('should not throw when all required fields are present', () => {
      const response: ApiResponse = {
        status: 200,
        headers: {},
        body: {
          id: '123',
          name: 'Test',
          email: 'test@example.com'
        },
        ok: true
      };

      const schema = {
        required: ['id', 'name', 'email']
      };

      expect(() => {
        ResponseValidator.validateSchema(response, schema);
      }).not.toThrow();
    });

    test('should throw error when required field is missing', () => {
      const response: ApiResponse = {
        status: 200,
        headers: {},
        body: {
          id: '123',
          name: 'Test'
        },
        ok: true
      };

      const schema = {
        required: ['id', 'name', 'email']
      };

      expect(() => {
        ResponseValidator.validateSchema(response, schema);
      }).toThrow("Required field 'email' missing from response");
    });

    test('should throw error for first missing field when multiple fields are missing', () => {
      const response: ApiResponse = {
        status: 200,
        headers: {},
        body: {
          id: '123'
        },
        ok: true
      };

      const schema = {
        required: ['id', 'name', 'email', 'phone']
      };

      expect(() => {
        ResponseValidator.validateSchema(response, schema);
      }).toThrow("Required field 'name' missing from response");
    });

    test('should not throw when schema has no required fields', () => {
      const response: ApiResponse = {
        status: 200,
        headers: {},
        body: { id: '123' },
        ok: true
      };

      const schema = {
        required: []
      };

      expect(() => {
        ResponseValidator.validateSchema(response, schema);
      }).not.toThrow();
    });

    test('should not throw when schema has no required property', () => {
      const response: ApiResponse = {
        status: 200,
        headers: {},
        body: { id: '123' },
        ok: true
      };

      const schema = {};

      expect(() => {
        ResponseValidator.validateSchema(response, schema);
      }).not.toThrow();
    });

    test('should validate complex schema with multiple required fields', () => {
      const response: ApiResponse = {
        status: 200,
        headers: {},
        body: {
          id: '123',
          name: 'John Doe',
          email: 'john@example.com',
          age: 30,
          active: true,
          roles: ['user', 'admin'],
          metadata: { created: '2024-01-01' }
        },
        ok: true
      };

      const schema = {
        required: ['id', 'name', 'email', 'age', 'active', 'roles', 'metadata']
      };

      expect(() => {
        ResponseValidator.validateSchema(response, schema);
      }).not.toThrow();
    });

    test('should accept fields with null or falsy values as present', () => {
      const response: ApiResponse = {
        status: 200,
        headers: {},
        body: {
          id: '123',
          count: 0,
          active: false,
          description: '',
          metadata: null
        },
        ok: true
      };

      const schema = {
        required: ['id', 'count', 'active', 'description', 'metadata']
      };

      expect(() => {
        ResponseValidator.validateSchema(response, schema);
      }).not.toThrow();
    });
  });

  test.describe('edge cases', () => {
    test('should handle empty response body', () => {
      const response: ApiResponse = {
        status: 200,
        headers: {},
        body: {},
        ok: true
      };

      expect(() => {
        ResponseValidator.validateField(response, 'anyField');
      }).toThrow("Field 'anyField' not found in response");

      const schema = { required: [] };
      expect(() => {
        ResponseValidator.validateSchema(response, schema);
      }).not.toThrow();
    });

    test('should handle null response body', () => {
      const response: ApiResponse = {
        status: 204,
        headers: {},
        body: null,
        ok: true
      };

      expect(() => {
        ResponseValidator.validateField(response, 'anyField');
      }).toThrow("Field 'anyField' not found in response");
    });

    test('should handle array response body', () => {
      const response: ApiResponse = {
        status: 200,
        headers: {},
        body: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' }
        ],
        ok: true
      };

      // Arrays don't have named fields, so this should throw
      expect(() => {
        ResponseValidator.validateField(response, 'id');
      }).toThrow("Field 'id' not found in response");
    });

    test('should handle string response body', () => {
      const response: ApiResponse = {
        status: 200,
        headers: {},
        body: 'Plain text response',
        ok: true
      };

      expect(() => {
        ResponseValidator.validateField(response, 'anyField');
      }).toThrow("Field 'anyField' not found in response");
    });
  });
});
