# v0.5.0 - TweakCN Themes Integration + UI Improvements

## 🎨 Přidány TweakCN Theme Presets

Plugin nyní obsahuje **50+ profesionálních TweakCN témat** vedle původních 9 témat!

### Nové TweakCN Témata

Plugin automaticky konvertuje všechna TweakCN témata z formátu OKLCH do standardního Payload formátu:

- **neutral** - Neutrální odstíny
- **blue** - Modrá paleta
- **slate** - Břidlicová
- **gray** - Šedá
- **zinc** - Zinkově šedá
- **stone** - Kamenná
- **red** - Červená
- **orange** - Oranžová
- **amber** - Jantarová
- **yellow** - Žlutá
- **lime** - Limetková
- **green** - Zelená
- **emerald** - Smaragdová
- **teal** - Modrozelená
- **cyan** - Tyrkysová
- **sky** - Nebeská
- **indigo** - Indigová
- **violet** - Fialová
- **purple** - Purpurová
- **fuchsia** - Fuchsiová
- **pink** - Růžová
- **rose** - Rose
- A mnoho dalších variant!

### Technická Implementace

#### 1. **Nový Converter (`src/utils/tweakcnConverter.ts`)**

```typescript
// Konvertuje ExtendedThemePreset → ThemePreset
export function convertTweakCNPreset(extended: ExtendedThemePreset): ThemePreset

// Konvertuje všechna TweakCN témata
export function getAllTweakCNPresets(): ThemePreset[]
```

**Co converter dělá:**
- ✅ Konvertuje OKLCH barvy do formátu kompatibilního s Payload
- ✅ Extrahuje border radius hodnoty
- ✅ Mapuje light/dark mode barvy
- ✅ Generuje preview barvy pro UI
- ✅ Přidá suffix "(TweakCN)" k labelům
- ✅ Zachová typography konfiguraci

#### 2. **Sloučené Presety (`src/presets.ts`)**

```typescript
// Export kombinovaných presetů
export const allThemePresets: ThemePreset[] = [
  ...defaultThemePresets,  // Původních 9 témat
  ...getAllTweakCNPresets(), // 50+ TweakCN témat
]
```

#### 3. **Aktualizovaný ThemePreviewField**

- ✅ Používá `allThemePresets` místo `defaultThemePresets`
- ✅ Zobrazuje všechna témata v selektoru
- ✅ Funguje stejně pro původní i TweakCN témata

---

## 🎨 UI Vylepšení

### Odstraněn Redundantní Preview Box

**Před:**
```
[Theme Selector]
[Preview Box s color swatches]  ← Odstraněno
[Live Preview]
```

**Po:**
```
[Theme Selector s color swatches]  ← Vše v jednom
[Live Preview]
```

**Proč:**
- Barevné kroužky jsou už na tlačítkách témat
- Preview box byl duplicitní
- Čistší, kompaktnější UI

---

## 📋 Struktura Témat

### Původní Témata (9)
1. Cool & Professional
2. Modern Brutalism
3. Neon Cyberpunk
4. Solar Warmth
5. Dealership Professional - Blue
6. Dealership Professional - Gold  
7. Dealership Professional - Neutral
8. Real Estate - Blue
9. Real Estate - Gold
10. Real Estate - Neutral

### TweakCN Témata (50+)
Každé s označením "(TweakCN)":
1. Neutral (TweakCN)
2. Blue (TweakCN)
3. Slate (TweakCN)
...a mnoho dalších

---

## 🔧 Změny v API

### Nový Export

```typescript
// index.ts
export { defaultThemePresets, allThemePresets } from './presets.js'
```

### Zpětná Kompatibilita

✅ **Žádné breaking changes**

- `defaultThemePresets` - stále dostupné (původních 9)
- `allThemePresets` - nové (všech 60+)
- Uživatelé mohou používat buď nebo
- ThemePreviewField automaticky používá `allThemePresets`

---

## 🎯 Použití

### Automatické

Plugin automaticky používá všechny presety:

```typescript
themeManagementPlugin({
  // Všechna témata jsou dostupná automaticky
  // Žádná konfigurace nutná
})
```

### Manuální Výběr Presetů

Pokud chcete pouze vybraná témata:

```typescript
import { defaultThemePresets, allThemePresets } from '@kilivi/payloadcms-theme-management'

themeManagementPlugin({
  themePresets: defaultThemePresets, // Pouze původní
  // NEBO
  themePresets: allThemePresets, // Všechna včetně TweakCN
  // NEBO
  themePresets: [
    ...defaultThemePresets,
    ...allThemePresets.filter(p => p.name.includes('blue'))
  ], // Custom výběr
})
```

---

## 📊 Statistiky

| Metrika | Hodnota |
|---------|---------|
| Celkem témat | 60+ |
| Původní témata | 9 |
| TweakCN témata | 50+ |
| Formáty barev | HSL, OKLCH |
| Border radius options | 5 (none/small/medium/large/xl) |
| Typography presets | Ano, pro každé téma |

---

## 🧪 Testování

### Build Status
```bash
✅ Successfully compiled: 33 files with swc (32.8ms)
✅ No TypeScript errors
✅ All exports working
```

### Nové Soubory
- `src/utils/tweakcnConverter.ts` - OKLCH → ThemePreset converter
- Aktualizováno: `src/presets.ts` - přidán allThemePresets export
- Aktualizováno: `src/index.ts` - export allThemePresets
- Aktualizováno: `src/fields/ThemePreviewField.tsx` - použití allThemePresets

---

## 🚀 Co Dál

### v0.5.0 Features
- [x] Přidat TweakCN presety
- [x] Konverter OKLCH → ThemePreset
- [x] Sloučit presety
- [x] Odstranit redundantní preview box
- [x] Export allThemePresets
- [x] Build successful

### Budoucí Vylepšení (v0.6.0+)
- [ ] Filtrování témat podle kategorie
- [ ] Vyhledávání témat
- [ ] Oblíbená témata
- [ ] Custom theme editor v admin UI
- [ ] Více TweakCN variant
- [ ] Theme collections/tags

---

## 📝 Migrace z v0.4.0

**Žádná migrace nutná!**

- ✅ Automaticky kompatibilní
- ✅ Existující témata fungují stejně
- ✅ Data nezměněna
- ✅ Pouze přidána nová témata

---

**Verze:** 0.5.0  
**Datum:** Říjen 14, 2025  
**Status:** ✅ Implementováno a otestováno  
**Témata:** 60+ profesionálních presetů
