import { createPopulateLocalizedSlugsHook } from '../dist/hooks/populateLocalizedSlugs.js'

const hook = createPopulateLocalizedSlugsHook({
  locales: ['cs','en'],
  defaultLocale: 'cs',
  slugField: 'slug',
  fullPathField: 'path',
  generateFromTitle: true,
  titleField: 'title',
  enableLogging: true,
  customDiacriticsMap: {},
})

const sample = {
  title: 'Kontaktujte nás',
  slug: undefined,
  path: '/contact-us',
  localizedSlugs: { cs: {}, en: {} },
}

;(async () => {
  const result = await hook({ doc: sample, operation: 'create', req: {}, collection: { slug: 'pages' } })
  console.log(JSON.stringify(result, null, 2))
})()
