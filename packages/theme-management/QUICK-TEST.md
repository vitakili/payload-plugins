# Quick Testing Guide for Theme Configuration Plugin

## Immediate Next Steps for Testing

Since your plugin has many custom components with specific type requirements, here's how to test it:

### Option 1: Skip TypeScript Errors (Quick Test)

Add to your `tsconfig.json` in the plugin:

```json
{
  "compilerOptions": {
    "skipLibCheck": true,
    "noImplicitAny": false
  }
}
```

Then build with:
```bash
cd packages/theme-management
pnpm build --force
```

### Option 2: Comment Out Complex Components (Recommended)

Temporarily disable the problematic components to get a working base plugin:

1. Edit `src/plugin.ts` and simplify it to just the basic fields (remove custom field components)
2. Build the plugin
3. Test the basic functionality
4. Gradually add back complex components

### Option 3: Use pnpm link for Local Testing

```bash
# In the plugin directory
cd packages/theme-management

# Build (even with errors, it might produce usable output)
pnpm build 2>&1 | tee build.log

# Link globally
pnpm link --global

# In your Payload project
cd /path/to/your/payload-project
pnpm link --global @payloadcms-plugins/theme-management
```

### Quick Test Setup

Create a minimal test in your main project:

```typescript
// payload.config.ts
import { buildConfig } from 'payload'
import { ThemeConfigurationPlugin } from '@payloadcms-plugins/theme-management'

export default buildConfig({
  plugins: [
    ThemeConfigurationPlugin({
      // Basic config
    }),
  ],
  // ... rest of config
})
```

## Fixing Import Path Issues

Your current files use `@/` imports. For a plugin, you have two options:

### Option A: Keep @/ paths (requires tsconfig paths)

Update `package.json` exports:

```json
"exports": {
  ".": {
    "import": "./dist/index.js",
    "types": "./dist/index.d.ts"
  },
  "./components/*": "./dist/components/*",
  "./fields/*": "./dist/fields/*",
  "./utils/*": "./dist/utils/*",
  "./constants/*": "./dist/constants/*",
  "./providers/*": "./dist/providers/*"
}
```

### Option B: Use relative imports (simpler)

Replace all `@/` imports with relative paths:
- `@/payload-types` → `../payload-types`
- `@/providers/Theme/types` → `../providers/Theme/types`
- etc.

## Testing the Plugin - Step by Step

### 1. **Build Check**

```bash
cd packages/theme-management
pnpm build 2>&1 | tee build-errors.txt
```

Review `build-errors.txt` to see which files have issues.

### 2. **Create Dist Check**

```bash
ls -la dist/
# You should see .js and .d.ts files even with type errors
```

### 3. **Link Locally**

```bash
# In plugin dir
pnpm link --global

# Verify
pnpm list --global --depth=0 | grep theme-management
```

### 4. **Use in Test Project**

```bash
cd ~/your-test-project
pnpm link --global @payloadcms-plugins/theme-management

# Verify in package.json or node_modules
ls -la node_modules/@payloadcms-plugins/
```

### 5. **Check it Works**

```bash
pnpm dev
# Open http://localhost:3000/admin
# Look for "Theme Configuration" in Globals
```

## Common Issues & Solutions

### Issue: "Cannot find module"

**Solution:**
```bash
# Rebuild and relink
cd packages/theme-management
rm -rf dist
pnpm build
pnpm unlink --global
pnpm link --global
```

### Issue: TypeScript errors in your project

**Solution:**
Add to your project's `tsconfig.json`:
```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

### Issue: Changes not reflected

**Solution:**
```bash
# In plugin dir - use watch mode
pnpm dev

# In your project - restart dev server
# Ctrl+C, then pnpm dev
```

## Alternative: Use Direct Path Import

Instead of linking, directly import from the built plugin:

```typescript
import { ThemeConfigurationPlugin } from '../../payload-plugins/packages/theme-management/dist/index.js'
```

This avoids linking issues but requires rebuilding manually.

## Next Steps After Basic Testing

1. **Verify globals appear** in admin panel
2. **Test saving values** in the theme configuration
3. **Check API access** - create an endpoint to fetch theme config
4. **Add custom components** one by one
5. **Fix type issues** gradually

## Need Help?

The build errors are mainly type mismatches between:
- Your custom components expecting certain payload-types
- The generic types we created

**Solutions:**
1. Generate actual payload-types in a test project
2. Copy them to the plugin
3. Or make your components more generic

Would you like me to create a simplified version of the plugin that definitely works first?
