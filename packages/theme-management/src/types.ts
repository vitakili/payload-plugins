import type { ThemePreset } from './presets'

export interface ThemeConfigurationPluginOptions {
	/** Whether the plugin should register itself */
	enabled?: boolean
	/** Collection slug that stores site-level settings (default: `site-settings`) */
	targetCollection?: string
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
}

export interface FetchThemeConfigurationOptions {
	/** Optional tenant identifier if your project is multi-tenant */
	tenantSlug?: string
	/** Collection slug override (default: `site-settings`) */
	collectionSlug?: string
	/** Depth parameter passed to Payload REST API */
	depth?: number
	/** Locale parameter passed to Payload REST API */
	locale?: string
	/** Include draft documents */
	draft?: boolean
	/** Extra query parameters to append to the request */
	queryParams?: Record<string, string | number | boolean>
}

