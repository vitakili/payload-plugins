import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { SelectFieldClientProps } from 'payload'
import React from 'react'
import ThemePreviewField from '../../src/fields/ThemePreviewField.js'

const mockSetValue = jest.fn()
const mockDispatchFields = jest.fn()

jest.mock('@payloadcms/ui', () => ({
  useField: jest.fn(() => ({
    value: 'cool',
    setValue: mockSetValue,
  })),
  useForm: jest.fn(() => ({
    dispatchFields: mockDispatchFields,
  })),
  useFormFields: jest.fn((selector) => selector([{}])),
}))

jest.mock('../../src/components/typographyPreviewUtils.js', () => ({
  resolveTypographyPreview: jest.fn(() => ({
    bodyFont: 'Inter',
    headingFont: 'Inter',
    baseFontSize: '16px',
    lineHeight: 1.5,
    bodyLabel: 'Inter',
    headingLabel: 'Inter',
  })),
}))

jest.mock('../../src/index.js', () => ({
  defaultThemePresets: [
    {
      name: 'cool',
      label: 'Cool & Professional',
      borderRadius: 'medium',
      lightMode: {
        primary: '#112233',
        secondary: '#223344',
        accent: '#334455',
        background: '#ffffff',
        foreground: '#000000',
      },
      darkMode: {},
    },
    {
      name: 'neon',
      label: 'Neon Cyberpunk',
      borderRadius: 'medium',
      lightMode: {
        primary: '#ff00ff',
        secondary: '#00ffff',
        accent: '#ff9900',
        background: '#0d0f1a',
        foreground: '#f5f5f5',
      },
      darkMode: {},
    },
  ],
  allThemePresets: [
    {
      name: 'cool',
      label: 'Cool & Professional',
      borderRadius: 'medium',
      lightMode: {
        primary: '#112233',
        secondary: '#223344',
        accent: '#334455',
        background: '#ffffff',
        foreground: '#000000',
      },
      darkMode: {},
    },
    {
      name: 'neon',
      label: 'Neon Cyberpunk',
      borderRadius: 'medium',
      lightMode: {
        primary: '#ff00ff',
        secondary: '#00ffff',
        accent: '#ff9900',
        background: '#0d0f1a',
        foreground: '#f5f5f5',
      },
      darkMode: {},
    },
  ],
}))

jest.mock('../../src/presets.js', () => ({
  defaultThemePresets: [
    {
      name: 'cool',
      label: 'Cool & Professional',
      borderRadius: 'medium',
      lightMode: {
        primary: '#112233',
        secondary: '#223344',
        accent: '#334455',
        background: '#ffffff',
        foreground: '#000000',
      },
      darkMode: {},
    },
    {
      name: 'neon',
      label: 'Neon Cyberpunk',
      borderRadius: 'medium',
      lightMode: {
        primary: '#ff00ff',
        secondary: '#00ffff',
        accent: '#ff9900',
        background: '#0d0f1a',
        foreground: '#f5f5f5',
      },
      darkMode: {},
    },
  ],
  allThemePresets: [
    {
      name: 'cool',
      label: 'Cool & Professional',
      borderRadius: 'medium',
      lightMode: {
        primary: '#112233',
        secondary: '#223344',
        accent: '#334455',
        background: '#ffffff',
        foreground: '#000000',
      },
      darkMode: {},
    },
    {
      name: 'neon',
      label: 'Neon Cyberpunk',
      borderRadius: 'medium',
      lightMode: {
        primary: '#ff00ff',
        secondary: '#00ffff',
        accent: '#ff9900',
        background: '#0d0f1a',
        foreground: '#f5f5f5',
      },
      darkMode: {},
    },
  ],
}))

describe('ThemePreviewField', () => {
  beforeEach(() => {
    mockSetValue.mockClear()
    mockDispatchFields.mockClear()
  })

  const baseProps = {
    field: {
      name: 'themeConfiguration',
      label: 'Theme Configuration',
      type: 'select' as const,
      admin: {
        isSortable: false,
        placeholder: '',
        isClearable: false,
      },
      options: [],
    },
    path: 'themeConfiguration.theme',
  } satisfies Partial<SelectFieldClientProps>

  it('renders theme options with color swatches', () => {
    render(<ThemePreviewField {...(baseProps as SelectFieldClientProps)} />)

    const coolButton = screen.getByRole('button', { name: /Cool & Professional/i })
    const neonButton = screen.getByRole('button', { name: /Neon Cyberpunk/i })

    expect(coolButton).toBeInTheDocument()
    expect(neonButton).toBeInTheDocument()

    const swatches = coolButton.querySelectorAll('[aria-hidden="true"] span')
    expect(swatches.length).toBeGreaterThanOrEqual(5)
  })

  it('updates value and dispatches preset when a theme is selected', async () => {
    render(<ThemePreviewField {...(baseProps as SelectFieldClientProps)} />)

    const neonButton = screen.getByRole('button', { name: /Neon Cyberpunk/i })
    const user = userEvent.setup()
    await user.click(neonButton)

    expect(mockSetValue).toHaveBeenCalledWith('neon')
    expect(mockDispatchFields).toHaveBeenCalled()
  })
})
