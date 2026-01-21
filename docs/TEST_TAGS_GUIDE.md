# Test Tags Guide

## Overview
Test tags allow you to run specific groups of tests without specifying file paths. This is useful for organizing and running tests by feature, priority, or type.

---

## Available Tags

### `@LoginTests`
Runs all login-related tests (positive and negative flows)

**Includes:**
- `tests/los/login.spec.ts` - Serial positive login flow (Steps 1-3)
- `tests/los/login-negative.spec.ts` - Parallel negative tests

**Total Tests:** 5
- Step 1: Request OTP
- Step 2: Verify OTP
- Step 3: Fetch User Data
- Invalid JWT Token
- Malformed Phone Number

---

## How to Run Tests by Tag

### Using npm Scripts (Recommended)

```bash
# Run all login tests
TEST_ENV=staging npm run test:login
```

### Using Playwright CLI Directly

```bash
# Run tests with specific tag
TEST_ENV=staging npx playwright test --grep @LoginTests

# Run tests with tag in headed mode
TEST_ENV=staging npx playwright test --grep @LoginTests --headed

# Run tests with tag and generate Allure report
TEST_ENV=staging npx playwright test --grep @LoginTests && npm run allure:serve
```

---

## Adding Tags to Tests

### Syntax

```typescript
// Single tag
test.describe('Test Suite', { tag: '@TagName' }, () => {
  // tests...
});

// Multiple tags
test.describe('Test Suite', { tag: ['@Tag1', '@Tag2'] }, () => {
  // tests...
});
```

### Example: Login Tests

```typescript
// tests/los/login.spec.ts
test.describe.serial('LOS Login Flow', { tag: '@LoginTests' }, () => {
  test('Step 1: Request OTP', async () => { /* ... */ });
  test('Step 2: Verify OTP', async () => { /* ... */ });
  test('Step 3: Fetch User Data', async () => { /* ... */ });
});

// tests/los/login-negative.spec.ts
test.describe('LOS Login - Negative Tests', { tag: '@LoginTests' }, () => {
  test('Invalid JWT Token', async () => { /* ... */ });
  test('Malformed Phone Number', async () => { /* ... */ });
});
```

---

## Tag Naming Conventions

### Format
- Use `@` prefix
- Use PascalCase (e.g., `@LoginTests`, `@SmokeTests`)
- Be descriptive and specific

### Examples

```typescript
// ✅ Good
@LoginTests
@SmokeTests
@RegressionTests
@CriticalPath
@ApiTests
@E2ETests

// ❌ Bad
@login          // Not PascalCase
@test1          // Not descriptive
@all            // Too generic
```

---

## Common Tag Patterns

### By Feature
```typescript
@LoginTests
@PaymentTests
@UserManagement
@Notifications
```

### By Priority
```typescript
@Critical
@High
@Medium
@Low
```

### By Type
```typescript
@SmokeTests
@RegressionTests
@E2ETests
@IntegrationTests
@UnitTests
```

### By Environment
```typescript
@StagingOnly
@ProductionSafe
@DevOnly
```

### By Speed
```typescript
@Fast
@Slow
@LongRunning
```

---

## Advanced Tag Usage

### Run Multiple Tags

```bash
# Run tests with either tag
npx playwright test --grep "@LoginTests|@SmokeTests"

# Run tests with both tags (AND)
npx playwright test --grep "(?=.*@LoginTests)(?=.*@Critical)"
```

### Exclude Tags

```bash
# Run all tests except login tests
npx playwright test --grep-invert @LoginTests

# Run all tests except slow tests
npx playwright test --grep-invert @Slow
```

### Combine Include and Exclude

```bash
# Run smoke tests but exclude slow ones
npx playwright test --grep @SmokeTests --grep-invert @Slow
```

---

## Suggested Tags for Your Framework

### Feature-Based Tags

```typescript
// Authentication
@LoginTests
@LogoutTests
@AuthTests

// LOS (Loan Origination System)
@LOSTests
@LoanTests
@ApplicationTests

// LMS (Loan Management System)
@LMSTests
@PaymentTests
@AccountTests
```

### Priority-Based Tags

```typescript
@Critical      // Must pass before release
@High          // Important but not blocking
@Medium        // Standard priority
@Low           // Nice to have
```

### Type-Based Tags

```typescript
@SmokeTests    // Quick sanity checks
@Regression    // Full regression suite
@E2E           // End-to-end flows
@API           // API-only tests
@Negative      // Negative test cases
```

---

## npm Scripts for Tags

Add these to your `package.json`:

```json
{
  "scripts": {
    "test:login": "playwright test --grep @LoginTests",
    "test:smoke": "playwright test --grep @SmokeTests",
    "test:critical": "playwright test --grep @Critical",
    "test:regression": "playwright test --grep @Regression",
    "test:negative": "playwright test --grep @Negative",
    "test:fast": "playwright test --grep @Fast",
    "test:los": "playwright test --grep @LOSTests",
    "test:lms": "playwright test --grep @LMSTests"
  }
}
```

Then run:

```bash
npm run test:login
npm run test:smoke
npm run test:critical
```

---

## Best Practices

### 1. Use Consistent Naming
```typescript
// ✅ Good - Consistent pattern
@LoginTests
@PaymentTests
@UserTests

// ❌ Bad - Inconsistent
@login
@PaymentTest
@Users
```

### 2. Tag at Suite Level
```typescript
// ✅ Good - Tag the entire suite
test.describe('Login Tests', { tag: '@LoginTests' }, () => {
  test('test 1', () => {});
  test('test 2', () => {});
});

// ❌ Bad - Tagging individual tests (harder to maintain)
test('test 1', { tag: '@LoginTests' }, () => {});
test('test 2', { tag: '@LoginTests' }, () => {});
```

### 3. Use Multiple Tags When Appropriate
```typescript
test.describe('Critical Login Tests', { 
  tag: ['@LoginTests', '@Critical', '@SmokeTests'] 
}, () => {
  // tests...
});
```

### 4. Document Your Tags
Keep a list of all tags in your project documentation so team members know what's available.

---

## Examples

### Run Login Tests with Allure Report

```bash
# Clean, run, and generate report
rm -rf allure-results allure-report
TEST_ENV=staging npm run test:login
npm run allure:serve
```

### Run Only Critical Tests

```bash
TEST_ENV=staging npx playwright test --grep @Critical
```

### Run Smoke Tests Excluding Slow Ones

```bash
TEST_ENV=staging npx playwright test --grep @SmokeTests --grep-invert @Slow
```

### Run All Tests Except Login

```bash
TEST_ENV=staging npx playwright test --grep-invert @LoginTests
```

---

## Summary

✅ **Tags organize tests** by feature, priority, or type  
✅ **Easy to run** specific test groups  
✅ **Flexible filtering** with include/exclude  
✅ **Better CI/CD** integration  
✅ **Improved maintainability**  

Use tags to make your test suite more organized and efficient! 🎯
