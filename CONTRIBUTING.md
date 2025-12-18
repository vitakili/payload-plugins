# Contributing to Payload Plugins

Thank you for your interest in contributing to this PayloadCMS plugins collection!

## 📋 Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Creating a New Plugin](#creating-a-new-plugin)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)

## 🚀 Development Setup

1. **Fork and Clone**

   ```bash
   git clone https://github.com/YOUR_USERNAME/payload-plugins.git
   cd payload-plugins
   ```

2. **Enable Corepack**

   ```bash
   corepack enable
   corepack prepare pnpm@9.4.0 --activate
   ```

3. **Install Dependencies**
   ```bash
   pnpm install
   ```

> **Note about lockfile**: If you change `package.json` (adding/updating/removing dependencies or scripts), run `pnpm install` locally and commit the updated `pnpm-lock.yaml` so CI (which uses `--frozen-lockfile`) can install dependencies successfully. Example:
>
> ```bash
> pnpm install
> git add pnpm-lock.yaml
> git commit -m "chore: update pnpm-lock.yaml"
> git push
> ```
>
> If CI still fails in the `Install dependencies` step, re-run the install locally and ensure `pnpm-lock.yaml` is included in your branch/PR.

4. **Build All Packages**
   ```bash
   pnpm build
   ```

## 📁 Project Structure

This is a **pnpm monorepo** with the following structure:

- `packages/` - Individual plugin packages
- `.github/workflows/` - CI/CD workflows
- Root config files - Shared configuration for all packages

## 🔌 Creating a New Plugin

### 1. Create Package Directory

```bash
mkdir -p packages/your-plugin-name
cd packages/your-plugin-name
```

### 2. Create package.json

```json
{
  "name": "@payloadcms-plugins/your-plugin-name",
  "version": "0.1.0",
  "description": "Brief description of your plugin",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist",
    "prepublishOnly": "pnpm build"
  },
  "keywords": ["payloadcms", "payload", "payload-plugin"],
  "author": "Your Name",
  "license": "Apache-2.0",
  "peerDependencies": {
    "payload": "^3.0.0"
  },
  "devDependencies": {
    "payload": "^3.0.0",
    "typescript": "^5.5.3"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

### 3. Create tsconfig.json

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noEmit": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 4. Create .eslintrc.cjs

```javascript
/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['../../.eslintrc.cjs'],
}
```

### 5. Create Source Files

**src/types.ts:**

```typescript
export interface YourPluginConfig {
  excludedCollections?: string[]
  excludedGlobals?: string[]
  // Add your plugin-specific options
}
```

**src/plugin.ts:**

```typescript
import type { Config } from 'payload'
import type { YourPluginConfig } from './types.js'

export const YourPlugin =
  (pluginConfig: YourPluginConfig = {}) =>
  (config: Config): Config => {
    // Your plugin logic here
    return config
  }

export default YourPlugin
```

**src/index.ts:**

```typescript
export { YourPlugin } from './plugin.js'
export type { YourPluginConfig } from './types.js'
export { default } from './plugin.js'
```

### 6. Create README.md

Include:

- Plugin description
- Installation instructions
- Usage examples
- Configuration options
- API documentation

### 7. Build and Test

```bash
# Install dependencies for the new package
pnpm install

# Build the package
pnpm --filter @payloadcms-plugins/your-plugin-name build

# Verify the build
ls packages/your-plugin-name/dist
```

## 📏 Coding Standards

### TypeScript

- Use TypeScript for all source code
- Export proper type definitions
- Use `type` imports where applicable
- Avoid `any` types (use `unknown` if necessary)

### Code Style

- Follow the Prettier configuration
- Use ESLint rules
- Run `pnpm format` before committing
- Run `pnpm lint` to check for issues

### Naming Conventions

- **Files**: kebab-case (`theme-management.ts`)
- **Types/Interfaces**: PascalCase (`ThemeConfigurationPluginConfig`)
- **Functions**: camelCase (`ensurePath`)
- **Constants**: SCREAMING_SNAKE_CASE (`DEFAULT_CONFIG`)

### Plugin Structure

Follow the standard pattern:

```typescript
import type { Config } from 'payload'

export const YourPlugin =
  (config: YourPluginConfig = {}) =>
  (payloadConfig: Config): Config => {
    // Validate config
    const mergedConfig = { ...defaultConfig, ...config }

    // Modify payload config
    // ...

    return payloadConfig
  }
```

## 🧪 Testing

While this repository doesn't have automated tests yet, please:

1. **Manual Testing**
   - Test your plugin in a real Payload project
   - Test with different configurations
   - Test edge cases

2. **Type Safety**
   - Ensure TypeScript compiles without errors
   - Export all necessary types
   - Document type parameters

3. **Build Verification**
   ```bash
   pnpm build
   # Check that dist/ contains expected files
   ```

## 📤 Submitting Changes

### Before Submitting

1. **Update Documentation**
   - Update plugin README
   - Update root README if adding a new plugin
   - Include usage examples

2. **Code Quality**

   ```bash
   pnpm lint
   pnpm format
   pnpm build
   ```

3. **Commit Messages**
   Follow conventional commits:
   - `feat: add new theme-management plugin`
   - `fix: resolve issue with color picker`
   - `docs: update README with examples`
   - `chore: update dependencies`

### Pull Request Process

1. **Create a Branch**

   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make Changes**
   - Write clear, focused commits
   - Follow coding standards
   - Update documentation

3. **Push and Create PR**

   ```bash
   git push origin feat/your-feature-name
   ```

   - Open a Pull Request on GitHub
   - Describe your changes clearly
   - Link related issues

4. **Review Process**
   - Address review comments
   - Update your branch if needed
   - Wait for approval

## 🎯 Plugin Development Best Practices

### Configuration

- Provide sensible defaults
- Make options optional where possible
- Validate configuration at runtime
- Document all options

### Payload Config Modification

- Use the `ensurePath` utility for nested object access
- Don't mutate the config unless necessary
- Return the modified config
- Respect excluded collections/globals

### Documentation

- Include clear examples
- Document all configuration options
- Explain use cases
- Provide TypeScript examples

### Versioning

- Follow [Semantic Versioning](https://semver.org/)
- Document breaking changes
- Update CHANGELOG if present

## 📚 Resources

- [PayloadCMS Documentation](https://payloadcms.com/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 💡 Need Help?

- Create an issue for bugs or feature requests
- Join the PayloadCMS Discord community
- Review existing plugins for examples

## 📄 License

By contributing, you agree that your contributions will be licensed under the Apache-2.0 License.

---

Thank you for contributing! 🙏
