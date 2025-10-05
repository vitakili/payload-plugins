interface ColorMode {
  background?: string | null
  foreground?: string | null
  card?: string | null
  cardForeground?: string | null
  popover?: string | null
  popoverForeground?: string | null
  primary?: string | null
  primaryForeground?: string | null
  secondary?: string | null
  secondaryForeground?: string | null
  muted?: string | null
  mutedForeground?: string | null
  accent?: string | null
  accentForeground?: string | null
  destructive?: string | null
  destructiveForeground?: string | null
  border?: string | null
  input?: string | null
  ring?: string | null
}

export interface ThemeColors {
  lightMode?: ColorMode
  darkMode?: ColorMode
}

interface GenerateThemeColorsOptions extends ThemeColors {
  themeName?: string
}

const COLOR_VARIABLE_MAP: Array<{ key: keyof ColorMode; variable: string }> = [
  { key: 'background', variable: '--background' },
  { key: 'foreground', variable: '--foreground' },
  { key: 'card', variable: '--card' },
  { key: 'cardForeground', variable: '--card-foreground' },
  { key: 'popover', variable: '--popover' },
  { key: 'popoverForeground', variable: '--popover-foreground' },
  { key: 'primary', variable: '--primary' },
  { key: 'primaryForeground', variable: '--primary-foreground' },
  { key: 'secondary', variable: '--secondary' },
  { key: 'secondaryForeground', variable: '--secondary-foreground' },
  { key: 'muted', variable: '--muted' },
  { key: 'mutedForeground', variable: '--muted-foreground' },
  { key: 'accent', variable: '--accent' },
  { key: 'accentForeground', variable: '--accent-foreground' },
  { key: 'destructive', variable: '--destructive' },
  { key: 'destructiveForeground', variable: '--destructive-foreground' },
  { key: 'border', variable: '--border' },
  { key: 'input', variable: '--input' },
  { key: 'ring', variable: '--ring' },
]

export function hexToHsl(hex: string): string {
  if (!hex) return '0 0% 0%'

  hex = hex.replace('#', '')

  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('')
  }

  const r = Number.parseInt(hex.substring(0, 2), 16) / 255
  const g = Number.parseInt(hex.substring(2, 4), 16) / 255
  const b = Number.parseInt(hex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  h = Math.round(h * 360)
  s = Math.round(s * 100)
  const lRounded = Math.round(l * 100)

  return `${h} ${s}% ${lRounded}%`
}

export function generateColorModeCss(
  colors: ColorMode,
  options: { themeName?: string; isDark?: boolean } = {},
): string {
  if (!colors) return ''

  const { themeName, isDark = false } = options

  const cssVariables = COLOR_VARIABLE_MAP.reduce<string[]>((acc, { key, variable }) => {
    const value = normalizeColor(colors[key])
    if (!value) return acc
    acc.push(`${variable}: hsl(${hexToHsl(value)});`)
    return acc
  }, [])

  if (cssVariables.length === 0) return ''

  const selector = buildSelector(themeName, isDark)
  return `${selector} {
  ${cssVariables.join('\n  ')}
}`
}

export function generateThemeColorsCss(options: GenerateThemeColorsOptions): string {
  const cssBlocks: string[] = []
  const { themeName, lightMode, darkMode } = options

  if (lightMode) {
    const lightModeCss = generateColorModeCss(lightMode, { themeName, isDark: false })
    if (lightModeCss) cssBlocks.push(lightModeCss)
  }

  if (darkMode) {
    const darkModeCss = generateColorModeCss(darkMode, { themeName, isDark: true })
    if (darkModeCss) cssBlocks.push(darkModeCss)
  }

  return cssBlocks.join('\n\n')
}

function buildSelector(themeName: string | undefined, isDark: boolean): string {
  if (themeName) {
    if (isDark) {
      return `:root[data-theme='${themeName}'][data-theme-mode='dark'], .dark[data-theme='${themeName}']`
    }
    return `:root[data-theme='${themeName}']`
  }

  if (isDark) {
    return ":root[data-theme-mode='dark'], .dark"
  }

  return ':root'
}

function normalizeColor(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length === 0 ? null : trimmed
}
