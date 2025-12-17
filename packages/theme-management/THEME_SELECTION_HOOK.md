# Theme Selection Hook - Auto-Population of Light/Dark Mode Colors

## Overview

When using the standalone global feature, the plugin automatically populates Light Mode and Dark Mode colors based on the selected theme preset. This eliminates the need to manually configure colors for each mode.

## How It Works

### Flow

1. **Theme Selection**: User selects a theme from "🎨 Theme Selection" dropdown
2. **Auto-Population**: `beforeChange` hook detects the change
3. **Color Copying**: Light Mode and Dark Mode color fields are automatically populated from the selected preset
4. **Manual Override**: User can still edit colors individually after population

### Structure

```
Appearance Settings Global
├── 🎨 Theme Selection  (user selects "Cool", "Brutal", etc.)
├── 📐 Border Radius
├── 📏 Spacing Scale
└── 🌗 Color Mode Settings
    ├── Default Color Mode
    ├── Enable Mode Toggle
    ├── ☀️ Light Mode Colors (auto-populated)
    │   └── [19 color tokens]
    └── 🌙 Dark Mode Colors (auto-populated)
        └── [19 color tokens]
```

## Color Tokens

The following 19 tokens are auto-populated when theme is selected:

- `background` - Main background
- `foreground` - Main text
- `primary` - Primary brand color
- `primaryForeground` - Text on primary
- `card` - Card background
- `cardForeground` - Text on card
- `popover` - Popover background
- `popoverForeground` - Text on popover
- `secondary` - Secondary elements
- `secondaryForeground` - Text on secondary
- `muted` - Muted background
- `mutedForeground` - Muted text
- `accent` - Accent color
- `accentForeground` - Text on accent
- `destructive` - Destructive action color
- `destructiveForeground` - Text on destructive
- `border` - Border color
- `input` - Input field color
- `ring` - Focus ring color

## Available Presets

Each preset includes both light and dark mode color configurations:

### Cool & Professional

- **Light Mode**: Light backgrounds with blue accents
- **Dark Mode**: Dark backgrounds with light blue accents

### Brutal

- **Light Mode**: High contrast black and white
- **Dark Mode**: High contrast white and black

### Neon

- **Light Mode**: Vibrant neon colors
- **Dark Mode**: Dark neon accents

### Solar

- **Light Mode**: Warm golden tones
- **Dark Mode**: Deep warm tones

And more...

## Implementation Details

### beforeChange Hook

The plugin adds a `beforeChange` hook to the standalone global:

```typescript
beforeChangeHook: async (args) => {
  const { data } = args

  if (data?.themeConfiguration?.theme) {
    const themeName = data.themeConfiguration.theme
    const selectedPreset = themePresets.find((p) => p.name === themeName)

    if (selectedPreset) {
      // Initialize if empty
      if (!data.themeConfiguration.lightMode) {
        data.themeConfiguration.lightMode = {}
      }
      if (!data.themeConfiguration.darkMode) {
        data.themeConfiguration.darkMode = {}
      }

      // Only populate if not manually edited
      const isLightModeEmpty = !data.themeConfiguration.lightMode?.background
      const isDarkModeEmpty = !data.themeConfiguration.darkMode?.background

      if (isLightModeEmpty && selectedPreset.lightMode) {
        data.themeConfiguration.lightMode = { ...selectedPreset.lightMode }
      }

      if (isDarkModeEmpty && selectedPreset.darkMode) {
        data.themeConfiguration.darkMode = { ...selectedPreset.darkMode }
      }
    }
  }

  return data
}
```

### Smart Population Logic

The hook uses intelligent population:

- **First Save**: When theme is selected for the first time, colors are automatically populated
- **Subsequent Changes**: If colors have been manually edited, they are preserved
- **Detection**: Empty `background` field indicates colors haven't been edited

## Usage

### Admin UI Flow

1. Navigate to **Settings → Appearance Settings** (or your custom label)
2. Select a theme from **🎨 Theme Selection**
3. Click **Save**
4. Light Mode and Dark Mode colors are automatically populated
5. (Optional) Edit individual colors if desired
6. Click **Save** again

### Configuration

The plugin automatically handles this when configured with:

```typescript
themeManagementPlugin({
  useStandaloneCollection: true,
  standaloneCollectionSlug: 'appearance-settings',
  // ... other options
})
```

## Data Structure

### Without Manual Editing

```json
{
  "id": 1,
  "themeConfiguration": {
    "theme": "cool",
    "borderRadius": "medium",
    "spacing": "medium",
    "colorMode": "auto",
    "allowColorModeToggle": true,
    "lightMode": {
      "background": "#ffffff",
      "foreground": "#0a0a0a",
      "primary": "#3b82f6",
      "primaryForeground": "#ffffff"
      // ... other 16 tokens
    },
    "darkMode": {
      "background": "#0a0a0a",
      "foreground": "#fafafa",
      "primary": "#60a5fa",
      "primaryForeground": "#0a0a0a"
      // ... other 16 tokens
    }
  }
}
```

### After Manual Editing

```json
{
  "id": 1,
  "themeConfiguration": {
    "theme": "cool",
    "lightMode": {
      "background": "#f5f5f5", // User changed from #ffffff
      "foreground": "#0a0a0a",
      "primary": "#3b82f6"
      // ... rest auto-populated
    },
    "darkMode": {
      "background": "#0a0a0a",
      "foreground": "#fafafa"
      // ... auto-populated
    }
  }
}
```

## Best Practices

### 1. Use Presets as Starting Point

Always select a theme first to get consistent color palettes. Then customize if needed.

### 2. Test Both Modes

After changing theme:

- Switch to Light Mode and verify colors
- Switch to Dark Mode and verify colors

### 3. Maintain Contrast

If editing colors manually, ensure sufficient contrast between text and background:

- **Light Mode**: Dark text on light background
- **Dark Mode**: Light text on dark background

### 4. Batch Updates

If changing multiple theme settings:

1. Select theme
2. Adjust border radius
3. Adjust spacing
4. Then edit colors if needed
5. Save once

## Troubleshooting

### Colors Not Populating

**Issue**: Selected theme but colors not filled in

**Solutions**:

1. Make sure Light Mode and Dark Mode sections are visible
2. Try a different theme to verify the hook is working
3. Check browser console for any errors
4. Clear browser cache and refresh

### Colors Changed Unexpectedly

**Issue**: Colors changed when I didn't touch them

**Possible Cause**: Another admin user changed the theme

**Solution**: If colors are already populated (background field not empty), they won't change on subsequent theme selections.

### Want to Reset to Preset

**Solution**:

1. Manually clear one color field (e.g., background)
2. Change theme to desired theme
3. Save - colors will repopulate

## API Integration

When fetching theme configuration:

```typescript
const theme = await fetchThemeConfiguration({
  useGlobal: true,
  collectionSlug: 'appearance-settings',
})

// Access populated colors
console.log(theme.themeConfiguration.lightMode.primary) // '#3b82f6'
console.log(theme.themeConfiguration.darkMode.primary) // '#60a5fa'
```

## Related

- [STANDALONE_GLOBAL.md](./STANDALONE_GLOBAL.md) - Standalone global feature documentation
- [MULTI_TENANT_GUIDE.md](./MULTI_TENANT_GUIDE.md) - Multi-tenant setup guide
- [README.md](./README.md) - Main plugin documentation
