# Troubleshooting Guide - Nekonečné smyčky a problémy

## Problem: `localizedSlugs` je prázdné `{}`

### Symptom

```
🌐 Populated localizedSlugs for pages: {}
🌐 Populated localizedSlugs for pages: {}
🌐 Populated localizedSlugs for pages: {}
```

### Příčiny a řešení

#### 1. **Pole `slug`/`fullPath` nejsou lokalizovaná**

```typescript
// ❌ ŠPATNĚ
{
  name: 'slug',
  type: 'text',
  // ← Chybí localized: true
}

// ✅ SPRÁVNĚ
{
  name: 'slug',
  type: 'text',
  localized: true,  // ← KRITICKÉ!
  required: true,
}
```

**Jak zkontrolovat:**

```typescript
// Přidej enableLogging: true a podívej se na logs:
🌐 Field check - slug: {
  type: 'object',           // ← 'object' znamená lokalizované!
  isLocalized: true,        // ← true = je OK
  value: { en: '...', cs: '...' }
}
```

#### 2. **Pole nemají žádné hodnoty**

```typescript
// Pokud jsou všechna pole prázdná/undefined:
🌐 Field check - slug: {
  type: 'undefined',        // ← Pole neexistuje nebo je prázdné
  isLocalized: false,
  value: undefined
}
```

**Řešení:** Ujistěte se, že máte data v `slug` a `fullPath` polích:

```typescript
// Klient/admin musí vyplnit
{
  slug: {
    en: 'contact-us',
    cs: 'kontaktujte-nas'
  },
  fullPath: {
    en: '/contact-us',
    cs: '/kontaktujte-nas'
  }
}
```

---

## Problem: Nekonečná smyčka (rekurze)

### Symptom

```
🌐 Populated localizedSlugs for pages: {}
revalidated page-silver-/kontaktujte-nas at 1762533525409
🌐 Populated localizedSlugs for pages: {}
revalidated page-silver-/kontaktujte-nas at 1762533525473
🌐 Populated localizedSlugs for pages: {}
revalidated page-silver-/kontaktujte-nas at 1762533525544
// ... neustává
```

### Příčiny

#### 1. **Starší verze pluginu s `req.payload.update()`**

```typescript
// ❌ STARÝ KÓD - Neustále se volá
await req.payload.update({
  collection: collection.slug,
  id: doc.id,
  data: { localizedSlugs: newLocalizedSlugs },
})
// ← Vyvolá afterChange hook znovu!
```

**Řešení:** Update na nejnovější verzi:

```bash
pnpm update @kilivi-dev/payloadcms-localized-slugs@latest
```

#### 2. **Vlastní hook + `req.payload.update()`**

Pokud máte vlastní hook:

```typescript
// ❌ ŠPATNĚ - Nekonečná smyčka
export const myHook = (): CollectionAfterChangeHook => {
  return async ({ doc, req }) => {
    const updated = { ...doc, customField: compute(doc) }

    // ❌ NEDĚLA! Vyvolá hook znovu
    await req.payload.update({
      collection: 'pages',
      id: doc.id,
      data: updated,
    })

    return updated
  }
}

// ✅ SPRÁVNĚ - Jen vrať dokument
export const myHook = (): CollectionAfterChangeHook => {
  return async ({ doc }) => {
    const updated = { ...doc, customField: compute(doc) }
    return updated // ← Hotovo! Payload to persiste automaticky
  }
}
```

#### 3. **Multitenant plugin volá mehrát hooky**

**Řešení:** Všechny hooky by měly:

1. Vrátit upravený dokument
2. NIKDY nevolat `req.payload.update()`
3. Markovat zpracování pomocí flagu

```typescript
const PROCESSING_FLAG = '__processing__'

export const myHook = (): CollectionAfterChangeHook => {
  return async ({ doc, req }) => {
    // Prevence rekurze
    if ((req as any)?.[PROCESSING_FLAG]) {
      return doc
    }

    ;(req as any)[PROCESSING_FLAG] = true

    return {
      ...doc,
      myField: compute(doc),
    }
  }
}
```

---

## Problem: Hook se vůbec nespouští

### Symptom

- `localizedSlugs` pole je prázdné
- Žádné logy ani "Populated" zprávy
- Pole existuje v databázi ale není naplněné

### Příčiny

#### 1. **Plugin není zaregistrován v config**

```typescript
// ✅ SPRÁVNĚ
import { localizedSlugsPlugin } from '@kilivi-dev/payloadcms-localized-slugs'

// ❌ ŠPATNĚ - Plugin chybí
export default buildConfig({
  collections: [Pages, Posts],
  // ← localizedSlugsPlugin chybí!
})

export default buildConfig({
  collections: [Pages, Posts],
  plugins: [
    localizedSlugsPlugin({
      locales: ['en', 'cs'],
      collections: [{ collection: 'pages' }, { collection: 'posts' }],
    }),
  ],
})
```

#### 2. **Kolekce není v `collections` listu pluginu**

```typescript
// ❌ ŠPATNĚ - 'pages' není v listu
localizedSlugsPlugin({
  locales: ['en', 'cs'],
  collections: [
    { collection: 'posts' }, // ← Jen posts!
  ],
})

// ✅ SPRÁVNĚ
localizedSlugsPlugin({
  locales: ['en', 'cs'],
  collections: [{ collection: 'pages' }, { collection: 'posts' }],
})
```

#### 3. **Disable/enabled flag**

```typescript
// ❌ ŠPATNĚ - Plugin je disabled
localizedSlugsPlugin({
  enabled: false, // ← NOPE!
  // ...
})

// ✅ SPRÁVNĚ
localizedSlugsPlugin({
  enabled: true, // ← Explicitně true
  locales: ['en', 'cs'],
  collections: [{ collection: 'pages' }],
})
```

---

## Problem: Chyba typu "Cannot read property 'update'"

### Symptom

```
TypeError: req.payload.update is not a function
```

### Příčina

Hook se spustil v testu nebo v prostředí bez Payload runtime.

### Řešení

```typescript
// ✅ SPRÁVNĚ - Zkontroluj, jestli existuje
if (!req?.payload) {
  return doc  // Skip processing
}

try {
  await req.payload.update(...)
} catch (error) {
  if (enableLogging) {
    console.error('Failed:', error)
  }
}
```

---

## Problem: Multitenant - dokumenty se nezpracovávají správně

### Symptom

- Některé tenanty mají `localizedSlugs`, jiné ne
- Race conditions v logech
- Chyby s tenant ID

### Příčiny a řešení

#### 1. **Hook nezachází tenant kontext**

```typescript
// ❌ ŠPATNĚ - Ignoruje tenant
;(req as any)[PROCESSING_FLAG] = true

// ✅ SPRÁVNĚ - Tenant-aware
const tenantId = req.user?.tenantId || 'default'
const flagKey = (`${PROCESSING_FLAG}_${tenantId}`(req as any)[flagKey] = true)
```

#### 2. **Revalidace vyvolá víc hooků**

V multitenant prostředí se revalidace spustí pro každého tenantu. Pokud máte tři tenanty, hook se spustí 3x.

**Řešení:** To je normální - flag na `req` zastaví rekurzi pro daný request.

#### 3. **Zkontroluj tenant plugin pořadí**

```typescript
// ✅ VHODNÉ POŘADÍ
plugins: [
  multitenantPlugin({
    // Inicializuj tenant kontext
  }),
  localizedSlugsPlugin({
    // Hook bude mít tenant kontext
  }),
]
```

---

## Debugging - Jak zjistit co se děje

### 1. **Povolte loging**

```typescript
localizedSlugsPlugin({
  enableLogging: true, // ← Povolí detailní logy
  locales: ['en', 'cs'],
  collections: [{ collection: 'pages' }],
})
```

### 2. **Čti logy v pořadí**

```
🌐 Field check - slug: {...}           ← Kontrola pole
🌐 Field check - fullPath: {...}       ← Kontrola pole
🌐 Localization status: slug=true, fullPath=true  ← Status detekce
🌐 Populated localizedSlugs for pages: {...}  ← Výsledek
```

Pokud vidíš `{}` v poslední řádce → pole nejsou naplněná!

### 3. **Zkontroluj data v DB**

```bash
# Payload admin panel
# Jdi na Pages → Edit dokument → Podívej se na tab "Data"
# Zkontroluj: slug, fullPath, localizedSlugs
```

### 4. **Vlastní test**

```typescript
import { expect, test } from 'vitest'
import { createPopulateLocalizedSlugsHook } from './hooks'

test('hook copies slug and fullPath', async () => {
  const hook = createPopulateLocalizedSlugsHook({
    locales: ['en', 'cs'],
    slugField: 'slug',
    fullPathField: 'fullPath',
    enableLogging: true, // ← Vidíš logy v testerru
  })

  const doc = {
    id: '123',
    slug: { en: 'test', cs: 'test-cs' },
    fullPath: { en: '/test', cs: '/test-cs' },
    localizedSlugs: {},
  }

  const result = await hook({
    doc,
    operation: 'create',
    req: {},
    collection: { slug: 'pages' },
  })

  expect(result.localizedSlugs.en.slug).toBe('test')
  expect(result.localizedSlugs.cs.slug).toBe('test-cs')
})
```

---

## Kontrolní seznam - Debug steps

- [ ] Jsou pole `slug` a `fullPath` označená jako `localized: true`?
- [ ] Mají pole nějaké hodnoty? (nisu prázdná/undefined)
- [ ] Je plugin zaregistrován v `plugins` arrayi?
- [ ] Je kolekce v `collections` listu pluginu?
- [ ] Je plugin `enabled: true`?
- [ ] Vidíš logy v konzoli? (pokud `enableLogging: true`)
- [ ] Podívej se do DB - je tam `localizedSlugs` pole?
- [ ] Zkontroluj, jestli nejsou starší hooky volající `req.payload.update()`?

---

## FAQ

**Q: Plugin zkopíruje existující slug/fullPath a pak?**
A: Ano, vytvoří `localizedSlugs` pole se stejnými hodnotami. Pak už to jen vrátí - Payload CMS to persistence.

**Q: Musím manuálně naplnit slug/fullPath?**
A: Ano. Plugin je "kopírka" - musíš mít data v `slug`/`fullPath` polích. Ty musí být lokalizovaná!

**Q: Funguje bez multitenant pluginu?**
A: Ano, 100% bez problémů. Plugin nezávisí na multitenantovi.

**Q: Musím volat njakou funkci po uložení?**
A: Ne! Hook se spustí automaticky v `afterChange`.

**Q: Co když mám vlastní `afterChange` hooky?**
A: Všechny se spustí, stačí aby všechny vrátily dokument a nevolaly `req.payload.update()`.

---

## Reporting Issues

Pokud máš problém:

1. Povolj `enableLogging: true`
2. Zkopíruj logs
3. Zkontroluj kontrolní seznam výše
4. Otevři issue na GitHub s:
   - Logs (sanitizované osobní údaje)
   - Verze pluginu: `npm list @kilivi-dev/payloadcms-localized-slugs`
   - Payload verze: `npm list payload`
   - Collection config (slug + fullPath definice)
   - Multitenant? Ano/Ne

---

**Last Updated:** 2025-11-07  
**Version:** 1.0.0
