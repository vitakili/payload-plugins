import { createPopulateLocalizedSlugsHook } from '../dist/hooks/populateLocalizedSlugs.js'

const hook = createPopulateLocalizedSlugsHook({
  locales: ['cs','en'],
  defaultLocale: 'cs',
  slugField: 'slug',
  fullPathField: 'path',
  generateFromTitle: false,
  titleField: 'title',
  enableLogging: true,
  customDiacriticsMap: {},
})

const sample = {
  createdAt: '2025-10-23T22:02:48.511Z',
  updatedAt: '2025-10-26T19:55:59.305Z',
  tenant: {
    createdAt: '2025-10-17T21:23:36.249Z',
    updatedAt: '2025-10-20T14:42:49.691Z',
    name: 'SILVER TENANT',
    slug: 'silver',
    subdomain: 'silver',
    id: '68f2b3d8753a97178cb25352',
  },
  title: 'Kontaktujte nás',
  slug: 'kontaktujte-nas',
  path: '/kontaktujte-nas',
  localizedSlugs: {
    cs: {},
    en: {},
  },
  id: '68faa608dcfae713f509c241',
}

;(async () => {
  const result = await hook({ doc: sample, operation: 'create', req: {}, collection: { slug: 'pages' } })
  console.log(JSON.stringify(result, null, 2))
})()
