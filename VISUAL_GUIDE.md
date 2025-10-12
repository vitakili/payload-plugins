# Vizuální Průvodce - UI Komponenty

## 1. Color Picker Popover (Kompaktní)

```
┌─────────────────────────────────────┐
│ Primary Color                       │
│                                     │
│  ┌──┐  #3b82f6                      │
│  │██│  ──────────────               │
│  └──┘                               │
│    ↓ (klik)                         │
│  ┌─────────────────────────┐        │
│  │                         │        │
│  │   [Color Wheel]         │        │
│  │      160px              │        │
│  │                         │        │
│  ├─────────────────────────┤        │
│  │ #3b82f6        [OK]     │        │
│  ├─────────────────────────┤        │
│  │ Rychlé barvy:           │        │
│  │ ██ ██ ██ ██ ██ ██      │        │
│  │ ██ ██ ██ ██ ██ ██      │        │
│  └─────────────────────────┘        │
│         280px wide                  │
└─────────────────────────────────────┘
```

**Klíčové vlastnosti:**

- Šířka: 280px (kompaktní)
- Výška color pickeru: 160px
- Position: `absolute` (nad fieldem)
- Grid rychlých barev: 6×2
- Zavře se: klik mimo nebo tlačítko "OK"

---

## 2. Theme Preset Select (S barevnými kruhy)

### Zavřený stav:

```
┌──────────────────────────────────────────┐
│ 🎨 Přednastavené téma                    │
├──────────────────────────────────────────┤
│ Cool & Professional   ●●●●●          ▼   │
│                       └─ 5 kruhů         │
└──────────────────────────────────────────┘
```

### Otevřený dropdown:

```
┌──────────────────────────────────────────┐
│ Cool & Professional          ●●●●●       │
│                                          │
│ Warm & Inviting             ●●●●●       │
│                                          │
│ Dark & Modern               ●●●●●       │
│                                          │
│ Minimalist Zen              ●●●●●       │
│                                          │
│ Vibrant Neon                ●●●●●       │
│                                          │
│ Real Estate Gold            ●●●●●       │
└──────────────────────────────────────────┘
```

**Barevné kruhy (swatches):**

- V tlačítku: 20px průměr
- V dropdownu: 24px průměr
- Pořadí: Primary, Secondary, Accent, Background, Foreground
- Max 5 kruhů per téma

---

## 3. Font Select (S náhledem písma)

### Zavřený stav:

```
┌──────────────────────────────────────────┐
│ Body Font                                │
├──────────────────────────────────────────┤
│ Inter                              ▼     │
│ (zobrazeno v Inter fontu)                │
└──────────────────────────────────────────┘
```

### Otevřený dropdown:

```
┌──────────────────────────────────────────┐
│ ✓ Inter                                  │
│   The quick brown fox jumps...           │
│   (v Inter fontu)                        │
├──────────────────────────────────────────┤
│   Roboto                                 │
│   The quick brown fox jumps...           │
│   (v Roboto fontu)                       │
├──────────────────────────────────────────┤
│   Playfair Display                       │
│   The quick brown fox jumps...           │
│   (v Playfair fontu)                     │
├──────────────────────────────────────────┤
│   Custom font...                         │
│   Specify custom font below              │
│   (italic, bez preview)                  │
└──────────────────────────────────────────┘
```

**Preview text:**

- Standardní fonty: "The quick brown fox jumps over the lazy dog"
- "preset": "Use theme preset font" (kurzívou)
- "custom": "Specify custom font below" (kurzívou)

---

## Porovnání velikostí

### Color Picker:

| Verze             | Šířka                 | Výška pickeru | Umístění     |
| ----------------- | --------------------- | ------------- | ------------ |
| ❌ Drawer (starý) | 100% (celá obrazovka) | 220px         | Modal drawer |
| ✅ Popover (nový) | 280px                 | 160px         | Nad fieldem  |

### Theme Swatches:

| Kontext  | Průměr | Počet | Border   |
| -------- | ------ | ----- | -------- |
| Tlačítko | 20px   | 5     | 1px rgba |
| Dropdown | 24px   | 5     | 1px rgba |

### Font Preview:

| Element       | Font Size | Font Family  | Style  |
| ------------- | --------- | ------------ | ------ |
| Název fontu   | 14px      | Vybraný font | Normal |
| Preview text  | 16px      | Vybraný font | Normal |
| Spec. položky | 16px      | inherit      | Italic |

---

## Interakce a stavy

### Color Picker:

```
Zavřeno → Klik na barevný vzorek → Otevře se popover
                                         ↓
                          Klik "OK" nebo mimo → Zavře se
```

### Theme Select:

```
Zavřeno (s kruhy) → Klik → Otevře dropdown (kruhy u všech)
                              ↓
                    Výběr tématu → Zavře se (kruhy u vybraného)
```

### Font Select:

```
Zavřeno (v písmu) → Klik → Otevře dropdown (preview všech)
                              ↓
                    Výběr fontu → Zavře se (v novém písmu)
```

---

## Responzivita

### Color Picker Popover:

- Desktop: 280px široký, vpravo zarovnaný
- Mobile: Může přetéct (overflow-x: visible)
- Z-index: 1000 (nad ostatními elementy)

### Theme & Font Selects:

- Width: 100% (přizpůsobí se containeru)
- Max height dropdown: 320px (scrollovatelné)
- Min width: 260px (zachová čitelnost)

---

## CSS Variables používané

```css
--theme-elevation-0       /* Pozadí popoveru/selectu */
--theme-elevation-50      /* Hover pozadí */
--theme-elevation-100     /* Vybraná položka */
--theme-elevation-150     /* Bordery inputů */
--theme-elevation-200     /* Bordery selectů */
--theme-elevation-400     /* Hover border */
--theme-elevation-500     /* Labels, text */
--theme-elevation-800     /* Hlavní text */
--theme-input-bg          /* Pozadí inputu */
```

---

## Accessibility

### Keyboard Navigation:

- ✅ Tab: Mezi fieldy
- ✅ Enter/Space: Otevře select
- ✅ Arrow keys: Navigace v dropdownu
- ✅ Escape: Zavře dropdown/popover

### ARIA Labels:

- ✅ `aria-label="Open color picker"` na color swatchu
- ✅ `aria-label="Select {color}"` na quick colors
- ✅ Semantic HTML (button, label)

### Screen Readers:

- Všechny interaktivní elementy jsou `<button>`
- Labels jsou správně propojené
- Color values čitelné z text inputu

---

## Ukázka kódu

### Color Picker Popover:

```tsx
<div style={{ position: 'relative' }}>
  <button onClick={() => setShowPicker(!showPicker)}>{/* Color swatch */}</button>

  {showPicker && (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        marginTop: '8px',
        width: '280px',
        zIndex: 1000,
      }}
    >
      <HexColorPicker height={160} />
      {/* Quick colors grid */}
    </div>
  )}
</div>
```

### Theme Select Swatches:

```tsx
<div style={{ display: 'flex', gap: '4px' }}>
  {colors.map((color) => (
    <span
      style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: color,
      }}
    />
  ))}
</div>
```

### Font Preview:

```tsx
<button
  style={{
    fontFamily: option.fontFamily || 'inherit',
  }}
>
  <div>{option.label}</div>
  <div style={{ fontSize: '16px' }}>The quick brown fox jumps...</div>
</button>
```

---

## Finální checklist ✅

- ✅ Color picker je kompaktní popover (ne drawer)
- ✅ Color picker je 280px široký
- ✅ Color picker má rychlé barvy v 6×2 gridu
- ✅ Theme select má barevné kruhy v tlačítku
- ✅ Theme select má barevné kruhy v dropdownu
- ✅ Theme select zobrazuje 5 barev per téma
- ✅ Font select zobrazuje názvy v odpovídajícím písmu
- ✅ Font select má preview text "The quick brown fox..."
- ✅ Font select má speciální text pro "preset" a "custom"
- ✅ Všechny komponenty mají click-outside handler
- ✅ Všechny komponenty používají theme variables
- ✅ Build je úspěšný (38 souborů)
