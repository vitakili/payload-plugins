# Appearance Controls Reference

Added in **v1.2.0** — collapsible configuration sections that extend the Appearance Settings tab with granular UI customisation options.

> **v1.4.0 — applied automatically.** `getThemeHtmlAttributes(resolved)` now emits **all** of the style data-attributes the generated CSS targets (`data-effect-style`, `data-shadow-intensity`, `data-backdrop-blur`, `data-border-style`, `data-border-width`, `data-card-style`, `data-card-hover`, `data-button-variant`, `data-button-size`, `data-navbar-style`, `data-footer-style`, `data-image-style`, `data-link-style`, plus `data-hover-animations="off"` / `data-scroll-reveal="off"` when disabled). Spreading it onto `<html>` makes Visual Effects + Component Styles render correctly on the **server** with no flash of unstyled content — no manual wiring required. The client `ThemeProvider` keeps these in sync after hydration.
>
> **Hero & Background is consumer-owned.** The plugin intentionally does **not** add hero/background fields (section 2 below documents the data-attribute contract you can wire into *your own* hero block/field). Hero styling is page/section-specific and belongs at that level, not in the global theme.

---

## Table of Contents

1. [Visual Effects](#1-visual-effects)
2. [Hero & Background](#2-hero--background)
3. [Component Styles](#3-component-styles)
4. [TypeScript types](#4-typescript-types)
5. [Accessing values in Next.js](#5-accessing-values-in-nextjs)
6. [CSS variable mapping guide](#6-css-variable-mapping-guide)

---

## 1. Visual Effects

**Admin field path:** `themeConfiguration.visualEffects`  
**DB name prefix:** `effect_*`, `shadow_*`, `backdrop_*`, `border_*`, `glass_*`

Controls the physical rendering style of cards, panels and interactive UI elements.

### Fields

| Field             | Type           | Default  | Options                                                                 |
| ----------------- | -------------- | -------- | ----------------------------------------------------------------------- |
| `effectStyle`     | select         | `flat`   | `flat`, `elevated`, `glass`, `neumorphic`, `clay`                       |
| `shadowIntensity` | select         | `medium` | `none`, `subtle`, `medium`, `strong`, `dramatic`                        |
| `backdropBlur`    | select         | `none`   | `none`, `slight` (4px), `medium` (8px), `strong` (16px), `heavy` (24px) |
| `borderStyle`     | select         | `solid`  | `none`, `solid`, `dashed`, `dotted`, `double`                           |
| `borderWidth`     | select         | `1px`    | `0px`, `1px`, `2px`, `3px`, `4px`                                       |
| `glassOpacity`    | number (0–100) | `60`     | only visible when `effectStyle === 'glass'`                             |

### Effect style descriptions

| Value        | Description                                                                                                          |
| ------------ | -------------------------------------------------------------------------------------------------------------------- |
| `flat`       | No shadows. Clean, minimal cards.                                                                                    |
| `elevated`   | Box-shadow depth layers. Cards appear raised above the page.                                                         |
| `glass`      | Frosted glass — semi-transparent background + `backdrop-filter: blur()`. Requires `backdropBlur` and `glassOpacity`. |
| `neumorphic` | Soft UI: subtle inset/outset shadows matching the background colour. Best with `neumorphism` theme preset.           |
| `clay`       | Cartoon-like chunky coloured drop shadows. Best with `claymorphism` theme preset.                                    |

### Mapping to CSS

```css
/* effectStyle → data-effect attribute on <html> or card container */
[data-effect='glass'] .card {
  background: oklch(var(--card) / calc(var(--glass-opacity, 60) * 1%));
  backdrop-filter: blur(var(--backdrop-blur, 8px));
}

[data-effect='elevated'] .card {
  box-shadow: 0 var(--shadow-offset-y) var(--shadow-blur) var(--shadow-spread) var(--shadow-color);
}
```

---

## 2. Hero & Background _(consumer-side pattern — not a plugin field)_

> ⚠️ The plugin does **not** register these fields. Hero/background styling is
> page- and section-specific, so it belongs on **your own** hero block/field.
> This section documents a recommended data-attribute contract you can adopt if
> you add such fields yourself. The `--gradient-from` / `--gradient-via` /
> `--gradient-to` brand tokens (and the composed `--gradient-brand`) emitted by
> the plugin are designed to feed exactly this kind of hero gradient.

**Suggested field path (in your config):** `heroBackground`  

Controls the visual style of the page hero section and decorative background effects on any section.

### Fields

| Field               | Type           | Default     | Options                                                                             |
| ------------------- | -------------- | ----------- | ----------------------------------------------------------------------------------- |
| `heroStyle`         | select         | `solid`     | `solid`, `gradient`, `radial`, `mesh`, `image-overlay`, `video`                     |
| `heroHeight`        | select         | `large`     | `small` (40vh), `medium` (60vh), `large` (80vh), `full` (100vh)                     |
| `gradientDirection` | select         | `to-bottom` | `to-bottom`, `to-top`, `to-right`, `to-left`, `to-bottom-right`, `to-top-right`     |
| `overlayOpacity`    | number (0–100) | `50`        | only visible for `image-overlay` / `video`                                          |
| `backgroundPattern` | select         | `none`      | `none`, `dots`, `grid`, `cross`, `lines-h`, `lines-d`, `noise`, `waves`, `hexagons` |
| `patternOpacity`    | number (0–100) | `10`        | only visible when pattern ≠ `none`                                                  |
| `sectionDivider`    | select         | `none`      | `none`, `line`, `wave`, `diagonal`, `chevron`, `curved`, `zigzag`                   |
| `enableParallax`    | checkbox       | `false`     | parallax scroll on hero bg image                                                    |

### Conditional visibility

- `gradientDirection` — visible only when `heroStyle` is `gradient` or `mesh`
- `overlayOpacity` — visible only when `heroStyle` is `image-overlay` or `video`
- `patternOpacity` — visible only when `backgroundPattern` is not `none`

### Hero style descriptions

| Value           | Description                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------------- |
| `solid`         | Single background colour from `--background` token.                                             |
| `gradient`      | Linear gradient from `--primary` → `--background`. Direction controlled by `gradientDirection`. |
| `radial`        | Radial gradient centred on the hero.                                                            |
| `mesh`          | Multi-colour mesh gradient (CSS `conic-gradient` layers).                                       |
| `image-overlay` | Hero background image with a semi-transparent colour overlay. Opacity from `overlayOpacity`.    |
| `video`         | Autoplay muted video background with colour overlay.                                            |

### Background patterns

Patterns are applied as SVG data-URI `background-image` overlays. The opacity is controlled through CSS opacity or fill alpha.

```css
/* Example: dots pattern */
[data-pattern='dots'] {
  background-image: radial-gradient(circle, var(--foreground) 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: calc(var(--pattern-opacity, 10) / 100);
}
```

---

## 3. Component Styles

**Admin field path:** `themeConfiguration.componentStyles`  
**DB name prefix:** `button_*`, `card_*`, `image_*`, `icon_*`, `navbar_*`, `footer_*`

Fine-grained control over the visual style of reusable UI components across the entire website.

### Fields

| Field                   | Type     | Default    | Options                                                                        |
| ----------------------- | -------- | ---------- | ------------------------------------------------------------------------------ |
| `buttonVariant`         | select   | `filled`   | `filled`, `outlined`, `ghost`, `gradient`, `pill`, `brutal`                    |
| `buttonSize`            | select   | `medium`   | `small`, `medium`, `large`, `xl`                                               |
| `cardStyle`             | select   | `elevated` | `elevated`, `flat`, `bordered`, `glass`, `neumorphic`, `gradient-border`       |
| `cardHoverEffect`       | select   | `lift`     | `none`, `lift`, `scale`, `shadow`, `glow`, `tilt`                              |
| `imageStyle`            | select   | `default`  | `default`, `rounded`, `circle`, `vignette`, `grayscale`, `duotone`, `polaroid` |
| `iconSet`               | select   | `lucide`   | `lucide`, `heroicons`, `phosphor`, `tabler`, `font-awesome`                    |
| `navbarStyle`           | select   | `solid`    | `solid`, `transparent`, `blur`, `floating`, `minimal`                          |
| `footerStyle`           | select   | `standard` | `standard`, `minimal`, `dark`, `gradient-top`, `full-color`                    |
| `linkStyle`             | select   | `underline-hover` | `underline`, `underline-hover`, `none`, `highlight`, `animated`         |
| `enableScrollReveal`    | checkbox | `true`     | animate elements on scroll                                                     |
| `enableHoverAnimations` | checkbox | `true`     | micro-animations on hover                                                      |

> **Built-in CSS.** As of v1.4.0 the plugin ships ready-to-use rules for
> `buttonVariant` (incl. `gradient`), `buttonSize`, `footerStyle`, `imageStyle`
> and `linkStyle`, scoped by the `data-*` attributes above. Mark elements with
> `[data-btn]`, `[data-card]`, `[data-img]` / `.themed-image`, `[data-link]` /
> `.themed-link` (and standard `header` / `footer`) and they pick up the tenant's
> choices automatically — no extra CSS needed.

### Button variant descriptions

| Value      | Description                                                      |
| ---------- | ---------------------------------------------------------------- |
| `filled`   | Solid background with `--primary` colour. Classic CTA.           |
| `outlined` | Transparent fill, `--primary` border and text.                   |
| `ghost`    | No background or border, primary text only.                      |
| `gradient` | Linear gradient from `--primary` to `--accent`.                  |
| `pill`     | `filled` variant but with `border-radius: 9999px`.               |
| `brutal`   | Thick (2–3px) solid border, offset box-shadow, no border-radius. |

### Card hover effects

| Value    | CSS description                                                         |
| -------- | ----------------------------------------------------------------------- |
| `lift`   | `transform: translateY(-4px); box-shadow: deeper;`                      |
| `scale`  | `transform: scale(1.03);`                                               |
| `shadow` | Shadow expands from subtle to strong.                                   |
| `glow`   | `box-shadow: 0 0 20px var(--primary / 40%);`                            |
| `tilt`   | CSS `perspective` + `rotateX/Y` based on cursor position (requires JS). |

### Navbar styles

| Value         | Description                                                     |
| ------------- | --------------------------------------------------------------- |
| `solid`       | Opaque background using `--background`.                         |
| `transparent` | Transparent when over the hero, transitions to solid on scroll. |
| `blur`        | `backdrop-filter: blur(12px)` with semi-transparent background. |
| `floating`    | Detached from top, rounded pill shape with shadow.              |
| `minimal`     | No background, only a 1px bottom border.                        |

---

## 4. TypeScript Types

All three sections are exported from the main package:

```typescript
import type {
  SiteThemeConfiguration,
  ThemeComponentStyles,
  ThemeHeroBackground,
  ThemeVisualEffects,
} from '@kilivi-dev/payloadcms-theme-management'
```

### `ThemeVisualEffects`

```typescript
interface ThemeVisualEffects {
  effectStyle?: 'flat' | 'elevated' | 'glass' | 'neumorphic' | 'clay' | null
  shadowIntensity?: 'none' | 'subtle' | 'medium' | 'strong' | 'dramatic' | null
  backdropBlur?: 'none' | 'slight' | 'medium' | 'strong' | 'heavy' | null
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double' | null
  borderWidth?: '0px' | '1px' | '2px' | '3px' | '4px' | null
  glassOpacity?: number | null
}
```

### `ThemeHeroBackground`

```typescript
interface ThemeHeroBackground {
  heroStyle?: 'solid' | 'gradient' | 'radial' | 'mesh' | 'image-overlay' | 'video' | null
  heroHeight?: 'small' | 'medium' | 'large' | 'full' | null
  gradientDirection?:
    | 'to-bottom'
    | 'to-top'
    | 'to-right'
    | 'to-left'
    | 'to-bottom-right'
    | 'to-top-right'
    | null
  overlayOpacity?: number | null
  backgroundPattern?:
    | 'none'
    | 'dots'
    | 'grid'
    | 'cross'
    | 'lines-h'
    | 'lines-d'
    | 'noise'
    | 'waves'
    | 'hexagons'
    | null
  patternOpacity?: number | null
  sectionDivider?: 'none' | 'line' | 'wave' | 'diagonal' | 'chevron' | 'curved' | 'zigzag' | null
  enableParallax?: boolean | null
}
```

### `ThemeComponentStyles`

```typescript
interface ThemeComponentStyles {
  buttonVariant?: 'filled' | 'outlined' | 'ghost' | 'gradient' | 'pill' | 'brutal' | null
  buttonSize?: 'small' | 'medium' | 'large' | 'xl' | null
  cardStyle?: 'elevated' | 'flat' | 'bordered' | 'glass' | 'neumorphic' | 'gradient-border' | null
  cardHoverEffect?: 'none' | 'lift' | 'scale' | 'shadow' | 'glow' | 'tilt' | null
  imageStyle?:
    | 'default'
    | 'rounded'
    | 'circle'
    | 'vignette'
    | 'grayscale'
    | 'duotone'
    | 'polaroid'
    | null
  iconSet?: 'lucide' | 'heroicons' | 'phosphor' | 'tabler' | 'font-awesome' | null
  navbarStyle?: 'solid' | 'transparent' | 'blur' | 'floating' | 'minimal' | null
  footerStyle?: 'standard' | 'minimal' | 'dark' | 'gradient-top' | 'full-color' | null
  enableScrollReveal?: boolean | null
  enableHoverAnimations?: boolean | null
}
```

---

## 5. Accessing Values in Next.js

The recommended path resolves the configuration once and spreads the generated
attributes onto `<html>`. Every Visual Effects + Component Styles data-attribute
is emitted for you, so the server-rendered markup already matches the CSS:

```tsx
// app/layout.tsx
import {
  fetchThemeConfiguration,
  resolveThemeConfiguration,
  getThemeHtmlAttributes,
  ServerThemeInjector,
} from '@kilivi-dev/payloadcms-theme-management'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const themeConfiguration = await fetchThemeConfiguration({ collectionSlug: 'site-settings' })
  const resolved = resolveThemeConfiguration(themeConfiguration)
  const htmlAttrs = getThemeHtmlAttributes(resolved)

  return (
    <html {...htmlAttrs}>
      <head>
        <ServerThemeInjector themeConfiguration={themeConfiguration} />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

`htmlAttrs` includes `data-theme`, `data-theme-mode`, `data-border-radius`,
`data-font-scale`, `data-spacing`, `data-animation-level`,
`data-allow-color-mode-toggle` **and** the style attributes
(`data-effect-style`, `data-card-style`, `data-button-variant`,
`data-button-size`, `data-navbar-style`, `data-footer-style`,
`data-image-style`, `data-link-style`, `data-card-hover`, `data-shadow-intensity`,
`data-backdrop-blur`, `data-border-style`, `data-border-width`). You do not need
to set these by hand anymore.

### Full resolver example

```typescript
// lib/resolveAppearance.ts
import type { SiteThemeConfiguration } from '@kilivi-dev/payloadcms-theme-management'

export function resolveAppearanceAttributes(cfg: SiteThemeConfiguration | null) {
  const ve = cfg?.visualEffects
  const hb = cfg?.heroBackground
  const cs = cfg?.componentStyles

  return {
    'data-effect': ve?.effectStyle ?? 'flat',
    'data-shadow': ve?.shadowIntensity ?? 'medium',
    'data-blur': ve?.backdropBlur ?? 'none',
    'data-hero': hb?.heroStyle ?? 'solid',
    'data-hero-height': hb?.heroHeight ?? 'large',
    'data-pattern': hb?.backgroundPattern ?? 'none',
    'data-divider': hb?.sectionDivider ?? 'none',
    'data-button': cs?.buttonVariant ?? 'filled',
    'data-card': cs?.cardStyle ?? 'elevated',
    'data-card-hover': cs?.cardHoverEffect ?? 'lift',
    'data-navbar': cs?.navbarStyle ?? 'solid',
    'data-footer': cs?.footerStyle ?? 'standard',
  } as Record<string, string>
}
```

---

## 6. CSS Variable Mapping Guide

Use the data attributes set on `<html>` (or a wrapper element) together with Tailwind arbitrary variants or plain CSS selectors to apply styles conditionally.

### Tailwind CSS example

```css
/* globals.css */

/* --- Effect style --- */
[data-effect='glass'] .card {
  @apply bg-card/60 backdrop-blur-md border border-white/20;
}
[data-effect='elevated'] .card {
  @apply shadow-lg hover:shadow-xl;
}
[data-effect='neumorphic'] .card {
  box-shadow:
    5px 5px 10px oklch(0 0 0 / 15%),
    -5px -5px 10px oklch(1 0 0 / 60%);
  background: var(--background);
}
[data-effect='clay'] .card {
  box-shadow: 4px 8px 0 4px oklch(0.6 0.18 255);
}

/* --- Background patterns --- */
[data-pattern='dots'] .pattern-layer {
  background-image: radial-gradient(circle, hsl(var(--foreground) / 0.15) 1px, transparent 1px);
  background-size: 20px 20px;
}
[data-pattern='grid'] .pattern-layer {
  background-image:
    linear-gradient(hsl(var(--foreground) / 0.07) 1px, transparent 1px),
    linear-gradient(to right, hsl(var(--foreground) / 0.07) 1px, transparent 1px);
  background-size: 32px 32px;
}

/* --- Navbar --- */
[data-navbar='blur'] header {
  @apply bg-background/70 backdrop-blur-lg border-b border-border/30;
}
[data-navbar='floating'] header {
  @apply fixed top-4 left-4 right-4 rounded-2xl shadow-xl bg-card;
}
[data-navbar='transparent'] header {
  @apply bg-transparent absolute top-0 w-full;
}

/* --- Card hover effects --- */
[data-card-hover='lift'] .card {
  @apply transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl;
}
[data-card-hover='glow'] .card {
  @apply transition-shadow duration-300 hover:shadow-[0_0_24px_hsl(var(--primary)/40%)];
}
[data-card-hover='scale'] .card {
  @apply transition-transform duration-300 hover:scale-[1.03];
}

/* --- Button variants --- */
[data-button='outlined'] .btn-primary {
  @apply bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground;
}
[data-button='pill'] .btn-primary {
  @apply rounded-full;
}
[data-button='brutal'] .btn-primary {
  @apply border-2 border-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))]
         hover:shadow-[1px_1px_0_0_hsl(var(--foreground))]
         hover:translate-x-[2px] hover:translate-y-[2px]
         transition-all rounded-none;
}
```

### Hero height utility

```css
:root {
  --hero-h-small: 40vh;
  --hero-h-medium: 60vh;
  --hero-h-large: 80vh;
  --hero-h-full: 100vh;
}
[data-hero-height='small'] .hero {
  min-height: var(--hero-h-small);
}
[data-hero-height='medium'] .hero {
  min-height: var(--hero-h-medium);
}
[data-hero-height='large'] .hero {
  min-height: var(--hero-h-large);
}
[data-hero-height='full'] .hero {
  min-height: var(--hero-h-full);
}
```

---

_See also: [THEME_PRESETS_EXTENDED.md](./THEME_PRESETS_EXTENDED.md) for the new visual-style theme presets added in v1.2.0._
