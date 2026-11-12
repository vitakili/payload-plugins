# Notice

`@kilivi/payload-plugin-seo` is a fork of
[`@focus-reactive/payload-plugin-seo`](https://www.npmjs.com/package/@focus-reactive/payload-plugin-seo),
originally developed by [FocusReactive](https://focusreactive.com) in
[focusreactive/payload-plugins](https://github.com/focusreactive/payload-plugins/tree/main/packages/payload-plugin-seo)
and released under the MIT License. The original copyright notice is kept in
[`LICENSE`](./LICENSE) as the MIT License requires.

This package is maintained independently by Kilián Vít. It is not an official
FocusReactive package, and FocusReactive does not endorse or support it.

## Origin

- Forked from upstream `main` at commit `78209561` (2026-11-09), which ships
  `@focus-reactive/payload-plugin-seo@1.10.2`.
- Includes changes proposed upstream by Kilián Vít that were not yet merged there:
  - [focusreactive/payload-plugins#227](https://github.com/focusreactive/payload-plugins/pull/227)
  - [focusreactive/payload-plugins#228](https://github.com/focusreactive/payload-plugins/pull/228)

  These cover a translated admin UI with a bundled Czech translation
  (`feat/seo-i18n`) and analysis of non-English locales with their own Yoast
  researcher (`fix/seo-locale-researcher`).

## Third-party runtime dependencies

The plugin imports these packages at runtime. They are installed as npm
dependencies and are **not** bundled into this package's `dist`:

| Package | License |
| --- | --- |
| [`yoastseo`](https://www.npmjs.com/package/yoastseo) | GPL-3.0 |
| [`@yoast/search-metadata-previews`](https://www.npmjs.com/package/@yoast/search-metadata-previews) | GPL-3.0 |

Yoast and the Yoast names are trademarks of Yoast BV. This package is not
affiliated with Yoast. If you distribute an application that bundles these
dependencies, their GPL-3.0 terms apply to that distribution.
