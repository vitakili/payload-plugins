# Hook Injection Guide pro Payload CMS

## Jak správně injectovat `afterChange` hooky

### ❌ Špatně - Přímá mutace kolekce

```typescript
// ❌ NEDĚLA - Mutuje originální kolekci
const collection = {
  ...baseCollection,
  hooks: {
    ...collection.hooks,
    afterChange: [...(collection.hooks?.afterChange || []), newHook],
  },
}
```

**Problém:** Může způsobit problémy s references a neočekávané chování.

### ✅ Správně - Immutable spread s fallback

```typescript
// ✅ SPRÁVNĚ - Bezpečné spread
return {
  ...collection,
  hooks: {
    ...collection.hooks,
    afterChange: [...(collection.hooks?.afterChange || []), populateLocalizedSlugsHook],
  },
}
```

**Výhody:**

- ✅ Immutable pattern
- ✅ Zachovává originální kolekci
- ✅ Koexistence s ostatními hooky
- ✅ Kompatibilní s multitenant pluginy

### Struktura Plugin Signature

```typescript
interface Plugin = (config: Config) => Config

// Implementace:
export const myPlugin = (options: PluginOptions = {}): Plugin => {
  return (config: Config): Config => {
    // Modifikace config
    return {
      ...config,
      collections: config.collections?.map(collection => {
        // Per-collection modifications
        return {
          ...collection,
          fields: [...(collection.fields || []), newField],
          hooks: {
            ...collection.hooks,
            afterChange: [
              ...(collection.hooks?.afterChange || []),
              newHook,
            ],
          },
        }
      }),
    }
  }
}
```

## Bezpečné Hook Injection

### 1. **Vždycky zkontroluj existující hooky**

```typescript
// ❌ Špatně - Přepíše stávající hooky
hooks: {
  afterChange: [newHook],  // ← Ztratí ostatní hooky!
}

// ✅ Správně - Přidá k existujícím
hooks: {
  ...collection.hooks,
  afterChange: [
    ...(collection.hooks?.afterChange || []),
    newHook,
  ],
}
```

### 2. **Vždycky vrať config (pure function)**

```typescript
// ❌ Špatně - Mutuje config
config.collections[0].hooks.afterChange.push(myHook)
return config

// ✅ Správně - Vrátí nový config
return {
  ...config,
  collections: config.collections?.map((col) => ({
    ...col,
    hooks: {
      /* ... */
    },
  })),
}
```

### 3. **Řeš undefined/null bezpečně**

```typescript
// ❌ Špatně - Padne s "Cannot read property 'afterChange'"
config.collections?.forEach((col) => {
  col.hooks.afterChange.push(myHook) // ← col.hooks je undefined!
})

// ✅ Správně - Defensivní spread
const afterChange = [...(collection.hooks?.afterChange || []), myHook]
```

## Prevence Nekonečných Smyček

### Problem: Recursive Hook Calls

```
Document Save
  → afterChange Hook #1 (calls req.payload.update)
    → Document Save (again!)
      → afterChange Hook #1 (calls req.payload.update)
        → Document Save (again!)
          → ... infinite loop ✗
```

### Solution: Use Request Context Flag

```typescript
const HOOK_PROCESSING_FLAG = '__my_hook_processing__'

export const myHook = (): CollectionAfterChangeHook => {
  return async ({ doc, req, collection }) => {
    // Prevent recursive calls
    if ((req as any)?.[HOOK_PROCESSING_FLAG]) {
      return doc // Skip processing
    }

    // Mark that we're processing
    ;(req as any)[HOOK_PROCESSING_FLAG] = true

    // Do your work on the returned document
    const updatedDoc = {
      ...doc,
      myComputedField: computeValue(doc),
    }

    // ✅ RETURN the document, don't call req.payload.update()
    // Payload CMS will automatically persist it
    return updatedDoc
  }
}
```

### Key Points:

1. **❌ NIKDY** nevolejte `req.payload.update()` z `afterChange` hooku
2. **✅ VŽDYCKY** vrátěte upravený dokument
3. **✅ VŽDYCKY** zkontrolujte request flag
4. **✅ VŽDYCKY** markujte, že jste zpracovali dokument

## Multitenant Kompatibilita

### S Multitenant Pluginem

```typescript
export default buildConfig({
  plugins: [
    // Pořadí NENÍ důležité s naším přístupem
    multitenantPlugin({
      // config
    }),
    localizedSlugsPlugin({
      // config
    }),
  ],
})
```

**Proč to funguje:**

- ✅ Oba hooky vracejí dokument bez externích volání
- ✅ Payload CMS jen jednou persistence finální dokument
- ✅ Žádné rekurze ani race conditions
- ✅ Tenant switching je transparentní

### Bez Multitenant Pluginu

Stejná logika - bezpečné hook injection funguje všude!

```typescript
export default buildConfig({
  plugins: [
    localizedSlugsPlugin({
      /* config */
    }),
    otherPlugin({
      /* config */
    }),
  ],
})
```

## Debug Hook Execution

```typescript
const myHook = (): CollectionAfterChangeHook => {
  return async ({ doc, operation, req, collection }) => {
    console.log('🔄 Hook executed:', {
      collection: collection.slug,
      operation,
      documentId: doc.id,
      timestamp: new Date().toISOString(),
    })

    // Check if we're preventing recursion
    if ((req as any)?.[HOOK_PROCESSING_FLAG]) {
      console.log('⏭️  Skipping - already processed')
      return doc
    }

    console.log('✅ Processing document')
    return doc
  }
}
```

## Testování Hook Injection

```typescript
import { expect, test } from 'vitest'

test('plugin injects hook correctly', () => {
  const baseCollection = {
    slug: 'pages',
    fields: [],
    hooks: { afterChange: [existingHook] },
  }

  const plugin = myPlugin()
  const config = plugin({ collections: [baseCollection] })

  const enhancedCollection = config.collections?.[0]

  // Oba hooky by měly být přítomny
  expect(enhancedCollection?.hooks?.afterChange).toHaveLength(2)
  expect(enhancedCollection?.hooks?.afterChange).toContain(existingHook)
  expect(enhancedCollection?.hooks?.afterChange).toContain(myNewHook)
})
```

## Summary

| Aspekt         | ✅ Správně   | ❌ Špatně                   |
| -------------- | ------------ | --------------------------- |
| Hook vracení   | Return doc   | Call `req.payload.update()` |
| Existing hooks | Spread + add | Přepiš array                |
| Recursion      | Check flag   | Žádná prevence              |
| Mutability     | Immutable    | Mutuj config                |
| Multitenant    | Kompatibilní | Problémy                    |

---

**Reference:** Payload CMS v3 Hooks Documentation  
**Updated:** 2025-11-07
