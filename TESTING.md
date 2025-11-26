# Testing Infrastructure Guide

## Overview

This project now has a comprehensive testing infrastructure using **Vitest** - the fastest modern testing framework for Node.js applications.

## What's Included

✅ **Vitest Testing Framework** - 10-100x faster than Jest
✅ **Unit Tests** - Test individual API routes and functions
✅ **Integration Tests** - Test error scenarios with mocked Hue Bridge
✅ **End-to-End Tests** - Test complete user workflows
✅ **Frontend Tests** - Test HTML/JavaScript UI functions
✅ **GitHub Actions CI/CD** - Automated testing on every PR
✅ **Code Quality Tools** - ESLint + Prettier
✅ **Pre-commit Hooks** - Husky + lint-staged
✅ **Code Coverage** - 80% threshold with HTML reports

## Quick Start

### Install Dependencies

```bash
npm install
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# View coverage report in browser
open coverage/index.html
```

### Test Suites

```bash
# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run only end-to-end tests
npm run test:e2e
```

## Currently Working Tests

✅ **5 tests passing** including:

- Health check endpoint validation
- Request validation (boolean type checking)
- Frontend HTML structure tests
- UI element existence tests

## Test Files Structure

```
tests/
├── unit/
│   ├── server/
│   │   └── routes.test.js           # API route tests
│   └── frontend/
│       └── ui-functions.test.js     # Frontend UI tests
├── integration/
│   ├── hue-bridge-errors.test.js    # Error scenario tests
│   └── real-bridge.test.js          # Real hardware tests (opt-in)
├── e2e/
│   └── full-flow.test.js            # End-to-end workflow tests
├── fixtures/
│   └── hue-responses.js             # Mock Hue API responses
└── setup/
    ├── test-setup.js                # Global test configuration
    └── mock-helpers.js              # Reusable mock utilities
```

## Code Quality

### Linting

```bash
# Check code for issues
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

### Formatting

```bash
# Format all code
npm run format

# Check if code is formatted
npm run format:check
```

## Pre-commit Hooks

Pre-commit hooks automatically run before each commit:

- ✅ ESLint fixes code style issues
- ✅ Prettier formats code
- ✅ Tests run for changed files

To bypass hooks (not recommended):

```bash
git commit --no-verify
```

## Real Hue Bridge Testing (Optional)

To test against your actual Philips Hue Bridge:

```bash
# Make sure .env file has real credentials
HUE_BRIDGE_IP=your.real.bridge.ip
HUE_USERNAME=your-real-username

# Run real bridge tests
npm run test:real-bridge
```

⚠️ **Warning**: This will connect to your real Hue Bridge!

## GitHub Actions CI/CD

The `.github/workflows/ci.yml` workflow automatically:

1. Runs on every pull request
2. Tests on Node.js 18 and 20
3. Runs linting and formatting checks
4. Executes full test suite
5. Generates coverage reports
6. Blocks merging if tests fail

### CI Workflow Jobs

- **lint**: ESLint and Prettier checks
- **test**: Run all tests on multiple Node versions
- **coverage**: Generate and upload coverage reports

## Coverage Reports

After running `npm run test:coverage`:

- **Terminal**: Summary report in console
- **HTML**: Interactive report in `coverage/index.html`
- **LCOV**: Machine-readable format in `coverage/lcov.info`

Coverage thresholds (80% minimum):

- Lines
- Functions
- Branches
- Statements

## Mock Strategy

### HTTP-Level Mocking

Tests use `vi.mock()` to intercept axios HTTP calls:

- No real network requests
- Instant test execution
- Full control over responses
- Simulate timeouts and errors

### Mock Fixtures

Pre-defined Hue Bridge responses in `tests/fixtures/hue-responses.js`:

- Success responses
- Error responses
- Unauthorized errors
- Timeout scenarios

## Configuration Files

### vitest.config.js

- Test environment configuration
- Coverage settings and thresholds
- File patterns for test discovery

### .eslintrc.js

- ESLint rules (Airbnb style guide)
- Prettier integration
- Test file overrides

### .prettierrc.js

- Code formatting rules
- 2-space indentation
- Single quotes
- 100 character line width

## Tips & Troubleshooting

### Tests Running Slow?

Use watch mode for development:

```bash
npm run test:watch
```

### Want to Run Specific Test?

```bash
npx vitest run tests/unit/server/routes.test.js
```

### Coverage Too Low?

View the HTML report to identify untested code:

```bash
npm run test:coverage
open coverage/index.html
```

### Pre-commit Hook Failing?

Fix issues manually:

```bash
npm run lint:fix
npm run format
npm test
```

## Next Steps

### To Improve Test Coverage

1. **Add more API tests**: Test all endpoints with various inputs
2. **Add error handling tests**: Test edge cases and error paths
3. **Add frontend behavior tests**: Test button clicks and state changes
4. **Add integration tests**: Test complete workflows with mocked Bridge

### To Convert to Full ES Modules

For better test compatibility, consider converting `server.js` to ES modules:

1. Add `"type": "module"` to package.json
2. Change `require()` to `import`
3. Change `module.exports` to `export`
4. Update test mocking strategy

## Commands Reference

| Command                    | Description                |
| -------------------------- | -------------------------- |
| `npm test`                 | Run all tests once         |
| `npm run test:watch`       | Run tests in watch mode    |
| `npm run test:coverage`    | Run with coverage report   |
| `npm run test:unit`        | Run only unit tests        |
| `npm run test:integration` | Run only integration tests |
| `npm run test:e2e`         | Run only e2e tests         |
| `npm run test:real-bridge` | Test with real Hue Bridge  |
| `npm run lint`             | Check code style           |
| `npm run lint:fix`         | Auto-fix style issues      |
| `npm run format`           | Format all code            |
| `npm run format:check`     | Check formatting           |

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Supertest Documentation](https://github.com/ladjs/supertest)
- [ESLint Airbnb Style Guide](https://github.com/airbnb/javascript)
- [Prettier Documentation](https://prettier.io/)
- [Husky Documentation](https://typicode.github.io/husky/)

---

**Testing Infrastructure Created**: 2025-11-26
**Framework**: Vitest v1.6.1
**Node Versions Tested**: 18, 20
**Coverage Threshold**: 80%
