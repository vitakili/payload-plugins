/**
 * Replaces the `home` page with theme showcase blocks for the theme-management
 * Live Preview. Only that page is touched; everything else stays as it is.
 *
 *   pnpm seed:theme
 */
import config from '@payload-config'
import { getPayload } from 'payload'
import { seedThemeShowcase, THEME_SHOWCASE_SLUG } from '../endpoints/seed/theme-showcase'

const payload = await getPayload({ config })
const { id, created } = await seedThemeShowcase(payload)
payload.logger.info(
  `${created ? 'Created' : 'Updated'} page "${THEME_SHOWCASE_SLUG}" (id ${id}). Open Appearance Settings → Live Preview.`,
)
process.exit(0)
