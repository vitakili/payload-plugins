---
name: theme-customization-tools
description: Use the admin-side and programmatic theming tools in @kilivi-dev/payloadcms-theme-management — generate a full light/dark palette from one brand colour or a logo, run a WCAG accessibility audit of the palette with one-click fixes, and export the theme as W3C design tokens (JSON) or Tailwind v4 @theme / v3 config.
---

# Theme customization & export tools

These tools live in the Appearance Settings tab (admin `ui` fields) and as pure
exported utilities for programmatic use.

## Palette generator (admin: PaletteGeneratorField, util: generatePalette)

Builds a complete, harmonious light + dark palette from a single brand colour —
or a colour extracted from an uploaded logo/image.

Programmatic:

```ts
import {
  generatePaletteFromColor,
  extractDominantColors,
} from '@kilivi-dev/payloadcms-theme-management/utils/generatePalette'

const { lightMode, darkMode } = generatePaletteFromColor('#1d4ed8')
// extractDominantColors(imgEl, 6) → hex[] ranked by saturation-weighted frequency
```

Hue is preserved; lightness/saturation are derived per token. Foregrounds are
nudged to meet WCAG AA. The admin field writes the result straight into
`themeConfiguration.lightMode.*` / `.darkMode.*`.

## Accessibility audit (admin: AccessibilityAuditField, util: contrast)

Checks the key foreground/background pairs (body, primary button, card, accent,
destructive, …) in both modes against WCAG AA (4.5:1), shows pass/fail with the
ratio, and offers a one-click fix (nearest accessible colour, hue preserved).

```ts
import {
  auditThemePalette,
  getContrastRatio,
  getWcagLevel,
  suggestAccessibleColor,
} from '@kilivi-dev/payloadcms-theme-management/utils/contrast'

auditThemePalette(lightMode) // ContrastPairResult[] with ratio, level, suggestion
getContrastRatio('#fff', '#1d4ed8') // 1–21 or null
suggestAccessibleColor('#777', '#fff', 4.5) // nearest AA-passing hex
```

This util is the single source of contrast logic (the colour picker reuses it) —
don't reimplement luminance/ratio maths.

## Export (admin: ThemeExportField, util: exportTokens)

Export the current theme for design-tool / Tailwind interop.

```ts
import {
  generateDesignTokens,        // W3C Design Tokens object
  generateDesignTokensJson,    // pretty JSON string
  generateTailwindV4Theme,     // "@theme inline { --color-primary: var(--primary); … }"
  generateTailwindV3Theme,     // theme.extend config string
} from '@kilivi-dev/payloadcms-theme-management/utils/exportTokens'
```

The Tailwind output maps utilities (`bg-primary`, `text-foreground`, …) to the
**runtime CSS variables** the plugin injects, so colours keep following the active
theme, light/dark mode and live preview without rebuilding Tailwind. For Tailwind
v4, paste the `@theme inline { … }` block into your global stylesheet after
`@import "tailwindcss";`.

## Notes
- Admin fields are registered automatically inside the Appearance Settings tab —
  after adding the plugin to a new collection run `payload generate:importmap`.
- All three utils are framework-agnostic pure functions (safe on the server).

Related: [theme-management-setup], [theme-color-fields], [theme-visitor-components].
