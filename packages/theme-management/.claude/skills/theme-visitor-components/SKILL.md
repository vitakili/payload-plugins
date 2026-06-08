---
name: theme-visitor-components
description: Add front-end (visitor-facing) theme controls from @kilivi-dev/payloadcms-theme-management — the ColorModeToggle (light/dark/auto with a View Transitions ripple animation) and the ThemeSwitcher (runtime theme-preset switching). Use when a site needs a dark-mode button or a theme picker for end users.
---

# Theme visitor components

Drop-in, front-end components for letting site visitors control the theme. Both
are client components; render them anywhere inside the app wrapped by
`ThemeProvider`.

## ColorModeToggle

A single accessible icon button that switches light/dark (optionally cycling
through `auto`). When the browser supports the View Transitions API and the user
hasn't requested reduced motion, the change animates as a circular ripple from
the click point.

```tsx
import { ColorModeToggle } from '@kilivi-dev/payloadcms-theme-management/components/ColorModeToggle'

<ColorModeToggle />
// options:
<ColorModeToggle includeAuto size={22} disableAnimation aria-label="Toggle theme" />
```

- Returns `null` when the admin disabled the colour-mode toggle
  (`isColorModeToggleAllowed === false`).
- Honours `prefers-reduced-motion` automatically.
- Override icons via `icons={{ light: Sun, dark: Moon, auto: Monitor }}`.
- The ripple needs the bundled `ColorModeToggle.css` — it's imported by the
  component, so just make sure your bundler includes package CSS (Next.js does).

Requires the app to be wrapped in `ThemeProvider` (see [theme-management-setup])
and the SSR `InitTheme`/`ServerThemeInjector` for no-flash mode.

## ThemeSwitcher

A `<select>` that swaps the active theme **preset** at runtime by injecting the
preset's colour CSS and updating `data-theme`. Persists the choice to
localStorage and restores it on the next visit.

```tsx
import { ThemeSwitcher } from '@kilivi-dev/payloadcms-theme-management/components/ThemeSwitcher'

// All bundled presets:
<ThemeSwitcher />

// A curated subset:
import { allThemePresets } from '@kilivi-dev/payloadcms-theme-management'
const offered = allThemePresets.filter((p) => ['cool', 'ocean', 'forest'].includes(p.name))
<ThemeSwitcher presets={offered} persist onChange={(name) => console.log(name)} />
```

- Colour-mode (light/dark) is handled by `ColorModeToggle` + the SSR injector with
  no flash. Preset switching re-applies on mount, so a brief flash to the SSR
  default theme can occur before the stored preset is restored — keep the offered
  list focused, or set `persist={false}` if you don't want stickiness.
- Pass any `Pick<ThemePreset, 'name' | 'label' | 'lightMode' | 'darkMode'>[]`.

## Rules of thumb
- Don't hand-roll a dark-mode button or wire `useTheme()` yourself — use these.
- These are **front-end** components; they don't use admin i18n. Localise via the
  `aria-label` prop and the preset `label`s.

Related: [theme-management-setup], [theme-live-preview].
