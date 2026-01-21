# Allure Categories Guide

## Overview
The Allure report automatically categorizes test failures based on HTTP status codes and error patterns. This makes it easy to identify and prioritize issues.

## Categories Configuration

### 1. **4XX Client Errors**
Catches all client-side errors (400-499 range)

**Examples:**
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 422 Unprocessable Entity
- 429 Too Many Requests

**Pattern:** `.*(400|401|402|403|404|405|406|407|408|409|410|411|412|413|414|415|416|417|418|422|423|424|425|426|428|429|431|451).*`

**Use Case:** Identifies issues with request format, authentication, permissions, or resource availability.

---

### 2. **5XX Server Errors**
Catches all server-side errors (500-599 range)

**Examples:**
- 500 Internal Server Error
- 502 Bad Gateway
- 503 Service Unavailable
- 504 Gateway Timeout

**Pattern:** `.*(500|501|502|503|504|505|506|507|508|510|511).*`

**Use Case:** Identifies backend issues, infrastructure problems, or service outages.

---

### 3. **Authentication Issues**
Specific category for auth-related failures

**Examples:**
- 401 Unauthorized
- 403 Forbidden
- Invalid token errors
- Login failures
- JWT validation errors

**Pattern:** `.*401.*|.*403.*|.*auth.*|.*token.*|.*login.*|.*unauthorized.*|.*forbidden.*`

**Use Case:** Quickly identify authentication and authorization problems.

---

### 4. **Not Found Errors**
Specific category for missing resources

**Examples:**
- 404 Not Found
- Resource not found errors
- Endpoint not found

**Pattern:** `.*404.*|.*not found.*`

**Use Case:** Identify incorrect URLs or missing resources.

---

### 5. **Timeout Errors**
Catches timeout-related failures

**Examples:**
- 408 Request Timeout
- 504 Gateway Timeout
- Connection timeout
- Read timeout

**Pattern:** `.*timeout.*|.*408.*|.*504.*`

**Use Case:** Identify performance issues or slow endpoints.

---

### 6. **Validation Errors**
Catches assertion and validation failures

**Examples:**
- expect() assertion failures
- Response validation errors
- Schema validation errors

**Pattern:** `.*expect.*|.*assert.*|.*validation.*|.*invalid.*`

**Use Case:** Identify test logic issues or unexpected response formats.

---

### 7. **Network Errors**
Catches network connectivity issues

**Examples:**
- ENOTFOUND (DNS resolution failed)
- ECONNREFUSED (Connection refused)
- ETIMEDOUT (Connection timeout)
- Network unreachable

**Pattern:** `.*ENOTFOUND.*|.*ECONNREFUSED.*|.*ETIMEDOUT.*|.*network.*`

**Use Case:** Identify infrastructure or connectivity problems.

---

### 8. **Other Failures**
Catch-all category for unclassified failures

**Use Case:** Captures any failures that don't match the above patterns.

---

## How Categories Work

### Priority Order
Categories are evaluated in order. The **first matching category** is assigned to the failure.

**Example:**
```
Test fails with "401 Unauthorized"
↓
Matches "4XX Client Errors" ✅
Matches "Authentication Issues" ✅
↓
Assigned to: "4XX Client Errors" (first match)
```

### Multiple Matches
A failure can match multiple patterns, but only the first match is used.

**Example:**
```
Test fails with "403 Forbidden - Invalid token"
↓
Matches "4XX Client Errors" ✅
Matches "Authentication Issues" ✅
↓
Assigned to: "4XX Client Errors" (first match)
```

---

## Viewing Categories in Allure Report

### 1. Open Allure Report
```bash
npm run allure:open
```

### 2. Navigate to "Categories" Section
- Click on "Categories" in the left sidebar
- See all failures grouped by category
- Click on a category to see all tests in that category

### 3. Category View Shows:
- **Category Name** (e.g., "4XX Client Errors")
- **Number of failures** in that category
- **List of failed tests** with links to details
- **Failure messages** and stack traces

---

## Example: Step 4 Failure

### Test Code:
```typescript
test('Step 4: Fetch User Data with Invalid JWT - Returns 401', async () => {
  setFeature('Authentication');
  setStory('Negative Testing - Invalid JWT');
  setSeverity('critical');
  
  await step('Set invalid JWT token and attempt to fetch user data', async () => {
    const invalidJwtToken = 'eyJhbGciOiJIUzI1NiJ9.INVALID_TOKEN.qHm-wWBtMIIm3tnPHZM6OxL-ZIDyVynf_SaF_-INVALID';
    losHelper.setAuthToken(invalidJwtToken);
    
    const response = await losHelper.getUserData();
    
    // Expected 401, but got 403
    expect(response.status).toBe(401); // ❌ Fails!
  });
});
```

### Allure Report Shows:
```
Category: 4XX Client Errors
  ↓
Test: Step 4: Fetch User Data with Invalid JWT - Returns 401
  ↓
Error: expect(received).toBe(expected)
  Expected: 401
  Received: 403
  ↓
Attachments:
  - Request (JSON)
  - Response (JSON)
  - Curl Command (text)
```

---

## Customizing Categories

### Add New Category
Edit `playwright.config.ts`:

```typescript
{
  name: 'Rate Limit Errors',
  messageRegex: '.*429.*|.*rate limit.*|.*too many requests.*',
  matchedStatuses: ['failed', 'broken']
}
```

### Modify Existing Category
Edit the `messageRegex` pattern:

```typescript
{
  name: 'Authentication Issues',
  messageRegex: '.*401.*|.*403.*|.*auth.*|.*token.*|.*login.*|.*jwt.*', // Added jwt
  matchedStatuses: ['failed', 'broken']
}
```

### Change Category Order
Reorder categories in the array (first match wins):

```typescript
categories: [
  { name: 'Authentication Issues', ... },  // Check this first
  { name: '4XX Client Errors', ... },      // Then this
  { name: '5XX Server Errors', ... },      // Then this
  // ...
]
```

---

## Best Practices

### 1. Order Categories by Specificity
Put more specific categories first:
```
✅ Good Order:
1. Authentication Issues (specific)
2. Not Found Errors (specific)
3. 4XX Client Errors (general)
4. Other Failures (catch-all)

❌ Bad Order:
1. 4XX Client Errors (general)
2. Authentication Issues (specific) ← Will never match!
```

### 2. Use Clear Category Names
```
✅ Good: "4XX Client Errors"
❌ Bad: "Client Side Issues"

✅ Good: "Authentication Issues"
❌ Bad: "Auth Problems"
```

### 3. Include Status Codes in Patterns
```
✅ Good: '.*401.*|.*403.*|.*auth.*'
❌ Bad: '.*auth.*' (misses numeric codes)
```

### 4. Test Your Patterns
Create intentional failures to verify categories work:
```typescript
test('Test 401 categorization', async () => {
  // Force 401 error
  expect(response.status).toBe(401);
});
```

---

## Category Statistics

### In Allure Report, You'll See:
```
Categories Overview:
┌─────────────────────────┬───────┬────────┐
│ Category                │ Count │ %      │
├─────────────────────────┼───────┼────────┤
│ 4XX Client Errors       │   5   │ 50%    │
│ Authentication Issues   │   3   │ 30%    │
│ Validation Errors       │   1   │ 10%    │
│ Network Errors          │   1   │ 10%    │
└─────────────────────────┴───────┴────────┘
```

This helps you:
- **Prioritize fixes** (50% are client errors)
- **Identify patterns** (30% are auth issues)
- **Track improvements** over time

---

## Troubleshooting

### Category Not Showing
1. Check if pattern matches error message
2. Verify category is before catch-all category
3. Regenerate report: `npm run allure:generate`

### Wrong Category Assigned
1. Check category order (first match wins)
2. Make specific categories come before general ones
3. Test pattern with regex tester

### No Categories Showing
1. Ensure tests are failing (categories only show for failures)
2. Check `playwright.config.ts` has categories configured
3. Verify Allure reporter is enabled

---

## Summary

Allure categories provide powerful failure classification:
- ✅ **4XX/5XX categorization** for HTTP errors
- ✅ **Specific categories** for common issues (auth, timeouts, etc.)
- ✅ **Automatic classification** based on error messages
- ✅ **Visual grouping** in Allure report
- ✅ **Easy prioritization** of fixes

This makes debugging and issue tracking much more efficient!
