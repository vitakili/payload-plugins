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
      expect(screen.getByRole('button', { name: /^Theme background$/i })).toBeDefined()
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

  it('prefers tenant from form values over cookie (string path)', async () => {
    jest.resetAllMocks()
    // re-set index mocks after resetAllMocks
    const indexMock = require('../../src/index.js')
    indexMock.fetchThemeConfiguration = jest.fn(async (opts: any) => ({
      lightMode: {
        primary: '#112233',
        background: '#ffffff',
      },
    }))
    indexMock.allThemePresets = [
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
    ]

    const useFieldMock = require('@payloadcms/ui').useField as jest.Mock
    useFieldMock.mockImplementation(({ path }: { path: string }) => {
      if (path === 'themeConfiguration') return { value: null }
      if (path === 'tenant') return { value: 'FormTenant' }
      return { value: undefined, setValue: mockSetValue }
    })

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
            // simulate empty object provided by consumer
            fetchThemeConfigurationOptions: {},
          },
        },
      },
    } as unknown as SelectFieldClientProps

    render(<ThemeTokenSelectField {...props} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Theme background$/i })).toBeDefined()
    })

    const { fetchThemeConfiguration } = await import('../../src/index.js')
    const calledWith = (fetchThemeConfiguration as jest.Mock).mock.calls[0][0]
    expect(calledWith.tenantSlug === 'FormTenant' || calledWith.tenantSlug === 'formtenant').toBe(
      true,
    )
  })

  it('prefers tenant from form relation object (id) over cookie', async () => {
    jest.resetAllMocks()
    // re-set index mocks after resetAllMocks
    const indexMock = require('../../src/index.js')
    indexMock.fetchThemeConfiguration = jest.fn(async (opts: any) => ({
      lightMode: {
        primary: '#112233',
        background: '#ffffff',
      },
    }))
    indexMock.allThemePresets = [
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
    ]

    const useFieldMock = require('@payloadcms/ui').useField as jest.Mock
    useFieldMock.mockImplementation(({ path }: { path: string }) => {
      if (path === 'themeConfiguration') return { value: null }
      if (path === 'tenant') return { value: { id: 'tenant-123' } }
      return { value: undefined, setValue: mockSetValue }
    })

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

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Theme background$/i })).toBeDefined()
    })

    const { fetchThemeConfiguration } = await import('../../src/index.js')
    const calledWith = (fetchThemeConfiguration as jest.Mock).mock.calls[0][0]
    expect(calledWith.tenantSlug === 'tenant-123').toBe(true)
  })

  it('prefers form tenant id over slug when both present', async () => {
    jest.resetAllMocks()
    // re-set index mocks after resetAllMocks
    const indexMock = require('../../src/index.js')
    indexMock.fetchThemeConfiguration = jest.fn(async (opts: any) => ({
      lightMode: {
        primary: '#112233',
        background: '#ffffff',
      },
    }))
    indexMock.allThemePresets = [
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
    ]

    const useFieldMock = require('@payloadcms/ui').useField as jest.Mock
    useFieldMock.mockImplementation(({ path }: { path: string }) => {
      if (path === 'themeConfiguration') return { value: null }
      if (path === 'tenant') return { value: { id: 'tenant-456', slug: 'my-slug' } }
      return { value: undefined, setValue: mockSetValue }
    })

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

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Theme background$/i })).toBeDefined()
    })

    const { fetchThemeConfiguration: fetch2 } = await import('../../src/index.js')
    const calledWith2 = (fetch2 as jest.Mock).mock.calls[0][0]
    expect(calledWith2.tenantSlug === 'tenant-456').toBe(true)
  })

  it('applies inferred tenant when custom.fetchThemeConfigurationOptions is an empty object', async () => {
    jest.resetAllMocks()
    const indexMock = require('../../src/index.js')
    indexMock.fetchThemeConfiguration = jest.fn(async (opts: any) => ({
      lightMode: {
        primary: '#112233',
        background: '#ffffff',
      },
    }))
    indexMock.allThemePresets = [
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
    ]

    const useFieldMock = require('@payloadcms/ui').useField as jest.Mock
    useFieldMock.mockImplementation(({ path }: { path: string }) => {
      if (path === 'themeConfiguration') return { value: null }
      if (path === 'tenant') return { value: 'FormTenant' }
      return { value: undefined, setValue: mockSetValue }
    })

    const props = {
      path: 'header.tokens',
      field: {
        name: 'tokens',
        label: 'Theme Tokens',
        type: 'select' as const,
        options: [],
        admin: {
          custom: {
            fetchThemeConfigurationOptions: {},
          },
        },
      },
    } as unknown as SelectFieldClientProps

    render(<ThemeTokenSelectField {...props} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Theme background$/i })).toBeDefined()
    })

    const { fetchThemeConfiguration: fetch3 } = await import('../../src/index.js')
    const calledWith3 = (fetch3 as jest.Mock).mock.calls[0][0]
    expect(calledWith3.tenantSlug === 'FormTenant').toBe(true)
  })
})
