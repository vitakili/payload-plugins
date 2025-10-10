# Theme Management Plugin for Payload CMS v3

A comprehensive theme management plugin for Payload CMS v3 that provides powerful theming capabilities with SSR support, preventing FOUC (Flash of Unstyled Content).

## 🎉 Version 0.2.1 - New Features!

- **✅ Live Theme Preview** - Real-time theme preview in admin panel at `/admin/theme-preview`
- **✅ Professional Color Picker** - Enhanced color picker with react-colorful library
- **✅ Streamlined Tokens** - Optimized to 24 essential color tokens
- **✅ Tabs Structure** - Plugin creates a "Nastavení vzhledu" (Appearance Settings) tab
- **✅ Extended Theme Support** - OKLCH color format with semantic tokens
- **✅ shadcn/ui Compatible** - Works with https://ui.shadcn.com/themes
- **✅ TweakCN Compatible** - Works with https://tweakcn.com/editor/theme
- **✅ Chart Colors** - 5 customizable colors for data visualization

## Features

- 🎨 **Multiple Theme Presets** - Cool, Brutal, Neon, Solar, and more
- 🖼️ **Live Theme Preview** - Real-time preview in admin panel (no configuration needed!)
- 🎨 **Extended Themes** - OKLCH-based themes with full shadcn/ui token support
- 🎨 **Custom Color Palette** - Full HSL color customization (24 semantic tokens)
- 🔤 **Typography Control** - Google Fonts integration for headings, body, and code
- 📐 **Border Radius Presets** - Sharp, Rounded, or Pill styles
- 🌓 **Dark Mode Support** - Built-in light/dark/system mode toggle
- 📊 **Chart Colors** - Data visualization color palette
- 🚀 **SSR Theme Injection** - Zero FOUC with server-side rendering
- ⚡ **Performance Optimized** - Critical CSS inlining, preload links
- 🎯 **Type Safe** - Full TypeScript support
- 🔧 **Highly Configurable** - Flexible plugin options

## Installation

```bash
pnpm add @kilivi/payloadcms-theme-management
# or
npm install @kilivi/payloadcms-theme-management
# or
yarn add @kilivi/payloadcms-theme-management
```

## Quick Start

### 1. Add Plugin to Payload Config

```typescript
import { buildConfig } from 'payload'
import { themeManagementPlugin } from '@kilivi/payloadcms-theme-management'

export default buildConfig({
  // ... other config
  
  globals: [
    {
      slug: 'site-settings',
      fields: [
        {
          name: 'siteName',
          type: 'text',
        },
        // Theme configuration will be injected here
      ],
    },
  ],
  
  plugins: [
    themeManagementPlugin({
      enabled: true,
      targetCollection: 'site-settings',
      defaultTheme: 'cool',
      includeColorModeToggle: true,
      enableLogging: true,
    }),
  ],
})
```

### 2. Add Server Theme Injection (Next.js)

**⚠️ IMPORTANT:** Import from `/server` entry point!

```tsx
// app/layout.tsx
import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const payload = await getPayload({ config: configPromise })
  
  const { docs } = await payload.find({
    collection: 'site-settings',
    limit: 1,
  })

  return (
    <html lang="en">
      <head>
        <ServerThemeInjector themeConfiguration={docs[0]?.themeConfiguration} />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### 3. Use Theme Variables in Your CSS

The plugin injects CSS custom properties you can use:

```css
.my-component {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  border-radius: var(--radius);
  font-family: var(--font-body);
}
```

Or with Tailwind CSS:

```tsx
<div className="bg-primary text-primary-foreground rounded-lg">
  Themed Content
</div>
```


## Plugin Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable/disable the plugin |
| `targetCollection` | `string` | `'site-settings'` | Global or collection slug to add theme field to |
| `themePresets` | `ThemePreset[]` | Built-in presets | Custom theme presets |
| `defaultTheme` | `string` | `'cool'` | Default theme preset name |
| `includeColorModeToggle` | `boolean` | `true` | Show light/dark mode toggle |
| `includeCustomCSS` | `boolean` | `true` | Allow custom CSS injection |
| `includeBrandIdentity` | `boolean` | `false` | Show brand identity fields |
| `enableAdvancedFeatures` | `boolean` | `true` | Enable advanced customization |
| `enableLogging` | `boolean` | `false` | Log plugin actions to console |

## Available Theme Presets

- **Cool** - Professional blue theme
- **Brutal** - High contrast, bold design
- **Neon** - Vibrant, energetic colors
- **Solar** - Warm, golden tones
- **Dealership** - Automotive-inspired
- **Real Estate** - Professional property theme (+ Gold, Neutral variants)

## Live Theme Preview

The plugin automatically adds a **Live Preview** page to your admin panel at `/admin/theme-preview`.

### Features:
- ✅ **Zero Configuration** - Works automatically when plugin is installed
- ✅ **Real-time Updates** - See changes instantly as you edit theme settings
- ✅ **Light/Dark Toggle** - Preview both modes side-by-side
- ✅ **Component Showcase** - View cards, buttons, inputs, badges, and more
- ✅ **Professional UI** - Clean, modern preview interface

### How to Access:
1. Install the plugin (see Quick Start above)
2. Navigate to `/admin/theme-preview` in your Payload admin panel
3. Open theme settings in another tab and see changes update live!

The preview automatically watches your `themeConfiguration` field and displays real-time updates without any additional setup.

## API Reference

### Main Entry Point

Import from `@kilivi/payloadcms-theme-management` for client-safe code:

```typescript
// Plugin
import { themeManagementPlugin } from '@kilivi/payloadcms-theme-management'

// Client Components
import { ThemeProvider } from '@kilivi/payloadcms-theme-management'

// Utilities
import { 
  generateThemeColorsCss,
  generateThemeCSS,
  getThemeStyles,
  resolveThemeConfiguration,
  fetchThemeConfiguration,
} from '@kilivi/payloadcms-theme-management'

// Types
import type {
  ThemePreset,
  ThemeDefaults,
  ThemeManagementPluginOptions,
} from '@kilivi/payloadcms-theme-management'
```

### Server Entry Point

⚠️ **Import from `/server` for server components only:**

```typescript
import {
  ServerThemeInjector,
  getThemeCriticalCSS,
  getThemeCSSPath,
  generateThemePreloadLinks,
} from '@kilivi/payloadcms-theme-management/server'
```

### Subpath Exports

```typescript
// Direct field imports
import { ThemeColorPickerField } from '@kilivi/payloadcms-theme-management/fields/ThemeColorPickerField'
import { ThemeTokenSelectField } from '@kilivi/payloadcms-theme-management/fields/ThemeTokenSelectField'

// Direct component imports
import { ThemePreview } from '@kilivi/payloadcms-theme-management/components/ThemePreview'
```

## Integration Examples

### With Tailwind CSS

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ... other color variables
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
    },
  },
}
```

### Fetching Theme Configuration

```typescript
import { fetchThemeConfiguration } from '@kilivi/payloadcms-theme-management'

// Simple usage
const theme = await fetchThemeConfiguration()

// With options
const theme = await fetchThemeConfiguration({
  collectionSlug: 'site-settings',
  depth: 2,
  locale: 'en',
})
```

### Custom Theme Preset

```typescript
import type { ThemePreset } from '@kilivi/payloadcms-theme-management'

const myTheme: ThemePreset = {
  name: 'my-custom-theme',
  label: 'My Custom Theme',
  colors: {
    primary: { h: 220, s: 70, l: 50 },
    secondary: { h: 180, s: 60, l: 45 },
    // ... other colors
  },
  borderRadius: 'rounded',
  typography: {
    heading: 'Poppins',
    body: 'Inter',
    code: 'Fira Code',
  },
}

// Use in plugin config
themeManagementPlugin({
  themePresets: [myTheme],
  defaultTheme: 'my-custom-theme',
})
```

## Migrating from Older Versions

See [MIGRATION_GUIDE.md](./docs/MIGRATION_GUIDE.md) for detailed migration instructions.

### Key Changes in v0.1.9+

- **Server components must import from `/server`**
- Added `server-only` package to prevent client bundling errors
- Removed `ServerThemeInjector` from main entry point

```diff
- import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management'
+ import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management/server'
```


## Testing

See [TEST_APP_GUIDE.md](./docs/TEST_APP_GUIDE.md) for instructions on creating a test application.

## Troubleshooting

### Type Conflicts: `Type 'SiteSetting' is not assignable to type 'SiteSetting'`

**Problem:** You see errors about incompatible types even though you're passing the correct data structure.

**Why This Happens:** Your app's generated `payload-types.ts` might have slightly different type definitions than the plugin's (e.g., different font options, field variations).

**Solution:** Update to v0.1.11+ which uses generic types instead of strict payload-types:

```bash
pnpm update @kilivi/payloadcms-theme-management@latest
```

The plugin now accepts any compatible theme configuration structure, regardless of your Payload version or type variations. See [TYPE_INDEPENDENCE_GUIDE.md](./docs/TYPE_INDEPENDENCE_GUIDE.md) for technical details.

### `Module not found: Can't resolve 'fs/promises'`

**Solution:** Make sure you're using v0.1.9+ and importing server components from `/server`:

```typescript
import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management/server'
```

Then clear your cache:
```bash
rm -rf .next node_modules/.cache
pnpm install
```

### Theme Not Applying

1. Verify `ServerThemeInjector` is in your `<head>` tag
2. Check that site settings exist with theme configuration
3. Inspect page source - should see `<style>` tag with CSS variables
4. Ensure Tailwind/CSS is configured to use the CSS variables

### TypeScript Errors

```bash
# Regenerate Payload types
pnpm payload generate:types

# Restart TypeScript server
# VS Code: Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

## Documentation

- [Type Independence Guide](./docs/TYPE_INDEPENDENCE_GUIDE.md) - Understanding type safety without coupling
- [Migration Guide](./docs/MIGRATION_GUIDE.md) - Upgrading from older versions
- [Test App Guide](./docs/TEST_APP_GUIDE.md) - Create a test application
- [Server/Client Separation](./docs/SERVER_CLIENT_SEPARATION.md) - Technical details
- [Build Setup](./docs/BUILD_SETUP.md) - Build configuration details

## Development

```bash
# Install dependencies
pnpm install

# Build the plugin
pnpm build

# Watch mode for development
pnpm dev

# Clean build artifacts
pnpm clean
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Troubleshooting

### Common Issues

**Error: "right-hand side of 'in' should be an object, got undefined"**

This is a known Payload CMS issue related to user preferences. See [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) for solutions.

**Quick Fix:** Go to `/admin/account` and click "Reset Preferences" at the bottom of the page.

## License

Apache-2.0

## Author

Created for Payload CMS v3 applications.

## Links

- [NPM Package](https://www.npmjs.com/package/@kilivi/payloadcms-theme-management)
- [GitHub Repository](https://github.com/vitakili/payload-plugins)
- [Payload CMS](https://payloadcms.com)

## Changelog

### v0.1.9 (Latest)
- ✅ **Fixed:** Server/client component separation
- ✅ **Added:** `server-only` package to prevent bundling errors
- ✅ **Changed:** `ServerThemeInjector` now exported from `/server` entry
- ✅ **Added:** Comprehensive documentation

### v0.1.7
- ✅ **Fixed:** ESM import resolution with `.js` extensions
- ✅ **Added:** SWC + TypeScript build pipeline

### v0.1.5
- Initial release with theme management features

