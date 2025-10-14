# ✅ v0.4.0 - Tab Injection Implementace

## Shrnutí změn

Plugin nyní injektuje konfiguraci tématu jako **tab** do existující tabs struktury v SiteSettings kolekci místo samostatného group fieldu.

---

## 🎯 Co bylo provedeno

### 1. **Změna Return Type v `themeConfigurationField.ts`**

```typescript
// Přidán nový typ
export type ThemeTab = NonNullable<TabsField['tabs']>[number]

// Funkce nyní vrací tab místo field
export function createThemeConfigurationField(options): ThemeTab {
  return {
    label: {
      en: '🎨 Appearance Settings',
      cs: '🎨 Nastavení vzhledu',
    },
    fields: [
      {
        name: 'themeConfiguration',
        type: 'group',
        admin: {
          description: {
            en: 'Configure website appearance and styling',
            cs: 'Nakonfigurujte vzhled a stylování webu',
          },
        },
        fields,
      },
    ],
  }
}
```

### 2. **Nová Logika v `index.ts`**

Implementovány 3 nové pomocné funkce:

#### `findTabsField()` - Najde tabs field

```typescript
const findTabsField = (fields: Field[] = []): TabsField | null => {
  for (const field of fields) {
    if (field.type === 'tabs') {
      return field as TabsField
    }
  }
  return null
}
```

#### `removeExistingThemeTab()` - Odstraní duplicitní tab

```typescript
const removeExistingThemeTab = (tabs): NonNullable<TabsField['tabs']> => {
  return tabs.filter((tab) => {
    const labelEn =
      typeof tab.label === 'object' && tab.label !== null
        ? (tab.label as { en?: string }).en
        : tab.label
    return labelEn !== '🎨 Appearance Settings' && labelEn !== 'Appearance Settings'
  })
}
```

#### `injectThemeTab()` - Hlavní injekční logika

```typescript
const injectThemeTab = (
  fields: Field[] | undefined,
  themeTab: ThemeTab,
  enableLogging: boolean,
): Field[] => {
  // 1. Odstraní legacy group field
  const sanitizedFields = removeExistingThemeField(fields ?? [])

  // 2. Najde tabs field
  const tabsField = findTabsField(sanitizedFields)

  // 3. Pokud tabs neexistuje, vytvoří novou strukturu
  if (!tabsField || !tabsField.tabs) {
    const newTabsField: TabsField = {
      type: 'tabs',
      tabs: [themeTab],
    }
    return [...sanitizedFields, newTabsField]
  }

  // 4. Odstraní existující Appearance Settings tab
  const sanitizedTabs = removeExistingThemeTab(tabsField.tabs)

  // 5. Přidá nový tab na konec
  const updatedTabs = [...sanitizedTabs, themeTab]

  // 6. Aktualizuje tabs field
  const updatedTabsField: TabsField = {
    ...tabsField,
    tabs: updatedTabs,
  }

  // 7. Vrátí aktualizované fields
  return sanitizedFields.map((field) => (field.type === 'tabs' ? updatedTabsField : field))
}
```

### 3. **Export Nového Typu**

```typescript
export type { ThemeTab } from './fields/themeConfigurationField.js'
```

---

## 📊 Výsledná Struktura

### V SiteSettings Collection:

```typescript
{
  slug: 'site-settings',
  fields: [
    {
      name: 'hiddenLabel',
      type: 'text',
      defaultValue: 'Site Settings',
      admin: { hidden: true },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: { en: 'General', cs: 'Obecné' },
          fields: [...]
        },
        {
          label: { en: '🎨 Appearance Settings', cs: '🎨 Nastavení vzhledu' },  // ← Plugin injektuje sem
          fields: [
            {
              name: 'themeConfiguration',
              type: 'group',
              fields: [
                { name: 'theme', type: 'select', ... },
                { name: 'borderRadius', type: 'select', ... },
                { name: 'spacing', type: 'select', ... },
                ...
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### V Databázi (beze změny):

```json
{
  "_id": "...",
  "title": "My Site",
  "themeConfiguration": {
    "theme": "cool",
    "borderRadius": "medium",
    "spacing": "medium",
    "typography": { ... },
    "lightMode": { ... },
    "darkMode": { ... }
  }
}
```

---

## ✅ Test Results

### Jest Unit Tests

```
✅ PASS tests/css-validation.test.ts (6.113s)
✅ PASS tests/unit/fields.test.ts (6.405s)
✅ PASS tests/unit/ThemePreviewField.test.tsx (7.797s)

Test Suites: 3 passed, 3 total
Tests:       17 passed, 17 total
Time:        9.504s
```

### Build

```
✅ Successfully compiled: 32 files with swc (34.44ms)
✅ No TypeScript errors
✅ All assets copied
```

---

## 🔄 Zpětná Kompatibilita

### ✅ Data zůstávají stejná

- Cesta k datům: `themeConfiguration.*` (beze změny)
- Struktura dat: identická
- Žádná migrace dat nutná

### ✅ API beze změny

- `fetchThemeConfiguration()` - funguje stejně
- `resolveThemeConfiguration()` - funguje stejně
- `getThemePreset()` - funguje stejně
- `ThemeProvider` - funguje stejně
- `ServerThemeInjector` - funguje stejně

### ✅ Automatická migrace legacy fieldu

- Plugin automaticky odstraní starý `themeConfiguration` group field
- Nahradí ho novým tabem

---

## 🚀 Chování Pluginu

### Scénář 1: Kolekce má tabs

```typescript
// Plugin najde tabs a přidá nový tab
tabs: [
  { label: 'General', ... },
  { label: '🎨 Appearance Settings', ... }  // ← Přidáno
]
```

### Scénář 2: Kolekce nemá tabs

```typescript
// Plugin vytvoří tabs strukturu
{
  type: 'tabs',
  tabs: [
    { label: '🎨 Appearance Settings', ... }  // ← První tab
  ]
}
```

### Scénář 3: Legacy group field existuje

```typescript
// Plugin odstraní:
{ name: 'themeConfiguration', type: 'group', ... }  // ❌ Smazáno

// A nahradí:
tabs: [
  { label: '🎨 Appearance Settings', ... }  // ✅ Nový tab
]
```

### Scénář 4: Re-inicializace

```typescript
// Plugin nenačte duplicitní tab díky removeExistingThemeTab()
tabs: [
  { label: '🎨 Appearance Settings', ... }  // ✅ Pouze jeden
]
```

---

## 📝 Breaking Changes

### ❌ Žádné breaking changes pro koncové uživatele

Všechny změny jsou **interní**:

- Return type `createThemeConfigurationField()` změněn (ale tuto funkci přímo nepoužíváte)
- Logika injekce změněna (transparentní)
- Data struktura stejná
- API stejné

---

## 📚 Dokumentace

Vytvořeny nové dokumentační soubory:

1. **TAB_INJECTION_MIGRATION.md** - Detailní migrace guide
2. **RELEASE_v0.4.0.md** - Tento soubor

---

## 🎉 Hotovo!

Plugin je nyní připraven k použití s tab injection strukturou:

- ✅ Kompilace úspěšná
- ✅ Všechny testy prošly
- ✅ Zpětná kompatibilita zachována
- ✅ Data struktura beze změny
- ✅ API beze změny
- ✅ Dokumentace vytvořena

**Verze:** 0.4.0  
**Datum:** Říjen 14, 2025  
**Status:** ✅ Ready to publish
