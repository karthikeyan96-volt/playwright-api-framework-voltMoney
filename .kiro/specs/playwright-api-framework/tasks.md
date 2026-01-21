# Implementation Plan: Playwright TypeScript API Automation Framework

## Overview

This implementation plan breaks down the creation of a scalable Playwright TypeScript API automation framework into discrete, incremental steps. The framework will support multi-pod architecture (LOS, LMS) with clean separation of concerns across configuration, helpers, test data, and test specifications.

## Tasks

- [x] 1. Initialize project structure and configuration
  - Create package.json with Playwright, TypeScript, and fast-check dependencies
  - Create tsconfig.json with appropriate compiler options
  - Create playwright.config.ts for API testing
  - Create .gitignore to exclude node_modules, test-results, dist, and creds.json
  - Create directory structure: config/, helpers/, testdata/, tests/, types/, utils/
  - _Requirements: 1.3, 1.4, 1.5, 4.4_

- [ ] 2. Create TypeScript type definitions
  - [x] 2.1 Create types/config.types.ts with configuration interfaces
    - Define PodCredentials, CredentialsConfig, PodEndpoints, EndpointsConfig interfaces
    - _Requirements: 10.1, 10.2_
  
  - [x] 2.2 Create types/testdata.types.ts with test data interfaces
    - Define TestDataHeaders, PodTestData interfaces
    - _Requirements: 10.2_
  
  - [x] 2.3 Create types/api.types.ts with API request/response interfaces
    - Define ApiResponse<T>, LoginRequest, LoginResponse interfaces
    - _Requirements: 10.3_

- [ ] 3. Create configuration files
  - [x] 3.1 Create config/envconfig.ts with environment configuration
    - Implement EnvironmentConfig interface with dev, staging, prod environments
    - Implement getBaseUrl function with environment selection logic
    - Support environment selection via TEST_ENV environment variable
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 3.2 Create config/endpoints.json with API endpoints
    - Add LOS endpoints (auth, loans, applications)
    - Add LMS endpoints (auth, payments, accounts)
    - Use relative paths without base URLs
    - Organize by pod and category
    - _Requirements: 3.1, 3.2, 3.4_
  
  - [x] 3.3 Create config/creds.json and config/creds.example.json
    - Add LOS credentials structure (userid, email, password, authToken)
    - Add LMS credentials structure (userid, email, password, authToken)
    - Create example template with placeholder values
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [ ] 4. Create utility components
  - [x] 4.1 Create utils/logger.ts with logging functionality
    - Implement Logger class with context-based logging
    - Support log levels: DEBUG, INFO, WARN, ERROR
    - Format log messages with level, context, and timestamp
    - _Requirements: 11.5_
  
  - [x] 4.2 Create utils/validators.ts with response validation
    - Implement ResponseValidator class with static validation methods
    - Add validateStatus, validateStatusOk, validateField, validateSchema methods
    - Provide descriptive error messages for validation failures
    - _Requirements: 12.1, 12.5_

- [ ] 5. Create base helper class
  - [x] 5.1 Create helpers/base/baseHelper.ts
    - Implement abstract BaseHelper class with request, baseUrl, authToken, logger properties
    - Implement makeRequest method for HTTP requests (GET, POST, PUT, DELETE, PATCH)
    - Implement buildUrl method with query parameter support
    - Implement buildHeaders method with auth token injection
    - Implement parseResponse method with automatic JSON parsing
    - Implement replacePathParams method for path parameter substitution
    - Implement setAuthToken and getAuthToken methods
    - Add comprehensive error logging for failed requests
    - Define abstract login method
    - _Requirements: 5.3, 5.5, 6.1, 6.2, 11.1, 11.2, 12.2_
  
  - [x] 5.2 Write property test for path parameter replacement
    - **Property 8: Path Parameters Are Correctly Replaced**
    - **Validates: Requirements 5.4**
  
  - [x] 5.3 Write property test for JSON response parsing
    - **Property 7: JSON Responses Are Automatically Parsed**
    - **Validates: Requirements 12.2**
  
  - [x] 5.4 Write unit tests for base helper methods
    - Test buildUrl with and without query parameters
    - Test buildHeaders with and without auth token
    - Test error scenarios (network failures, timeouts)
    - _Requirements: 11.1, 11.2_

- [ ] 6. Create LOS helper class
  - [x] 6.1 Create helpers/los/losHelper.ts
    - Extend BaseHelper class
    - Implement login method using LOS credentials and endpoints
    - Implement createLoan, getLoanById, updateLoan, deleteLoan, listLoans methods
    - Implement createApplication, getApplicationById, submitApplication methods
    - Implement logout method
    - _Requirements: 5.1, 5.2, 5.4, 6.3_
  
  - [x] 6.2 Write property test for authentication token storage and usage
    - **Property 4: Authentication Stores and Uses Token**
    - **Validates: Requirements 6.1, 6.2**
  
  - [x] 6.3 Write unit test for authentication failure
    - Test that login throws descriptive error on failure
    - _Requirements: 6.4, 11.4_

- [ ] 7. Create LMS helper class
  - [x] 7.1 Create helpers/lms/lmsHelper.ts
    - Extend BaseHelper class
    - Implement login method using LMS credentials and endpoints
    - Implement createPayment, getPaymentById, listPayments methods
    - Implement getAccountById, updateAccount methods
    - Implement logout method
    - _Requirements: 5.1, 5.2, 5.4, 6.3_

- [x] 8. Checkpoint - Verify helper classes compile and basic structure is correct
  - Run TypeScript compiler to ensure no errors
  - Verify all helper methods are properly typed
  - Ensure all tests pass, ask the user if questions arise

- [ ] 9. Create test data files
  - [x] 9.1 Create testdata/los/testdata.json
    - Add headers configuration with Content-Type, Accept, X-Client-Id
    - Add config with timeout, retries, defaultWaitTime
    - Add sample payloads for validLoan and validApplication
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [x] 9.2 Create testdata/lms/testdata.json
    - Add headers configuration with Content-Type, Accept, X-Client-Id
    - Add config with timeout, retries, defaultWaitTime
    - Add sample payloads for validPayment and accountUpdate
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [x] 9.3 Write property test for test data structure
    - **Property 5: Test Data Files Contain Required Structure**
    - **Validates: Requirements 7.2, 7.3**

- [ ] 10. Create LOS test specifications
  - [x] 10.1 Create tests/los/los.spec.ts
    - Import LOSHelper and test data
    - Implement beforeAll hook to instantiate helper and login
    - Implement afterAll hook to logout
    - Write test: "should create a new loan"
    - Write test: "should retrieve loan by ID"
    - Write test: "should update an existing loan"
    - Write test: "should list all loans"
    - Write test: "should create and submit application"
    - Use ResponseValidator for assertions
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 11. Create LMS test specifications
  - [x] 11.1 Create tests/lms/lms.spec.ts
    - Import LMSHelper and test data
    - Implement beforeAll hook to instantiate helper and login
    - Implement afterAll hook to logout
    - Write test: "should create a new payment"
    - Write test: "should retrieve payment by ID"
    - Write test: "should list all payments"
    - Write test: "should retrieve account by ID"
    - Write test: "should update account information"
    - Use ResponseValidator for assertions
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 12. Create property-based tests
  - [x] 12.1 Create tests/properties/ directory and setup
    - Install fast-check as dev dependency
    - Create property test structure
  
  - [x] 12.2 Create tests/properties/environment.spec.ts
    - **Property 1: Environment Selection Returns Correct Base URL**
    - **Validates: Requirements 2.3, 2.4**
  
  - [x] 12.3 Create tests/properties/endpoints.spec.ts
    - **Property 2: All Endpoints Use Relative Paths**
    - **Validates: Requirements 3.4**
  
  - [x] 12.4 Create tests/properties/credentials.spec.ts
    - **Property 3: All Pod Credentials Contain Required Fields**
    - **Validates: Requirements 4.3**
  
  - [x] 12.5 Create tests/properties/logging.spec.ts
    - **Property 6: Failed API Calls Log Complete Details**
    - **Validates: Requirements 11.1, 11.2**

- [ ] 13. Create unit tests for utilities
  - [x] 13.1 Create tests/unit/utils/logger.spec.ts
    - Test logger at different log levels
    - Test log message formatting
    - _Requirements: 11.5_
  
  - [x] 13.2 Create tests/unit/utils/validators.spec.ts
    - Test validateStatus with matching and non-matching status codes
    - Test validateStatusOk with ok and non-ok responses
    - Test validateField with present and missing fields
    - Test validateSchema with valid and invalid responses
    - _Requirements: 12.1, 12.5_

- [ ] 14. Add NPM scripts and documentation
  - [x] 14.1 Update package.json with test scripts
    - Add script: "test" for running all tests
    - Add script: "test:los" for LOS tests only
    - Add script: "test:lms" for LMS tests only
    - Add script: "test:unit" for unit tests only
    - Add script: "test:properties" for property tests only
    - Add script: "report" for viewing test reports
    - Add script: "clean" for cleaning test results
    - _Requirements: 8.5_
  
  - [x] 14.2 Create README.md with framework documentation
    - Document project structure
    - Document how to add a new pod
    - Document how to run tests
    - Document environment configuration
    - Include security considerations
    - _Requirements: 9.4_

- [x] 15. Final checkpoint - Run all tests and verify framework
  - Run TypeScript compiler to ensure no errors
  - Run all unit tests
  - Run all property tests
  - Verify test scripts work correctly (test:los, test:lms)
  - Ensure all tests pass, ask the user if questions arise
  - _Requirements: 10.5_

## Notes

- All tasks are required for comprehensive framework implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties with minimum 100 iterations
- Unit tests validate specific examples and edge cases
- The framework is designed to be extended with new pods following the established pattern
- After implementation, login cURLs can be integrated into the helper classes' login methods
