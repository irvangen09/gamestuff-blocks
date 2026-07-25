# Changelog

All notable changes to GameStuff Blocks are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

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