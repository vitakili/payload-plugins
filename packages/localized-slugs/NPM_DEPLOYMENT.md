# NPM Deployment Checklist for @kilivi-dev/payloadcms-localized-slugs

## ✅ Completed

### Project Structure

- [x] Source code organized in `src/` directory
- [x] Compiled output in `dist/` directory
- [x] TypeScript declaration files generated (`*.d.ts`)
- [x] Source maps included (`*.js.map`, `*.d.ts.map`)

### Configuration Files

- [x] `package.json` - npm metadata with proper exports configuration
- [x] `tsconfig.json` - TypeScript compiler configuration
- [x] `.npmignore` - npm publish ignore rules
- [x] `.eslintrc.cjs` - Code linting rules
- [x] `jest.config.js` - Test runner configuration

### Documentation

- [x] `README.md` - Comprehensive plugin documentation
- [x] `CHANGELOG.md` - Version history
- [x] `LICENSE` - MIT license file

### CI/CD & Automation

- [x] `.github/workflows/publish.yml` - Automated npm publishing workflow

### Build & Testing

- [x] ✅ TypeScript compilation passes
- [x] ✅ ESM modules generated with proper exports
- [x] Build outputs verified in `dist/` directory

## 📦 Package Information

**Name:** `@kilivi-dev/payloadcms-localized-slugs`  
**Version:** `0.1.0`  
**Type:** ESM Module  
**License:** MIT

### Exports Configuration

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./fields/*": "./dist/fields/*.js",
    "./hooks/*": "./dist/hooks/*.js",
    "./utils/*": "./dist/utils/*.js"
  }
}
```

## 🚀 Publishing Steps

### Step 1: Configure NPM Credentials

```bash
npm login
# or
npm config set //registry.npmjs.org/:_authToken="your_npm_token"
```

### Step 2: Tag Release (from root)

```bash
git tag @kilivi-dev/payloadcms-localized-slugs@0.1.0
git push origin @kilivi-dev/payloadcms-localized-slugs@0.1.0
```

### Step 3: Manual Publish (Optional)

```bash
cd packages/localized-slugs
pnpm publish
```

### Step 4: GitHub Actions (Recommended)

1. Set `NPM_TOKEN` secret in GitHub Actions settings
2. Push the tag above
3. GitHub workflow will automatically build and publish

## 📝 NPM Package Files

The following files will be published to npm (controlled by `.npmignore`):

- ✅ `dist/` - Compiled JavaScript and type definitions
- ✅ `README.md` - Package documentation
- ✅ `LICENSE` - MIT license
- ✅ `package.json` - Package metadata

**Excluded from npm:**

- `src/`, `tests/` - Source code
- Configuration files (`.eslintrc.cjs`, `jest.config.js`, `tsconfig.json`)
- Development files

## 🔍 Verification Checklist

Before publishing to npm:

- [ ] Run `pnpm test` - All tests pass
- [ ] Run `pnpm lint` - No linting errors
- [ ] Run `pnpm build` - Build succeeds
- [ ] Verify `dist/` directory exists with compiled files
- [ ] Update version in `package.json` if needed
- [ ] Update `CHANGELOG.md` with new features/fixes
- [ ] Test in consuming application:
  ```bash
  npm install @kilivi-dev/payloadcms-localized-slugs@0.1.0
  ```

## 🎯 Quick Integration Test

After publishing, test locally:

```typescript
import { localizedSlugsPlugin } from '@kilivi-dev/payloadcms-localized-slugs'

export default buildConfig({
  plugins: [
    localizedSlugsPlugin({
      locales: ['cs', 'en'],
      collections: [
        {
          collection: 'posts',
          generateFromTitle: true,
        },
      ],
    }),
  ],
})
```

## 📊 Comparison with theme-management

| Aspect           | localized-slugs | theme-management       |
| ---------------- | --------------- | ---------------------- |
| **Build Tool**   | TypeScript      | SWC + TypeScript       |
| **Output**       | ESM             | ESM                    |
| **Exports**      | Basic subpaths  | Comprehensive subpaths |
| **Dependencies** | Payload only    | Payload + React        |
| **Type Safety**  | ✅ Full         | ✅ Full                |
| **Tests**        | Jest ready      | Jest + Vitest          |

## 🔧 Maintenance

### Updating for New Features

1. Add feature to source in `src/`
2. Update types in `src/index.ts`
3. Export from root if needed
4. Test locally
5. Build: `pnpm build`
6. Update `CHANGELOG.md`
7. Bump version in `package.json`
8. Create git tag
9. Push to trigger GitHub Actions

### Common Commands

```bash
# Development
pnpm dev                    # Watch mode TypeScript compilation
pnpm lint                  # Run ESLint
pnpm lint:fix             # Auto-fix linting issues

# Testing & Building
pnpm test                 # Run Jest tests
pnpm build                # Full build (clean + compile + types)
pnpm clean                # Remove dist/ and build artifacts

# Publishing
pnpm publish              # Publish to npm (from package dir)
```

## 📚 Resources

- [Payload CMS Plugin Documentation](https://payloadcms.com)
- [npm Package JSON Guide](https://docs.npmjs.com/cli/v8/configuring-npm/package-json)
- [ESM in npm Packages](https://nodejs.org/en/docs/guides/ecmascript-modules/)

## 🎉 Next Steps

1. ✅ **Verify Build** - `pnpm build` ✓
2. ⏭️ **Run Tests** - `pnpm test`
3. ⏭️ **Setup npm Login** - `npm login`
4. ⏭️ **Create Git Tag** - `git tag @kilivi-dev/payloadcms-localized-slugs@0.1.0`
5. ⏭️ **Push Tag** - GitHub Actions will auto-publish

---

**Last Updated:** October 23, 2024  
**Status:** Ready for npm Publication ✅
