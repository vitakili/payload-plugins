# Testing the Theme Configuration Plugin

This guide will help you test the `theme-management` plugin locally.

## Option 1: Local Development with pnpm link

### 1. Build the Plugin

```bash
cd packages/theme-management
pnpm build
```

### 2. Link the Plugin Globally

```bash
# In the theme-management directory
pnpm link --global
```

### 3. Create a Test Payload Project

```bash
# Navigate to a different directory
cd ~/projects  # or wherever you want to create the test project

# Create a new Payload project
npx create-payload-app@latest my-payload-test
```

When prompted:
- Choose **Next.js** as the project template
- Choose **MongoDB** as the database
- Choose **Lexical** as the rich text editor

### 4. Link the Plugin in Your Test Project

```bash
cd my-payload-test
pnpm link --global @payloadcms-plugins/theme-management
```

### 5. Use the Plugin in Your Test Project

Edit `src/payload.config.ts`:

```typescript
import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { ThemeConfigurationPlugin } from '@payloadcms-plugins/theme-management'

export default buildConfig({
  // ... other config
  plugins: [
    ThemeConfigurationPlugin({
      enableThemeSwitcher: true,
      defaultTheme: 'auto',
    }),
  ],
  // ... rest of config
})
```

### 6. Run the Test Project

```bash
pnpm dev
```

Visit `http://localhost:3000/admin` and you should see the "Theme Configuration" global in the admin panel.

---

## Option 2: Using pnpm workspace (Recommended for Development)

### 1. Create a Test Project Inside the Monorepo

```bash
# From the root of payload-plugins
mkdir -p test-apps/payload-test
cd test-apps/payload-test
```

### 2. Initialize the Test Project

```bash
pnpm init
```

### 3. Update package.json

```json
{
  "name": "payload-test-app",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "generate:types": "payload generate:types"
  },
  "dependencies": {
    "@payloadcms-plugins/theme-management": "workspace:*",
    "@payloadcms/db-mongodb": "^3.58.0",
    "@payloadcms/next": "^3.58.0",
    "@payloadcms/richtext-lexical": "^3.58.0",
    "next": "^15.0.0",
    "payload": "^3.58.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "sharp": "^0.33.5"
  },
  "devDependencies": {
    "@types/node": "^20.14.9",
    "@types/react": "^18.3.12",
    "typescript": "^5.5.3"
  }
}
```

### 4. Update pnpm-workspace.yaml

Add the test-apps directory to the workspace:

```yaml
packages:
  - 'packages/*'
  - 'test-apps/*'
```

### 5. Install Dependencies

```bash
# From the root
pnpm install
```

---

## Option 3: Direct Path Import (Quick Test)

In any Payload project, you can directly import from the built plugin:

```typescript
// In your payload.config.ts
import { ThemeConfigurationPlugin } from '../path/to/payload-plugins/packages/theme-management/dist/index.js'
```

---

## Verifying the Plugin Works

### 1. Check the Admin Panel

After running your test project:

1. Navigate to `http://localhost:3000/admin`
2. Log in with your admin credentials
3. Look for **"Globals"** in the sidebar
4. You should see **"Theme Configuration"**
5. Click on it to see the fields:
   - Primary Color
   - Secondary Color
   - Font Family
   - Header Height

### 2. Test the Configuration

Try adding values:
- Primary Color: `#3B82F6`
- Secondary Color: `#10B981`
- Font Family: `Inter, sans-serif`
- Header Height: `80`

Save and verify that the values persist.

### 3. Access Configuration Programmatically

Create a simple API route to test accessing the config:

```typescript
// app/api/theme/route.ts
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET() {
  const payload = await getPayload({ config: configPromise })
  
  const themeConfig = await payload.findGlobal({
    slug: 'theme-management',
  })
  
  return Response.json(themeConfig)
}
```

Visit `http://localhost:3000/api/theme` to see the configuration JSON.

---

## Troubleshooting

### Plugin Not Found

If you get "Cannot find module" errors:

1. **Rebuild the plugin:**
   ```bash
   cd packages/theme-management
   pnpm build
   ```

2. **Re-link the plugin:**
   ```bash
   pnpm link --global
   ```

3. **In your test project:**
   ```bash
   pnpm link --global @payloadcms-plugins/theme-management
   ```

### TypeScript Errors

If you see TypeScript errors:

1. Ensure `payload` is installed in your test project
2. Run `pnpm install` to update dependencies
3. Restart your TypeScript server in VSCode

### Hot Reload Not Working

When developing the plugin:

1. Run `pnpm dev` in the plugin directory (watch mode)
2. Changes will automatically rebuild
3. Restart your test project to see changes

---

## Testing Custom Fields

If you add custom field components (like `ThemePreviewField`), the import path should be:

```typescript
// In plugin.ts
{
  name: 'preview',
  type: 'ui' as const,
  admin: {
    components: {
      Field: '@payloadcms-plugins/theme-management/components/ThemePreviewField'
    }
  }
}
```

**Important:** The path starts from the package name, not from `@/plugins/...`

For this to work:

1. Create the component file:
   ```bash
   mkdir -p packages/theme-management/src/components
   touch packages/theme-management/src/components/ThemePreviewField.tsx
   ```

2. Export it in package.json:
   ```json
   "exports": {
     ".": {
       "import": "./dist/index.js",
       "types": "./dist/index.d.ts"
     },
     "./components/*": {
       "import": "./dist/components/*.js",
       "types": "./dist/components/*.d.ts"
     }
   }
   ```

3. Build the plugin: `pnpm build`

---

## Best Practices for Testing

1. **Always rebuild** after making changes to the plugin
2. **Use workspace:*** for local development in monorepo
3. **Version lock** - ensure Payload versions match between plugin and test project
4. **Clear cache** - sometimes `rm -rf .next node_modules` helps
5. **Check console** - look for errors in both terminal and browser console

---

## Next Steps

Once testing is complete:

1. Add unit tests
2. Add integration tests
3. Test with different Payload versions
4. Test with different databases (MongoDB, PostgreSQL)
5. Document any breaking changes
