# Localized Slugs Plugin - Integration Guide

## Správná integrace do Payload CMS

### ✅ Klíčové pravidla

1. **Hook NIKDY nevolá `req.payload.update()`**
   - Vrací pouze upravený dokument
   - Payload CMS automaticky persistence vrácený dokument
   - To zabraňuje nekonečným smyčkám v multitenant prostředích

2. **Pole `slug` a `fullPath` MUSÍ být lokalizovaná**

   ```typescript
   {
     name: 'slug',
     type: 'text',
     localized: true,  // ← KRITICKÉ!
     required: true,
   },
   {
     name: 'fullPath',
     type: 'text',
     localized: true,  // ← KRITICKÉ!
     required: true,
   }
   ```

3. **Hook detekuje jak lokalizovaná, tak nelokalizovaná pole**
   - Lokalizovaná: `slug: { en: "...", cs: "..." }`
   - Nelokalizovaná: `slug: "..."` (kopíruje se pro všechny locales)

### 📋 Konfigurace pluginu

```typescript
import { localizedSlugsPlugin } from '@kilivi-dev/payloadcms-localized-slugs'

const payload = await getPayloadClient({
  config: buildConfig({
    plugins: [
      localizedSlugsPlugin({
        enabled: true,
        locales: ['en', 'cs'],
        collections: [
          {
            collection: 'pages',
            slugField: 'slug', // default: 'slug'
            fullPathField: 'fullPath', // default: 'fullPath'
          },
          {
            collection: 'posts',
            slugField: 'slug',
            fullPathField: 'fullPath',
          },
        ],
        enableLogging: true, // Pro debug v development
      }),
    ],
  }),
})
```

### 🔄 Jak to funguje

**Kroky za běhu:**

1. **Dokument se uloží** → Payload spustí `afterChange` hook
2. **Hook se spustí** → Zkontroluje `slug` a `fullPath` pole
3. **Detekce lokalizace** → Zjistí, jestli jsou pole lokalizovaná
4. **Naplnění dat** → Zkopíruje hodnoty do `localizedSlugs`
5. **Vrácení dokumentu** → Hook vrátí upravený dokument
6. **Payload persistence** → Payload CMS automaticky uloží vrácený dokument
7. **Prevence smyček** → Flag `__localized_slugs_processing__` zabraňuje rekurzi

### 🔒 Prevence nekonečných smyček

Plugin používá vnitřní flag na `req` objektu:

```typescript
const LOCALIZED_SLUGS_PROCESSING = ('__localized_slugs_processing__'(
  // Při prvním volání je flag nastaven na true
  req as any,
)[LOCALIZED_SLUGS_PROCESSING] = true)

// Pokud se hook zavolá znovu, detekuje flag a přeskočí zpracování
if ((req as any)?.[LOCALIZED_SLUGS_PROCESSING]) {
  return doc // Skip processing
}
```

Toto zabraňuje nekonečným smyčkám v multitenant prostředích.

### 🚀 Kompatibilita s Multitenant pluginem

Plugin je **plně kompatibilní** s multitenant pluginem:

✅ Neblokuje tenant switching
✅ Respektuje tenant-specific revalidace
✅ Nevolá `req.payload.update()` (zdroj problémů)
✅ Pracuje s tenant-specific dokumenty

**Pro multitenant projekty:**

```typescript
plugins: [
  multitenantPlugin({
    // ... config
  }),
  localizedSlugsPlugin({
    // Bude fungovat bez problémů
    locales: ['en', 'cs'],
    collections: ['pages', 'posts'],
    enableLogging: true,
  }),
]
```

### 📝 Příklad - Kompletní Collection Setup

```typescript
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: 'Page',
    plural: 'Pages',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      localized: true, // ← DŮLEŽITÉ!
      unique: true,
      admin: {
        placeholder: 'auto-generated-from-title',
      },
    },
    {
      name: 'fullPath',
      type: 'text',
      localized: true, // ← DŮLEŽITÉ!
      admin: {
        placeholder: '/path/to/page',
      },
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
    },
    // localizedSlugs se přidá automaticky
  ],
  // afterChange hook se přidá automaticky
}
```

### 🐛 Debug

Povolte `enableLogging: true` v konfiguraci:

```typescript
localizedSlugsPlugin({
  enableLogging: true, // ← Zobrazuje detailní logy
  // ...
})
```

Pak uvidíte v konzoli:

```
🌐 Field check - slug: { type: 'object', isLocalized: true, value: {...} }
🌐 Field check - fullPath: { type: 'object', isLocalized: true, value: {...} }
🌐 Localization status: slug=true, fullPath=true
🌐 Populated localizedSlugs for pages: { en: {...}, cs: {...} }
```

### ❌ Co NEDĚLA a proč

#### ❌ Hook nevolá `req.payload.update()`

- ❌ Vyvolalo by nekonečné smyčky
- ❌ Není potřeba - Payload CMS auto-persistence vrácený dokument
- ✅ Plugin vrací upravený dokument a hotovo

#### ❌ Nedokumentuje se obsahu `localizedSlugs` v `afterChange`

- ✅ Vrací se v POST respondách
- ✅ Je dostupný v hook callbacích
- ✅ Je uložen v databázi

### 📊 Příklad Response

```json
{
  "id": "507f1f77bcf86cd799439013",
  "title": {
    "en": "Contact Us",
    "cs": "Kontaktujte nás"
  },
  "slug": {
    "en": "contact-us",
    "cs": "kontaktujte-nas"
  },
  "fullPath": {
    "en": "/contact-us",
    "cs": "/kontaktujte-nas"
  },
  "localizedSlugs": {
    "en": {
      "slug": "contact-us",
      "fullPath": "/contact-us"
    },
    "cs": {
      "slug": "kontaktujte-nas",
      "fullPath": "/kontaktujte-nas"
    }
  }
}
```

### 🎯 Troubleshooting

| Problem                 | Příčina                           | Řešení                                       |
| ----------------------- | --------------------------------- | -------------------------------------------- |
| `localizedSlugs: {}`    | Pole nejsou lokalizovaná          | Přidat `localized: true` k `slug`/`fullPath` |
| Nekonečná smyčka        | Hook volá `req.payload.update()`  | Update - plugin je už fix                    |
| Multitenant problémy    | Konflikt s tenant switching       | Update - plugin je kompatibilní              |
| Hook se vůbec nespouští | Plugin není správně zaregistrován | Zkontroluj plugin konfiguraci                |

---

**Verze:** 1.0.0  
**Poslední update:** 2025-11-07  
**Status:** ✅ Stabilní
