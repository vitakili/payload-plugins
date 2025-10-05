# Theme Configuration Plugin for Payload CMS

A flexible theme configuration plugin for Payload CMS v3 that allows you to manage theme settings through the admin UI.

## Features

- 🎨 **Theme Management** - Configure primary and secondary colors
- 🔤 **Typography Control** - Set custom font families
- 📐 **Layout Settings** - Adjust header height and other layout properties
- 🌓 **Theme Switcher** - Optional theme switching capability (light/dark/auto)
- ⚙️ **Configurable** - Exclude specific collections or globals as needed

## Installation

```bash
npm install @payloadcms-plugins/theme-management
# or
yarn add @payloadcms-plugins/theme-management
# or
pnpm add @payloadcms-plugins/theme-management
```

## Usage

Add the plugin to your Payload config:

```typescript
import { buildConfig } from 'payload';
import { ThemeConfigurationPlugin } from '@payloadcms-plugins/theme-management';

export default buildConfig({
  // ... other config
  plugins: [
    ThemeConfigurationPlugin({
      enableThemeSwitcher: true,
      defaultTheme: 'auto',
      excludedCollections: [], // Collections to exclude
      excludedGlobals: [], // Globals to exclude
    }),
  ],
});
```

## Configuration Options

### `ThemeConfigurationPluginConfig`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `excludedCollections` | `string[]` | `[]` | Array of collection slugs to exclude |
| `excludedGlobals` | `string[]` | `[]` | Array of global slugs to exclude |
| `enableThemeSwitcher` | `boolean` | `true` | Enable theme switcher in admin UI |
| `defaultTheme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Default theme |

## Theme Configuration Fields

The plugin adds a global called `theme-management` with the following fields:

- **Primary Color** - Main theme color (e.g., #3B82F6)
- **Secondary Color** - Secondary theme color (e.g., #10B981)
- **Font Family** - Primary font family for the site
- **Header Height** - Height of the site header in pixels

## Accessing Theme Configuration

You can access the theme configuration in your application:

```typescript
const payload = await getPayloadClient();

const themeConfig = await payload.findGlobal({
  slug: 'theme-management',
});

console.log(themeConfig.primaryColor); // e.g., "#3B82F6"
```

## Development

```bash
# Install dependencies
pnpm install

# Build the plugin
pnpm build

# Watch mode for development
pnpm dev
```

## License

Apache-2.0

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
