# 🎉 Payload Plugins Monorepo - Setup Complete!

Your PayloadCMS 3 plugin development repository has been successfully created and configured!

## 📁 Repository Structure

```
payload-plugins/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Continuous Integration workflow
│       └── publish.yml               # NPM publishing workflow
├── packages/
│   └── theme-management/          # Your first plugin!
│       ├── dist/                     # Built files (auto-generated)
│       ├── src/
│       │   ├── index.ts             # Main export file
│       │   ├── plugin.ts            # Plugin implementation
│       │   └── types.ts             # TypeScript type definitions
│       ├── package.json
│       ├── tsconfig.json
│       ├── .eslintrc.cjs
│       └── README.md
├── .eslintrc.cjs                     # Root ESLint config
├── .gitignore
├── .npmrc                            # pnpm configuration
├── .prettierrc.mjs                   # Prettier config
├── package.json                      # Root package.json
├── pnpm-lock.yaml                    # pnpm lockfile
├── pnpm-workspace.yaml               # Workspace configuration
├── README.md                         # Repository documentation
├── tsconfig.json                     # Root TypeScript config
└── turbo.json                        # Turbo build configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js: ^18.20.2 or >=20.9.0
- pnpm: 9.x

### Install Dependencies

```bash
# Enable Corepack (one-time setup)
corepack enable

# Activate the pinned pnpm version
corepack prepare pnpm@9.4.0 --activate

# Install all dependencies
pnpm install
```

### Build All Packages

```bash
pnpm build
```

### Build a Specific Package

```bash
pnpm --filter @payloadcms-plugins/theme-management build
```

### Development Mode (Watch)

```bash
# Watch all packages
pnpm dev

# Watch specific package
pnpm --filter @payloadcms-plugins/theme-management dev
```

## 📦 Theme Configuration Plugin

The theme-management plugin has been created with:

- ✅ Basic plugin structure following Payload v3 patterns
- ✅ TypeScript support with proper type definitions
- ✅ Global configuration for theme settings (colors, fonts, header height)
- ✅ Configurable options (excludedCollections, excludedGlobals, etc.)
- ✅ Built and ready to use
- ✅ Comprehensive README with usage instructions

### Using the Plugin

```typescript
import { ThemeConfigurationPlugin } from '@payloadcms-plugins/theme-management'
import { buildConfig } from 'payload'

export default buildConfig({
  plugins: [
    ThemeConfigurationPlugin({
      enableThemeSwitcher: true,
      defaultTheme: 'auto',
    }),
  ],
})
```

## 🛠️ Available Scripts

From the **root** directory:

- `pnpm install` - Install all dependencies
- `pnpm build` - Build all packages
- `pnpm dev` - Watch mode for all packages
- `pnpm clean` - Clean all build outputs
- `pnpm lint` - Lint all packages
- `pnpm format` - Format code with Prettier

## 📝 Adding More Plugins

To create a new plugin:

1. **Create a new package directory:**

   ```bash
   mkdir -p packages/your-plugin-name
   cd packages/your-plugin-name
   ```

2. **Initialize package.json:**

   ```json
   {
     "name": "@payloadcms-plugins/your-plugin-name",
     "version": "0.1.0",
     "type": "module",
     "main": "./dist/index.js",
     "types": "./dist/index.d.ts",
     "scripts": {
       "build": "tsc",
       "dev": "tsc --watch"
     },
     "peerDependencies": {
       "payload": "^3.0.0"
     }
   }
   ```

3. **Create src/ directory with plugin code:**
   - `src/index.ts` - Main exports
   - `src/plugin.ts` - Plugin implementation
   - `src/types.ts` - Type definitions

4. **Create tsconfig.json** (copy from theme-management)

5. **Build and test:**
   ```bash
   pnpm install
   pnpm --filter @payloadcms-plugins/your-plugin-name build
   ```

## 🔄 Publishing to NPM

The repository includes a GitHub Actions workflow for publishing packages to NPM:

1. Go to the "Actions" tab in your GitHub repository
2. Select "Publish Package to NPM"
3. Click "Run workflow"
4. Choose:
   - Package to publish (e.g., theme-management)
   - Version bump type (patch/minor/major)
5. Click "Run workflow"

**Requirements:**

- Add `NPM_TOKEN` secret to your GitHub repository
- Ensure you have the rights to publish to `@payloadcms-plugins` scope on npm

## 🧪 Continuous Integration

The CI workflow automatically:

- Runs on every push to main and PRs
- Installs dependencies
- Lints code
- Builds all packages
- Type-checks TypeScript

## 📚 References

This repository structure is inspired by:

- [shefing/payload-tools](https://github.com/shefing/payload-tools) - Similar PayloadCMS plugin monorepo with proven patterns for CSS handling
- [PayloadCMS Documentation](https://payloadcms.com/) - Official Payload docs
- [pnpm Workspaces](https://pnpm.io/workspaces) - Workspace documentation

### Important Notes

**CSS Import Handling in Client Components:**
To avoid `ERR_UNKNOWN_FILE_EXTENSION` errors when running `payload generate:importmap`, CSS files are dynamically imported only in browser environments:

```typescript
// Import CSS only in browser environment
// This prevents Node.js from trying to import CSS directly
if (typeof window !== 'undefined') {
  // @ts-expect-error - Dynamic import of CSS is not recognized by TypeScript
  import('./YourComponent.css').catch((err) => {
    console.warn('Failed to load CSS file:', err)
  })
}
```

This pattern is used throughout the theme-management plugin and is based on the proven approach from the payload-tools repository.

## 🤝 Contributing

1. Create a new branch for your feature
2. Make your changes
3. Ensure tests pass and code is linted
4. Submit a pull request

## 📄 License

Apache-2.0

---

**Happy Plugin Development! 🎉**

For questions or issues, please refer to the [PayloadCMS documentation](https://payloadcms.com/docs) or create an issue in this repository.
