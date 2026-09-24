import type { Payload, RequiredDataFromCollectionSlug } from 'payload'

/**
 * Home page content built as a theme showcase for the theme-management plugin's
 * Live Preview (which renders the `home` page).
 *
 * Every block here exercises a different set of theme tokens, so switching a
 * preset, locking parts of the look or generating a palette shows up somewhere:
 *
 * - hero (highImpact): background, foreground, primary + outline buttons, heading font
 * - content columns: body font, line height, links, muted text, lists, quotes, radius
 * - banners (info / success / warning / error): semantic status colours
 * - CTA: card surface, border, primary + secondary buttons
 * - media: image style, radius, shadows
 * - archive / carousel / three-item grid: cards, card hover effects, muted surfaces
 *
 * Upserts the `home` page in place (same id, so links and preview URLs keep
 * working) and never touches any other content.
 */

export const THEME_SHOWCASE_SLUG = 'home'

// ─── Minimal Lexical builders ────────────────────────────────────────────────

type Node = Record<string, unknown>

const text = (value: string, format = 0): Node => ({
  type: 'text',
  detail: 0,
  format, // 1 = bold, 2 = italic
  mode: 'normal',
  style: '',
  text: value,
  version: 1,
})

const link = (label: string, url: string): Node => ({
  type: 'link',
  children: [text(label)],
  direction: 'ltr',
  fields: { linkType: 'custom', newTab: false, url },
  format: '',
  indent: 0,
  version: 3,
})

const heading = (tag: 'h1' | 'h2' | 'h3' | 'h4', value: string): Node => ({
  type: 'heading',
  children: [text(value)],
  direction: 'ltr',
  format: '',
  indent: 0,
  tag,
  version: 1,
})

const paragraph = (...children: Node[]): Node => ({
  type: 'paragraph',
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  version: 1,
})

const list = (items: string[]): Node => ({
  type: 'list',
  listType: 'bullet',
  start: 1,
  tag: 'ul',
  children: items.map((item, index) => ({
    type: 'listitem',
    value: index + 1,
    children: [text(item)],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  })),
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
})

const quote = (value: string): Node => ({
  type: 'quote',
  children: [text(value)],
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
})

type LexicalNode = { [k: string]: unknown; type: string; version: number }

const richText = (...children: Node[]) => ({
  root: {
    type: 'root',
    children: children as LexicalNode[],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

const customLink = (label: string, url: string, appearance: 'default' | 'outline' = 'default') => ({
  link: { type: 'custom' as const, appearance, label, url },
})

// ─── Page data ───────────────────────────────────────────────────────────────

type ShowcaseArgs = {
  heroImageId?: number | string
  productIds: Array<number | string>
}

export const themeShowcasePageData = ({
  heroImageId,
  productIds,
}: ShowcaseArgs): RequiredDataFromCollectionSlug<'pages'> => {
  const layout: Node[] = [
    {
      blockType: 'content',
      blockName: 'Typografie a text',
      columns: [
        {
          size: 'twoThirds',
          richText: richText(
            heading('h2', 'Typografie, která drží celý web'),
            paragraph(
              text('Tento odstavec používá '),
              text('písmo pro text', 1),
              text(', základní velikost a výšku řádku z nastavení vzhledu. Nadpisy používají '),
              text('písmo nadpisů', 2),
              text('. Odkazy mají barvu primární barvy, třeba '),
              link('tento odkaz na katalog', '/search'),
              text('.'),
            ),
            heading('h3', 'Co si tu vyzkoušet'),
            list([
              'Přepněte motiv a sledujte pozadí, text a tlačítka.',
              'Zamkněte písma a vyberte jiný styl: písmo zůstane.',
              'Vygenerujte paletu z loga a vraťte ji tlačítkem Zpět.',
            ]),
            quote('Dobrý motiv je ten, kterého si návštěvník nevšimne, ale zapamatuje si ho.'),
          ),
        },
        {
          size: 'oneThird',
          richText: richText(
            heading('h4', 'Tlumený text a karty'),
            paragraph(
              text(
                'Postranní sloupec ukazuje menší nadpis a delší text. Sledujte, jak se mění zaoblení a stíny karet níže.',
              ),
            ),
          ),
          enableLink: true,
          link: { type: 'custom', appearance: 'outline', label: 'Kontakt', url: '/contact' },
        },
      ],
    },
    {
      blockType: 'banner',
      blockName: 'Banner – info',
      style: 'info',
      content: richText(paragraph(text('Info: '), text('nové motivy jsou k dispozici v nastavení vzhledu.', 0))),
    },
    {
      blockType: 'banner',
      blockName: 'Banner – úspěch',
      style: 'success',
      content: richText(paragraph(text('Hotovo: '), text('paleta prošla kontrolou kontrastu WCAG AA.'))),
    },
    {
      blockType: 'banner',
      blockName: 'Banner – varování',
      style: 'warning',
      content: richText(paragraph(text('Pozor: '), text('ztlumený text na akcentu má nízký kontrast.'))),
    },
    {
      blockType: 'banner',
      blockName: 'Banner – chyba',
      style: 'error',
      content: richText(paragraph(text('Chyba: '), text('destruktivní barva se používá pro mazání a chyby.'))),
    },
    {
      blockType: 'content',
      blockName: 'Tři sloupce',
      columns: (['Primární', 'Sekundární', 'Akcent'] as const).map((title, index) => ({
        size: 'oneThird',
        richText: richText(
          heading('h3', title),
          paragraph(
            text(
              [
                'Primární barva nese hlavní akce a odkazy.',
                'Sekundární barva patří vedlejším tlačítkům a plochám.',
                'Akcent zvýrazňuje štítky, hover a vybrané prvky.',
              ][index]!,
            ),
          ),
        ),
        enableLink: true,
        link: {
          type: 'custom',
          appearance: index === 0 ? 'default' : 'outline',
          label: index === 0 ? 'Hlavní akce' : 'Vedlejší akce',
          url: '/search',
        },
      })),
    },
    ...(heroImageId
      ? [{ blockType: 'mediaBlock', blockName: 'Obrázek', media: heroImageId }]
      : []),
    {
      blockType: 'cta',
      blockName: 'Výzva k akci',
      richText: richText(
        heading('h3', 'Líbí se vám tenhle vzhled?'),
        paragraph(text('Karta výzvy používá plochu karty, okraj a obě varianty tlačítek.')),
      ),
      links: [customLink('Uložit vzhled', '/admin'), customLink('Zkusit jiný', '/admin', 'outline')],
    },
  ]

  if (productIds.length > 0) {
    layout.push(
      {
        blockType: 'threeItemGrid',
        blockName: 'Produkty – mřížka',
        products: productIds.slice(0, 3),
      },
      {
        blockType: 'archive',
        blockName: 'Produkty – archiv',
        introContent: richText(heading('h3', 'Karty produktů')),
        populateBy: 'collection',
        relationTo: 'products',
        limit: 6,
      },
    )
  }

  return {
    title: 'Home',
    slug: THEME_SHOWCASE_SLUG,
    _status: 'published',
    hero: {
      type: heroImageId ? 'highImpact' : 'lowImpact',
      ...(heroImageId ? { media: heroImageId as number } : {}),
      richText: richText(
        heading('h1', 'Ukázka motivu'),
        paragraph(
          text(
            'Stránka pro živý náhled nastavení vzhledu. Každý blok níže používá jiné barvy, písma a styly komponent.',
          ),
        ),
      ),
      links: [customLink('Primární tlačítko', '/search'), customLink('Obrysové tlačítko', '/contact', 'outline')],
    },
    layout: layout as unknown as RequiredDataFromCollectionSlug<'pages'>['layout'],
    meta: {
      title: 'Ukázka motivu',
      description: 'Ukázková stránka pro živý náhled pluginu theme-management.',
    },
  }
}

/** Create or replace the showcase page, reusing media and products already in the database. */
export async function seedThemeShowcase(payload: Payload): Promise<{ id: number | string; created: boolean }> {
  const [media, products, existing] = await Promise.all([
    payload.find({ collection: 'media', limit: 1, depth: 0, sort: '-createdAt' }),
    payload.find({ collection: 'products', limit: 6, depth: 0, where: { _status: { equals: 'published' } } }),
    payload.find({
      collection: 'pages',
      limit: 1,
      depth: 0,
      where: { slug: { equals: THEME_SHOWCASE_SLUG } },
    }),
  ])

  const data = themeShowcasePageData({
    heroImageId: media.docs[0]?.id,
    productIds: products.docs.map((product) => product.id),
  })

  const current = existing.docs[0]
  if (current) {
    const page = await payload.update({
      collection: 'pages',
      id: current.id,
      data,
      context: { disableRevalidate: true },
    })
    return { id: page.id, created: false }
  }

  const page = await payload.create({
    collection: 'pages',
    data,
    context: { disableRevalidate: true },
  })
  return { id: page.id, created: true }
}
