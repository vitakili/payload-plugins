# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: non-technical website owners and editors (usually one tenant of a multi-tenant SaaS) who tune how their own site looks from inside the Payload admin. They are not designers or developers. They pick a preset, adjust colors, fonts and appearance options, and want to see the result before saving.

Secondary: the developer who installs and configures the plugin (plugin options, standalone global/collection, SSR injection, export). They set it up once, and after that the editor works with it alone.

End visitors see the result on the public site, and can see the optional `ColorModeToggle` / `ThemeSwitcher` components.

## Product Purpose

Let a site owner give their site its own appearance (color palette, light/dark mode, typography, visual effects, component styles) in the Payload admin, without code, and publish it safely through SSR-injected CSS variables. Success means the editor gets a result they are happy with, it stays readable and accessible, and they never have to ask a developer for it.

## Positioning

- The **live preview is the centerpiece**. Every change shows up right away, and the preview is the main surface of the settings screen.
- It feels **native to Payload admin**. It uses Payload's CSS variables and light/dark mode and follows its conventions, so it doesn't look like a separate embedded app.
- **Accessibility is built in**. A live WCAG contrast audit of the whole palette in both modes offers one-click fixes, so a non-expert can't accidentally publish an unreadable palette.

## Operating Context

- Runs inside Payload CMS v3 admin (Next.js), as a tab injected into an existing collection, a standalone collection, or a standalone global.
- Main deployment: the owner's own multi-tenant SaaS, where each tenant has isolated appearance settings. The plugin is also published on npm as `@kilivi/payloadcms-theme-management`.
- Works with Payload Live Preview, cache revalidation (`/api/theme/revalidate`) and SSR injection (`ServerThemeInjector`).

## Capabilities and Constraints

- 60+ presets (including tweakcn, OKLCH extended styles), a palette generator from a brand color or logo, a color picker, a font picker (Google Fonts), and a live preview on several devices.
- A WCAG audit with suggested fixes, plus design-token export (W3C JSON, Tailwind v4/v3).
- Appearance sections: color modes, typography, visual effects, hero & background, component styles.
- Admin UI is React client components inside Payload; styles must not leak into the rest of the admin.
- Every admin string goes through i18n (`theme-management` namespace) with **cs and en** translations required. No hard-coded English.

## Product Principles

1. Show the result, don't describe it. The preview is more important than the form.
2. A non-technical editor must be unable to break the site: safe defaults, contrast warnings and fixes, reversible changes.
3. Stay part of Payload. Follow the admin's look, theme and behavior; no custom visual world.
4. Every string exists in Czech and English.
5. Keep options progressive. Presets come first, fine-tuning comes second.

## Accessibility & Inclusion

The admin UI itself and the palettes it generates must meet WCAG 2.1 AA (contrast, keyboard control, visible focus, `prefers-reduced-motion`), in both light and dark mode.
