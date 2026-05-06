# Style Presets & Visual Effects — Architecture Guide

Added in **v1.2.0** — describes the complete pipeline from admin selection to browser-rendered effect.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Style Presets](#2-style-presets)
3. [Visual Effects — field reference](#3-visual-effects--field-reference)
4. [Component Styles — field reference](#4-component-styles--field-reference)
5. [How CSS is generated](#5-how-css-is-generated)
6. [Data attribute pipeline](#6-data-attribute-pipeline)
7. [CSS hooks in your app](#7-css-hooks-in-your-app)
8. [Conflict resolution](#8-conflict-resolution)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Overview

The plugin manages visual effects via a **three-layer pipeline**:

```
Admin UI → Payload DB → resolveThemeConfiguration()
  → generateThemeCSS() → <style> tag in <head>
  → data-* attributes on <html>
  → CSS rules target [data-card] / .glass-card elements
```

**Why data attributes instead of CSS variables alone?**  
Tailwind v4 compiles utility classes like `bg-card/90` and `backdrop-blur-sm` to static CSS at build time. CSS custom properties cannot override already-compiled utility values. The only reliable way to override these is via `!important` rules with higher specificity — which the data attribute selectors provide.

---

## 2. Style Presets

**Admin field path:** `themeConfiguration.stylePreset`

A preset is a named bundle of field values that covers `visualEffects.*`, `componentStyles.*`, `borderRadius`, and `animationLevel`. Selecting a preset dispatches form updates to all those sibling fields in a single click.

### Available presets

| Name                  | Category     | Effect style | Card style        | Button variant |
| --------------------- | ------------ | ------------ | ----------------- | -------------- |
| `brutalism`           | classic      | `flat`       | `bordered`        | `brutal`       |
| `swiss`               | classic      | `flat`       | `flat`            | `outlined`     |
| `minimalism`          | classic      | `flat`       | `elevated`        | `ghost`        |
| `flat-design`         | classic      | `flat`       | `flat`            | `filled`       |
| `material`            | classic      | `elevated`   | `elevated`        | `filled`       |
| `glassmorphism`       | modern       | `glass`      | `glass`           | `ghost`        |
| `neumorphism`         | modern       | `neumorphic` | `neumorphic`      | `outlined`     |
| `claymorphism`        | modern       | `clay`       | `elevated`        | `pill`         |
| `skeuomorphism`       | modern       | `elevated`   | `elevated`        | `filled`       |
| `cyberpunk`           | experimental | `flat`       | `bordered`        | `brutal`       |
| `retro`               | experimental | `elevated`   | `bordered`        | `outlined`     |
| `y2k`                 | experimental | `elevated`   | `gradient-border` | `gradient`     |
| `grunge`              | experimental | `flat`       | `bordered`        | `brutal`       |
| `maximalism`          | experimental | `elevated`   | `gradient-border` | `gradient`     |
| `card-based`          | layout       | `elevated`   | `elevated`        | `filled`       |
| `bento-grid`          | layout       | `flat`       | `flat`            | `ghost`        |
| `gradient-heavy`      | visual       | `elevated`   | `gradient-border` | `gradient`     |
| `typography-first`    | visual       | `flat`       | `flat`            | `ghost`        |
| `motion-design`       | motion       | `elevated`   | `elevated`        | `pill`         |
| `scroll-storytelling` | motion       | `flat`       | `flat`            | `ghost`        |

> Presets do **not** set colour fields. All HSL color tokens remain unchanged.

### What happens on select

1. `StylePresetField` dispatches `dispatchFields({ type: 'UPDATE', path: ... })` for every preset property
2. Sibling fields (`borderRadius`, `animationLevel`, `visualEffects.*`, `componentStyles.*`) update in real-time
3. User saves the form → DB stores the flat values
4. On next page load, `resolveThemeConfiguration()` reads the stored values and passes them to `generateThemeCSS()`

---

## 3. Visual Effects — field reference

**Admin field path:** `themeConfiguration.visualEffects`

| Field             | Type         | Options                                                                     | CSS output                                        |
| ----------------- | ------------ | --------------------------------------------------------------------------- | ------------------------------------------------- |
| `effectStyle`     | select       | `flat`, `elevated`, `glass`, `neumorphic`, `clay`                           | `--effect-style` var + element rules              |
| `shadowIntensity` | select       | `none`, `subtle`, `medium`, `strong`, `dramatic`                            | `--card-shadow` var                               |
| `backdropBlur`    | select       | `none`, `slight` (4 px), `medium` (8 px), `strong` (16 px), `heavy` (24 px) | `--backdrop-blur` + `--card-backdrop-filter` vars |
| `borderStyle`     | select       | `none`, `solid`, `dashed`, `dotted`, `double`                               | `--border-style` var                              |
| `borderWidth`     | select       | `0px`, `1px`, `2px`, `3px`, `4px`                                           | `--border-width` var + element rules              |
| `glassOpacity`    | number 0–100 | only shown when `effectStyle === 'glass'`                                   | `--glass-opacity` + `--card-bg-opacity` vars      |

### Effect style descriptions

| Value        | Visual result                                                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `flat`       | No shadows, no blur. Cards are opaque rectangles.                                                                                                            |
| `elevated`   | Multi-layer box-shadow giving depth. Intensity from `shadowIntensity`.                                                                                       |
| `glass`      | Semi-transparent card with `backdrop-filter: blur()`. Requires content behind the card to be visible. Opacity from `glassOpacity`, blur from `backdropBlur`. |
| `neumorphic` | Dual light/dark shadow extruding from the background colour. Works best with solid, mid-tone backgrounds.                                                    |
| `clay`       | Bold offset drop shadow (cartoon-style). Cards lift on hover.                                                                                                |

---

## 4. Component Styles — field reference

**Admin field path:** `themeConfiguration.componentStyles`

| Field             | Type   | Options                                                                  | Targets                               |
| ----------------- | ------ | ------------------------------------------------------------------------ | ------------------------------------- |
| `buttonVariant`   | select | `filled`, `outlined`, `ghost`, `gradient`, `pill`, `brutal`              | `[data-btn]` attribute on Button      |
| `cardStyle`       | select | `elevated`, `flat`, `bordered`, `glass`, `neumorphic`, `gradient-border` | sets `data-card-style` on `<html>`    |
| `cardHoverEffect` | select | `none`, `lift`, `scale`, `shadow`, `glow`, `tilt`                        | `[data-card]`, `.glass-card` on hover |
| `navbarStyle`     | select | `solid`, `transparent`, `blur`, `floating`, `minimal`                    | `header` element                      |

---

## 5. How CSS is generated

`generateThemeCSS(config)` in `src/utils/themeUtils.ts` produces CSS in three sections:

### Section A — `:root` block (CSS custom properties)

```css
:root[data-theme='cool'] {
  /* From applyVisualEffectsCSSVars(): */
  --effect-style: glass;
  --backdrop-blur: 16px;
  --card-bg-opacity: 0.55; /* set for glass only; 1.0 for all other effects */
  --card-backdrop-filter: blur(16px); /* 'none' for non-glass effects */
  --glass-opacity: 0.55;
  --card-shadow: 0 1px 3px...;

  /* From applyComponentStyleCSSVars(): */
  --button-variant: ghost;
  --card-style: glass;
  --card-hover-effect: glow;
  --navbar-style: blur;
}
```

> **Important:** `--card-bg-opacity` and `--card-backdrop-filter` are **always** emitted when an `effectStyle` is set. Non-glass effects emit `1.0` / `none` to disable the glass look from consumer `.glass-card` utility classes.

### Section B — Element rules (outside `:root`)

Rules with `!important` that target actual DOM elements via data attribute selectors:

```css
/* Example for glassmorphism */
html[data-effect-style='glass'] [data-card],
html[data-effect-style='glass'] .glass-card,
html[data-effect-style='glass'] .glass {
  background-color: hsl(var(--card) / 55%) !important;
  backdrop-filter: blur(16px) saturate(150%) !important;
  -webkit-backdrop-filter: blur(16px) saturate(150%) !important;
  border-color: hsl(var(--border) / 40%) !important;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
}
```

**Why `!important`?** Tailwind v4 compiles `bg-card/90` and `backdrop-blur-sm` as static CSS in `@layer utilities`. Unlayered rules with `!important` override layered utilities regardless of document order.

### Section C — Color mode overrides

Dark mode and custom color palette rules (handled by `generateThemeColorsCss`).

---

## 6. Data attribute pipeline

```
SSR layout.tsx                    Client ThemeProvider
─────────────────                 ──────────────────────
reads DB → resolves config        reads CSS vars from computed style
sets on <html>:                   syncs to <html>:
  data-effect-style="glass"         data-effect-style
  data-card-style="glass"           data-card-style
  data-button-variant="ghost"       data-button-variant
  data-navbar-style="blur"          data-navbar-style
  data-card-hover="glow"            data-card-hover
  data-border-width="1px"           data-border-width
  data-theme="cool"                 (already set by InitTheme)
  data-theme-mode="light"           (already set by InitTheme)
```

`ServerThemeInjector` writes the `<style>` tag. `ThemeProvider` re-syncs attributes client-side after hydration to prevent any mismatch.

---

## 7. CSS hooks in your app

To opt elements into the effect pipeline, add these attributes:

| Attribute      | Add to                              | Effect                                              |
| -------------- | ----------------------------------- | --------------------------------------------------- |
| `data-card=""` | main card `<div>`                   | All effect-style rules + hover effects              |
| `data-btn=""`  | `<button>` / `<a>` acting as button | Button variant rules (`brutal`, `pill`, `outlined`) |

Consumer apps that use a CSS class instead of the component (e.g. `className="glass-card"`) are **automatically covered** — the plugin also targets `.glass-card` and `.glass` class selectors in all effect rules.

---

## 8. Conflict resolution

### `.glass-card` / `.glass` utilities (pre-existing in consumer app)

The consumer app defines these utilities in `globals.css` using CSS variable fallbacks:

```css
.glass-card {
  background-color: hsl(var(--card) / var(--card-bg-opacity, 0.75));
  backdrop-filter: var(--card-backdrop-filter, blur(16px));
}
```

**Conflict:** The fallback values (`0.75` opacity, `blur(16px)`) apply a glass look even without a preset.  
**Resolution:** When any `effectStyle` is configured, the plugin sets `--card-bg-opacity` and `--card-backdrop-filter` in `:root` to override those fallbacks. For non-glass effects, it explicitly sets `1.0` and `none`.

**Pre-existing utilities take precedence over the plugin** when no `effectStyle` is configured (null/not set) — the app retains its original glass look by default.

### Tailwind compiled classes on `<Card>`

`card.tsx` ships with `bg-card/90 backdrop-blur-sm text-foreground shadow-xl`. These are compiled Tailwind utilities.  
**Resolution:** Plugin element rules use `!important` to override them. No conflict for the consumer.

### Border radius

Both the plugin and the consumer set border radius CSS variables. The plugin's `applyBorderRadiusRule()` emits `--radius-*` vars inside `:root[data-theme='X']`. The consumer's `tailwind.config.mjs` maps `rounded-*` classes to `var(--radius-*)`.  
**Priority:** Plugin wins because it writes directly to `--radius-*`. No conflict.

### Header / navbar

The consumer's `Header` component may have inline styles or high-specificity selectors. The plugin targets the `header` HTML element with moderate specificity.  
**If header styles don't respond:** Increase specificity or add `data-header=""` to the `<header>` element and update the plugin selector accordingly.

---

## 9. Troubleshooting

### Effect looks the same after changing preset

1. Open DevTools → Elements → inspect `<html>` — verify `data-effect-style` has the new value
2. Open DevTools → Elements → select a `.glass-card` element → inspect Computed styles — verify `backdrop-filter` and `background-color` show the override (not the Tailwind compiled values)
3. If not there: open DevTools → Sources → `theme-critical-css` style element — verify the `html[data-effect-style='...']` rules are present

### Glass effect invisible on white background

Glass (`backdrop-filter: blur`) only shows when there is visible content **behind** the card. Against a solid white `--background`, the blur is invisible. Try:

- Setting a theme with a coloured or gradient background
- Adding a background pattern or image
- Selecting a theme with `data-gradient="true"` enabled

### `data-card` vs `.glass-card` — which should I use?

Use `[data-card]` on the shadcn `<Card>` component (automatically present via `card.tsx`). Use `.glass-card` on custom `<div>` elements. Both are targeted by all effect rules.
