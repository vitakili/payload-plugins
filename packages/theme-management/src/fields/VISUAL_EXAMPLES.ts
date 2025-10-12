/**
 * Enhanced Font Selector - Visual Examples
 *
 * This file demonstrates how the font selector appears with actual fonts
 */

/**
 * BEFORE (Standard Payload Select):
 *
 * ┌──────────────────────────────┐
 * │ Body font             ▼      │
 * ├──────────────────────────────┤
 * │ System                       │
 * │ Inter                        │
 * │ Roboto                       │
 * │ Open Sans                    │
 * │ ...                          │
 * └──────────────────────────────┘
 *
 * Issues:
 * - No visual preview of fonts
 * - Can't see how font looks
 * - Generic dropdown appearance
 * - No distinction between fonts
 */

/**
 * AFTER (Custom Font Selector):
 *
 * ┌────────────────────────────────────┐
 * │ Body font                          │
 * │ ┌────────────────────────────┐     │
 * │ │ Inter               ▼      │     │
 * │ └────────────────────────────┘     │
 * └────────────────────────────────────┘
 *
 * Opens dropdown:
 *
 * ┌────────────────────────────────────┐
 * │ ✓ Inter                            │
 * │   The quick brown fox jumps...     │
 * │   (rendered in Inter font)         │
 * ├────────────────────────────────────┤
 * │   Roboto                           │
 * │   The quick brown fox jumps...     │
 * │   (rendered in Roboto font)        │
 * ├────────────────────────────────────┤
 * │   Playfair Display                 │
 * │   The quick brown fox jumps...     │
 * │   (rendered in Playfair font)      │
 * └────────────────────────────────────┘
 *
 * Features:
 * ✅ Live font preview
 * ✅ Check mark on selected
 * ✅ Hover effects
 * ✅ Smooth transitions
 * ✅ Font category badges
 */

/**
 * Color Picker BEFORE (Inline Popover):
 *
 * ┌────────────────────────────────┐
 * │ Primary color                  │
 * │ ┌───┐ #3b82f6                  │
 * │ │███│ ────────────             │
 * │ └───┘                          │
 * │   ┌──────────────────┐         │
 * │   │  Color Picker    │         │
 * │   │  [Hex Wheel]     │         │
 * │   │  #3b82f6         │         │
 * │   └──────────────────┘         │
 * └────────────────────────────────┘
 *
 * Issues:
 * - Takes up inline space
 * - Hard to use on mobile
 * - No quick color swatches
 * - Click-outside handling complex
 */

/**
 * Color Picker AFTER (Modal Drawer):
 *
 * Field:
 * ┌────────────────────────────────┐
 * │ Primary color                  │
 * │ ┌───┐ #3b82f6                  │
 * │ │███│ ────────────             │
 * │ └───┘                          │
 * └────────────────────────────────┘
 *
 * Click swatch → Opens Modal:
 *
 * ╔════════════════════════════════╗
 * ║ Choose Primary color      [×]  ║
 * ╠════════════════════════════════╣
 * ║                                ║
 * ║   ┌────────────────────┐       ║
 * ║   │                    │       ║
 * ║   │   [Color Wheel]    │       ║
 * ║   │                    │       ║
 * ║   └────────────────────┘       ║
 * ║                                ║
 * ║   #3b82f6          [Done]      ║
 * ║                                ║
 * ║   Quick Colors:                ║
 * ║   ┌──┬──┬──┬──┬──┬──┬──┬──┐   ║
 * ║   │██│██│██│██│██│██│██│██│   ║
 * ║   └──┴──┴──┴──┴──┴──┴──┴──┘   ║
 * ║                                ║
 * ╚════════════════════════════════╝
 *
 * Features:
 * ✅ Full-screen modal (Payload Drawer)
 * ✅ Larger color picker (220px)
 * ✅ Quick color swatches
 * ✅ Better mobile UX
 * ✅ Escape key to close
 */

/**
 * Theme Preset Selector (Already Had Swatches!):
 *
 * ┌─────────────────────────────────────┐
 * │ Cool & Professional     ●●●●●       │
 * │ cool                                │
 * ├─────────────────────────────────────┤
 * │ Warm & Inviting        ●●●●●       │
 * │ warm                                │
 * ├─────────────────────────────────────┤
 * │ Dark & Modern          ●●●●●       │
 * │ dark                                │
 * └─────────────────────────────────────┘
 *
 * Legend:
 * ● = Color swatch for:
 *     - Primary
 *     - Secondary
 *     - Accent
 *     - Background
 *     - Foreground
 */

export const examples = {
  fontSelector: {
    before: 'Standard dropdown with no preview',
    after: 'Custom component with live font rendering',
  },
  colorPicker: {
    before: 'Inline popover',
    after: 'Modal drawer with quick swatches',
  },
  themePresets: {
    status: 'Already implemented with color swatches!',
  },
}
