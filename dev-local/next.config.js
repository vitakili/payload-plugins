import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { withPayload } from '@payloadcms/next/withPayload'
import redirects from './redirects.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Watch local file:-linked packages for HMR — without this webpack ignores node_modules
  transpilePackages: [
    '@kilivi-dev/payloadcms-theme-management',
    '@kilivi/payloadcms-localized-slugs',
  ],
  images: {
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
    ],
  },
  reactStrictMode: true,
  redirects,
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    // Bypass pnpm virtual store (stale hard-linked copy) — point directly to the live source
    webpackConfig.resolve.alias = {
      '@kilivi-dev/payloadcms-theme-management': resolve(__dirname, '../packages/theme-management'),
      '@kilivi/payloadcms-localized-slugs': resolve(__dirname, '../packages/localized-slugs'),
      ...webpackConfig.resolve.alias,
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig)
