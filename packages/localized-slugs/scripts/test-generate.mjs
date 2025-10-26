import { generateLocalizedSlugs } from '../dist/utils/slugUtils.js'

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
  layout: [
    {
      blockType: 'HeroBlock',
      heading: 'Kontaktujte nás',
      subHeading: 'Vítejte a kontaktujte nás!',
      id: '68faa608baa9b72e48fa1cb6',
    },
  ],
  meta: {},
  isHome: false,
  isDynamic: false,
  slugMode: 'generate',
  slug: 'kontaktujte-nas',
  pathMode: 'generate',
  path: '/kontaktujte-nas',
  breadcrumbs: [
    {
      doc: '68faa608dcfae713f509c241',
      url: '/kontaktujte-nas',
      label: 'Kontaktujte nás',
      id: '68faa608baa9b72e48fa1cb5',
    },
  ],
  _status: 'published',
  localizedSlugs: {
    cs: {},
    en: {},
  },
  id: '68faa608dcfae713f509c241',
}

const result = generateLocalizedSlugs(sample, undefined, Object.keys(sample.localizedSlugs))
console.log(JSON.stringify(result, null, 2))
