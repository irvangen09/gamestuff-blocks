# Changelog

All notable changes to GameStuff Blocks are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.5.0] - 2026-07-28

### Added

- **Character Infobox** and **Infobox Field** blocks: a portrait +
  key/value information card, e.g. for character profiles, item
  stats, or quest summaries.
- Character Infobox's accent color is wired to the `primary_color`
  global setting, the same pattern used by TOC and Timeline.
- Dark mode styling for these blocks is generated through the shared
  `DarkMode` service, the same pattern used by TOC, Accordion, and
  Content Scroll.
- A custom `gamestuff_character` image size (270×360, scaled not
  cropped) for character portraits.

## [1.4.0] - 2026-07-28

### Added

- **Timeline** and **Timeline Item** blocks: a vertical timeline for
  sequential content (events, walkthroughs, quests, etc.), with a
  Numbered Timeline variant.
- Timeline's accent color is wired to the `primary_color` global
  setting, the same pattern used by TOC.

## [1.3.0] - 2026-07-26

### Added

- **Content Scroll** and **Content Scroll Item** blocks: a navigation
  grid on desktop that becomes a native horizontal scroll on mobile,
  with an overflow-aware "more content" hint.
- Dark mode styling for these blocks is generated through the shared
  `DarkMode` service, the same pattern used by TOC and Accordion.
- `src/shared/breakpoint.js` and `src/shared/tokens.scss`: the mobile
  breakpoint used by Accordion Item, Content Scroll, and Content
  Scroll Item is now defined in one place instead of being duplicated
  per block.

## [1.2.0] - 2026-07-26

### Added

- **Accordion** and **Accordion Item** blocks.
- Dark mode styling for these blocks is generated through the shared
  `DarkMode` service rather than a fixed theme selector, so it follows
  either the visitor's OS/browser preference or the active theme's own
  dark mode, depending on the Dark Mode Selector setting.

## [1.1.0] - 2026-07-26

### Added

- **TOC** block: an automatic table of contents built from the
  article's headings, with anchor ids injected into the article body
  so each entry links directly to its section.
- `dark_mode_selector` global setting and the `DarkMode` service.

## [1.0.0] - 2026-07-26

### Added

- Initial plugin foundation: bootstrap, autoloader, block registry,
  and the global settings page.
- `primary_color` global setting, applied as a CSS custom property
  across blocks that use it.