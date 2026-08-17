# GameStuff Blocks

A lightweight, WordPress-native collection of Gutenberg blocks for documentation, wiki, knowledge base, and article-driven websites.

GameStuff Blocks is built around a small set of well-made blocks rather than a large number of overlapping ones. Every block has a clear purpose, produces clean semantic HTML, is built with accessibility in mind, and loads no CSS or JavaScript it doesn't need.

## Requirements

- PHP 8.0+
- WordPress 6.9+

No jQuery or other legacy front-end libraries are used — blocks are built with modern, dependency-free JavaScript where scripting is needed at all.

## Blocks

- **TOC** — an automatic table of contents built from the article's headings, with anchor ids injected into the article body so each entry links directly to its section.
- **Accordion** — displays content as a set of collapsible panels.
- **Content Scroll** — a navigation grid on desktop that becomes a native horizontal scroll on mobile.
- **Timeline** — a vertical timeline for sequential content (events, walkthroughs, quests, etc.), with a Numbered Timeline variant.
- **Character Infobox** — a portrait + key/value information card, e.g. for character profiles, item stats, or quest summaries.
- **Info List** — a compact box of key-value attributes with an optional Requirements checklist, e.g. for an event's trigger conditions.
- **Tabs** — displays content in multiple panels that visitors switch between, with Underline and Sidebar style variants.
- **Table** — a documentation table with grouped rows, built-in sorting and search, cell text formatting (bold, italic, links), and three layout presets: Standard, Field List (a compact two-column layout on mobile), and Catalog Card (renders rows as an image/title/detail card grid).

## Settings

Available under **Settings → GameStuff Blocks**:

- **Primary Color** — accent color shared across every block that uses a site-wide accent.
- **Color Scheme** — Auto (default), Light, or Dark. Auto follows the visitor's theme automatically, with no configuration needed; Light/Dark force one fixed appearance for every block regardless of the theme.
- **Blocks** — enable or disable individual blocks. A disabled block is not registered, and loads no styles or scripts on the front end. Parent/child block pairs (e.g. Accordion and Accordion Item) share a single toggle.

## Installation

For end users, install this plugin like any other WordPress plugin: upload the plugin files (or the built `.zip`, see below) to `/wp-content/plugins/`, then activate it from the Plugins screen.

## Development

This repository contains the plugin's source. A build step is required before the plugin can be used — the `build/` directory is generated, not committed.

```bash
git clone https://github.com/irvangen09/gamestuff-blocks.git
cd gamestuff-blocks

npm install
npm run build
```

Useful scripts (see `package.json`):

| Script | Purpose |
| --- | --- |
| `npm run build` | Production build |
| `npm run start` | Development build with file watching |
| `npm run lint:js` | Lint JavaScript |
| `npm run lint:css` | Lint CSS/SCSS |
| `npm run format` | Auto-format source files |
| `npm run plugin-zip` | Package a distributable `.zip` |

PHP code quality tooling (WordPress Coding Standards) is managed separately via Composer and is dev-only — the plugin has no runtime dependency on `vendor/autoload.php`:

```bash
composer install

composer lint      # phpcs
composer lint:fix   # phpcbf
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full contribution workflow.

## Architecture

Each top-level block lives in its own folder under `src/`, and does not depend on any other block. A block's child blocks (e.g. Accordion Item, Tabs Item) live nested inside their parent's own folder rather than as separate top-level folders, so everything belonging to one feature stays in one place. Plugin-wide concerns (settings, dark mode, block registration) live under `includes/` as small, single-purpose services rather than being scattered across individual blocks.

## Security

See [SECURITY.md](SECURITY.md) for how to report a vulnerability.

## License

GPL-2.0-or-later. See the [LICENSE](LICENSE) file for details.