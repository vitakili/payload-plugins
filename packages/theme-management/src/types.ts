import type { ThemePreset } from './presets.js'

export interface ThemeManagementLivePreviewUrlArgs {
  /** Resolved preview page document (if found) */
  page?: Record<string, unknown>
  /** Resolved preview page slug */
  pageSlug: string
  /** Inferred tenant identifier (if available) */
  tenantSlug?: string
  /** Current Payload request */
  req: {
    payload: {
      find: (args: Record<string, unknown>) => Promise<{ docs?: Array<Record<string, unknown>> }>
      logger?: {
        warn?: (...args: unknown[]) => void
      }
    }
    query?: unknown
    headers?: unknown
    user?: unknown
  }
}

export interface ThemeManagementLivePreviewOptions {
  /** Enable Payload admin live preview for the target config (default: true) */
  enabled?: boolean
  /** Inject a Payload endpoint for live preview (enables `/api/theme/preview`) (default: false) */
  injectRoute?: boolean
  /** Endpoint path under Payload API (default: '/theme/preview') */
  routePath?: string
  /** Collection slug containing preview pages (default: 'pages') */
  pageCollection?: string
  /** Preferred page slug for preview (default: 'home') */
  pageSlug?: string
  /** Fallback to first page if preferred slug does not exist (default: true) */
  fallbackToFirstPage?: boolean
  /** Tenant field name used for filtering in multi-tenant setups (default: 'tenant') */
  tenantField?: string
  /** Query param name appended to default URL when tenant is resolved (default: 'tenant') */
  tenantQueryParam?: string
  /**
   * Device breakpoints shown in Payload's Live Preview toolbar (iframe size presets).
   * Use this to make preview sizing more practical for your editors.
   */
  breakpoints?: Array<{
    name: string
    label: string
    width: number | string
    height: number | string
  }>
  /**
   * Custom URL resolver for Payload live preview.
   * Defaults to `/${slug}` (or `/` for `home`) with optional tenant query param.
   */
  url?: (args: ThemeManagementLivePreviewUrlArgs) => string | Promise<string>
}

export interface ThemeManagementCacheRevalidationOptions {
  /** Enable cache revalidation support (default: true for standalone mode, false for tab mode) */
  enabled?: boolean
  /** Inject a Payload endpoint for manual/external revalidation triggers (default: true) */
  injectRoute?: boolean
  /** Endpoint path under Payload API (default: '/theme/revalidate') */
  routePath?: string
  /** Optional shared secret checked against header/body/query before revalidation */
  secret?: string
  /** Additional tags to revalidate together with the default global tag */
  tags?: string[]
  /** Optional paths to revalidate together with tags */
  paths?: string[]
}

export interface ThemeManagementPluginOptions {
  /** Whether the plugin should register itself */
  enabled?: boolean
  /** Collection slug that stores site-level settings (default: `site-settings`) */
  targetCollection?: string
  /** Create a standalone collection instead of adding as a tab (default: false) */
  useStandaloneCollection?: boolean
  /** Name of the standalone collection (default: 'appearance-settings') */
  standaloneCollectionSlug?: string
  /** Label for the standalone collection (default: 'Appearance Settings') */
  standaloneCollectionLabel?: string | Record<string, string>
  /** Theme presets available to editors */
  themePresets?: ThemePreset[]
  /** Default preset name when no value is stored */
  defaultTheme?: string
  /** Allow editors to toggle between light / dark / auto modes */
  includeColorModeToggle?: boolean
  /** Expose custom CSS editor */
  includeCustomCSS?: boolean
  /** Reserved for future use, keeps API parity */
  includeBrandIdentity?: boolean
  /** Enable advanced controls such as animation level */
  enableAdvancedFeatures?: boolean
  /** Log helpful messages during config mutation */
  enableLogging?: boolean
  /** Configure Payload admin live preview URL generation */
  livePreview?: boolean | ThemeManagementLivePreviewOptions
  /** Configure cache revalidation route and tags for Next.js `unstable_cache` usage */
  cacheRevalidation?: boolean | ThemeManagementCacheRevalidationOptions
}

export interface FetchThemeConfigurationOptions {
  /** Optional tenant identifier if your project is multi-tenant */
  tenantSlug?: string
  /** Collection/Global slug override (default: `site-settings`) */
  collectionSlug?: string
  /** Depth parameter passed to Payload REST API */
  depth?: number
  /** Locale parameter passed to Payload REST API */
  locale?: string
  /** Include draft documents */
  draft?: boolean
  /** Extra query parameters to append to the request */
  queryParams?: Record<string, string | number | boolean>
  /** Set to true if using standalone global instead of collection (default: false) */
  useGlobal?: boolean
}
