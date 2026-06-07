import type { Field, GroupField } from 'payload'

/**
 * Out-of-the-box field builders for adding theme-aware colour controls to ANY
 * Payload collection/block/global — without hand-writing the radio + token-select
 * + colour-picker boilerplate every time.
 *
 * Pair these builders with {@link resolveColorValue} on the front-end to turn the
 * stored value into a ready-to-use CSS colour string.
 */

type LocalizedLabel = string | { [locale: string]: string }

const FIELD_PREFIX = '@kilivi-dev/payloadcms-theme-management/fields'

export type ColorGroupOptions = {
  /** Field label (bilingual object or plain string). */
  label?: LocalizedLabel
  /** Whether the editor starts on the theme token or a custom colour. Default: `'theme'`. */
  defaultSource?: 'theme' | 'custom'
  /** Placeholder shown in the custom colour input. Default: `'#1d4ed8'`. */
  placeholder?: string
  /** Description shown under the custom colour input. */
  customDescription?: LocalizedLabel
  /** Description shown under the theme-token select. */
  themeDescription?: LocalizedLabel
  /** Make the whole group required. */
  required?: boolean
  /** Extra admin.condition applied to the whole group. */
  condition?: GroupField['admin'] extends { condition?: infer C } ? C : never
}

const text = (en: string, cs: string) => ({ en, cs })

/**
 * A theme-aware colour group: editors pick either a colour token from the active
 * theme (rendered with live swatches) or a fully custom HEX/HSL/RGB/CSS value.
 *
 * The stored shape is:
 * ```ts
 * { source: 'theme' | 'custom', themeToken?: string, customColor?: string }
 * ```
 *
 * Resolve it on the front-end with {@link resolveColorValue}.
 *
 * @example
 * ```ts
 * import { createColorGroup } from '@kilivi-dev/payloadcms-theme-management/fields/colorFieldHelpers'
 *
 * fields: [
 *   createColorGroup('sectionBackground', { label: { en: 'Background', cs: 'Pozadí' } }),
 * ]
 * ```
 */
export const createColorGroup = (
  name: string,
  options: ColorGroupOptions = {},
): GroupField => {
  const {
    label,
    defaultSource = 'theme',
    placeholder = '#1d4ed8',
    customDescription = text(
      'HEX, HSL, RGB or CSS variable (e.g. var(--primary))',
      'HEX, HSL, RGB nebo CSS proměnná (např. var(--primary))',
    ),
    themeDescription = text('Pick a color from the active theme', 'Vyberte barvu z aktivního tématu'),
    required,
    condition,
  } = options

  return {
    name,
    type: 'group',
    label: label ?? false,
    admin: condition ? { condition } : undefined,
    fields: [
      {
        name: 'source',
        type: 'radio',
        label: text('Color source', 'Zdroj barvy'),
        defaultValue: defaultSource,
        required,
        options: [
          { label: text('Theme color', 'Barva tématu'), value: 'theme' },
          { label: text('Custom color', 'Vlastní barva'), value: 'custom' },
        ],
        admin: { layout: 'horizontal' },
      },
      {
        name: 'themeToken',
        type: 'text',
        label: text('Theme color token', 'Token barvy tématu'),
        admin: {
          description: themeDescription,
          components: {
            Field: `${FIELD_PREFIX}/ThemeTokenSelectField`,
          },
          condition: (_, siblingData) => siblingData?.source !== 'custom',
        },
      },
      {
        name: 'customColor',
        type: 'text',
        label: text('Custom color', 'Vlastní barva'),
        admin: {
          placeholder,
          description: customDescription,
          components: {
            Field: `${FIELD_PREFIX}/ColorPickerField`,
          },
          condition: (_, siblingData) => siblingData?.source === 'custom',
        },
      },
    ],
  }
}

/**
 * A single, always-custom colour field backed by the visual colour picker.
 * Use when you don't need the theme-token option.
 *
 * @example
 * ```ts
 * createColorField('badgeColor', { label: { en: 'Badge color', cs: 'Barva odznaku' } })
 * ```
 */
export const createColorField = (
  name: string,
  options: { label?: LocalizedLabel; placeholder?: string; description?: LocalizedLabel; required?: boolean } = {},
): Field => ({
  name,
  type: 'text',
  label: options.label ?? false,
  required: options.required,
  admin: {
    placeholder: options.placeholder ?? '#1d4ed8',
    description:
      options.description ??
      text('HEX, HSL, RGB or CSS variable', 'HEX, HSL, RGB nebo CSS proměnná'),
    components: {
      Field: `${FIELD_PREFIX}/ColorPickerField`,
    },
  },
})

/** Shape produced by {@link createColorGroup}. */
export type ColorGroupValue = {
  source?: 'theme' | 'custom' | null
  themeToken?: string | null
  customColor?: string | null
}

/**
 * Turn a stored {@link createColorGroup} value into a CSS colour string.
 *
 * - `source: 'theme'` → `var(--<token>)`
 * - `source: 'custom'` → the raw custom value
 *
 * @param value   The stored group value.
 * @param fallback Returned when nothing usable is set. Defaults to `undefined`.
 *
 * @example
 * ```tsx
 * const bg = resolveColorValue(data.appearance?.sectionBackground, 'var(--background)')
 * <section style={{ background: bg }} />
 * ```
 */
export const resolveColorValue = (
  value: ColorGroupValue | null | undefined,
  fallback?: string,
): string | undefined => {
  if (!value) return fallback

  if (value.source === 'custom') {
    const custom = value.customColor?.trim()
    return custom && custom.length > 0 ? custom : fallback
  }

  // Default to theme token (covers source === 'theme' and unset).
  const token = value.themeToken?.trim()
  if (token && token.length > 0) {
    // Allow callers to store either a bare token (`primary`) or a full expression.
    return token.startsWith('var(') || token.includes('(') || token.startsWith('#')
      ? token
      : `var(--${token})`
  }

  return fallback
}
