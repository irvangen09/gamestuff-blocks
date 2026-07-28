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
- **Content Scroll** — a navigation grid on desktop that becomes a native horizontal scroll on mobile, with an overflow-aware "more content" hint.
- **Timeline** — a vertical timeline for sequential content (events, walkthroughs, quests, etc.), with a Numbered Timeline variant.
- **Character Infobox** — a portrait + key/value information card, e.g. for character profiles, item stats, or quest summaries.

## Settings

Available under **Settings → GameStuff Blocks**:

- **Primary Color** — accent color shared across every block that uses a site-wide accent.
- **Dark Mode Selector** — the CSS selector your theme applies when its own dark mode is active (e.g. `.dark-mode`). Left empty, blocks instead follow the visitor's OS/browser dark mode preference.

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

Each block lives in its own folder under `src/`, follows the same internal structure, and does not depend on any other block. Plugin-wide concerns (settings, dark mode, block registration) live under `includes/` as small, single-purpose services rather than being scattered across individual blocks.

## Security

See [SECURITY.md](SECURITY.md) for how to report a vulnerability.

## License

GPL-2.0-or-later. See the [LICENSE](LICENSE) file for details.
