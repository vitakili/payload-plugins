import 'server-only'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import type { SiteThemeConfiguration } from './payload-types.js'
import {
  DEFAULT_THEME_CONFIGURATION,
  resolveThemeConfiguration,
} from './utils/resolveThemeConfiguration.js'

export { ServerThemeInjector } from './components/ServerThemeInjector.js'

export {
  createFallbackCriticalCSS,
  getThemeCriticalCSS,
  getThemeCSS,
  generateThemePreloadLinks,
  getThemeCSSPath,
} from './utils/themeAssets.js'

export const getThemeCacheTag = (globalSlug = 'appearance-settings'): string =>
  `global_${globalSlug}`

interface ThemeGlobalLike {
  themeConfiguration?: SiteThemeConfiguration | null
}

interface CreateCachedThemeFetcherOptions {
  /** Function that loads the appearance global document. */
  loadAppearanceSettings: () => Promise<ThemeGlobalLike | null | undefined>
  /** Optional global slug used for default cache tag and key (default: 'appearance-settings'). */
  globalSlug?: string
  /** Additional cache key parts passed to unstable_cache. */
  cacheKeyParts?: string[]
  /** Additional tags to include besides the default `global_{slug}` tag. */
  tags?: string[]
  /** Next.js revalidate interval in seconds (default: 3600). */
  revalidate?: number | false
}

export const createCachedThemeFetcher = (options: CreateCachedThemeFetcherOptions) => {
  const {
    loadAppearanceSettings,
    globalSlug = 'appearance-settings',
    cacheKeyParts = [],
    tags = [],
    revalidate = 3600,
  } = options

  const defaultTag = getThemeCacheTag(globalSlug)
  const cacheKey = [`${globalSlug}-theme`, ...cacheKeyParts]
  const cacheTags = [...new Set([defaultTag, ...tags].filter(Boolean))]

  return unstable_cache(
    async () => {
      const appearanceSettings = await loadAppearanceSettings()
      return resolveThemeConfiguration(
        appearanceSettings?.themeConfiguration ?? DEFAULT_THEME_CONFIGURATION,
      )
    },
    cacheKey,
    {
      tags: cacheTags,
      revalidate,
    },
  )
}

interface RevalidateThemeCacheOptions {
  /** Optional global slug for default tag (default: 'appearance-settings'). */
  globalSlug?: string
  /** Extra cache tags to invalidate. */
  tags?: string[]
  /** Optional paths to invalidate with revalidatePath. */
  paths?: string[]
}

export const revalidateThemeCache = async (
  options: RevalidateThemeCacheOptions = {},
): Promise<{ tags: string[]; paths: string[] }> => {
  const { globalSlug = 'appearance-settings', tags = [], paths = [] } = options

  const resolvedTags = [...new Set([getThemeCacheTag(globalSlug), ...tags].filter(Boolean))]
  const resolvedPaths = [...new Set(paths.filter((value) => typeof value === 'string' && value))]

  resolvedTags.forEach((tag) => revalidateTag(tag))
  resolvedPaths.forEach((path) => revalidatePath(path))

  return {
    tags: resolvedTags,
    paths: resolvedPaths,
  }
}
