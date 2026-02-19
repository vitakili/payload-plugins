import type { CollectionConfig, Config, Field, GlobalConfig, Plugin, TabsField } from 'payload'
import { createThemeConfigurationField } from './fields/themeConfigurationField.js'
import type { ThemeTab } from './fields/themeConfigurationField.js'
import type { SiteThemeConfiguration } from './payload-types.js'
import type { ThemePreset } from './presets.js'
import { allThemePresets } from './presets.js'
import { getTranslations, translations } from './translations.js'
import type {
  FetchThemeConfigurationOptions,
  ThemeManagementLivePreviewOptions,
  ThemeManagementLivePreviewUrlArgs,
  ThemeManagementPluginOptions,
} from './types.js'

const THEME_FIELD_NAME = 'themeConfiguration'

/**
 * Removes existing theme configuration from a group field (legacy)
 */
const removeExistingThemeField = (fields: Field[] = []): Field[] =>
  fields.filter((field) => {
    const candidate = field as { name?: unknown }
    return candidate?.name !== THEME_FIELD_NAME
  })

/**
 * Finds the tabs field in the collection fields array
 */
const findTabsField = (fields: Field[] = []): TabsField | null => {
  for (const field of fields) {
    if (field.type === 'tabs') {
      return field as TabsField
    }
  }
  return null
}

/**
 * Removes existing Appearance Settings tab if it exists
 */
const removeExistingThemeTab = (
  tabs: NonNullable<TabsField['tabs']>,
): NonNullable<TabsField['tabs']> => {
  const knownLabels = Object.values(translations).map((t) => t.tabLabel)
  return tabs.filter((tab) => {
    // Normalize label to string (support localized object or plain string)
    let labelValues: string[] = []
    if (typeof tab.label === 'object' && tab.label !== null) {
      labelValues = Object.values(tab.label as Record<string, string>)
    } else if (typeof tab.label === 'string') {
      labelValues = [tab.label]
    }

    // If any of the label values match a known plugin tab label, remove it
    const matchesKnown = labelValues.some((v) => knownLabels.includes(v))

    return !matchesKnown
  })
}

/**
 * Injects theme tab into existing tabs field
 */
const injectThemeTab = (
  fields: Field[] | undefined,
  themeTab: ThemeTab,
  enableLogging: boolean,
): Field[] => {
  // First, remove any legacy theme field (group-based)
  const sanitizedFields = removeExistingThemeField(fields ?? [])

  // Find the tabs field
  const tabsField = findTabsField(sanitizedFields)

  if (!tabsField || !tabsField.tabs) {
    if (enableLogging) {
      console.warn(
        '🎨 Theme Management Plugin: No tabs field found. Creating a new tabs structure.',
      )
    }

    // If no tabs exist, create a basic tabs structure with just the theme tab
    const newTabsField: TabsField = {
      type: 'tabs',
      tabs: [themeTab],
    }

    return [...sanitizedFields, newTabsField]
  }

  // Remove existing theme tab if present
  const sanitizedTabs = removeExistingThemeTab(tabsField.tabs)

  // Add theme tab to the end
  const updatedTabs = [...sanitizedTabs, themeTab]

  if (enableLogging) {
    console.log('🎨 Theme Management Plugin: injecting Appearance Settings tab')
  }

  // Update the tabs field
  const updatedTabsField: TabsField = {
    ...tabsField,
    tabs: updatedTabs,
  }

  // Replace the old tabs field with the updated one
  return sanitizedFields.map((field) => (field.type === 'tabs' ? updatedTabsField : field))
}

const ensureCollectionsArray = (collections: Config['collections']): CollectionConfig[] =>
  Array.isArray(collections) ? collections : []

const ensureEndpointsArray = (endpoints: Config['endpoints']): NonNullable<Config['endpoints']> =>
  Array.isArray(endpoints) ? endpoints : []

type NormalizedLivePreviewOptions = {
  enabled: boolean
  injectRoute: boolean
  routePath: string
  pageCollection: string
  pageSlug: string
  fallbackToFirstPage: boolean
  tenantField: string
  tenantQueryParam: string
  breakpoints?: ThemeManagementLivePreviewOptions['breakpoints']
  url?: ThemeManagementLivePreviewOptions['url']
}

type NormalizedCacheRevalidationOptions = {
  enabled: boolean
  injectRoute: boolean
  routePath: string
  secret?: string
  tags: string[]
  paths: string[]
}

type MinimalPayloadRequest = ThemeManagementLivePreviewUrlArgs['req']

const normalizeLivePreviewOptions = (
  livePreview: ThemeManagementPluginOptions['livePreview'],
): NormalizedLivePreviewOptions => {
  if (livePreview === false) {
    return {
      enabled: false,
      injectRoute: false,
      routePath: '/theme/preview',
      pageCollection: 'pages',
      pageSlug: 'home',
      fallbackToFirstPage: true,
      tenantField: 'tenant',
      tenantQueryParam: 'tenant',
      breakpoints: undefined,
    }
  }

  const raw = typeof livePreview === 'object' && livePreview ? livePreview : {}

  return {
    enabled: raw.enabled ?? true,
    injectRoute: raw.injectRoute ?? false,
    routePath: normalizeRoutePath(raw.routePath),
    pageCollection: raw.pageCollection ?? 'pages',
    pageSlug: raw.pageSlug ?? 'home',
    fallbackToFirstPage: raw.fallbackToFirstPage ?? true,
    tenantField: raw.tenantField ?? 'tenant',
    tenantQueryParam: raw.tenantQueryParam ?? 'tenant',
    breakpoints: raw.breakpoints,
    url: raw.url,
  }
}

const dedupeStrings = (values: (string | undefined)[]): string[] => [
  ...new Set(
    values.filter((value): value is string => typeof value === 'string' && value.trim().length > 0),
  ),
]

const normalizeRoutePath = (path: string | undefined): string => {
  if (!path || !path.trim()) {
    return '/theme/revalidate'
  }

  return path.startsWith('/') ? path : `/${path}`
}

const normalizeCacheRevalidationOptions = (args: {
  cacheRevalidation: ThemeManagementPluginOptions['cacheRevalidation']
  standaloneCollectionSlug: string
  useStandaloneCollection: boolean
}): NormalizedCacheRevalidationOptions => {
  const { cacheRevalidation, standaloneCollectionSlug, useStandaloneCollection } = args

  if (cacheRevalidation === false) {
    return {
      enabled: false,
      injectRoute: false,
      routePath: '/theme/revalidate',
      tags: [],
      paths: [],
    }
  }

  const raw = typeof cacheRevalidation === 'object' && cacheRevalidation ? cacheRevalidation : {}
  const defaultTag = `global_${standaloneCollectionSlug}`

  return {
    enabled: raw.enabled ?? useStandaloneCollection,
    injectRoute: raw.injectRoute ?? true,
    routePath: normalizeRoutePath(raw.routePath),
    secret: raw.secret,
    tags: dedupeStrings([defaultTag, ...(raw.tags ?? [])]),
    paths: dedupeStrings(raw.paths ?? []),
  }
}

const asRecord = (value: unknown): Record<string, unknown> | undefined => {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>
  }
  return undefined
}

const pickString = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim()) return value
  return undefined
}

const extractTenantValue = (value: unknown): string | undefined => {
  if (!value) return undefined
  if (typeof value === 'string') return pickString(value)

  const tenantRecord = asRecord(value)
  if (!tenantRecord) return undefined

  return (
    pickString(tenantRecord.id) ??
    pickString(tenantRecord.slug) ??
    pickString(tenantRecord.value) ??
    pickString(tenantRecord.tenant)
  )
}

const resolveTenantSlug = (
  req: MinimalPayloadRequest,
  tenantField: string,
  data?: Record<string, unknown>,
): string | undefined => {
  const fromData = extractTenantValue(data?.[tenantField])
  if (fromData) return fromData

  const query = req.query
  if (query && typeof URLSearchParams !== 'undefined' && query instanceof URLSearchParams) {
    return (
      pickString(query.get('tenant')) ??
      pickString(query.get('tenantSlug')) ??
      pickString(query.get('tenantId'))
    )
  }

  const queryRecord = asRecord(query)
  const fromQuery =
    extractTenantValue(queryRecord?.tenant) ??
    extractTenantValue(queryRecord?.tenantSlug) ??
    extractTenantValue(queryRecord?.tenantId)
  if (fromQuery) return fromQuery

  const userRecord = asRecord(req.user)
  const fromUser =
    extractTenantValue(userRecord?.[tenantField]) ??
    extractTenantValue(userRecord?.tenant) ??
    extractTenantValue(userRecord?.tenantSlug)
  if (fromUser) return fromUser

  const headers = req.headers
  if (headers && typeof Headers !== 'undefined' && headers instanceof Headers) {
    return (
      pickString(headers.get('x-tenant-id')) ??
      pickString(headers.get('x-tenant')) ??
      pickString(headers.get('payload-tenant'))
    )
  }

  const headerRecord = asRecord(headers)
  return (
    extractTenantValue(headerRecord?.['x-tenant-id']) ??
    extractTenantValue(headerRecord?.['x-tenant']) ??
    extractTenantValue(headerRecord?.['payload-tenant'])
  )
}

const buildDefaultPreviewPath = (
  pageSlug: string,
  tenantSlug: string | undefined,
  tenantQueryParam: string,
): string => {
  const normalizedSlug = pageSlug === 'home' ? '' : pageSlug
  const basePath = normalizedSlug ? `/${normalizedSlug}` : '/'

  if (!tenantSlug) {
    return basePath
  }

  const separator = basePath.includes('?') ? '&' : '?'
  return `${basePath}${separator}${tenantQueryParam}=${encodeURIComponent(tenantSlug)}`
}

const resolveLivePreviewUrl = async (args: {
  req: MinimalPayloadRequest
  data?: Record<string, unknown>
  livePreview: NormalizedLivePreviewOptions
  enableLogging: boolean
}): Promise<string> => {
  const { req, data, livePreview, enableLogging } = args

  const tenantSlug = resolveTenantSlug(req, livePreview.tenantField, data)

  const tenantWhere = tenantSlug
    ? {
        [livePreview.tenantField]: {
          equals: tenantSlug,
        },
      }
    : undefined

  const homeWhere = {
    and: [
      {
        slug: {
          equals: livePreview.pageSlug,
        },
      },
      ...(tenantWhere ? [tenantWhere] : []),
    ],
  }

  try {
    const preferredPageResponse = await req.payload.find({
      collection: livePreview.pageCollection,
      where: homeWhere,
      depth: 0,
      draft: true,
      limit: 1,
      overrideAccess: true,
      pagination: false,
    })

    let page = preferredPageResponse?.docs?.[0]

    if (!page && livePreview.fallbackToFirstPage) {
      const fallbackResponse = await req.payload.find({
        collection: livePreview.pageCollection,
        where: tenantWhere,
        depth: 0,
        draft: true,
        limit: 1,
        overrideAccess: true,
        pagination: false,
      })

      page = fallbackResponse?.docs?.[0]
    }

    const pageRecord = asRecord(page)
    const resolvedPageSlug = pickString(pageRecord?.slug) ?? livePreview.pageSlug

    if (livePreview.url) {
      return await livePreview.url({
        page: pageRecord,
        pageSlug: resolvedPageSlug,
        tenantSlug,
        req,
      })
    }

    return buildDefaultPreviewPath(resolvedPageSlug, tenantSlug, livePreview.tenantQueryParam)
  } catch (error) {
    if (enableLogging) {
      req.payload.logger?.warn?.(
        '🎨 Theme Management Plugin: live preview URL fallback used',
        error,
      )
    }

    return buildDefaultPreviewPath(livePreview.pageSlug, tenantSlug, livePreview.tenantQueryParam)
  }
}

const createPreviewAdminConfig = (
  normalizedLivePreview: NormalizedLivePreviewOptions,
  enableLogging: boolean,
) => {
  if (!normalizedLivePreview.enabled) {
    return {}
  }

  return {
    livePreview: {
      breakpoints: normalizedLivePreview.breakpoints,
      url: ({ data, req }: { data?: unknown; req: unknown }) =>
        resolveLivePreviewUrl({
          req: req as MinimalPayloadRequest,
          data: asRecord(data),
          livePreview: normalizedLivePreview,
          enableLogging,
        }),
    },
    preview: (data: Record<string, unknown>, options: { req?: unknown }) => {
      const req = options?.req
      if (!req) return null

      return resolveLivePreviewUrl({
        req: req as MinimalPayloadRequest,
        data,
        livePreview: normalizedLivePreview,
        enableLogging,
      })
    },
  }
}

const readSecretFromRequest = async (req: unknown): Promise<string | undefined> => {
  const requestRecord = asRecord(req)
  const headersValue = requestRecord?.headers

  if (headersValue && typeof Headers !== 'undefined' && headersValue instanceof Headers) {
    return (
      pickString(headersValue.get('x-theme-revalidate-secret')) ??
      pickString(headersValue.get('x-revalidate-secret'))
    )
  }

  const headerRecord = asRecord(headersValue)
  const fromHeaders =
    pickString(headerRecord?.['x-theme-revalidate-secret']) ??
    pickString(headerRecord?.['x-revalidate-secret'])
  if (fromHeaders) {
    return fromHeaders
  }

  const requestWithJson = req as { json?: () => Promise<unknown> }
  const body =
    typeof requestWithJson?.json === 'function' ? await requestWithJson.json() : undefined
  const bodyRecord = asRecord(body)
  const fromBody = pickString(bodyRecord?.secret)
  if (fromBody) {
    return fromBody
  }

  const queryRecord = asRecord(requestRecord?.query)
  return pickString(queryRecord?.secret)
}

const executeThemeRevalidation = async (options: {
  tags: string[]
  paths: string[]
  enableLogging: boolean
  logger?: { info?: (...args: any[]) => void; error?: (...args: any[]) => void }
}): Promise<{ tags: string[]; paths: string[] }> => {
  const { tags, paths, enableLogging, logger } = options

  try {
    const { revalidatePath, revalidateTag } = await import('next/cache')

    tags.forEach((tag) => revalidateTag(tag))
    paths.forEach((path) => revalidatePath(path))

    if (enableLogging) {
      logger?.info?.(
        `🎨 Theme Management Plugin: revalidated cache tags=[${tags.join(', ')}] paths=[${paths.join(', ')}]`,
      )
    }
  } catch (error) {
    if (enableLogging) {
      logger?.error?.('🎨 Theme Management Plugin: cache invalidation failed:', error)
    }
    throw error
  }

  return { tags, paths }
}

const readQueryStringFromRequest = (req: unknown, paramName: string): string | undefined => {
  const reqRecord = asRecord(req)

  // Try URLSearchParams from native fetch/Node.js
  const queryValue = reqRecord?.query
  if (
    queryValue &&
    typeof URLSearchParams !== 'undefined' &&
    queryValue instanceof URLSearchParams
  ) {
    return pickString(queryValue.get(paramName))
  }

  // Try object form (common in Payload)
  const queryRecord = asRecord(queryValue)
  if (queryRecord) {
    const rawValue = queryRecord[paramName]
    if (Array.isArray(rawValue)) {
      return pickString(rawValue[0])
    }
    return pickString(rawValue)
  }

  // Try manual URL parsing as fallback
  const urlValue = pickString(reqRecord?.url) ?? pickString(reqRecord?.originalUrl)
  if (urlValue) {
    try {
      const url = new URL(urlValue, 'http://localhost')
      return pickString(url.searchParams.get(paramName))
    } catch {
      // Ignore parse errors
    }
  }

  return undefined
}

const createLivePreviewEndpoint = (options: {
  livePreview: NormalizedLivePreviewOptions
  enableLogging: boolean
}) => {
  const { livePreview, enableLogging } = options

  if (!livePreview.enabled || !livePreview.injectRoute) {
    return null
  }

  return {
    path: livePreview.routePath,
    method: 'get',
    handler: async (req: unknown) => {
      const previewSecret = process.env.PREVIEW_SECRET ?? process.env.PAYLOAD_PREVIEW_SECRET

      if (previewSecret) {
        const providedSecret =
          readQueryStringFromRequest(req, 'previewSecret') ??
          readQueryStringFromRequest(req, 'preview')
        if (providedSecret !== previewSecret) {
          return jsonResponse({ error: 'Unauthorized' }, 401)
        }
      }

      const pageSlug = readQueryStringFromRequest(req, 'pageSlug') ?? livePreview.pageSlug
      const tenantSlug = readQueryStringFromRequest(req, 'tenant')

      // Redirect to the actual client page (standard Payload live preview behavior)
      const destination = buildDefaultPreviewPath(
        pageSlug,
        tenantSlug,
        livePreview.tenantQueryParam,
      )

      if (enableLogging) {
        console.log('🎨 Theme Management Plugin: live preview redirect', destination)
      }

      return {
        status: 307,
        headers: {
          Location: destination,
        },
      }
    },
  }
}

const createCacheRevalidationEndpoint = (options: {
  cacheRevalidation: NormalizedCacheRevalidationOptions
  enableLogging: boolean
}) => {
  const { cacheRevalidation, enableLogging } = options

  if (!cacheRevalidation.enabled || !cacheRevalidation.injectRoute) {
    return null
  }

  return {
    path: cacheRevalidation.routePath,
    method: 'post',
    handler: async (req: unknown) => {
      const reqRecord = asRecord(req)
      const payload = asRecord(reqRecord?.payload)
      const logger = payload?.logger as
        | { info?: (...args: any[]) => void; error?: (...args: any[]) => void }
        | undefined

      if (cacheRevalidation.secret) {
        const providedSecret = await readSecretFromRequest(req)
        if (providedSecret !== cacheRevalidation.secret) {
          return jsonResponse({ error: 'Unauthorized' }, 401)
        }
      }

      try {
        const result = await executeThemeRevalidation({
          tags: cacheRevalidation.tags,
          paths: cacheRevalidation.paths,
          enableLogging,
          logger,
        })

        return jsonResponse({ ok: true, revalidated: result })
      } catch {
        return jsonResponse({ ok: false, error: 'Revalidation failed' }, 500)
      }
    },
  }
}

const mergeEndpoint = (
  endpoints: NonNullable<Config['endpoints']>,
  endpoint: unknown,
): NonNullable<Config['endpoints']> => {
  if (!endpoint) {
    return endpoints
  }

  const record = endpoint as unknown as { path?: string; method?: string }

  const withoutExisting = endpoints.filter((candidate) => {
    const candidateRecord = candidate as unknown as { path?: string; method?: string }
    return !(
      candidateRecord?.path === record?.path &&
      typeof candidateRecord.method === 'string' &&
      typeof record.method === 'string' &&
      candidateRecord.method.toLowerCase() === record.method.toLowerCase()
    )
  })

  return [...withoutExisting, endpoint as unknown as NonNullable<Config['endpoints']>[number]]
}

const jsonResponse = (body: Record<string, unknown>, status = 200): unknown => {
  if (typeof Response !== 'undefined' && typeof Response.json === 'function') {
    return Response.json(body, { status })
  }

  return {
    status,
    json: async () => body,
  }
}

export const themeManagementPlugin = (options: ThemeManagementPluginOptions = {}): Plugin => {
  return (config: Config): Config => {
    const {
      enabled = true,
      targetCollection = 'site-settings',
      useStandaloneCollection = false,
      standaloneCollectionSlug = 'appearance-settings',
      // Allow either string or localized object; default comes from plugin translations
      standaloneCollectionLabel = getTranslations().standaloneCollectionLabel,
      themePresets = allThemePresets,
      defaultTheme = 'cool',
      includeColorModeToggle = true,
      includeCustomCSS = true,
      includeBrandIdentity = false,
      enableAdvancedFeatures = true,
      enableLogging = false,
      livePreview = true,
      cacheRevalidation,
    } = options

    const normalizedLivePreview = normalizeLivePreviewOptions(livePreview)
    const normalizedCacheRevalidation = normalizeCacheRevalidationOptions({
      cacheRevalidation,
      standaloneCollectionSlug,
      useStandaloneCollection,
    })

    if (!enabled) {
      if (enableLogging) {
        console.log('🎨 Theme Management Plugin: disabled via options, skipping.')
      }
      return config
    }

    const themeTab = createThemeConfigurationField({
      themePresets,
      defaultTheme,
      includeColorModeToggle,
      includeCustomCSS,
      includeBrandIdentity: includeBrandIdentity ?? false,
      enableAdvancedFeatures,
      useThemePreviewField: !normalizedLivePreview.enabled,
    })

    // If using standalone collection, create a new global
    if (useStandaloneCollection) {
      if (enableLogging) {
        console.log(
          `🎨 Theme Management Plugin: creating standalone global "${standaloneCollectionSlug}"`,
        )
      }

      // Extract the fields from the tab directly (no wrapping in group)
      const tabFields = (themeTab.fields ?? []) as Field[]

      /**
       * Hook to auto-populate lightMode and darkMode colors when theme changes
       */
      type BeforeChangeArgs = {
        data?: {
          themeConfiguration?: {
            theme?: string
            lightMode?: Record<string, unknown>
            darkMode?: Record<string, unknown>
          }
        }
      }

      const beforeChangeHook = async (args: BeforeChangeArgs) => {
        const { data } = args

        // If theme is being changed, auto-populate color modes
        if (data?.themeConfiguration?.theme) {
          const themeName = data.themeConfiguration.theme
          const selectedPreset = themePresets.find((p) => p.name === themeName)

          if (selectedPreset) {
            // Initialize light and dark mode colors from preset if not already set
            if (!data.themeConfiguration.lightMode) {
              data.themeConfiguration.lightMode = {}
            }
            if (!data.themeConfiguration.darkMode) {
              data.themeConfiguration.darkMode = {}
            }

            // Only populate if not manually edited (first time or empty)
            const isLightModeEmpty = !data.themeConfiguration.lightMode?.background
            const isDarkModeEmpty = !data.themeConfiguration.darkMode?.background

            if (isLightModeEmpty && selectedPreset.lightMode) {
              data.themeConfiguration.lightMode = { ...selectedPreset.lightMode }
            }

            if (isDarkModeEmpty && selectedPreset.darkMode) {
              data.themeConfiguration.darkMode = { ...selectedPreset.darkMode }
            }
          }
        }

        return data
      }

      const standaloneGlobal: GlobalConfig = {
        slug: standaloneCollectionSlug,
        label: standaloneCollectionLabel,
        admin: {
          group: 'Settings',
          ...createPreviewAdminConfig(normalizedLivePreview, enableLogging),
        },
        // Provide a broad access object but cast to GlobalConfig['access'] to satisfy types
        access: ((): GlobalConfig['access'] => {
          const accessObj = {
            read: () => true,
            create: ({ req }: { req?: { user?: unknown } }) => !!req?.user,
            update: ({ req }: { req?: { user?: unknown } }) => !!req?.user,
            delete: ({ req }: { req?: { user?: unknown } }) => !!req?.user,
          } as unknown as GlobalConfig['access']
          return accessObj
        })(),
        fields: tabFields,
        hooks: {
          beforeChange: [beforeChangeHook],
          afterChange: [
            async ({ doc, req }) => {
              // Invalidate cache after appearance settings change
              if (!req?.context?.disableRevalidate && normalizedCacheRevalidation.enabled) {
                try {
                  await executeThemeRevalidation({
                    tags: normalizedCacheRevalidation.tags,
                    paths: normalizedCacheRevalidation.paths,
                    enableLogging,
                    logger: req?.payload?.logger,
                  })
                } catch {
                  // no-op: logging is handled in executeThemeRevalidation
                }
              }
              return doc
            },
          ],
        },
      }

      const globals = Array.isArray(config.globals) ? config.globals : []

      // Check if global already exists
      const existingIndex = globals.findIndex((g) => g.slug === standaloneCollectionSlug)

      if (existingIndex !== -1) {
        if (enableLogging) {
          console.warn(
            `🎨 Theme Management Plugin: global "${standaloneCollectionSlug}" already exists, skipping creation.`,
          )
        }
        return config
      }

      const currentEndpoints = ensureEndpointsArray(config.endpoints)
      const livePreviewEndpoint = createLivePreviewEndpoint({
        livePreview: normalizedLivePreview,
        enableLogging,
      })
      let endpoints = mergeEndpoint(currentEndpoints, livePreviewEndpoint)
      const cacheEndpoint = createCacheRevalidationEndpoint({
        cacheRevalidation: normalizedCacheRevalidation,
        enableLogging,
      })
      endpoints = mergeEndpoint(endpoints, cacheEndpoint)

      return {
        ...config,
        endpoints,
        globals: [...globals, standaloneGlobal],
      }
    }

    // Otherwise, add as tab to existing collection
    let collectionTouched = false

    const collections = ensureCollectionsArray(config.collections).map((collection) => {
      if (collection.slug !== targetCollection) {
        return collection
      }

      collectionTouched = true

      if (enableLogging) {
        console.log(`🎨 Theme Management Plugin: enhancing collection "${collection.slug}"`)
      }

      const existingFields = Array.isArray(collection.fields) ? collection.fields : []

      const fields = injectThemeTab(existingFields, themeTab, enableLogging)

      const admin = {
        ...collection.admin,
        ...createPreviewAdminConfig(normalizedLivePreview, enableLogging),
      }

      return {
        ...collection,
        fields,
        admin,
      }
    })

    if (!collectionTouched) {
      if (enableLogging) {
        console.warn(
          `🎨 Theme Management Plugin: collection "${targetCollection}" was not found, leaving config untouched.`,
        )
      }
      return config
    }

    const currentEndpoints = ensureEndpointsArray(config.endpoints)
    const livePreviewEndpoint = createLivePreviewEndpoint({
      livePreview: normalizedLivePreview,
      enableLogging,
    })
    let endpoints = mergeEndpoint(currentEndpoints, livePreviewEndpoint)
    const cacheEndpoint = createCacheRevalidationEndpoint({
      cacheRevalidation: normalizedCacheRevalidation,
      enableLogging,
    })
    endpoints = mergeEndpoint(endpoints, cacheEndpoint)

    return {
      ...config,
      endpoints,
      collections,
    }
  }
}

type FetchOptionsInput = string | FetchThemeConfigurationOptions

export const fetchThemeConfiguration = async (
  options?: FetchOptionsInput,
): Promise<SiteThemeConfiguration | null> => {
  const normalizedOptions = typeof options === 'string' ? { tenantSlug: options } : (options ?? {})

  const {
    tenantSlug,
    collectionSlug = 'site-settings', // Can be overridden to 'appearance-settings' if using standalone
    depth,
    locale,
    draft,
    queryParams = {},
    useGlobal = false, // Set to true if using standalone global instead of collection
  } = normalizedOptions

  try {
    if (useGlobal) {
      // Fetch from global endpoint
      const params = new URLSearchParams()

      if (typeof depth === 'number') params.set('depth', String(depth))
      // For globals, keep tenant param for backwards compatibility, and also add where[...] filter
      if (tenantSlug) {
        params.set('tenant', tenantSlug)
        params.set('where[tenant][equals]', String(tenantSlug))
      }

      Object.entries(queryParams).forEach(([key, value]) => {
        if (value === undefined) return
        params.set(key, String(value))
      })

      const queryString = params.toString()
      const url = `/api/globals/${collectionSlug}${queryString ? `?${queryString}` : ''}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch theme global (status ${response.status})`)
      }

      const data = (await response.json()) as {
        themeConfiguration?: SiteThemeConfiguration
      }

      return data?.themeConfiguration ?? null
    } else {
      // Fetch from collection endpoint (legacy/default behavior)
      const params = new URLSearchParams({ limit: '1' })

      if (typeof depth === 'number') params.set('depth', String(depth))
      // For collections, use a where[tenant][equals] filter so Payload's find endpoint applies tenant scoping
      if (tenantSlug) params.set('where[tenant][equals]', String(tenantSlug))
      if (locale) params.set('locale', locale)
      if (draft) params.set('draft', 'true')

      Object.entries(queryParams).forEach(([key, value]) => {
        if (value === undefined) return
        params.set(key, String(value))
      })

      const url = `/api/${collectionSlug}?${params.toString()}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch theme configuration (status ${response.status})`)
      }

      const data = (await response.json()) as {
        docs?: Array<{ themeConfiguration?: SiteThemeConfiguration }>
      }

      const doc = data.docs?.[0]

      return doc?.themeConfiguration ?? null
    }
  } catch (error) {
    console.warn('Failed to fetch theme configuration:', error)
    return null
  }
}

export const getThemePreset = (themeName: string): ThemePreset | null => {
  return allThemePresets.find((preset) => preset.name === themeName) || null
}

export const getAvailableThemePresets = (): ThemePreset[] => {
  return allThemePresets
}

export { defaultThemePresets, allThemePresets } from './presets.js'
export type { ThemePreset, ThemeTypographyPreset } from './presets.js'
export type { ThemeTab } from './fields/themeConfigurationField.js'
export {
  extendedThemePresets,
  allExtendedThemePresets,
  extendedThemeToCSSVariables,
} from './extended-presets.js'
export type { ExtendedThemePreset, ShadcnColorTokens } from './extended-presets.js'
export {
  applyExtendedTheme,
  generateExtendedThemeCSS,
  resetExtendedTheme,
  getExtendedThemeTokens,
  createUseExtendedTheme,
  getTailwindVarReferences,
} from './utils/extendedThemeHelpers.js'
export type {
  ThemeManagementPluginOptions,
  ThemeManagementCacheRevalidationOptions,
  FetchThemeConfigurationOptions,
  ThemeManagementLivePreviewOptions,
  ThemeManagementLivePreviewUrlArgs,
} from './types.js'
export {
  DEFAULT_THEME_CONFIGURATION,
  resolveThemeConfiguration,
} from './utils/resolveThemeConfiguration.js'
export type { ResolvedThemeConfiguration } from './utils/resolveThemeConfiguration.js'
export { generateThemeColorsCss, hexToHsl } from './utils/themeColors.js'
export { generateThemeCSS, getThemeStyles } from './utils/themeUtils.js'
export { getThemeHtmlAttributes } from './utils/themeHtmlAttributes.js'

// Dynamic theme CSS generation
export {
  generateThemeCSS as generatePresetCSS,
  generateAllThemesCSS,
} from './utils/generateThemeCSS.js'
export { getThemeDynamicCSS, getAllDynamicThemesCSS } from './utils/themeCSS.js'

export type { Mode, ThemeDefaults } from './providers/Theme/types.js'
export { ThemeProvider } from './providers/Theme/index.js'

// Font loading utilities for Next.js integration
export {
  getFontLoaderCode,
  getThemeFontFamilies,
  ThemeFontProvider,
  useThemeFonts,
  FONT_IMPORT_MAP,
} from './providers/font-loader.js'

// Note: Do NOT re-export client components from the root entry to avoid
// server-side evaluation during `payload generate:importmap`.
// If needed, import directly from subpath: `@kilivi/payloadcms-theme-management/fields/ThemeLivePreview`

export const ThemeManagementPlugin = themeManagementPlugin
/** @deprecated use {@link themeManagementPlugin} */
export const themeConfigurationPlugin = themeManagementPlugin

// Export plugin translations for consumers to merge into their payload translations
export {
  translations,
  getTranslations,
  registerTranslations,
  availableLanguages,
} from './translations.js'

export default themeManagementPlugin
