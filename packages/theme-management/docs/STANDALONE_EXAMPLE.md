// Example: Using Theme Management Plugin with Standalone Collection

import { themeManagementPlugin } from '@kilivi/payloadcms-theme-management'
import { buildConfig } from 'payload'

export default buildConfig({
// ... other config

plugins: [
// Option 1: Standalone Collection (New in v0.6.0)
// Creates a separate "Appearance Settings" collection
themeManagementPlugin({
enabled: true,
useStandaloneCollection: true, // Enable standalone mode
standaloneCollectionSlug: 'appearance-settings', // Optional: custom slug
standaloneCollectionLabel: 'Appearance Settings', // Optional: custom label
// Or with i18n:
// standaloneCollectionLabel: {
// en: 'Appearance Settings',
// cs: 'Nastavení vzhledu',
// },
defaultTheme: 'cool',
includeColorModeToggle: true,
enableLogging: true,
}),

    // Option 2: Traditional Tab-based (Default)
    // Adds theme settings as a tab in existing collection
    // themeManagementPlugin({
    //   enabled: true,
    //   targetCollection: 'site-settings', // Adds as tab here
    //   defaultTheme: 'cool',
    //   includeColorModeToggle: true,
    //   enableLogging: true,
    // }),

],
})

// ============================================================================
// Usage in Next.js Layout
// ============================================================================

// app/layout.tsx
import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
const payload = await getPayload({ config: configPromise })

// Fetch from standalone collection
const docs = await payload.findGlobal({
slug: 'appearance-settings',
})

// Or if using tab-based approach:
// const { docs } = await payload.find({
// collection: 'site-settings',
// limit: 1,
// })

return (

<html lang="en">
<head>
<ServerThemeInjector themeConfiguration={docs[0]?.themeConfiguration ?? docs.themeConfiguration} />
</head>
<body>{children}</body>
</html>
)
}

// ============================================================================
// Fetching Theme Configuration
// ============================================================================

import { fetchThemeConfiguration } from '@kilivi/payloadcms-theme-management'

// For standalone collection
const theme = await fetchThemeConfiguration({
collectionSlug: 'appearance-settings',
})

// For tab-based approach
// const theme = await fetchThemeConfiguration({
// collectionSlug: 'site-settings',
// })
