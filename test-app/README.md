# Payload Plugins Test Application

This is a dedicated test application for validating both Payload CMS plugins before npm publication.

## Purpose

This test suite ensures that:

- ✅ Both plugins build correctly
- ✅ All exports are configured properly
- ✅ Client components are marked with `'use client'`
- ✅ TypeScript definitions are generated
- ✅ No module resolution errors occur
- ✅ File extensions are correct (`.js` for components, `.js` for utilities)

## Quick Start

### Run comprehensive tests

```bash
# From project root
pnpm test

# Or from test-app directory
cd test-app
node tests/run-tests.js
```

### Run import verification tests

```bash
# From project root
pnpm test:imports

# Or from test-app directory
cd test-app
node tests/test-imports.js
```

## Test Structure

```
test-app/
├── tests/
│   ├── run-tests.js       # Comprehensive test suite (23 tests)
│   ├── test-imports.js    # Import verification tests
│   └── README.md          # Test documentation
├── package.json           # Test app dependencies
├── tsconfig.json          # TypeScript configuration
└── TEST_DOCUMENTATION.md  # Detailed test documentation
```

## What Gets Tested

### 1. Directory Structure (2 tests)

- Ensures both dist folders exist and are accessible

### 2. Entry Points (2 tests)

- Validates main `index.js` files exist for both plugins

### 3. Provider Components (3 tests)

- Checks providers directory and JSX files for localized-slugs

### 4. Client Component Directives (2 tests)

- Verifies `'use client'` directives are present in client components

### 5. Exports (4 tests)

- Confirms all required exports are available and functional

### 6. File Extensions (3 tests)

- Validates correct use of `.js` for components and `.js` for utilities

### 7. TypeScript Definitions (3 tests)

- Ensures `.d.ts` type definition files are generated

### 8. Package Configuration (4 tests)

- Verifies `package.json` exports field is correctly configured

## Test Results Interpretation

### ✅ ALL TESTS PASS

The plugins are ready to be published to npm and will work correctly in Next.js applications.

### ❌ SOME TESTS FAIL

Review the failing test(s) and check:

- Did you run `pnpm build` after making changes?
- Are the plugin source files correctly configured?
- Check `TEST_DOCUMENTATION.md` for detailed guidance

## Before Publishing to npm

1. **Run tests**

   ```bash
   pnpm test
   ```

2. **Verify all tests pass**
   - Should see "Passed: 23, Failed: 0"

3. **Build the plugins**

   ```bash
   pnpm build
   ```

4. **Run tests again**

   ```bash
   pnpm test
   ```

5. **Publish when ready**
   ```bash
   cd packages/localized-slugs && npm publish
   cd packages/theme-management && npm publish
   ```

## Troubleshooting

### Test fails with "Cannot find module"

- Run `pnpm build` to ensure plugins are compiled
- Check that paths in test files are correct

### Test fails with "use client not found"

- Check that JSX files contain `'use client'` directive
- Ensure `.tsx` files are compiling to `.js` format

### Import tests fail with "Unknown file extension .js"

- This is expected in Node.js - it's not a problem for Next.js
- Next.js handles `.js` files correctly
- File existence checks should pass

## Integration with CI/CD

Add to GitHub Actions or similar CI/CD pipeline:

```yaml
- name: Run Plugin Tests
  run: pnpm test

- name: Build Plugins
  run: pnpm build

- name: Verify Tests Still Pass
  run: pnpm test
```

## Adding New Tests

To add new tests:

1. Create a new test file in `tests/`
2. Add test logic using Node.js `fs` module
3. Run the test manually to verify it works
4. Document the test in `TEST_DOCUMENTATION.md`

Example:

```javascript
const fs = require('node:fs')
const path = require('node:path')

// Test logic here
logTest('Test name', condition, 'Optional message')
```

## Support

For questions about the test suite, refer to:

- `TEST_DOCUMENTATION.md` - Detailed documentation
- `tests/run-tests.js` - Main test implementation
- `tests/test-imports.js` - Import verification implementation
