# Changelog

All notable changes to GameStuff Blocks are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.10.1] - 2026-08-13

### Fixed

- **Table**: sortable column headers now expose their sort state
  (`aria-sort`) so screen reader users can tell which column is
  currently sorted, and in which direction.
- **Table**: image cells now support alt text, whether the image is
  chosen from the Media Library or inserted by URL.

## [1.10.0] - 2026-08-09

### Added

- **Table** block: a documentation table with grouped rows (via a
  Divider control), built-in column sorting, and a search box. Three
  layout presets are available: **Standard** (a regular table),
  **Style 1 — Field List** (the same table on desktop, but a compact
  two-column label/value layout on mobile, no JavaScript required),
  and **Style 2 — Catalog Card** (renders each row as a card with an
  image, title, and subtitle instead of a table row — well suited to
  catalog-style content such as items, recipes, or database entries).
- Table columns can be typed as Text, Number, or Image (uploaded from
  the Media Library or linked directly by URL).
- A contextual toolbar for inserting, deleting, and retyping rows and
  columns, based on whichever cell is currently focused.
- Table's accent color follows the "Primary Color" setting, consistent
  with every other GameStuff block.

## [1.9.0] - 2026-08-01

### Added

- **GameStuff Tabs** and **Tab Item** blocks: content split into
  multiple panels that visitors switch between, with Underline and
  Sidebar style variants. The block is fully static — the tab strip,
  ARIA roles (following the WAI-ARIA Tabs Pattern), and switching
  behavior are all built at runtime on the front end, so a tab's
  content stays fully readable even if JavaScript fails to load.
- Tabs' accent color follows the "Primary Color" setting (Settings >
  GameStuff Blocks > Appearance), consistent with every other
  GameStuff block.

## [1.8.0] - 2026-07-31

### Added

- New **Info List** block: a compact box for displaying key-value
  attributes (e.g. an event's trigger requirements — Location, Time,
  Season, Weather) as a list of rows, each with an optional icon,
  label, and value.
- Optional **Requirements** section within Info List: a checklist of
  free-form requirement items, each with its own optional icon.
- Info List's accent color follows the "Primary Color" setting
  (Settings > GameStuff Blocks > Appearance), consistent with every
  other GameStuff block.

## [1.7.0] - 2026-07-31

### Changed

- Dark mode support for every block (Table of Contents, Accordion
  Item, Content Scroll Item, Character Infobox) is now automatic and
  requires no configuration. Each block's colors are now derived from
  the surrounding theme's own text color rather than a fixed
  light/dark color pair, so they adapt correctly to any theme's dark
  mode implementation without a site owner needing to identify and
  enter its CSS selector.
- New "Color Scheme" setting (Settings > GameStuff Blocks >
  Appearance) lets a site owner force Light or Dark for every block
  at once, for cases where a fixed appearance is preferred over
  automatic detection.
- Character Infobox and Table of Contents no longer render a drop
  shadow by default; both now rely on their border alone for visual
  separation, since a shadow cannot adapt automatically to light or
  dark the same way flat colors can. A shadow is still applied when
  Color Scheme is forced to Light or Dark.
- Accordion Item's background is now transparent in light mode as
  well as dark (previously white in light mode only).

### Removed

- The "Dark Mode Selector" setting and the internal service that
  powered it have been removed — no longer needed now that every
  block adapts automatically.

## [1.6.0] - 2026-07-29

### Added

- Per-block enable/disable toggles under Settings > GameStuff Blocks >
  Blocks, replacing the deny-list that previously had no admin UI of
  its own.
- Settings page is now organized into Appearance and Blocks tabs.

### Changed

- `BlockRegistry::get_disabled_blocks()` is now public, so the new
  Blocks tab can read current toggle state.
- Child blocks (Accordion Item, Content Scroll Item, Infobox Field,
  Timeline Item) no longer have an independent enable/disable state:
  they now follow their parent block's toggle automatically, since a
  child block can only ever be inserted inside its parent. Only
  top-level blocks appear as a toggle in the Blocks tab.
- `.distignore` now also excludes `CHANGELOG.md`, `README.md`, and
  `LICENSE.md` from the distributable zip — license terms remain
  declared in the plugin header and `readme.txt`.

## [1.5.1] - 2026-07-28

### Fixed

- TOC block's default title, which was left in Indonesian instead of
  being translated to English along with every other block's strings.
- Script translations were never registered for any block, so
  `__()`-wrapped editor strings had no way to actually be translated
  even once translation files existed for a locale.
- `HeadingCollector` fetched `post_content` with the default filtered
  context before re-parsing it into blocks; switched to the raw,
  unfiltered context that `parse_blocks()` expects.

### Added

- Lazy loading for Content Scroll Item thumbnail images.
- Caching for the TOC block's heading scan, invalidated automatically
  when a post is saved.

### Changed

- Internal refactor: the repeated "is this block present on the
  current page" check used for conditional asset loading is now a
  single shared helper instead of being duplicated per block.
- Various documentation and code-comment fixes for internal
  consistency.

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