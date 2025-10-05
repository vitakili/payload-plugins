# 🚀 Payload CMS Plugins Collection

This repository contains a set of powerful plugins designed to enhance your [Payload CMS](https://payloadcms.com/) v3 projects. Whether you're managing complex content structures or optimizing the authoring experience, these plugins will help streamline your workflow.

## 🔌 Available Plugins (Compatible with Payload 3.0)

1. **🎨 [Theme Configuration](./packages/theme-management)** - Manage theme settings and configurations for your Payload CMS project with a flexible and extensible theme configuration system.

## 🛠️ Development Notes

### Getting started (pnpm install)

This is a pnpm workspace/monorepo. Install dependencies from the repository root.

**Prerequisites:**
- Node: ^18.20.2 or >=20.9.0 (see package.json "engines")
- pnpm: 9.x (this repo pins pnpm in package.json "packageManager")

**Recommended: use Corepack to get the right pnpm version:**
- Enable Corepack once: `corepack enable`
- Activate the pinned pnpm version for this repo: `corepack prepare pnpm@9.4.0 --activate`

**Install all workspace dependencies (from the repo root):**
```bash
pnpm install
```

This will create/update a single `pnpm-lock.yaml` at the repository root.

**Build all packages:**
```bash
pnpm build
```

**Build a specific package:**
```bash
pnpm --filter @payloadcms-plugins/theme-management build
```

## 📦 Package Structure

Each plugin in the `packages/` directory is a standalone npm package that can be:
- Developed independently
- Published to npm
- Used in any Payload CMS v3 project

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

Apache-2.0 License