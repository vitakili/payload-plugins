# Tailwind CSS Integration Guide

## What Was Added to README

The README now includes complete Tailwind CSS configuration for seamless integration with the Theme Management Plugin.

## Files Added

### 1. tailwind.config.mjs

Complete production-ready Tailwind configuration featuring:

- **Dark mode support** with class-based switching
- **Dynamic CSS Variables** integration for theme colors
- **Container queries** with responsive padding
- **Extended theme** with all color tokens:
  - Background, foreground, primary, secondary, accent, destructive
  - Card, popover, muted colors
  - Input, border, ring, success, warning, error, info colors
- **Typography system**:
  - Variable font families (body, heading, mono)
  - Dynamic font sizing from theme
  - Letter spacing presets
  - Font weight variables

- **Component-aware utilities**:
  - Card styling with padding and shadow
  - Button transitions and hover scales
  - Input field sizing and styling
  - Section spacing with responsive variants

- **Animations**:
  - Accordion animations
  - Smooth transitions based on animation level

- **Plugins**:
  - `tailwindcss-animate` for built-in animations
  - `@tailwindcss/typography` for prose styling

### 2. globals.css

Global stylesheet with base layer CSS including:

- **CSS Variables Setup**:
  - Font scale presets (small, medium, large, xl)
  - Spacing presets (compact, comfortable, spacious, xl)
  - Animation duration levels (none, reduced, normal, enhanced)

- **Dynamic Theme Application**:
  - `--theme-font-scale` for responsive typography
  - `--theme-spacing` for responsive spacing
  - `--theme-animation-level` for animation control

- **Scaled Variables**:
  - Container padding with spacing multiplier
  - Section spacing with responsive variants
  - Component padding based on theme spacing

- **Reset & Base Styles**:
  - CSS box-sizing reset
  - Margin and padding reset
  - Default border color application

- **Typography**:
  - Dynamic font sizing from theme
  - Font family fallbacks
  - Responsive heading styles

- **Animation Level Controls**:
  - Conditional duration based on `[data-animation-level]` attribute
  - Support for: none, reduced, normal, enhanced

- **Visibility & Flash Prevention**:
  - Prevents flash of unstyled content (FOUC)
  - Respects Storybook for development
  - Smooth theme transitions

- **Dark Mode**:
  - Color scheme preference
  - Dark mode class application

- **Modern Features**:
  - React 19 View Transitions API
  - Fade in/out animations for page navigation
  - Respects `prefers-reduced-motion` for accessibility

## How It Works Together

1. **Theme Manager** sets CSS variables on `:root` element via JavaScript
2. **Tailwind Config** references these CSS variables in color definitions
3. **Global CSS** provides base styling and animation controls
4. **Components** use Tailwind classes that automatically use theme colors

### Example Flow

```
1. Admin selects "Cool" theme
   ↓
2. fetchThemeConfiguration() gets light/dark mode colors
   ↓
3. ServerThemeInjector sets CSS variables:
   --primary: #3b82f6
   --background: #ffffff
   etc.
   ↓
4. Tailwind interprets `class="bg-primary text-primary-foreground"`
   as: background-color: var(--primary); color: var(--primary-foreground);
   ↓
5. Component renders with theme colors
```

## Key Features

### 🎨 Dynamic Theming

- All colors are CSS variables
- Changes immediately when variables update
- No component reload needed

### 📱 Responsive Design

- Container padding scales with breakpoints
- Section spacing adapts to screen size
- Font sizing respects font-scale multiplier

### ♿ Accessibility

- Respects `prefers-reduced-motion`
- Proper contrast ratios for theme colors
- Semantic color tokens (success, warning, error)

### ⚡ Performance

- CSS-in-JS free approach
- No runtime compilation
- Critical CSS can be inlined for SSR

### 🎬 Modern Browser APIs

- View Transitions for page navigation
- CSS custom properties for theme management
- Class-based dark mode switching

## Configuration Notes

### Content Paths

Update content array to match your project structure:

```javascript
content: [
  './src/app/**/*.{ts,tsx}',
  './src/components/**/*.{ts,tsx}',
  // Add your custom paths here
]
```

### Safelist

Pre-generate CSS for dynamic classes used in content:

```javascript
safelist: [
  'col-span-4',
  'bg-primary',
  // Add your dynamic classes here
]
```

### CSS Variables

The `globals.css` sets up CSS variable naming convention:

```css
--primary: (set by theme) --typography-fontFamily: (set by theme)
  --layout-sectionSpacing: (set by theme);
```

Reference them in Tailwind config:

```javascript
colors: {
  primary: 'var(--primary)',
  // ...
}
```

## Using in Components

### Applying Theme Colors

```tsx
// Class names automatically use theme colors
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground hover:bg-primary/90">Click me</button>
</div>
```

### Responsive Styling

```tsx
// Uses scaled spacing from theme
<div className="p-card space-section">Content with theme-aware spacing</div>
```

### Dark Mode

```tsx
// Automatically applies based on data-theme-mode attribute
<div className="dark:bg-card dark:text-foreground">Adapts to dark mode</div>
```

### Animation Control

```tsx
// Animations respect theme's animation level
<div className="animate-accordion-down">Animation duration varies by theme setting</div>
```

## Troubleshooting

### Colors Not Applying

1. Check that CSS variables are set: `console.log(getComputedStyle(document.documentElement).getPropertyValue('--primary'))`
2. Verify Tailwind config references the variables
3. Check browser DevTools for CSS variable values

### Styling Flashes

1. Ensure ServerThemeInjector is in layout `<head>`
2. Check that theme variables are set before content renders
3. Verify visibility is not hidden unintentionally

### Animation Not Working

1. Check `[data-animation-level]` attribute on document
2. Verify animation level is set correctly
3. Test with `data-animation-level="normal"`

## Next Steps

1. Copy `tailwind.config.mjs` to your project root
2. Copy `globals.css` to your app's styles folder
3. Import `globals.css` in your root layout
4. Use Tailwind classes with confidence!

## See Also

- [README.md](./README.md) - Main plugin documentation
- [STANDALONE_GLOBAL.md](./STANDALONE_GLOBAL.md) - Global configuration
- [MULTI_TENANT_GUIDE.md](./MULTI_TENANT_GUIDE.md) - Multi-tenant setup
