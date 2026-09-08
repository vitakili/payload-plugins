import { dirname } from 'path'
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

    // NOTE: no resolve.alias for the local plugins.
    // Aliasing the bare package name to the source folder bypasses the package
    // "exports" map, so subpath imports (/components/*, /fields/*) would look for
    // `<pkg>/components/...` instead of `<pkg>/dist/components/...` and fail.
    // Instead the plugins are consumed exactly like a published package via the
    // `file:` dependency — after changing plugin source run:
    //   pnpm --filter @kilivi-dev/payloadcms-theme-management build && (cd dev-local && pnpm ii)

    return webpackConfig
  },
}

export default withPayload(nextConfig)
