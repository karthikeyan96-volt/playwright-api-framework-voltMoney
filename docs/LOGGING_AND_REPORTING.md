# Logging and Reporting Guide

This document explains how to use log4js for logging and Allure for reporting in the Playwright API Automation Framework.

## 📝 Logging with log4js

### Overview
The framework uses **log4js** for comprehensive logging with:
- Console output for real-time monitoring
- File-based logging with automatic daily rotation
- Separate log files per pod (LOS, LMS)
- Error-only log file for quick debugging

### Log Files Location
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
- **DEBUG**: Detailed information for debugging (request/response bodies)
- **INFO**: General information (request URLs, status codes)
- **WARN**: Warning messages
- **ERROR**: Error messages with full context

### Using Logger in Code

```typescript
import { Logger } from '../utils/logger';

// Create logger instance
const logger = new Logger('los'); // or 'lms', 'test'

// Log messages
logger.debug('Request body:', requestData);
logger.info('GET https://api.example.com/users');
logger.warn('Rate limit approaching');
logger.error('Request failed:', error);
```

### Configuration
Log configuration is in `config/log4js.config.ts`. You can:
- Change log levels per category
- Add new appenders (email, database, etc.)
- Modify log file patterns
- Adjust log rotation settings

## 📊 Reporting with Allure

### Overview
The framework uses **Allure** for rich, interactive test reports with:
- Beautiful UI with graphs and charts
- Test execution timeline
- Request/response attachments
- Curl commands for reproduction
- Historical trends
- Test categorization

### Running Tests with Allure

```bash
# Run tests (generates allure-results)
npm test

# Generate and open Allure report
npm run allure:generate
npm run allure:open

# Or do both in one command
npm run test:allure

# Serve report without generating (useful for CI)
npm run allure:serve
```

### Allure Report Features

#### 1. Automatic Attachments
Every API request automatically attaches:
- **Request details**: Method, URL, headers, body
- **Response details**: Status, headers, body
- **Curl command**: Copy-paste to reproduce the request

#### 2. Test Metadata
Add metadata to your tests:

```typescript
import { setFeature, setStory, setSeverity } from '../../utils/allureHelper';

test('My API Test', async () => {
  // Add metadata
  setFeature('Authentication');
  setStory('Login Flow');
  setSeverity('critical'); // blocker, critical, normal, minor, trivial
  
  // Your test code...
});
```

#### 3. Custom Steps
Break down tests into logical steps:

```typescript
import { step } from '../../utils/allureHelper';

test('Multi-step test', async () => {
  await step('Step 1: Request OTP', async () => {
    // Step 1 code...
  });
  
  await step('Step 2: Verify OTP', async () => {
    // Step 2 code...
  });
});
```

#### 4. Links and Tags
Add links to issues, test cases, or documentation:

```typescript
import { addIssueLink, addTestCaseLink, addLink, addTag } from '../../utils/allureHelper';

test('Test with links', async () => {
  addIssueLink('JIRA-123', 'https://jira.example.com/JIRA-123');
  addTestCaseLink('TC-456', 'https://testmanagement.example.com/TC-456');
  addLink('API Docs', 'https://api.example.com/docs');
  addTag('smoke');
  addTag('regression');
  
  // Your test code...
});
```

#### 5. Custom Attachments
Attach custom data to reports:

```typescript
import { allure } from 'allure-playwright';

test('Test with custom attachment', async () => {
  // Attach text
  allure.attachment('Custom Data', 'Some important data', 'text/plain');
  
  // Attach JSON
  allure.attachment('Config', JSON.stringify(config, null, 2), 'application/json');
  
  // Attach file
  allure.attachment('Screenshot', fs.readFileSync('screenshot.png'), 'image/png');
});
```

### Report Categories
The framework automatically categorizes failures:
- **Authentication Issues**: Failures related to auth, tokens, login
- **API Errors**: Failures related to status codes, responses
- **Validation Errors**: Failures related to assertions

### Viewing Reports

#### Local Development
```bash
npm run allure:open
```
Opens the report in your default browser at `http://localhost:port`

#### CI/CD Integration
```bash
# Generate report
npm run allure:generate

# Report is in allure-report/ directory
# Serve it using any web server or CI artifact storage
```

### Report Structure
```
Allure Report
├── Overview
│   ├── Total tests
│   ├── Pass/Fail rate
│   ├── Execution time
│   └── Trends graph
├── Categories
│   ├── Authentication Issues
│   ├── API Errors
│   └── Validation Errors
├── Suites
│   ├── LOS Tests
│   ├── LMS Tests
│   └── Property Tests
├── Graphs
│   ├── Status chart
│   ├── Severity chart
│   ├── Duration chart
│   └── Timeline
└── Behaviors
    ├── Features
    └── Stories
```

## 🎯 Best Practices

### Logging
1. Use appropriate log levels:
   - DEBUG for detailed request/response data
   - INFO for general flow information
   - WARN for potential issues
   - ERROR for failures

2. Include context in log messages:
   ```typescript
   // ❌ Bad
   logger.error('Request failed');
   
   // ✅ Good
   logger.error(`Request failed: ${method} ${url}`, { status, body });
   ```

3. Don't log sensitive data:
   ```typescript
   // ❌ Bad
   logger.info('Password:', password);
   
   // ✅ Good
   logger.info('Authentication attempt for user:', userId);
   ```

### Allure Reporting
1. Always add metadata to tests:
   ```typescript
   setFeature('Feature Name');
   setStory('User Story');
   setSeverity('critical');
   ```

2. Use steps for complex tests:
   ```typescript
   await step('Setup', async () => { /* ... */ });
   await step('Execute', async () => { /* ... */ });
   await step('Verify', async () => { /* ... */ });
   ```

3. Add links for traceability:
   ```typescript
   addIssueLink('JIRA-123');
   addTestCaseLink('TC-456');
   ```

4. Use descriptive test names:
   ```typescript
   // ❌ Bad
   test('Test 1', async () => { /* ... */ });
   
   // ✅ Good
   test('Should return 200 when requesting OTP with valid phone number', async () => { /* ... */ });
   ```

## 🔧 Troubleshooting

### Logs not appearing
- Check log level configuration in `config/log4js.config.ts`
- Ensure `logs/` directory has write permissions
- Verify logger category matches configuration

### Allure report not generating
- Ensure tests ran successfully: `npm test`
- Check `allure-results/` directory exists
- Install Allure CLI: `npm install -g allure-commandline`
- Try: `allure serve allure-results`

### Attachments not showing
- Verify `allure-playwright` is configured in `playwright.config.ts`
- Check that helper functions are imported correctly
- Ensure `makeRequest()` is being called (attachments happen there)

## 📚 Additional Resources

- [log4js Documentation](https://log4js-node.github.io/log4js-node/)
- [Allure Documentation](https://docs.qameta.io/allure/)
- [Allure Playwright Integration](https://www.npmjs.com/package/allure-playwright)
