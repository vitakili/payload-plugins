import { render, screen, waitFor } from '@testing-library/react'
import type { SelectFieldClientProps } from 'payload'
import React from 'react'
import ThemeTokenSelectField from '../../src/fields/ThemeTokenSelectField.js'

const mockSetValue = jest.fn()

jest.mock('@payloadcms/ui', () => ({
  useField: jest.fn(({ path }: { path: string }) => {
    // Return a themeConfiguration for path === 'themeConfiguration' when needed in tests
    if (path === 'themeConfiguration') return { value: null }
    return { value: undefined, setValue: mockSetValue }
  }),
}))

jest.mock('../../src/index.js', () => ({
  fetchThemeConfiguration: jest.fn(async (opts: any) => {
    return {
      lightMode: {
        primary: '#112233',
        background: '#ffffff',
      },
    }
  }),
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
  ],
}))

describe('ThemeTokenSelectField', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    // set cookie include payload-tenant
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'payload-tenant=Silverigo; other=1',
    })
  })

  it.skip('passes inferred tenant from cookie to fetchThemeConfiguration', async () => {
    const props = {
      path: 'header.tokens',
      field: {
        name: 'tokens',
        label: 'Theme Tokens',
        type: 'select' as const,
        options: [],
        admin: {
          custom: {
            collectionSlug: 'header',
          },
        },
      },
    } as unknown as SelectFieldClientProps

    render(<ThemeTokenSelectField {...props} />)

    // Wait for async effect to complete and DOM to update
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Theme background|Background/i })).toBeDefined()
    })

    // Verify fetchThemeConfiguration called and tenant param included
    const { fetchThemeConfiguration } = await import('../../src/index.js')
    expect(fetchThemeConfiguration).toHaveBeenCalled()
    const calledWith = (fetchThemeConfiguration as jest.Mock).mock.calls[0][0]
    expect(calledWith).toBeDefined()
    expect(calledWith.tenantSlug === 'Silverigo' || calledWith.tenantSlug === 'silverigo').toBe(
      true,
    )
  })
})
