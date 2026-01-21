# Playwright TypeScript API Automation Framework

A scalable, maintainable API automation framework built with Playwright and TypeScript for testing multi-pod architecture systems.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Environment Configuration](#environment-configuration)
- [Adding a New Pod](#adding-a-new-pod)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)

## Overview

This framework is designed to test multi-pod architecture systems with clean separation of concerns. It currently supports:
- **LOS (Loan Origination System)** - Loan and application management
- **LMS (Loan Management System)** - Payment and account management

The framework emphasizes:
- **Scalability**: Easy addition of new pods without modifying existing code
- **Maintainability**: Clear separation of concerns with dedicated directories
- **Type Safety**: Full TypeScript support with interfaces for all data structures
- **Environment Awareness**: Support for multiple deployment environments (dev, staging, prod)
- **Security**: Credentials isolated in separate configuration files

## Features

- ✅ **Multi-Environment Support**: Configure and switch between dev, staging, and production environments
- ✅ **Centralized Configuration**: All endpoints, credentials, and test data organized by pod
- ✅ **Helper Classes**: Encapsulate all API logic with automatic authentication management
- ✅ **Property-Based Testing**: Verify universal correctness properties with fast-check
- ✅ **Unit Testing**: Comprehensive unit tests for utilities and helper methods
- ✅ **Integration Testing**: End-to-end test specifications for each pod
- ✅ **Type Safety**: TypeScript interfaces for all configuration and data structures
- ✅ **Logging**: Context-based logging with configurable log levels
- ✅ **Response Validation**: Built-in validators for status codes, fields, and schemas

## Project Structure

```
playwright-api-framework/
├── config/                      # Configuration files
│   ├── envconfig.ts            # Environment-specific base URLs
│   ├── endpoints.json          # API endpoints organized by pod
│   ├── creds.json              # Credentials per pod (gitignored)
│   └── creds.example.json      # Template for credentials
├── helpers/                     # Helper classes for API calls
│   ├── base/
│   │   └── baseHelper.ts       # Base helper with common functionality
│   ├── los/
│   │   └── losHelper.ts        # LOS API helper class
│   └── lms/
│       └── lmsHelper.ts        # LMS API helper class
├── testdata/                    # Test data organized by pod
│   ├── los/
│   │   └── testdata.json       # LOS-specific test data
│   └── lms/
│       └── testdata.json       # LMS-specific test data
├── tests/                       # Test specifications
│   ├── los/
│   │   └── los.spec.ts         # LOS integration tests
│   ├── lms/
│   │   └── lms.spec.ts         # LMS integration tests
│   ├── properties/             # Property-based tests
│   │   ├── authentication.spec.ts
│   │   ├── credentials.spec.ts
│   │   ├── endpoints.spec.ts
│   │   ├── environment.spec.ts
│   │   ├── jsonParsing.spec.ts
│   │   ├── logging.spec.ts
│   │   ├── pathParams.spec.ts
│   │   └── testdata.spec.ts
│   └── unit/                   # Unit tests
│       ├── config/
│       ├── helpers/
│       └── utils/
├── types/                       # TypeScript type definitions
│   ├── api.types.ts            # API request/response types
│   ├── config.types.ts         # Configuration types
│   └── testdata.types.ts       # Test data types
├── utils/                       # Utility functions
│   ├── logger.ts               # Logging utility
│   └── validators.ts           # Response validation utilities
├── package.json
├── tsconfig.json
├── playwright.config.ts
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd playwright-api-framework
```

2. Install dependencies:
```bash
npm install
```

3. Set up credentials:
```bash
cp config/creds.example.json config/creds.json
```

4. Edit `config/creds.json` with your actual credentials:
```json
{
  "los": {
    "userid": "your_los_userid",
    "email": "your_los_email@example.com",
    "password": "your_los_password",
    "authToken": ""
  },
  "lms": {
    "userid": "your_lms_userid",
    "email": "your_lms_email@example.com",
    "password": "your_lms_password",
    "authToken": ""
  }
}
```

5. Configure environment URLs in `config/envconfig.ts` if needed.

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests by Pod
```bash
# LOS tests only
npm run test:los

# LMS tests only
npm run test:lms
```

### Run Tests by Type
```bash
# Unit tests only
npm run test:unit

# Property-based tests only
npm run test:properties
```

### Run Tests with Options
```bash
# Run in headed mode (with browser UI)
npm run test:headed

# Run in debug mode
npm run test:debug
```

### View Test Reports
```bash
npm run report
```

### Clean Test Results
```bash
npm run clean
```

## Environment Configuration

The framework supports multiple environments: `dev`, `staging`, and `prod`.

### Set Environment via Environment Variable
```bash
# Run tests against staging environment
TEST_ENV=staging npm test

# Run tests against production environment
TEST_ENV=prod npm test
```

### Default Environment
If no environment is specified, the framework defaults to `dev`.

### Configure Environment URLs
Edit `config/envconfig.ts` to update base URLs for each environment:
```typescript
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
```

## Adding a New Pod

To add a new pod to the framework, follow these steps:

### 1. Add Endpoints
Add a new pod section to `config/endpoints.json`:
```json
"newpod": {
  "auth": {
    "login": "/api/newpod/auth/login",
    "logout": "/api/newpod/auth/logout"
  },
  "resources": {
    "create": "/api/newpod/resources",
    "getById": "/api/newpod/resources/{id}"
  }
}
```

### 2. Add Credentials
Add credentials to `config/creds.json`:
```json
"newpod": {
  "userid": "newpod_user",
  "email": "newpod@example.com",
  "password": "password",
  "authToken": ""
}
```

### 3. Create Helper Class
Create `helpers/newpod/newpodHelper.ts`:
```typescript
import { APIRequestContext } from '@playwright/test';
import { BaseHelper } from '../base/baseHelper';
import endpoints from '../../config/endpoints.json';
import creds from '../../config/creds.json';
import { LoginResponse, ApiResponse } from '../../types/api.types';

export class NewPodHelper extends BaseHelper {
  constructor(request: APIRequestContext) {
    super(request, 'newpod');
  }
  
  async login(): Promise<void> {
    const loginEndpoint = endpoints.newpod.auth.login;
    const credentials = creds.newpod;

    const response = await this.makeRequest('POST', loginEndpoint, {
      data: {
        email: credentials.email,
        password: credentials.password
      }
    });

    if (!response.ok) {
      throw new Error(`NewPod login failed: ${response.status} - ${JSON.stringify(response.body)}`);
    }

    const loginData: LoginResponse = response.body;
    this.setAuthToken(loginData.token);
    this.logger.info('NewPod login successful');
  }
  
  // Add pod-specific methods here
  async createResource(data: any): Promise<ApiResponse> {
    const endpoint = endpoints.newpod.resources.create;
    return await this.makeRequest('POST', endpoint, { data });
  }
  
  async logout(): Promise<void> {
    const endpoint = endpoints.newpod.auth.logout;
    await this.makeRequest('POST', endpoint);
    this.setAuthToken('');
    this.logger.info('NewPod logout successful');
  }
}
```

### 4. Create Test Data
Create `testdata/newpod/testdata.json`:
```json
{
  "headers": {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Client-Id": "newpod-test-client"
  },
  "config": {
    "timeout": 30000,
    "retries": 2,
    "defaultWaitTime": 1000
  },
  "payloads": {
    "validResource": {
      "name": "Test Resource",
      "type": "example"
    }
  }
}
```

### 5. Create Test Spec
Create `tests/newpod/newpod.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';
import { NewPodHelper } from '../../helpers/newpod/newpodHelper';
import { ResponseValidator } from '../../utils/validators';
import newpodTestData from '../../testdata/newpod/testdata.json';

test.describe('NewPod API Tests', () => {
  let newpodHelper: NewPodHelper;

  test.beforeAll(async ({ request }) => {
    newpodHelper = new NewPodHelper(request);
    await newpodHelper.login();
  });

  test.afterAll(async () => {
    await newpodHelper.logout();
  });

  test('should create a new resource', async () => {
    const resourceData = newpodTestData.payloads.validResource;
    const response = await newpodHelper.createResource(resourceData);

    ResponseValidator.validateStatusOk(response);
    expect(response.body).toHaveProperty('id');
  });
});
```

### 6. Add NPM Script
Add to `package.json`:
```json
"test:newpod": "playwright test tests/newpod"
```

## Security Considerations

### Credentials Management
- **Never commit** `config/creds.json` to version control
- The file is already in `.gitignore`
- Use `config/creds.example.json` as a template for team members
- For CI/CD, use environment variables or secrets management systems

### Production Safety
- Always use HTTPS URLs in production environments
- Rotate credentials regularly
- Use separate credentials for each environment
- Consider integrating with secrets management systems (AWS Secrets Manager, Azure Key Vault, etc.)

### Token Storage
- Authentication tokens are stored in memory only
- Tokens are never persisted to disk
- Tokens are cleared on logout

## Testing Strategy

The framework uses a dual testing approach:

### Unit Tests
- Test specific examples and edge cases
- Located in `tests/unit/`
- Focus on utilities, validators, and helper methods

### Property-Based Tests
- Verify universal properties across all inputs
- Located in `tests/properties/`
- Use fast-check library for property testing
- Run 100 iterations per property by default

### Integration Tests
- Test end-to-end flows using helper classes
- Located in `tests/{pod}/`
- Verify complete authentication and CRUD operations

## Contributing

1. Follow the established directory structure
2. Add TypeScript types for all new data structures
3. Write both unit tests and property tests for new functionality
4. Update this README when adding new features or pods
5. Ensure all tests pass before submitting changes

## License

ISC

## Support

For questions or issues, please contact the development team or open an issue in the repository.
