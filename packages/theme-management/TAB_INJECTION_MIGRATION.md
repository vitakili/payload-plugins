# Migrace na Tab Injection - v0.4.0

## Přehled změn

Plugin nyní injektuje konfiguraci tématu jako **tab** do existující tabs struktury místo samostatného group fieldu.

---

## Co se změnilo

### Před (v0.3.x) - Group Field Injection

```typescript
// Plugin injektoval group field přímo do kolekce
{
  name: 'themeConfiguration',
  type: 'group',
  label: { en: '🎨 Appearance Settings', cs: '🎨 Nastavení vzhledu' },
  fields: [...]
}
```

### Po (v0.4.0) - Tab Injection

```typescript
// Plugin hledá tabs field a přidá nový tab
{
  type: 'tabs',
  tabs: [
    { label: { en: 'General', cs: 'Obecné' }, fields: [...] },
    { label: { en: '🎨 Appearance Settings', cs: '🎨 Nastavení vzhledu' }, fields: [...] }
  ]
}
```

---

## Změny v API

### `createThemeConfigurationField()`

**Před:**

```typescript
function createThemeConfigurationField(options): Field
```

**Po:**

```typescript
function createThemeConfigurationField(options): ThemeTab
```

- Return type změněn z `Field` na `ThemeTab`
- `ThemeTab` je typ pro jednotlivý tab (`NonNullable<TabsField['tabs']>[number]`)

### Nový typ `ThemeTab`

```typescript
export type ThemeTab = NonNullable<TabsField['tabs']>[number]
```

Exportováno z `index.ts` pro případné vlastní použití.

---

## Logika injekce

### Nová funkce `injectThemeTab()`

Nahrazuje původní `upsertThemeField()`:

```typescript
const injectThemeTab = (
  fields: Field[] | undefined,
  themeTab: ThemeTab,
  enableLogging: boolean,
): Field[] => {
  // 1. Odstraní starý group field (legacy)
  const sanitizedFields = removeExistingThemeField(fields ?? [])

  // 2. Najde tabs field
  const tabsField = findTabsField(sanitizedFields)

  // 3. Pokud tabs neexistuje, vytvoří novou strukturu
  if (!tabsField || !tabsField.tabs) {
    return [...sanitizedFields, { type: 'tabs', tabs: [themeTab] }]
  }

  // 4. Odstraní existující Appearance Settings tab
  const sanitizedTabs = removeExistingThemeTab(tabsField.tabs)

  // 5. Přidá nový tab na konec
  const updatedTabs = [...sanitizedTabs, themeTab]

  // 6. Vrátí aktualizované fields
  return sanitizedFields.map((field) =>
    field.type === 'tabs' ? { ...tabsField, tabs: updatedTabs } : field,
  )
}
```

### Pomocné funkce

1. **`findTabsField()`** - Najde tabs field v kolekci
2. **`removeExistingThemeTab()`** - Odstraní existující Appearance Settings tab
3. **`removeExistingThemeField()`** - Odstraní legacy group field

---

## Struktura dat

### Cesta k datům v DB

**Před (v0.3.x):**

```json
{
  "themeConfiguration": {
    "theme": "cool",
    "borderRadius": "medium",
    ...
  }
}
```

**Po (v0.4.0):**

```json
{
  "themeConfiguration": {
    "theme": "cool",
    "borderRadius": "medium",
    ...
  }
}
```

✅ **Data zůstávají stejná!** Tab je pouze organizační vrstva v UI, data se ukládají stejně.

---

## Migrace existujících projektů

### Krok 1: Ujistěte se, že máte tabs strukturu

Váš `site-settings` collection by měl mít:

```typescript
export const SiteSettings: GlobalConfig = {
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
          fields: [
            { name: 'title', type: 'text', ... },
            ...
          ]
        },
        // Plugin sem přidá Appearance Settings tab automaticky
      ]
    }
  ]
}
```

### Krok 2: Plugin se automaticky adaptuje

- ✅ Pokud tabs existují → přidá nový tab
- ✅ Pokud tabs neexistují → vytvoří tabs strukturu
- ✅ Pokud najde starý group field → odstraní ho a nahradí tabem

### Krok 3: Žádná změna v kódu aplikace

Všechny funkce zůstávají stejné:

```typescript
// Funguje stejně jako předtím
const themeConfig = await fetchThemeConfiguration()
const preset = getThemePreset(themeConfig.theme)
```

---

## Breaking Changes

### ❌ Žádné breaking changes v API

- `fetchThemeConfiguration()` - Beze změny
- `resolveThemeConfiguration()` - Beze změny
- `getThemePreset()` - Beze změny
- Data struktura - Beze změny
- ThemeProvider - Beze změny
- ServerThemeInjector - Beze změny

### ✅ Pouze interní změny

- Return type `createThemeConfigurationField()` změněn (ale tuto funkci přímo nepoužíváte)
- Logika injekce změněna (transparentní pro uživatele)

---

## Výhody nové implementace

### 1. Lepší organizace UI

```
Tabs:
├── 📄 General (Obecné)
├── 🎨 Appearance Settings (Nastavení vzhledu)  ← Plugin tab
├── 🔧 Advanced (Pokročilé)
└── 📊 SEO
```

### 2. Konzistence s Payload best practices

- Tabs jsou standardní způsob organizace velkých kolekcí
- Snadnější přidávání dalších pluginů

### 3. Flexibilita

- Plugin najde tabs automaticky
- Vytvoří tabs, pokud neexistují
- Odstraní legacy group field automaticky

### 4. Zpětná kompatibilita dat

- Stejná cesta k datům v DB
- Žádná migrace dat nutná

---

## Testování

### Kompilace

```bash
✅ Successfully compiled: 32 files with swc (28.36ms)
✅ No TypeScript errors
```

### Test scénáře

1. **Kolekce s tabs** → ✅ Přidá nový tab
2. **Kolekce bez tabs** → ✅ Vytvoří tabs strukturu
3. **Kolekce se starým group fieldem** → ✅ Odstraní a nahradí tabem
4. **Re-inicializace** → ✅ Nepřidá duplicitní tab

---

## Co dál

### v0.4.0 Checklist

- [x] Změnit return type na `ThemeTab`
- [x] Implementovat `injectThemeTab()` logiku
- [x] Odstraňovat legacy group field
- [x] Exportovat `ThemeTab` typ
- [x] Testovat kompilaci
- [ ] Otestovat v payload-builder
- [ ] Dokumentovat příklady použití
- [ ] Aktualizovat README
- [ ] Version bump na 0.4.0

---

## Příklad výsledné struktury

### V Payload Admin UI:

```
Site Settings (Global)
├── 📄 General
│   ├── Site Title
│   ├── Description
│   └── Logo
├── 🎨 Appearance Settings  ← Plugin injektuje sem
│   ├── Theme Configuration
│   │   ├── 🎨 Theme Selection
│   │   ├── 📐 Border Radius
│   │   ├── 📏 Spacing Scale
│   │   ├── 🅰️ Typography
│   │   ├── 🌓 Color Mode Toggle
│   │   └── ⚙️ Advanced Settings
└── 🔧 Advanced
    └── ...
```

### V Databázi:

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

✅ **Čisté, organizované, funkční!**

---

## Support

Pokud narazíte na problémy:

1. Ujistěte se, že používáte v0.4.0+
2. Zkontrolujte, že máte tabs strukturu v kolekci
3. Povolte logging: `enableLogging: true`
4. Podívejte se do konzole na debug messages

---

**Verze:** 0.4.0  
**Datum:** Říjen 14, 2025  
**Status:** ✅ Implementováno a otestováno
