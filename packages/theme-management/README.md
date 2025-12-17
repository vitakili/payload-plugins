# Theme Management Plugin for Payload CMS v3

A comprehensive theme management plugin for Payload CMS v3 that provides powerful theming capabilities with SSR support, preventing FOUC (Flash of Unstyled Content).

## 🎉 Version 0.6.0 - New Features!

- **✅ Standalone Global Support** - Create separate appearance settings as a global
- **✅ Auto-Populate Light/Dark Colors** - Theme selection hook automatically fills color fields
- **✅ Multi-Tenant Ready** - Full support for multi-tenant applications
- **✅ Cleaner Data Structure** - Fixed nesting issues for better API integration
- **✅ Live Theme Preview** - Real-time theme preview in admin panel at `/admin/theme-preview`
- **✅ Professional Color Picker** - Enhanced color picker with react-colorful library
- **✅ shadcn/ui Compatible** - Works with https://ui.shadcn.com/themes
- **✅ TweakCN Compatible** - Works with https://tweakcn.com/editor/theme

## Features

- 🎨 **Multiple Theme Presets** - Cool, Brutal, Neon, Solar, and more
- 🎯 **Auto-Populate Colors** - Theme selection automatically sets Light/Dark mode colors
- 🌍 **Standalone Global** - Create separate appearance settings global (v0.6.0+)
- 🖼️ **Live Theme Preview** - Real-time preview in admin panel (no configuration needed!)
- 🎨 **Extended Themes** - OKLCH-based themes with full shadcn/ui token support
- 🎨 **Custom Color Palette** - Full HSL color customization (19 semantic tokens)
- 🔤 **Typography Control** - Google Fonts integration for headings, body, and code
- 📐 **Border Radius Presets** - Sharp, Rounded, or Pill styles
- 🌓 **Dark Mode Support** - Built-in light/dark/system mode toggle
- 📊 **Chart Colors** - Data visualization color palette
- 🚀 **SSR Theme Injection** - Zero FOUC with server-side rendering
- ⚡ **Performance Optimized** - Critical CSS inlining, preload links
- 🎯 **Type Safe** - Full TypeScript support
- 🔧 **Highly Configurable** - Flexible plugin options
- 👥 **Multi-Tenant Support** - Built-in multi-tenant capabilities

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

#### Option A: Add as Tab to Existing Collection (Default)

```typescript
import { themeManagementPlugin } from '@kilivi/payloadcms-theme-management'
import { buildConfig } from 'payload'

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
        // Theme configuration will be injected here as a tab
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

#### Option B: Create Standalone Global (Separate Settings)

```typescript
import { themeManagementPlugin } from '@kilivi/payloadcms-theme-management'
import { buildConfig } from 'payload'

export default buildConfig({
  // ... other config

  plugins: [
    themeManagementPlugin({
      enabled: true,
      useStandaloneCollection: true, // Creates a separate global
      standaloneCollectionSlug: 'appearance-settings', // Optional: custom slug
      standaloneCollectionLabel: 'Appearance Settings', // Optional: custom label
      defaultTheme: 'cool',
      includeColorModeToggle: true,
      enableLogging: true,
    }),
  ],
})
```

### 2. Add Server Theme Injection (Next.js)

**⚠️ IMPORTANT:** Import from `/server` entry point!

#### If Using Default (Tab in existing collection):

```tsx
// app/layout.tsx
import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'site-settings', // Your target collection
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

#### If Using Standalone Global:

```tsx
// app/layout.tsx
import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config: configPromise })

  // Fetch from standalone global
  const appearanceSettings = await payload.globals.findBySlug({
    slug: 'appearance-settings', // Your standalone global slug
  })

  return (
    <html lang="en">
      <head>
        <ServerThemeInjector themeConfiguration={appearanceSettings?.themeConfiguration} />
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
<div className="bg-primary text-primary-foreground rounded-lg">Themed Content</div>
```

## Plugin Configuration Options

| Option                      | Type                               | Default                 | Description                                                       |
| --------------------------- | ---------------------------------- | ----------------------- | ----------------------------------------------------------------- |
| `enabled`                   | `boolean`                          | `true`                  | Enable/disable the plugin                                         |
| `targetCollection`          | `string`                           | `'site-settings'`       | Collection slug to add theme field to (when not using standalone) |
| `useStandaloneCollection`   | `boolean`                          | `false`                 | Create a separate global instead of adding as a tab               |
| `standaloneCollectionSlug`  | `string`                           | `'appearance-settings'` | Slug for the standalone global                                    |
| `standaloneCollectionLabel` | `string \| Record<string, string>` | `'Appearance Settings'` | Label for the standalone global (supports i18n)                   |
| `themePresets`              | `ThemePreset[]`                    | Built-in presets        | Custom theme presets                                              |
| `defaultTheme`              | `string`                           | `'cool'`                | Default theme preset name                                         |
| `includeColorModeToggle`    | `boolean`                          | `true`                  | Show light/dark mode toggle                                       |
| `includeCustomCSS`          | `boolean`                          | `true`                  | Allow custom CSS injection                                        |
| `includeBrandIdentity`      | `boolean`                          | `false`                 | Show brand identity fields                                        |
| `enableAdvancedFeatures`    | `boolean`                          | `true`                  | Enable advanced customization                                     |
| `enableLogging`             | `boolean`                          | `false`                 | Log plugin actions to console                                     |

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
// Client Components

// Utilities
import {
  fetchThemeConfiguration,
  generateThemeColorsCss,
  generateThemeCSS,
  getThemeStyles,
  resolveThemeConfiguration,
  themeManagementPlugin,
  ThemeProvider,
} from '@kilivi/payloadcms-theme-management'
// Types
import type {
  ThemeDefaults,
  ThemeManagementPluginOptions,
  ThemePreset,
} from '@kilivi/payloadcms-theme-management'
```

### Server Entry Point

⚠️ **Import from `/server` for server components only:**

```typescript
import {
  getThemeCriticalCSS,
  getThemeCSS,
  ServerThemeInjector,
} from '@kilivi/payloadcms-theme-management/server'
```

> **Heads up:** Legacy helpers `getThemeCSSPath` and `generateThemePreloadLinks` are still exported for backwards compatibility but now return empty strings and emit console warnings. Prefer the inline CSS utilities above.

### Subpath Exports

```typescript
// Direct field imports

// Direct component imports
import { ThemePreview } from '@kilivi/payloadcms-theme-management/components/ThemePreview'
import { ThemeColorPickerField } from '@kilivi/payloadcms-theme-management/fields/ThemeColorPickerField'
import { ThemeTokenSelectField } from '@kilivi/payloadcms-theme-management/fields/ThemeTokenSelectField'
```

## Integration Examples

### With Tailwind CSS

#### tailwind.config.mjs

```typescript
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable import/no-anonymous-default-export */
import defaultTheme from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/collections/**/*.{ts,tsx}',
    './src/providers/**/*.{ts,tsx}',
    './src/heros/**/*.{ts,tsx}',
  ],
  safelist: [
    // Grid columns
    'col-span-4',
    'md:col-span-2',
    'lg:col-span-4',
    'lg:col-span-6',
    'lg:col-span-8',
    'lg:col-span-12',
    // Border colors
    'border-border',
    'border-error',
    'border-success',
    'border-warning',
    // Background colors
    'bg-card',
    'bg-error/30',
    'bg-success/30',
    'bg-warning/30',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: 'var(--layout-containerPadding)',
        md: 'var(--layout-containerPaddingTablet)',
        lg: 'var(--layout-containerPaddingDesktop)',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
    },
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        popover: 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        destructive: 'var(--destructive)',
        'destructive-foreground': 'var(--destructive-foreground)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        success: 'var(--success)',
        'success-foreground': 'var(--success-foreground)',
        warning: 'var(--warning)',
        'warning-foreground': 'var(--warning-foreground)',
        error: 'var(--error)',
        'error-foreground': 'var(--error-foreground)',
        info: 'var(--info)',
        'info-foreground': 'var(--info-foreground)',
      },
      borderRadius: {
        sm: 'var(--radius-small)',
        DEFAULT: 'var(--radius-default)',
        md: 'var(--radius-medium)',
        lg: 'var(--radius-large)',
      },
      fontFamily: {
        sans: ['var(--typography-fontFamily)', ...defaultTheme.fontFamily.sans],
        heading: ['var(--typography-headingFamily)', ...defaultTheme.fontFamily.sans],
        mono: ['var(--font-geist-mono)', ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        base: ['var(--typography-baseFontSize)', { lineHeight: 'var(--typography-lineHeight)' }],
      },
      letterSpacing: {
        tight: 'var(--typography-letterSpacing-tight)',
        normal: 'var(--typography-letterSpacing-normal)',
        wide: 'var(--typography-letterSpacing-wide)',
      },
      fontWeight: {
        normal: 'var(--typography-fontWeights-normal)',
        medium: 'var(--typography-fontWeights-medium)',
        semibold: 'var(--typography-fontWeights-semibold)',
        bold: 'var(--typography-fontWeights-bold)',
      },
      spacing: {
        section: {
          DEFAULT: 'var(--layout-sectionSpacing)',
          md: 'var(--layout-sectionSpacingTablet)',
          lg: 'var(--layout-sectionSpacingDesktop)',
        },
      },
      transitionProperty: {
        button: 'var(--components-button-transition)',
      },
      scale: {
        'button-hover': 'var(--components-button-hover-scale)',
      },
      opacity: {
        'button-hover': 'var(--components-button-hover-opacity)',
      },
      boxShadow: {
        card: 'var(--components-card-shadow)',
      },
      padding: {
        card: 'var(--components-card-padding)',
        button: 'var(--components-button-padding)',
        input: 'var(--components-input-padding)',
      },
      height: {
        input: 'var(--components-input-height)',
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.foreground'),
            '--tw-prose-headings': theme('colors.foreground'),
            '--tw-prose-lead': theme('colors.muted.foreground'),
            '--tw-prose-links': theme('colors.primary'),
            '--tw-prose-bold': theme('colors.foreground'),
            '--tw-prose-counters': theme('colors.foreground'),
            '--tw-prose-bullets': theme('colors.foreground'),
            '--tw-prose-hr': theme('colors.border'),
            '--tw-prose-quotes': theme('colors.foreground'),
            '--tw-prose-quote-borders': theme('colors.border'),
            '--tw-prose-captions': theme('colors.muted.foreground'),
            '--tw-prose-code': theme('colors.foreground'),
            '--tw-prose-pre-code': theme('colors.foreground'),
            '--tw-prose-pre-bg': theme('colors.muted'),
            '--tw-prose-th-borders': theme('colors.border'),
            '--tw-prose-td-borders': theme('colors.border'),
            h1: {
              fontWeight: 'var(--typography-fontWeights-bold)',
              marginBottom: '0.25em',
              fontFamily: theme('fontFamily.heading'),
              letterSpacing: 'var(--typography-letterSpacing-tight)',
            },
            h2: {
              fontFamily: theme('fontFamily.heading'),
              fontWeight: 'var(--typography-fontWeights-semibold)',
              letterSpacing: 'var(--typography-letterSpacing-tight)',
            },
            h3: {
              fontFamily: theme('fontFamily.heading'),
              fontWeight: 'var(--typography-fontWeights-semibold)',
              letterSpacing: 'var(--typography-letterSpacing-tight)',
            },
            h4: {
              fontFamily: theme('fontFamily.heading'),
              fontWeight: 'var(--typography-fontWeights-medium)',
              letterSpacing: 'var(--typography-letterSpacing-normal)',
            },
          },
        },
        base: {
          css: [
            {
              h1: { fontSize: '2.5rem' },
              h2: { fontSize: '1.25rem' },
            },
          ],
        },
        md: {
          css: [
            {
              h1: { fontSize: '3.5rem' },
              h2: { fontSize: '1.5rem' },
            },
          ],
        },
        invert: {
          css: {
            '--tw-prose-body': 'var(--foreground)',
            '--tw-prose-headings': 'var(--foreground)',
            '--tw-prose-lead': 'var(--muted-foreground)',
            '--tw-prose-links': 'var(--primary)',
            '--tw-prose-bold': 'var(--foreground)',
            '--tw-prose-counters': 'var(--foreground)',
            '--tw-prose-bullets': 'var(--foreground)',
            '--tw-prose-hr': 'var(--border)',
            '--tw-prose-quotes': 'var(--foreground)',
            '--tw-prose-quote-borders': 'var(--border)',
            '--tw-prose-captions': 'var(--muted-foreground)',
            '--tw-prose-code': 'var(--foreground)',
            '--tw-prose-pre-code': 'var(--foreground)',
            '--tw-prose-pre-bg': 'var(--muted)',
            '--tw-prose-th-borders': 'var(--border)',
            '--tw-prose-td-borders': 'var(--border)',
          },
        },
      }),
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
}
```

#### globals.css

```css
@import 'tailwindcss';

@config '../../../../../tailwind.config.mjs';

@layer base {
  /* Theme Configuration CSS Variables */
  :root {
    /* Font Scale Presets */
    --font-scale-small: 0.875;
    --font-scale-medium: 1;
    --font-scale-large: 1.125;
    --font-scale-xl: 1.25;

    /* Spacing Presets */
    --spacing-compact: 0.75;
    --spacing-comfortable: 1;
    --spacing-spacious: 1.25;
    --spacing-xl: 1.5;

    /* Animation Levels */
    --animation-none-duration: 0ms;
    --animation-reduced-duration: 100ms;
    --animation-normal-duration: 200ms;
    --animation-enhanced-duration: 300ms;

    /* Dynamic theme configuration (set by JS) */
    --theme-font-scale: var(--font-scale-medium);
    --theme-spacing: var(--spacing-comfortable);
    --theme-animation-level: normal;

    /* Apply spacing multiplier to layout */
    --layout-containerPadding-scaled: calc(
      var(--layout-containerPadding) * var(--theme-spacing, 1)
    );
    --layout-containerPaddingTablet-scaled: calc(
      var(--layout-containerPaddingTablet) * var(--theme-spacing, 1)
    );
    --layout-containerPaddingDesktop-scaled: calc(
      var(--layout-containerPaddingDesktop) * var(--theme-spacing, 1)
    );
    --layout-sectionSpacing-scaled: calc(var(--layout-sectionSpacing) * var(--theme-spacing, 1));
    --layout-sectionSpacingTablet-scaled: calc(
      var(--layout-sectionSpacingTablet) * var(--theme-spacing, 1)
    );
    --layout-sectionSpacingDesktop-scaled: calc(
      var(--layout-sectionSpacingDesktop) * var(--theme-spacing, 1)
    );
    --components-card-padding-scaled: calc(
      var(--components-card-padding) * var(--theme-spacing, 1)
    );
    --components-button-padding-scaled: var(--components-button-padding);
    --components-input-padding-scaled: var(--components-input-padding);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    @apply border-border;
  }

  html {
    -webkit-text-size-adjust: 100%;
    font-size: calc(var(--typography-baseFontSize, 16px) * var(--theme-font-scale, 1));
    line-height: var(--typography-lineHeight, 1.5);
    font-family: var(--typography-fontFamily, system-ui, sans-serif);
    visibility: hidden;
  }

  /* Animation level controls */
  [data-animation-level='none'] * {
    animation-duration: var(--animation-none-duration) !important;
    transition-duration: var(--animation-none-duration) !important;
  }

  [data-animation-level='reduced'] * {
    animation-duration: var(--animation-reduced-duration) !important;
    transition-duration: var(--animation-reduced-duration) !important;
  }

  [data-animation-level='normal'] * {
    animation-duration: var(--animation-normal-duration);
    transition-duration: var(--animation-normal-duration);
  }

  [data-animation-level='enhanced'] * {
    animation-duration: var(--animation-enhanced-duration);
    transition-duration: var(--animation-enhanced-duration);
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family: var(
      --typography-headingFamily,
      var(--typography-fontFamily, system-ui, sans-serif)
    );
    font-weight: var(--typography-fontWeights-bold, 700);
    line-height: 1.2;
  }

  /* Prevent flash of unstyled content except for Storybook */
  :root:not([data-theme]):not([data-theme-mode]):not(.sb-show-main) {
    visibility: hidden;
  }

  :root[data-theme][data-theme-mode],
  .sb-show-main {
    visibility: visible;
  }

  html:not(.sb-show-main) {
    opacity: 0;
  }

  html[data-theme-mode='dark'],
  html[data-theme-mode='light'],
  html.sb-show-main {
    opacity: 1;
    transition: opacity 0ms;
  }

  /* Force immediate opacity when JS is disabled */
  html:not([data-theme-mode]) {
    opacity: 1;
  }

  /* Media queries for responsive layout */
  @media (min-width: 640px) {
    :root {
      --layout-containerPadding: var(--layout-containerPaddingTablet, 2rem);
      --layout-sectionSpacing: var(--layout-sectionSpacingTablet, 3rem);
    }
  }

  @media (min-width: 1024px) {
    :root {
      --layout-containerPadding: var(--layout-containerPaddingDesktop, 2rem);
      --layout-sectionSpacing: var(--layout-sectionSpacingDesktop, 4rem);
    }
  }

  /* Ensure dark mode styles take precedence */
  html[data-theme-mode='dark'] {
    color-scheme: dark;
  }

  /* Native View Transitions API - React 19 */
  @view-transition {
    navigation: auto;
  }

  /* Smooth fade transition for page navigation */
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation-duration: 0.3s;
    animation-timing-function: ease-in-out;
  }

  ::view-transition-old(root) {
    animation-name: fade-out;
  }

  ::view-transition-new(root) {
    animation-name: fade-in;
  }

  @keyframes fade-out {
    to {
      opacity: 0;
    }
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
  }

  /* Respect user's reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    ::view-transition-old(root),
    ::view-transition-new(root) {
      animation-duration: 0.01ms !important;
    }
  }
}
```

### Fetching Theme Configuration

```typescript
import { fetchThemeConfiguration } from '@kilivi/payloadcms-theme-management'

// Default: fetch from 'site-settings' collection
const theme = await fetchThemeConfiguration()

// Fetch from standalone global
const theme = await fetchThemeConfiguration({
  collectionSlug: 'appearance-settings', // Your standalone global slug
  useGlobal: true, // Set to true when using standalone global
  depth: 2,
  locale: 'en',
})

// With multi-tenant support
const theme = await fetchThemeConfiguration({
  tenantSlug: 'tenant-123', // Optional: tenant identifier
  collectionSlug: 'appearance-settings',
  useGlobal: true,
  depth: 2,
})

// From collection (default behavior)
const theme = await fetchThemeConfiguration({
  collectionSlug: 'site-settings', // Collection slug
  useGlobal: false, // Use collection endpoint
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
