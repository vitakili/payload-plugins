# Extended Theme Presets — v1.2.0

Added in **v1.2.0**: 8 new special-style presets with full OKLCH colour tokens, custom shadow parameters and optional font-family hints.

All presets are included automatically via the `allThemePresets` export — no extra configuration required.

---

## Quick Reference

| Preset key      | Label               | Style family      | Radius    | Signature colour |
| --------------- | ------------------- | ----------------- | --------- | ---------------- |
| `glassmorphism` | Glassmorphism       | Frosted glass     | `1rem`    | Blue–cyan glass  |
| `claymorphism`  | Claymorphism        | Clay/cartoon      | `1.25rem` | Indigo clay      |
| `neumorphism`   | Neumorphism Soft UI | Soft shadows      | `0.75rem` | Slate blue       |
| `aurora`        | Aurora Borealis     | Northern lights   | `0.75rem` | Teal–violet      |
| `luxury`        | Luxury Gold         | Premium/editorial | `0.25rem` | Warm gold        |
| `healthcare`    | Healthcare Clean    | Medical/clinical  | `0.5rem`  | Calm blue        |
| `nordic`        | Nordic Minimal      | Scandinavian      | `0.25rem` | Cold slate blue  |
| `warm-earth`    | Warm Earth Tones    | Organic/natural   | `0.5rem`  | Terracotta       |

---

## Preset Details

### `glassmorphism`

Transparent frosted-glass aesthetic with coloured glows.  
Best combined with `effectStyle: 'glass'`, `backdropBlur: 'medium'` and a gradient hero background.

**Light accent colour:** `oklch(0.60 0.18 250)` — medium blue  
**Dark mode:** Near-opaque dark background with translucent card surfaces  
**Shadow:** Soft blue ambient shadow (`blur: 20px, opacity: 0.15`)  
**Font hint:** system sans-serif

```
Primary (light): oklch(0.60 0.18 250)
Background (light): oklch(0.97 0.015 230)
Card (light): oklch(1 0 0 / 60%)  — alpha transparency
```

---

### `claymorphism`

Chunky coloured drop-shadows that make elements look sculpted from clay.  
Best combined with `effectStyle: 'clay'` and `cardHoverEffect: 'lift'`.

**Light accent colour:** `oklch(0.65 0.20 255)` — bright indigo  
**Shadow:** Hard offset shadow (`offset-x: 4px, offset-y: 8px, spread: 4px, blur: 0`)  
**Radius:** `1.25rem` for soft rounded elements

```
Primary (light): oklch(0.65 0.20 255)
Accent (light): oklch(0.80 0.12 40)   — warm orange
Background (light): oklch(0.96 0.02 200)
```

---

### `neumorphism`

Monochromatic soft-UI with inset/outset shadows matching the surface colour.  
Works best in light mode. Combine with `effectStyle: 'neumorphic'`.

**Base colour:** `oklch(0.93 0.01 240)` — light grey-blue  
**Shadow:** Dual-directional (`offset: 5px/5px, blur: 10px, opacity: 0.5`)  
**Radius:** `0.75rem`

```
Background (light): oklch(0.93 0.01 240)
Card (light): same as background (creates inset illusion)
Primary (light): oklch(0.60 0.16 250)
```

---

### `aurora`

Northern-lights inspired palette — teal meets violet.  
Works well for creative agencies, portfolios or atmospheric landing pages.

**Light primary:** `oklch(0.62 0.18 175)` — teal-green  
**Accent:** `oklch(0.72 0.16 300)` — purple  
**Dark mode:** Deep midnight blue `oklch(0.10 0.04 230)` with vivid teal highlights  
**Shadow:** Subtle teal glow (`blur: 20px, opacity: 0.30`)

```
Primary (light): oklch(0.62 0.18 175)
Secondary (light): oklch(0.88 0.08 300)
Accent (dark): oklch(0.68 0.20 300)
```

---

### `luxury`

Editorial gold-and-dark for premium brands, jewellery or high-end services.  
Includes `font-serif: 'Cormorant Garamond, Georgia, serif'` hint — pair with a serif heading font.

**Primary (light):** `oklch(0.72 0.14 75)` — champagne gold  
**Dark mode:** Rich near-black `oklch(0.10 0.02 60)` with gold highlights  
**Radius:** `0.25rem` — almost square for a stately look  
**Shadow:** Warm gold ambient glow

```
Primary (light): oklch(0.72 0.14 75)
Accent (light): oklch(0.62 0.18 55)   — deep amber
Background (dark): oklch(0.10 0.02 60)
```

---

### `healthcare`

Clean clinical UI suitable for medical portals, appointment systems, health dashboards.  
Maximum legibility, high contrast, calming blue tones.

**Primary:** `oklch(0.55 0.16 218)` — trustworthy blue  
**Accent:** `oklch(0.68 0.14 170)` — teal–green (success/healthy)  
**Shadow:** Very subtle (`opacity: 0.10, blur: 4px`) — keeps focus on content  
**Font hint:** none (uses system UI stack)

```
Primary (light): oklch(0.55 0.16 218)
Background (light): oklch(0.99 0.005 210)   — near white
Accent (light): oklch(0.68 0.14 170)
```

---

### `nordic`

Scandinavian minimalism — cold, restrained, near-black-and-white with an icy accent.  
Includes `font-sans: 'Inter, ui-sans-serif, system-ui, sans-serif'` hint.

**Primary (light):** `oklch(0.42 0.10 225)` — deep slate blue  
**Background:** Slightly blue-tinted white  
**Radius:** `0.25rem` — minimal rounding  
**Shadow:** Extremely subtle (`opacity: 0.12, blur: 3px`)

```
Primary (light): oklch(0.42 0.10 225)
Background (light): oklch(0.97 0.01 220)
Accent (light): oklch(0.65 0.10 195)
```

---

### `warm-earth`

Organic terracotta and olive palette for lifestyle, food, craft or sustainability brands.  
Includes `font-serif: 'Playfair Display, Georgia, serif'` hint.

**Primary (light):** `oklch(0.52 0.12 50)` — warm terracotta  
**Accent:** `oklch(0.68 0.14 145)` — sage green  
**Background (light):** Warm off-white `oklch(0.97 0.025 75)`  
**Radius:** `0.5rem`

```
Primary (light): oklch(0.52 0.12 50)
Accent (light): oklch(0.68 0.14 145)
Secondary (light): oklch(0.88 0.07 85)   — golden straw
```

---

## Pairing Suggestions

| Preset          | `effectStyle` | `cardHoverEffect` | `backgroundPattern` | `buttonVariant` |
| --------------- | ------------- | ----------------- | ------------------- | --------------- |
| `glassmorphism` | `glass`       | `glow`            | `none`              | `ghost`         |
| `claymorphism`  | `clay`        | `lift`            | `none`              | `filled`        |
| `neumorphism`   | `neumorphic`  | `shadow`          | `none`              | `outlined`      |
| `aurora`        | `elevated`    | `glow`            | `dots`              | `gradient`      |
| `luxury`        | `elevated`    | `lift`            | `none`              | `filled`        |
| `healthcare`    | `flat`        | `scale`           | `none`              | `pill`          |
| `nordic`        | `flat`        | `lift`            | `grid`              | `outlined`      |
| `warm-earth`    | `elevated`    | `lift`            | `noise`             | `pill`          |

---

## Using a Preset

```typescript
// payload.config.ts
themeManagementPlugin({
  targetCollection: 'site-settings',
  defaultTheme: 'glassmorphism', // ← use any preset key
})
```

Or let editors pick their preset via the **Theme Selection** field in the Payload admin UI — all presets appear automatically in the dropdown.

---

## Colour Token Format

All 8 new presets use the **OKLCH** colour format (`oklch(L C H)`) which is natively supported in modern browsers (Chrome 111+, Firefox 113+, Safari 16.4+).

If you need legacy HEX fallbacks, use the existing conversion utilities:

```typescript
import { generateThemeColorsCss, hexToHsl } from '@kilivi-dev/payloadcms-theme-management'
```

---

_See also: [APPEARANCE_CONTROLS.md](./APPEARANCE_CONTROLS.md) for the Visual Effects, Hero & Background, and Component Styles configuration fields._
