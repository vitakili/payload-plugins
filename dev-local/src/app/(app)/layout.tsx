import type { ReactNode } from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { ensureStartsWith } from '@/utilities/ensureStartsWith'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management/server'
import React from 'react'
import './globals.css'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { resolveThemeConfiguration } from '@kilivi/payloadcms-theme-management'
import { unstable_cache } from 'next/cache'

/* const { SITE_NAME, TWITTER_CREATOR, TWITTER_SITE } = process.env
const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : 'http://localhost:3000'
const twitterCreator = TWITTER_CREATOR ? ensureStartsWith(TWITTER_CREATOR, '@') : undefined
const twitterSite = TWITTER_SITE ? ensureStartsWith(TWITTER_SITE, 'https://') : undefined
 */
/* export const metadata = {
  metadataBase: new URL(baseUrl),
  robots: {
    follow: true,
    index: true,
  },
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  ...(twitterCreator &&
    twitterSite && {
      twitter: {
        card: 'summary_large_image',
        creator: twitterCreator,
        site: twitterSite,
      },
    }),
} */

// Create cached theme fetcher with automatic invalidation
const getCachedTheme = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise })
    const appearanceSettings = await payload.findGlobal({
      slug: 'appearance-settings',
    })
    return resolveThemeConfiguration(appearanceSettings?.themeConfiguration)
  },
  ['appearance-settings-theme'],
  {
    tags: ['global_appearance-settings'], // Matches the auto-invalidation tag from plugin
    revalidate: 3600, // Optional: revalidate every hour as fallback
  },
)

export default async function RootLayout({ children }: { children: ReactNode }) {
  const themeConfig = await getCachedTheme()

  console.log('Appearance Settings Global (cached):', themeConfig)
  return (
    <html
      className={[GeistSans.variable, GeistMono.variable].filter(Boolean).join(' ')}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        {/* <InitTheme /> */}
        <ServerThemeInjector themeConfiguration={themeConfig} />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>
        <Providers themeConfiguration={themeConfig}>
          <AdminBar />
          <LivePreviewListener />

          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
