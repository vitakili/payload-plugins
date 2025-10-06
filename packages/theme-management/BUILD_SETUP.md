# Package Build Setup - Complete Solution

## Summary

Successfully migrated from TypeScript-only compilation to **SWC + TypeScript** build pipeline, matching the pattern used by `shefing/payload-tools` repository.

## Key Changes Made

### 1. Build Pipeline Update
- **Before**: `tsc` only (slow, no ESM `.js` extension handling)
- **After**: `swc` (transpilation) + `tsc` (type declarations)

### 2. Source Code Updates
- Added `.js` extensions to **all relative imports** in source files
- Converted `@/` path aliases to relative paths with `.js` extensions
- This is the **TypeScript ESM standard** for Node.js compatibility

### 3. Configuration Files

#### package.json
```json
{
  "scripts": {
    "build": "pnpm run clean && pnpm run compile && pnpm run copyfiles",
    "compile": "swc src -d dist --config-file .swcrc && tsc",
    "clean": "rimraf dist tsconfig.tsbuildinfo",
    "copyfiles": "copyfiles -u 1 \"src/**/*.{html,css,scss,ttf,woff,woff2,eot,svg,jpg,png,json}\" dist/"
  },
  "devDependencies": {
    "@swc/cli": "^0.1.65",
    "@swc/core": "^1.6.3",
    "rimraf": "^5.0.5",
    "copyfiles": "^2.4.1"
  }
}
```

#### tsconfig.json
```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "emitDeclarationOnly": true,
    "module": "ES6",
    "moduleResolution": "Bundler"
  }
}
```

#### .swcrc
```json
{
  "jsc": {
    "parser": {
      "syntax": "typescript",
      "tsx": true
    },
    "transform": {
      "react": {
        "runtime": "automatic"
      }
    },
    "target": "es2020"
  },
  "module": {
    "type": "es6"
  }
}
```

### 4. Helper Scripts

Created `scripts/add-js-extensions.mjs` to automate:
- Adding `.js` extensions to relative imports
- Converting `@/` aliases to relative paths

## Why `.js` Extensions in TypeScript?

This is **NOT** a bug or weird practice—it's the **official TypeScript ESM recommendation**:

1. **Node.js ESM requires explicit file extensions**
   - `import { x } from './file'` ❌ (doesn't work)
   - `import { x } from './file.js'` ✅ (required)

2. **TypeScript with `moduleResolution: "Bundler"`** allows `.js` in imports
   - TypeScript understands you mean the `.ts` file
   - Preserves the `.js` extension in output

3. **SWC transpiles code**, keeping import paths as-is
   - Input: `from './file.js'`
   - Output: `from './file.js'` ✅

## How It Works

```
SOURCE (TypeScript with .js extensions)
  ↓
SWC (transpiles TS → JS, preserves imports)
  ↓
TypeScript (generates .d.ts files)
  ↓
Copyfiles (copies CSS/assets)
  ↓
DIST (Ready for publication)
```

## Benefits

✅ **Fast builds**: SWC is 20x faster than `tsc`
✅ **Proper ESM**: Works in Node.js without bundlers
✅ **Next.js compatible**: No import resolution errors
✅ **Type-safe**: Full TypeScript declarations
✅ **Industry standard**: Same pattern as major Payload plugins

## Preventing Future Issues

The error you saw:
```
Module not found: Can't resolve './components/ServerThemeInjector'
```

Was caused by missing `.js` extensions in compiled output. This is now **permanently fixed** because:

1. Source files have `.js` in imports
2. SWC preserves these extensions
3. Node.js ESM can resolve the modules

## Testing

```bash
# Build
pnpm run build

# Test import
node --input-type=module -e "import m from './packages/theme-management/dist/index.js'; console.log('✅ Works!', Object.keys(m))"
```

## References

- [TypeScript Handbook - ES Modules](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html)
- [shefing/payload-tools](https://github.com/shefing/payload-tools) - Reference implementation
- [Node.js ESM Specification](https://nodejs.org/api/esm.html#mandatory-file-extensions)
