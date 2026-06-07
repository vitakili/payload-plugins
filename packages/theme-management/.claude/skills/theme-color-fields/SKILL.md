---
name: theme-color-fields
description: Add theme-aware colour and appearance controls to any Payload collection, block or global using the out-of-the-box helpers from @kilivi-dev/payloadcms-theme-management (createColorGroup, createColorField), and resolve the stored values to CSS on the front-end with resolveColorValue.
---

# Theme-aware colour fields (out of the box)

Use this skill when a component, block, hero or global needs a colour control that
either picks a token from the active theme **or** a custom colour — without
hand-writing the radio + token-select + colour-picker boilerplate.

Import from the `fields/colorFieldHelpers` subpath:

```ts
import {
  createColorGroup,
  createColorField,
  resolveColorValue,
  type ColorGroupValue,
} from '@kilivi-dev/payloadcms-theme-management/fields/colorFieldHelpers'
```

## `createColorGroup(name, options?)`

Renders a radio (Theme color / Custom color) + a live-swatch theme-token select +
a visual colour picker. Stored shape:

```ts
{ source: 'theme' | 'custom', themeToken?: string, customColor?: string }
```

```ts
// In any Field[] array (collection, block, global, group…):
fields: [
  createColorGroup('sectionBackground', {
    label: { en: 'Background color', cs: 'Barva pozadí' },
  }),
  createColorGroup('ctaBg', {
    label: { en: 'Button background', cs: 'Pozadí tlačítka' },
    defaultSource: 'custom',
    placeholder: '#1d4ed8',
  }),
]
```

Options: `label`, `defaultSource` (`'theme'`|`'custom'`, default `'theme'`),
`placeholder`, `customDescription`, `themeDescription`, `required`, `condition`.

## `createColorField(name, options?)`

A single always-custom colour field (visual picker, no theme-token option). Use when
you don't want the token choice.

## Resolve on the front-end: `resolveColorValue(value, fallback?)`

Turns the stored group value into a ready CSS colour string:
- `source: 'theme'` → `var(--<token>)`
- `source: 'custom'` → the raw custom value
- bare tokens (`primary`) become `var(--primary)`; full expressions / `#hex` /
  `var(...)` pass through unchanged.

```tsx
const bg = resolveColorValue(data.appearance?.sectionBackground, 'var(--background)')
return <section style={{ backgroundColor: bg }}>…</section>
```

For button overrides, expose them as CSS variables so utility classes can pick them up:

```ts
const vars: React.CSSProperties = {}
const text = resolveColorValue(cta?.textColor)
const bg = resolveColorValue(cta?.bgColor)
if (text) { vars['--cta-text' as never] = text; vars.color = text }
if (bg) { vars['--cta-bg' as never] = bg; vars.backgroundColor = bg }
```

## Rules of thumb
- Prefer `createColorGroup` over re-implementing the radio/token/picker trio. If you
  find a hand-rolled copy, replace it and re-export the helper for back-compat.
- The token-select and colour-picker are registered field components — after adding
  them to a new collection, run `payload generate:importmap`.
- Always pair the field with `resolveColorValue` on the render side; don't parse
  `source`/`themeToken`/`customColor` by hand.

Related: [theme-management-setup], [theme-live-preview].
