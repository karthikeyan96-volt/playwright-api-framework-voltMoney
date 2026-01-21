# Design Document: Playwright TypeScript API Automation Framework

## Overview

This design document describes a scalable, maintainable API automation framework built with Playwright and TypeScript. The framework supports multi-pod architecture testing with clean separation of concerns across configuration, helpers, test data, and test specifications.

The framework is designed around the following key principles:
- **Scalability**: Easy addition of new pods without modifying existing code
- **Maintainability**: Clear separation of concerns with dedicated directories for each responsibility
- **Type Safety**: Full TypeScript support with interfaces for all data structures
- **Environment Awareness**: Support for multiple deployment environments
- **Security**: Credentials isolated in separate configuration files

## Architecture

### Directory Structure

```
playwright-api-framework/
├── config/
│   ├── envconfig.ts          # Environment-specific base URLs
│   ├── endpoints.json         # All API endpoints organized by pod
│   ├── creds.json            # Credentials per pod (gitignored)
│   └── creds.example.json    # Template for credentials
├── helpers/
│   ├── los/
│   │   └── losHelper.ts      # LOS API helper class
│   ├── lms/
│   │   └── lmsHelper.ts      # LMS API helper class
│   └── base/
│       └── baseHelper.ts     # Base helper with common functionality
├── testdata/
│   ├── los/
│   │   └── testdata.json     # LOS-specific test data
│   └── lms/
│       └── testdata.json     # LMS-specific test data
├── tests/
│   ├── los/
│   │   └── los.spec.ts       # LOS test specifications
│   └── lms/
│       └── lms.spec.ts       # LMS test specifications
├── types/
│   ├── config.types.ts       # Configuration type definitions
│   ├── endpoints.types.ts    # Endpoint type definitions
│   ├── testdata.types.ts     # Test data type definitions
│   └── api.types.ts          # API request/response types
├── utils/
│   ├── logger.ts             # Logging utility
│   └── validators.ts         # Response validation utilities
├── package.json
├── tsconfig.json
├── playwright.config.ts
└── .gitignore
```

### Architectural Layers

1. **Configuration Layer**: Manages environment settings, endpoints, and credentials
2. **Helper Layer**: Encapsulates all API logic per pod with authentication management
3. **Test Data Layer**: Stores pod-specific test data and configurations
4. **Test Layer**: Contains test specifications that orchestrate helpers and assertions
5. **Type Layer**: Provides TypeScript interfaces for type safety
6. **Utility Layer**: Provides cross-cutting concerns (logging, validation)

## Components and Interfaces

### 1. Configuration Components

#### Environment Configuration (config/envconfig.ts)

```typescript
export interface EnvironmentConfig {
  dev: {
    baseUrl: string;
  };
  staging: {
    baseUrl: string;
  };
  prod: {
    baseUrl: string;
  };
}

export const envConfig: EnvironmentConfig = {
  dev: {
    baseUrl: 'https://dev.example.com'
  },
  staging: {
    baseUrl: 'https://staging.example.com'
  },
  prod: {
    baseUrl: 'https://prod.example.com'
  }
};

export function getBaseUrl(env: string = process.env.TEST_ENV || 'dev'): string {
  const environment = env as keyof EnvironmentConfig;
  if (!envConfig[environment]) {
    throw new Error(`Invalid environment: ${env}`);
  }
  return envConfig[environment].baseUrl;
}
```

#### Endpoints Configuration (config/endpoints.json)

```json
{
  "los": {
    "auth": {
      "login": "/api/los/auth/login",
      "logout": "/api/los/auth/logout",
      "refresh": "/api/los/auth/refresh"
    },
    "loans": {
      "create": "/api/los/loans",
      "getById": "/api/los/loans/{id}",
      "update": "/api/los/loans/{id}",
      "delete": "/api/los/loans/{id}",
      "list": "/api/los/loans"
    },
    "applications": {
      "create": "/api/los/applications",
      "getById": "/api/los/applications/{id}",
      "submit": "/api/los/applications/{id}/submit"
    }
  },
  "lms": {
    "auth": {
      "login": "/api/lms/auth/login",
      "logout": "/api/lms/auth/logout"
    },
    "payments": {
      "create": "/api/lms/payments",
      "getById": "/api/lms/payments/{id}",
      "list": "/api/lms/payments"
    },
    "accounts": {
      "getById": "/api/lms/accounts/{id}",
      "update": "/api/lms/accounts/{id}"
    }
  }
}
```

#### Credentials Configuration (config/creds.json)

```json
{
  "los": {
    "userid": "los_test_user",
    "email": "los.test@example.com",
    "password": "secure_password_123",
    "authToken": ""
  },
  "lms": {
    "userid": "lms_test_user",
    "email": "lms.test@example.com",
    "password": "secure_password_456",
    "authToken": ""
  }
}
```

### 2. Type Definitions

#### Configuration Types (types/config.types.ts)

```typescript
export interface PodCredentials {
  userid: string;
  email: string;
  password: string;
  authToken?: string;
}

export interface CredentialsConfig {
  [podName: string]: PodCredentials;
}

export interface PodEndpoints {
  [category: string]: {
    [endpoint: string]: string;
  };
}

export interface EndpointsConfig {
  [podName: string]: PodEndpoints;
}
```

#### Test Data Types (types/testdata.types.ts)

```typescript
export interface TestDataHeaders {
  'Content-Type': string;
  'Accept': string;
  [key: string]: string;
}

export interface PodTestData {
  headers: TestDataHeaders;
  config: {
    timeout: number;
    retries: number;
    [key: string]: any;
  };
  payloads: {
    [key: string]: any;
  };
}
```

#### API Types (types/api.types.ts)

```typescript
export interface ApiResponse<T = any> {
  status: number;
  headers: Record<string, string>;
  body: T;
  ok: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
  expiresIn: number;
}
```

### 3. Helper Classes

#### Base Helper (helpers/base/baseHelper.ts)

```typescript
import { APIRequestContext } from '@playwright/test';
import { getBaseUrl } from '../../config/envconfig';
import { Logger } from '../../utils/logger';

export abstract class BaseHelper {
  protected request: APIRequestContext;
  protected baseUrl: string;
  protected authToken: string = '';
  protected logger: Logger;
  protected podName: string;

  constructor(request: APIRequestContext, podName: string) {
    this.request = request;
    this.podName = podName;
    this.baseUrl = getBaseUrl();
    this.logger = new Logger(podName);
  }

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
      const response = await this.request[method.toLowerCase()](url, {
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

      return result;
    } catch (error) {
      this.logger.error(`Request failed: ${error.message}`);
      throw error;
    }
  }

  protected buildUrl(endpoint: string, params?: Record<string, string>): string {
    let url = `${this.baseUrl}${endpoint}`;
    
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      url += `?${queryString}`;
    }
    
    return url;
  }

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

  protected async parseResponse(response: any): Promise<any> {
    const contentType = response.headers()['content-type'] || '';
    
    if (contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  }

  protected replacePathParams(endpoint: string, params: Record<string, string>): string {
    let result = endpoint;
    for (const [key, value] of Object.entries(params)) {
      result = result.replace(`{${key}}`, value);
    }
    return result;
  }

  public setAuthToken(token: string): void {
    this.authToken = token;
    this.logger.info('Auth token updated');
  }

  public getAuthToken(): string {
    return this.authToken;
  }

  abstract login(): Promise<void>;
}
```

#### LOS Helper (helpers/los/losHelper.ts)

```typescript
import { APIRequestContext } from '@playwright/test';
import { BaseHelper } from '../base/baseHelper';
import endpoints from '../../config/endpoints.json';
import creds from '../../config/creds.json';
import { LoginResponse } from '../../types/api.types';

export class LOSHelper extends BaseHelper {
  constructor(request: APIRequestContext) {
    super(request, 'los');
  }

  async login(): Promise<void> {
    const loginEndpoint = endpoints.los.auth.login;
    const credentials = creds.los;

    const response = await this.makeRequest('POST', loginEndpoint, {
      data: {
        email: credentials.email,
        password: credentials.password
      }
    });

    if (!response.ok) {
      throw new Error(`LOS login failed: ${response.status} - ${JSON.stringify(response.body)}`);
    }

    const loginData: LoginResponse = response.body;
    this.setAuthToken(loginData.token);
    this.logger.info('LOS login successful');
  }

  async createLoan(loanData: any): Promise<ApiResponse> {
    const endpoint = endpoints.los.loans.create;
    return await this.makeRequest('POST', endpoint, { data: loanData });
  }

  async getLoanById(loanId: string): Promise<ApiResponse> {
    const endpoint = this.replacePathParams(endpoints.los.loans.getById, { id: loanId });
    return await this.makeRequest('GET', endpoint);
  }

  async updateLoan(loanId: string, loanData: any): Promise<ApiResponse> {
    const endpoint = this.replacePathParams(endpoints.los.loans.update, { id: loanId });
    return await this.makeRequest('PUT', endpoint, { data: loanData });
  }

  async deleteLoan(loanId: string): Promise<ApiResponse> {
    const endpoint = this.replacePathParams(endpoints.los.loans.delete, { id: loanId });
    return await this.makeRequest('DELETE', endpoint);
  }

  async listLoans(params?: Record<string, string>): Promise<ApiResponse> {
    const endpoint = endpoints.los.loans.list;
    return await this.makeRequest('GET', endpoint, { params });
  }

  async createApplication(applicationData: any): Promise<ApiResponse> {
    const endpoint = endpoints.los.applications.create;
    return await this.makeRequest('POST', endpoint, { data: applicationData });
  }

  async getApplicationById(applicationId: string): Promise<ApiResponse> {
    const endpoint = this.replacePathParams(endpoints.los.applications.getById, { id: applicationId });
    return await this.makeRequest('GET', endpoint);
  }

  async submitApplication(applicationId: string): Promise<ApiResponse> {
    const endpoint = this.replacePathParams(endpoints.los.applications.submit, { id: applicationId });
    return await this.makeRequest('POST', endpoint);
  }

  async logout(): Promise<void> {
    const endpoint = endpoints.los.auth.logout;
    await this.makeRequest('POST', endpoint);
    this.setAuthToken('');
    this.logger.info('LOS logout successful');
  }
}
```

#### LMS Helper (helpers/lms/lmsHelper.ts)

```typescript
import { APIRequestContext } from '@playwright/test';
import { BaseHelper } from '../base/baseHelper';
import endpoints from '../../config/endpoints.json';
import creds from '../../config/creds.json';
import { LoginResponse } from '../../types/api.types';

export class LMSHelper extends BaseHelper {
  constructor(request: APIRequestContext) {
    super(request, 'lms');
  }

  async login(): Promise<void> {
    const loginEndpoint = endpoints.lms.auth.login;
    const credentials = creds.lms;

    const response = await this.makeRequest('POST', loginEndpoint, {
      data: {
        email: credentials.email,
        password: credentials.password
      }
    });

    if (!response.ok) {
      throw new Error(`LMS login failed: ${response.status} - ${JSON.stringify(response.body)}`);
    }

    const loginData: LoginResponse = response.body;
    this.setAuthToken(loginData.token);
    this.logger.info('LMS login successful');
  }

  async createPayment(paymentData: any): Promise<ApiResponse> {
    const endpoint = endpoints.lms.payments.create;
    return await this.makeRequest('POST', endpoint, { data: paymentData });
  }

  async getPaymentById(paymentId: string): Promise<ApiResponse> {
    const endpoint = this.replacePathParams(endpoints.lms.payments.getById, { id: paymentId });
    return await this.makeRequest('GET', endpoint);
  }

  async listPayments(params?: Record<string, string>): Promise<ApiResponse> {
    const endpoint = endpoints.lms.payments.list;
    return await this.makeRequest('GET', endpoint, { params });
  }

  async getAccountById(accountId: string): Promise<ApiResponse> {
    const endpoint = this.replacePathParams(endpoints.lms.accounts.getById, { id: accountId });
    return await this.makeRequest('GET', endpoint);
  }

  async updateAccount(accountId: string, accountData: any): Promise<ApiResponse> {
    const endpoint = this.replacePathParams(endpoints.lms.accounts.update, { id: accountId });
    return await this.makeRequest('PUT', endpoint, { data: accountData });
  }

  async logout(): Promise<void> {
    const endpoint = endpoints.lms.auth.logout;
    await this.makeRequest('POST', endpoint);
    this.setAuthToken('');
    this.logger.info('LMS logout successful');
  }
}
```

### 4. Utility Components

#### Logger (utils/logger.ts)

```typescript
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export class Logger {
  private context: string;
  private logLevel: LogLevel;

  constructor(context: string, logLevel: LogLevel = LogLevel.INFO) {
    this.context = context;
    this.logLevel = logLevel;
  }

  debug(message: string, data?: any): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      console.log(`[DEBUG][${this.context}] ${message}`, data || '');
    }
  }

  info(message: string, data?: any): void {
    if (this.logLevel <= LogLevel.INFO) {
      console.log(`[INFO][${this.context}] ${message}`, data || '');
    }
  }

  warn(message: string, data?: any): void {
    if (this.logLevel <= LogLevel.WARN) {
      console.warn(`[WARN][${this.context}] ${message}`, data || '');
    }
  }

  error(message: string, data?: any): void {
    if (this.logLevel <= LogLevel.ERROR) {
      console.error(`[ERROR][${this.context}] ${message}`, data || '');
    }
  }
}
```

#### Validators (utils/validators.ts)

```typescript
import { ApiResponse } from '../types/api.types';

export class ResponseValidator {
  static validateStatus(response: ApiResponse, expectedStatus: number): void {
    if (response.status !== expectedStatus) {
      throw new Error(
        `Expected status ${expectedStatus}, but got ${response.status}. Body: ${JSON.stringify(response.body)}`
      );
    }
  }

  static validateStatusOk(response: ApiResponse): void {
    if (!response.ok) {
      throw new Error(
        `Expected successful response, but got ${response.status}. Body: ${JSON.stringify(response.body)}`
      );
    }
  }

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

  static validateSchema(response: ApiResponse, schema: any): void {
    // Basic schema validation - can be extended with libraries like Ajv
    const requiredFields = schema.required || [];
    
    for (const field of requiredFields) {
      if (!(field in response.body)) {
        throw new Error(`Required field '${field}' missing from response`);
      }
    }
  }

  private static getNestedField(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}
```

### 5. Test Data Structure

#### LOS Test Data (testdata/los/testdata.json)

```json
{
  "headers": {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Client-Id": "los-test-client"
  },
  "config": {
    "timeout": 30000,
    "retries": 2,
    "defaultWaitTime": 1000
  },
  "payloads": {
    "validLoan": {
      "borrowerName": "John Doe",
      "loanAmount": 250000,
      "loanType": "conventional",
      "term": 30,
      "interestRate": 3.5
    },
    "validApplication": {
      "applicantName": "Jane Smith",
      "ssn": "123-45-6789",
      "income": 75000,
      "employmentStatus": "employed"
    }
  }
}
```

#### LMS Test Data (testdata/lms/testdata.json)

```json
{
  "headers": {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Client-Id": "lms-test-client"
  },
  "config": {
    "timeout": 30000,
    "retries": 2,
    "defaultWaitTime": 1000
  },
  "payloads": {
    "validPayment": {
      "accountId": "ACC-12345",
      "amount": 1500.00,
      "paymentDate": "2024-01-15",
      "paymentMethod": "ACH"
    },
    "accountUpdate": {
      "status": "active",
      "contactEmail": "updated@example.com"
    }
  }
}
```

### 6. Test Specifications

#### LOS Test Spec (tests/los/los.spec.ts)

```typescript
import { test, expect } from '@playwright/test';
import { LOSHelper } from '../../helpers/los/losHelper';
import { ResponseValidator } from '../../utils/validators';
import losTestData from '../../testdata/los/testdata.json';

test.describe('LOS API Tests', () => {
  let losHelper: LOSHelper;

  test.beforeAll(async ({ request }) => {
    losHelper = new LOSHelper(request);
    await losHelper.login();
  });

  test.afterAll(async () => {
    await losHelper.logout();
  });

  test('should create a new loan', async () => {
    const loanData = losTestData.payloads.validLoan;
    const response = await losHelper.createLoan(loanData);

    ResponseValidator.validateStatusOk(response);
    ResponseValidator.validateField(response, 'borrowerName', loanData.borrowerName);
    expect(response.body).toHaveProperty('id');
  });

  test('should retrieve loan by ID', async () => {
    // Create loan first
    const createResponse = await losHelper.createLoan(losTestData.payloads.validLoan);
    const loanId = createResponse.body.id;

    // Retrieve loan
    const response = await losHelper.getLoanById(loanId);

    ResponseValidator.validateStatusOk(response);
    ResponseValidator.validateField(response, 'id', loanId);
  });

  test('should update an existing loan', async () => {
    // Create loan first
    const createResponse = await losHelper.createLoan(losTestData.payloads.validLoan);
    const loanId = createResponse.body.id;

    // Update loan
    const updateData = { ...losTestData.payloads.validLoan, loanAmount: 300000 };
    const response = await losHelper.updateLoan(loanId, updateData);

    ResponseValidator.validateStatusOk(response);
    ResponseValidator.validateField(response, 'loanAmount', 300000);
  });

  test('should list all loans', async () => {
    const response = await losHelper.listLoans();

    ResponseValidator.validateStatusOk(response);
    expect(Array.isArray(response.body)).toBeTruthy();
  });

  test('should create and submit application', async () => {
    const applicationData = losTestData.payloads.validApplication;
    
    // Create application
    const createResponse = await losHelper.createApplication(applicationData);
    ResponseValidator.validateStatusOk(createResponse);
    const applicationId = createResponse.body.id;

    // Submit application
    const submitResponse = await losHelper.submitApplication(applicationId);
    ResponseValidator.validateStatusOk(submitResponse);
    ResponseValidator.validateField(submitResponse, 'status', 'submitted');
  });
});
```

#### LMS Test Spec (tests/lms/lms.spec.ts)

```typescript
import { test, expect } from '@playwright/test';
import { LMSHelper } from '../../helpers/lms/lmsHelper';
import { ResponseValidator } from '../../utils/validators';
import lmsTestData from '../../testdata/lms/testdata.json';

test.describe('LMS API Tests', () => {
  let lmsHelper: LMSHelper;

  test.beforeAll(async ({ request }) => {
    lmsHelper = new LMSHelper(request);
    await lmsHelper.login();
  });

  test.afterAll(async () => {
    await lmsHelper.logout();
  });

  test('should create a new payment', async () => {
    const paymentData = lmsTestData.payloads.validPayment;
    const response = await lmsHelper.createPayment(paymentData);

    ResponseValidator.validateStatusOk(response);
    ResponseValidator.validateField(response, 'amount', paymentData.amount);
    expect(response.body).toHaveProperty('id');
  });

  test('should retrieve payment by ID', async () => {
    // Create payment first
    const createResponse = await lmsHelper.createPayment(lmsTestData.payloads.validPayment);
    const paymentId = createResponse.body.id;

    // Retrieve payment
    const response = await lmsHelper.getPaymentById(paymentId);

    ResponseValidator.validateStatusOk(response);
    ResponseValidator.validateField(response, 'id', paymentId);
  });

  test('should list all payments', async () => {
    const response = await lmsHelper.listPayments();

    ResponseValidator.validateStatusOk(response);
    expect(Array.isArray(response.body)).toBeTruthy();
  });

  test('should retrieve account by ID', async () => {
    const accountId = 'ACC-12345';
    const response = await lmsHelper.getAccountById(accountId);

    ResponseValidator.validateStatusOk(response);
    ResponseValidator.validateField(response, 'id', accountId);
  });

  test('should update account information', async () => {
    const accountId = 'ACC-12345';
    const updateData = lmsTestData.payloads.accountUpdate;
    
    const response = await lmsHelper.updateAccount(accountId, updateData);

    ResponseValidator.validateStatusOk(response);
    ResponseValidator.validateField(response, 'status', updateData.status);
  });
});
```

### 7. Configuration Files

#### Playwright Configuration (playwright.config.ts)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    baseURL: process.env.BASE_URL,
    trace: 'on-first-retry',
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  },
  projects: [
    {
      name: 'API Tests',
      testMatch: '**/*.spec.ts'
    }
  ]
});
```

#### TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "types": ["node", "@playwright/test"]
  },
  "include": [
    "**/*.ts",
    "**/*.json"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "test-results"
  ]
}
```

#### Package Configuration (package.json)

```json
{
  "name": "playwright-api-framework",
  "version": "1.0.0",
  "description": "Playwright TypeScript API Automation Framework for Multi-Pod Architecture",
  "scripts": {
    "test": "playwright test",
    "test:los": "playwright test tests/los",
    "test:lms": "playwright test tests/lms",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "report": "playwright show-report",
    "clean": "rm -rf test-results dist"
  },
  "keywords": ["playwright", "api", "automation", "typescript"],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0"
  }
}
```

## Data Models

### Configuration Data Models

The framework uses JSON-based configuration with TypeScript interfaces for type safety:

1. **Environment Configuration**: Maps environment names to base URLs
2. **Endpoints Configuration**: Hierarchical structure organizing endpoints by pod and category
3. **Credentials Configuration**: Pod-specific authentication credentials
4. **Test Data Configuration**: Pod-specific test payloads and headers

### API Data Models

API request and response models are defined as TypeScript interfaces:

1. **ApiResponse<T>**: Generic response wrapper with status, headers, body, and ok flag
2. **LoginRequest**: Authentication request structure
3. **LoginResponse**: Authentication response with token and metadata
4. **Pod-specific models**: Defined per pod based on API contracts


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Environment Selection Returns Correct Base URL

*For any* valid environment name (dev, staging, prod) in the configuration, calling getBaseUrl with that environment name should return the base URL associated with that environment in the configuration.

**Validates: Requirements 2.3, 2.4**

### Property 2: All Endpoints Use Relative Paths

*For any* endpoint in the endpoints.json configuration file, the endpoint path should not contain a protocol (http:// or https://) or domain name, ensuring all paths are relative.

**Validates: Requirements 3.4**

### Property 3: All Pod Credentials Contain Required Fields

*For any* pod in the credentials configuration, the pod's credentials object should contain all required fields: userid, email, password, and authToken (which may be empty initially).

**Validates: Requirements 4.3**

### Property 4: Authentication Stores and Uses Token

*For any* helper class, after successfully calling the login method, the helper should store the authentication token and include it in the Authorization header of all subsequent API requests.

**Validates: Requirements 6.1, 6.2**

### Property 5: Test Data Files Contain Required Structure

*For any* pod's test data file, it should contain both a headers object and a config object with the required fields.

**Validates: Requirements 7.2, 7.3**

### Property 6: Failed API Calls Log Complete Details

*For any* API call that fails (throws an error or returns non-OK status), the framework should log both the complete request details (method, URL, headers, body) and response details (status, headers, body).

**Validates: Requirements 11.1, 11.2**

### Property 7: JSON Responses Are Automatically Parsed

*For any* API response with Content-Type header containing "application/json", the framework should automatically parse the response body as JSON and return a JavaScript object.

**Validates: Requirements 12.2**

### Property 8: Path Parameters Are Correctly Replaced

*For any* endpoint path containing path parameters (e.g., {id}, {accountId}) and any set of parameter values, calling replacePathParams should replace all parameter placeholders with their corresponding values.

**Validates: Requirements 5.4** (implicit requirement for helper methods to work correctly)

## Error Handling

### Authentication Errors

- **Invalid Credentials**: When login fails due to invalid credentials, the helper class throws an error with the message format: `"{Pod} login failed: {status} - {response body}"`
- **Missing Token**: When an API call is made before authentication, the request proceeds without the Authorization header (API will return 401)
- **Expired Token**: If the API returns 401 after initial authentication, the error is propagated to the test for handling

### Configuration Errors

- **Invalid Environment**: When getBaseUrl is called with an environment not in the configuration, it throws an error: `"Invalid environment: {env}"`
- **Missing Configuration Files**: When configuration files (endpoints.json, creds.json) are missing, Node.js will throw a module resolution error
- **Malformed JSON**: When configuration files contain invalid JSON, Node.js will throw a JSON parse error

### API Request Errors

- **Network Errors**: Network failures are caught in the makeRequest method, logged with error details, and re-thrown
- **Timeout Errors**: Playwright's default timeout applies; timeout errors are logged and re-thrown
- **Non-JSON Responses**: When Content-Type is not JSON, the response is returned as text instead of parsed JSON

### Validation Errors

- **Status Code Mismatch**: ResponseValidator.validateStatus throws: `"Expected status {expected}, but got {actual}. Body: {body}"`
- **Missing Fields**: ResponseValidator.validateField throws: `"Field '{fieldPath}' not found in response"`
- **Field Value Mismatch**: ResponseValidator.validateField throws: `"Expected field '{fieldPath}' to be '{expected}', but got '{actual}'"`
- **Schema Validation**: ResponseValidator.validateSchema throws: `"Required field '{field}' missing from response"`

### Logging Strategy

All errors are logged at the ERROR level with context about:
- The pod name (from logger context)
- The operation being performed
- Request details (for API errors)
- Response details (for API errors)

## Testing Strategy

### Dual Testing Approach

The framework will use both unit tests and property-based tests for comprehensive coverage:

- **Unit Tests**: Verify specific examples, edge cases, and error conditions
- **Property Tests**: Verify universal properties across all inputs

Both testing approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Property-Based Testing Configuration

**Library Selection**: We will use `fast-check` for property-based testing in TypeScript, as it integrates well with Playwright and provides excellent TypeScript support.

**Test Configuration**:
- Each property test will run a minimum of 100 iterations to ensure comprehensive input coverage
- Each property test will be tagged with a comment referencing its design document property
- Tag format: `// Feature: playwright-api-framework, Property {number}: {property_text}`

**Property Test Implementation**:
- Each correctness property listed above will be implemented as a single property-based test
- Property tests will be organized in a separate `tests/properties/` directory
- Property tests will use the same helper classes and utilities as integration tests

### Unit Testing Strategy

**Test Organization**:
- Unit tests for utilities (logger, validators) in `tests/unit/utils/`
- Unit tests for configuration loading in `tests/unit/config/`
- Unit tests for helper base class in `tests/unit/helpers/`

**Coverage Focus**:
- Configuration loading and environment selection (specific examples)
- Logger functionality at different log levels (specific examples)
- Validator methods with various input scenarios (edge cases)
- Error handling scenarios (authentication failure, invalid environment, etc.)
- Path parameter replacement with edge cases (missing params, extra params)

**Balance**:
- Avoid writing too many unit tests for scenarios covered by property tests
- Focus unit tests on specific examples that demonstrate correct behavior
- Use unit tests for integration points between components
- Use unit tests for edge cases and error conditions

### Integration Testing Strategy

**Test Organization**:
- Integration tests for each pod in `tests/{pod}/{pod}.spec.ts`
- Tests verify end-to-end flows using helper classes
- Tests use actual API endpoints (or mocked endpoints in CI)

**Coverage Focus**:
- Complete authentication flow (login, authenticated requests, logout)
- CRUD operations for each pod's resources
- Error responses from API
- Multi-step workflows (create → retrieve → update → delete)

### Test Execution

**Commands**:
- `npm test`: Run all tests (unit, property, integration)
- `npm run test:unit`: Run only unit tests
- `npm run test:properties`: Run only property-based tests
- `npm run test:los`: Run only LOS integration tests
- `npm run test:lms`: Run only LMS integration tests
- `npm run test:pod -- {podName}`: Run tests for a specific pod

**CI/CD Integration**:
- All tests run in CI pipeline
- Property tests run with fixed seed for reproducibility
- Integration tests can use mocked API or test environment
- Test results exported as JSON and HTML reports

### Example Property Test

```typescript
// tests/properties/environment.spec.ts
import { test } from '@playwright/test';
import fc from 'fast-check';
import { getBaseUrl, envConfig } from '../../config/envconfig';

test.describe('Environment Configuration Properties', () => {
  // Feature: playwright-api-framework, Property 1: Environment Selection Returns Correct Base URL
  test('should return correct base URL for any valid environment', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('dev', 'staging', 'prod'),
        (env) => {
          const baseUrl = getBaseUrl(env);
          const expectedUrl = envConfig[env].baseUrl;
          return baseUrl === expectedUrl;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Example Unit Test

```typescript
// tests/unit/utils/validators.spec.ts
import { test, expect } from '@playwright/test';
import { ResponseValidator } from '../../../utils/validators';

test.describe('ResponseValidator', () => {
  test('should throw error when status does not match expected', () => {
    const response = {
      status: 404,
      headers: {},
      body: { error: 'Not found' },
      ok: false
    };

    expect(() => {
      ResponseValidator.validateStatus(response, 200);
    }).toThrow('Expected status 200, but got 404');
  });

  test('should not throw when status matches expected', () => {
    const response = {
      status: 200,
      headers: {},
      body: { data: 'success' },
      ok: true
    };

    expect(() => {
      ResponseValidator.validateStatus(response, 200);
    }).not.toThrow();
  });
});
```

## Implementation Notes

### Adding a New Pod

To add a new pod to the framework, follow these steps:

1. **Add Endpoints**: Add a new pod section to `config/endpoints.json`
   ```json
   "newpod": {
     "auth": {
       "login": "/api/newpod/auth/login"
     },
     "resources": {
       "create": "/api/newpod/resources"
     }
   }
   ```

2. **Add Credentials**: Add credentials to `config/creds.json`
   ```json
   "newpod": {
     "userid": "newpod_user",
     "email": "newpod@example.com",
     "password": "password",
     "authToken": ""
   }
   ```

3. **Create Helper Class**: Create `helpers/newpod/newpodHelper.ts`
   ```typescript
   import { APIRequestContext } from '@playwright/test';
   import { BaseHelper } from '../base/baseHelper';
   
   export class NewPodHelper extends BaseHelper {
     constructor(request: APIRequestContext) {
       super(request, 'newpod');
     }
     
     async login(): Promise<void> {
       // Implementation
     }
     
     // Add pod-specific methods
   }
   ```

4. **Create Test Data**: Create `testdata/newpod/testdata.json`
   ```json
   {
     "headers": {
       "Content-Type": "application/json",
       "Accept": "application/json"
     },
     "config": {
       "timeout": 30000,
       "retries": 2
     },
     "payloads": {}
   }
   ```

5. **Create Test Spec**: Create `tests/newpod/newpod.spec.ts`
   ```typescript
   import { test } from '@playwright/test';
   import { NewPodHelper } from '../../helpers/newpod/newpodHelper';
   
   test.describe('NewPod API Tests', () => {
     // Add tests
   });
   ```

6. **Add NPM Script**: Add to `package.json`
   ```json
   "test:newpod": "playwright test tests/newpod"
   ```

### Security Considerations

- **Credentials File**: Always keep `creds.json` in `.gitignore`
- **Environment Variables**: Consider using environment variables for sensitive data in CI/CD
- **Token Storage**: Tokens are stored in memory only, never persisted to disk
- **HTTPS**: Always use HTTPS base URLs in production environments
- **Secrets Management**: For production, integrate with secrets management systems (AWS Secrets Manager, Azure Key Vault, etc.)

### Maintenance Guidelines

- **Endpoint Updates**: When API endpoints change, update only `config/endpoints.json`
- **Credential Rotation**: Update `config/creds.json` when credentials change
- **Helper Methods**: Add new methods to helper classes as new API endpoints are added
- **Test Data**: Keep test data realistic but anonymized
- **Documentation**: Update this design document when architectural changes are made
