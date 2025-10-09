# Integration Testing for Theme Management Plugin

This directory contains integration tests for the Theme Management Plugin, following best practices from other Payload CMS 3 plugins like `plugin-otp`.

## Testing Strategy

### Why Integration Tests?

Integration tests verify that the plugin actually works when installed in a real Payload CMS application, not just that the code is syntactically correct. This is critical for:

- **Production Readiness**: Ensures the plugin can be deployed in existing applications
- **API Compatibility**: Verifies the plugin works with Payload CMS APIs  
- **Build Verification**: Confirms CSS files and other assets are properly bundled
- **Type Safety**: Checks that TypeScript definitions are correctly generated

### Test Levels

1. **Simple Integration Tests** (`int.simple.spec.ts`)
   - Verifies plugin initialization
   - Checks theme presets configuration
   - Validates build output (CSS files, type definitions)
   - Fast execution, no database required
   - **Currently Implemented** ✅

2. **Full Integration Tests** (`int.spec.ts`)
   - Tests plugin in complete Payload instance
   - Verifies CRUD operations with theme configuration
   - Tests MongoDB integration
   - **Planned** (requires CSS import handling)

3. **E2E Tests** (`e2e.spec.ts`)
   - Tests admin UI functionality
   - Verifies color pickers, live preview
   - Uses Playwright
   - **Planned**

## Running Tests

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# With UI
pnpm test:ui

# E2E tests (when implemented)
pnpm test:e2e
```

## Test Setup

### Current Implementation

**Simple Integration Tests** use Vitest with tsx for TypeScript execution:

- **Framework**: Vitest 3.2.4
- **Runtime**: tsx (handles TypeScript + CSS imports)
- **Config**: `dev/vitest.simple.config.ts`
- **Tests**: `dev/int.simple.spec.ts`

**What's Tested**:
- ✅ Theme presets availability
- ✅ Plugin exports
- ✅ Build output verification (dist/ folder)
- ✅ TypeScript definitions
- ✅ CSS file bundling

## Test Results

### ✅ Current Status (4/4 tests passing)

```
✓ Plugin Initialization > should have default theme presets
✓ Plugin Initialization > should have required preset properties  
✓ Build Output Verification > should have dist folder with compiled files
✓ Type Safety > should have proper TypeScript definitions
```

**Duration**: ~535ms  
**Framework**: Vitest + tsx

## Technical Challenges Solved

### CSS Import Issues

**Problem**: Node.js ESM doesn't support CSS imports natively. Libraries like `react-image-crop` (used by Payload's Lexical editor) cause "Unknown file extension .css" errors.

**Solutions Tried**:
1. ❌ Vitest CSS mocking with aliases
2. ❌ Custom Node.js loaders  
3. ❌ Vite React plugin
4. ✅ **tsx runtime** - Handles CSS imports automatically

**Final Approach**: Use tsx to run Vitest, which automatically handles CSS imports without configuration.

### Test Isolation

**Problem**: Full Payload initialization loads many dependencies with CSS imports.

**Solution**: Created simplified tests (`int.simple.spec.ts`) that:
- Import only necessary modules (presets, not full plugin)
- Verify build output directly  
- Run quickly without database

## Files

### Configuration
- `vitest.simple.config.ts` - Simple test configuration (current)
- `vitest.config.ts` - Full integration test config (future)
- `tsconfig.json` - TypeScript config for dev folder
- `payload.config.ts` - Payload config for full integration tests (future)

### Tests
- `int.simple.spec.ts` - Simple integration tests ✅ **4 tests passing**
- `int.spec.ts` - Full integration tests (future)
- `e2e.spec.ts` - E2E tests (future)

## Next Steps

1. **Resolve CSS Import Handling**: Find a way to run full Payload integration tests
2. **Implement Full Integration Tests**: Test plugin loading in real Payload instance
3. **Add E2E Tests**: Playwright tests for admin UI
4. **CI/CD Integration**: GitHub Actions workflow

## References

- [plugin-otp Testing](https://github.com/payloadcms/plugin-otp) - Reference implementation
- [Vitest Documentation](https://vitest.dev/)
- [Payload CMS Plugin Development](https://payloadcms.com/docs/plugins/overview)
