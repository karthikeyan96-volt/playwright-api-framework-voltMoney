# Login APIs Automation - Complete Understanding

## 📚 Table of Contents
1. [Framework Overview](#framework-overview)
2. [Project Structure](#project-structure)
3. [Login Test Implementation](#login-test-implementation)
4. [Logging with log4js](#logging-with-log4js)
5. [Allure Reporting](#allure-reporting)
6. [Test Execution](#test-execution)
7. [Quick Reference Commands](#quick-reference-commands)
8. [Troubleshooting](#troubleshooting)

---

## Framework Overview

### What is This Framework?
A **Playwright TypeScript API automation framework** designed for testing multi-pod architecture systems with:
- ✅ Clean separation of concerns
- ✅ Scalable architecture (easy to add new pods)
- ✅ Type-safe with TypeScript
- ✅ Professional logging with log4js
- ✅ Rich reporting with Allure
- ✅ Environment-aware configuration

### Key Features
- **Multi-Environment Support**: dev, staging, prod
- **Helper Classes**: Encapsulate all API logic per pod
- **Automatic Authentication**: Token management handled by helpers
- **Comprehensive Logging**: File-based logs with rotation
- **Rich Reports**: Interactive Allure reports with attachments
- **Test Tags**: Organize and run tests by tags

---

## Project Structure

```
playwright-api-framework/
├── config/                      # Configuration files
│   ├── envconfig.ts            # Environment URLs (dev, staging, prod)
│   ├── endpoints.json          # API endpoints by pod
│   ├── creds.json              # Credentials (gitignored)
│   ├── creds.example.json      # Credentials template
│   └── log4js.config.ts        # Logging configuration
│
├── helpers/                     # API helper classes
│   ├── base/
│   │   └── baseHelper.ts       # Base class with common functionality
│   ├── los/
│   │   └── losHelper.ts        # LOS API methods
│   └── lms/
│       └── lmsHelper.ts        # LMS API methods
│
├── testdata/                    # Test data by pod
│   ├── los/testdata.json
│   └── lms/testdata.json
│
├── tests/                       # Test specifications
│   ├── los/
│   │   ├── login.spec.ts           # Serial login tests (Steps 1-3)
│   │   ├── login-negative.spec.ts  # Parallel negative tests
│   │   └── los.spec.ts             # Other LOS tests
│   ├── lms/
│   ├── properties/             # Property-based tests
│   └── unit/                   # Unit tests
│
├── types/                       # TypeScript type definitions
│   ├── api.types.ts
│   ├── config.types.ts
│   └── testdata.types.ts
│
├── utils/                       # Utility functions
│   ├── logger.ts               # log4js logger wrapper
│   ├── validators.ts           # Response validators
│   └── allureHelper.ts         # Allure helper functions
│
├── logs/                        # Log files (auto-generated)
│   ├── los/                    # LOS pod logs
│   ├── lms/                    # LMS pod logs
│   ├── all/                    # All logs combined
│   └── errors/                 # Error logs only
│
├── docs/                        # Documentation
│   ├── LOGGING_AND_REPORTING.md
│   ├── ALLURE_CATEGORIES_GUIDE.md
│   └── TEST_TAGS_GUIDE.md
│
├── categories.json              # Allure failure categories
├── playwright.config.ts         # Playwright configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

---

## Login Test Implementation

### Test Architecture

#### 1. **Serial Tests** (`tests/los/login.spec.ts`)
Tests that **must run in order** because they share state (JWT token):

```typescript
test.describe.serial('LOS Login Flow', { tag: '@LoginTests' }, () => {
  let jwtToken: string; // Shared across tests
  
  test('Step 1: Request OTP - Returns 200', async () => {
    // Request OTP for phone number
  });
  
  test('Step 2: Verify OTP - Returns 200', async () => {
    // Verify OTP and capture JWT token
    jwtToken = response.body.jwt;
  });
  
  test('Step 3: Fetch User Data - Returns 200', async () => {
    // Use JWT token from Step 2
    losHelper.setAuthToken(jwtToken);
  });
});
```

**Why Serial?**
- Step 2 depends on Step 1 (OTP must be requested first)
- Step 3 depends on Step 2 (needs JWT token)
- Tests share state (JWT token variable)

#### 2. **Parallel Tests** (`tests/los/login-negative.spec.ts`)
Tests that **run independently** (no shared state):

```typescript
test.describe('LOS Login - Negative Tests', { tag: '@LoginTests' }, () => {
  
  test('Invalid JWT Token - Returns 403', async () => {
    // Test with invalid JWT
    // Intentionally fails to demonstrate Allure categories
  });
  
  test('Malformed Phone Number - Returns 400', async () => {
    // Test with malformed data
    // Intentionally fails to demonstrate Allure categories
  });
});
```

**Why Parallel?**
- Tests are independent (no shared state)
- Faster execution
- Demonstrate different error categories

### Login Flow Details

#### Step 1: Request OTP
```typescript
const response = await losHelper.requestOtp(phoneNo, true);
// API: GET /api/client/auth/requestOtp/v2/{phoneNo}?enableWhatsapp=true
// Response: { status: 'SUCCESS', noOfDigits: 6, message: 'Otp sent successfully' }
```

#### Step 2: Verify OTP
```typescript
const response = await losHelper.verifyOtp(phoneNo, otp);
// API: POST /api/client/auth/verifyOtp/v2
// Response: { status: 'SUCCESS', jwt: 'eyJhbGci...', message: 'Otp verified successfully' }
```

#### Step 3: Fetch User Data
```typescript
losHelper.setAuthToken(jwtToken);
const response = await losHelper.getUserData();
// API: POST /app/borrower/user
// Headers: { Authorization: 'Bearer {jwt}' }
// Response: { isLoggedIn: true, user: {...}, linkedBorrowerAccounts: [...] }
```

---

## Logging with log4js

### Configuration (`config/log4js.config.ts`)

```typescript
{
  appenders: {
    console: { type: 'console' },
    losFile: { type: 'dateFile', filename: 'logs/los/los', pattern: '-yyyy-MM-dd.log' },
    lmsFile: { type: 'dateFile', filename: 'logs/lms/lms', pattern: '-yyyy-MM-dd.log' },
    allFile: { type: 'dateFile', filename: 'logs/all/all', pattern: '-yyyy-MM-dd.log' },
    errors: { type: 'dateFile', filename: 'logs/errors/error', pattern: '-yyyy-MM-dd.log' }
  },
  categories: {
    los: { appenders: ['console', 'losFile', 'allFile', 'errors'], level: 'debug' },
    lms: { appenders: ['console', 'lmsFile', 'allFile', 'errors'], level: 'debug' }
  }
}
```

### Log Files Structure
```
logs/
├── los/
│   └── los-2026-01-20.log          # LOS pod logs
├── lms/
│   └── lms-2026-01-20.log          # LMS pod logs
├── all/
│   └── all-2026-01-20.log          # All logs combined
└── errors/
    └── error-2026-01-20.log        # Error logs only
```

### Log Levels
- **DEBUG**: Detailed information (request/response bodies)
- **INFO**: General information (request URLs, status codes)
- **WARN**: Warning messages
- **ERROR**: Error messages

### Sample Log Output
```
[2026-01-20 15:09:52] [INFO] [los] GET https://api.staging.voltmoney.in/api/client/auth/requestOtp/v2/+918344422975?enableWhatsapp=true
[2026-01-20 15:09:52] [INFO] [los] Response status: 200
[2026-01-20 15:09:52] [DEBUG] [los] Response body: { status: 'SUCCESS', noOfDigits: 6, message: 'Otp sent successfully' }
```

---

## Allure Reporting

### Features
- ✅ **Rich Attachments**: Request, Response, Curl commands
- ✅ **Automatic Categorization**: By HTTP status codes
- ✅ **Test Organization**: By Feature, Story, Severity
- ✅ **Timeline View**: Visual execution flow
- ✅ **Historical Trends**: Track test stability
- ✅ **Interactive UI**: Click to explore details

### Configuration (`playwright.config.ts`)

```typescript
reporter: [
  ['html'],
  ['list'],
  ['json', { outputFile: 'test-results/results.json' }],
  ['allure-playwright', {
    detail: true,
    outputFolder: 'allure-results',
    suiteTitle: true,
    categoriesPath: './categories.json'
  }]
]
```

### Failure Categories (`categories.json`)

```json
[
  {
    "name": "4XX Errors",
    "messageRegex": ".*(400|401|402|403|404|...).*",
    "matchedStatuses": ["failed", "broken"]
  },
  {
    "name": "5XX Errors",
    "messageRegex": ".*(500|501|502|503|504|...).*",
    "matchedStatuses": ["failed", "broken"]
  },
  {
    "name": "Others",
    "matchedStatuses": ["failed", "broken"]
  }
]
```

### Allure Metadata in Tests

```typescript
import { setFeature, setStory, setSeverity, step } from '../../utils/allureHelper';

test('My Test', async () => {
  setFeature('Authentication');
  setStory('OTP Login Flow');
  setSeverity('critical');
  
  await step('Step 1: Do something', async () => {
    // Your code...
  });
});
```

### What You'll See in Allure Report

#### 1. Overview Dashboard
```
┌─────────────────────────────────────────┐
│         Test Execution Summary          │
├─────────────────────────────────────────┤
│  Total:    5                            │
│  Passed:   3 (60%)  ✅                  │
│  Failed:   2 (40%)  ❌                  │
│  Duration: 937ms                        │
└─────────────────────────────────────────┘
```

#### 2. Categories Section
```
┌─────────────────────────────────────────┐
│            Categories                   │
├─────────────────────────────────────────┤
│  4XX Errors          2 failures         │
│  5XX Errors          0 failures         │
│  Others              0 failures         │
└─────────────────────────────────────────┘
```

#### 3. Test Details (Click on Failed Test)
- **Test Information**: Name, Status, Duration, Feature, Story, Severity
- **Error Message**: Expected vs Actual
- **Attachments**: Request JSON, Response JSON, Curl Command
- **Steps**: Custom steps with duration
- **Stack Trace**: Line numbers and code context
- **Console Logs**: All console output

---

## Test Execution

### Run All Login Tests
```bash
# Using tag
TEST_ENV=staging npm run test:login

# Or using Playwright CLI
TEST_ENV=staging npx playwright test --grep @LoginTests
```

### Run Specific Files
```bash
# Serial tests only (Steps 1-3)
TEST_ENV=staging npm test -- tests/los/login.spec.ts

# Negative tests only (parallel)
TEST_ENV=staging npm test -- tests/los/login-negative.spec.ts

# Both files
TEST_ENV=staging npm test -- tests/los/login*.spec.ts
```

### Expected Results
```
Total: 5 tests
Passed: 3 tests (login.spec.ts - serial)
Failed: 2 tests (login-negative.spec.ts - parallel, intentional)
Duration: ~1 second

✅ Step 1: Request OTP - 200
✅ Step 2: Verify OTP - 200
✅ Step 3: Fetch User Data - 200
❌ Invalid JWT Token - 403 (intentional failure)
❌ Malformed Phone Number - 400 (intentional failure)
```

---

## Quick Reference Commands

### Complete Workflow
```bash
# 1. Clean old reports
rm -rf allure-results allure-report playwright-report test-results logs

# 2. Run tests
TEST_ENV=staging npm run test:login

# 3. Generate and serve Allure report
npm run allure:serve
```

### All-in-One Command
```bash
rm -rf allure-results allure-report playwright-report test-results logs && TEST_ENV=staging npm run test:login && npm run allure:serve
```

### NPM Scripts
```bash
# Run tests
npm test                        # All tests
npm run test:login              # Login tests only (@LoginTests tag)
npm run test:framework          # Framework validation tests (@FrameworkCheckTests tag)
npm run test:los                # All LOS tests
npm run test:lms                # All LMS tests
npm run test:unit               # Unit tests only
npm run test:properties         # Property tests only (same as test:framework)

# Allure reports
npm run allure:generate         # Generate report
npm run allure:open             # Open existing report
npm run allure:serve            # Generate and serve

# Cleanup
npm run clean                   # Remove all reports and logs
```

### Test Tags
```bash
# Run by tag
npx playwright test --grep @LoginTests          # API login tests (5 tests)
npx playwright test --grep @FrameworkCheckTests # Framework validation (8 files, 60+ tests)
```

### View Logs
```bash
# View LOS logs
cat logs/los/los-$(date +%Y-%m-%d).log

# View error logs
cat logs/errors/error-$(date +%Y-%m-%d).log

# View all logs
cat logs/all/all-$(date +%Y-%m-%d).log
```

---

## Troubleshooting

### Issue 1: Step 3 Fails
**Symptom**: Step 3 fails with "No JWT token available"

**Cause**: OTP expired or JWT token not captured

**Solution**:
1. Check that tests run in serial (`.serial()`)
2. Check that `jwtToken` variable is shared between tests
3. Run tests again (OTP might have expired)

### Issue 2: Negative Tests Pass
**Symptom**: Negative tests pass instead of failing

**Cause**: Intentional failure assertions removed

**Solution**:
1. Check `login-negative.spec.ts`
2. Ensure `expect(response.status).toBe(200)` exists
3. This line should fail when status is 403 or 400

### Issue 3: Allure Report Empty
**Symptom**: Allure report shows no tests

**Cause**: Tests didn't run or allure-results missing

**Solution**:
1. Check `allure-results/` directory exists
2. Run: `npm run allure:generate`
3. Run: `npm run allure:serve`

### Issue 4: Duplicate Categories
**Symptom**: Same test appears in multiple categories

**Cause**: Using inline categories instead of external file

**Solution**:
1. Ensure `categories.json` exists
2. Check `playwright.config.ts` uses `categoriesPath: './categories.json'`
3. Don't use inline `categories` array

### Issue 5: Logs Not Created
**Symptom**: No log files in `logs/` directory

**Cause**: log4js configuration issue

**Solution**:
1. Check `config/log4js.config.ts` exists
2. Check `logs/` directory exists (created automatically)
3. Run tests to generate new logs

---

## Key Concepts

### Why Separate Files for Serial and Parallel Tests?
- **Serial tests** (login.spec.ts): Share state (JWT token), must run in order
- **Parallel tests** (login-negative.spec.ts): Independent, can run simultaneously
- **Benefit**: Optimal performance + clear organization

### Why Intentional Failures in Negative Tests?
- **Purpose**: Demonstrate Allure categories and error handling
- **Real-world**: In production, these would be proper negative tests
- **Learning**: Shows how failures appear in Allure report

### Why External categories.json?
- **Problem**: Inline categories cause duplicates (same test in multiple categories)
- **Solution**: External file uses different matching algorithm
- **Result**: Each failure appears in only ONE category

### Why log4js Instead of Custom Logger?
- **Professional**: Battle-tested, enterprise-grade logging
- **Features**: File rotation, multiple appenders, flexible configuration
- **Maintenance**: No need to maintain custom logging code

### Why Allure Instead of HTML Report?
- **Rich Context**: Request/response attachments, curl commands
- **Organization**: Categories, features, stories, severity
- **Debugging**: All context in one place, easy to share
- **Historical**: Track trends over time

---

## Summary

This framework provides:
- ✅ **Scalable architecture** for multi-pod API testing
- ✅ **Professional logging** with log4js (file-based, rotation)
- ✅ **Rich reporting** with Allure (interactive, attachments)
- ✅ **Type safety** with TypeScript
- ✅ **Clean organization** (serial vs parallel tests)
- ✅ **Easy maintenance** (add new pods without modifying existing code)
- ✅ **Comprehensive testing** (unit, property, integration)

**Result**: A production-ready API automation framework! 🎉

---

## Additional Resources

- **Complete Logging Guide**: `docs/LOGGING_AND_REPORTING.md`
- **Allure Categories Guide**: `docs/ALLURE_CATEGORIES_GUIDE.md`
- **Test Tags Guide**: `docs/TEST_TAGS_GUIDE.md`
- **Framework README**: `README.md`

---

**Last Updated**: January 20, 2026
