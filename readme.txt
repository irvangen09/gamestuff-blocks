=== GameStuff Blocks ===
Contributors: irvannoerfazri
Tags: gutenberg, blocks, documentation, wiki, knowledge-base
Requires at least: 6.9
Tested up to: 6.9
Requires PHP: 8.0
Stable tag: 1.10.1
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A lightweight, WordPress-native collection of Gutenberg blocks for documentation, wiki, and knowledge base websites.

== Description ==

GameStuff Blocks provides a focused set of Gutenberg blocks built specifically for documentation, wiki, knowledge base, and article-driven websites — designed to feel like a natural part of the Block Editor rather than a bolted-on addition.

Every block is built with a clear purpose, clean semantic HTML, accessibility in mind, and no unnecessary CSS or JavaScript. The plugin favors a small number of well-made blocks over a large number of overlapping ones.

Only the blocks a page actually uses are registered and loaded — an inactive block adds no styles or scripts on the front end.

Blocks currently available:

* TOC — an automatic table of contents built from the article's headings.
* Accordion — displays content as a set of collapsible panels.
* Content Scroll — a navigation grid on desktop that becomes a horizontal scroll on mobile.
* Timeline — a vertical timeline for sequential content, with a numbered variant.
* Character Infobox — a portrait + key/value information card, e.g. for character profiles or item stats.
* Info List — a compact box of key-value attributes with an optional Requirements checklist, e.g. for an event's trigger conditions.
* Tabs — displays content in multiple panels that visitors switch between, with Underline and Sidebar style variants.
* Table — a documentation table with grouped rows, built-in sorting and search, and three layout presets — including a catalog-card view for item or database-style content.

More content blocks are introduced in subsequent releases.

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/gamestuff-blocks` directory, or install the plugin directly through the WordPress plugins screen.
2. Activate the plugin through the "Plugins" screen in WordPress.
3. Configure global settings under Settings > GameStuff Blocks.

== Frequently Asked Questions ==

= Does this plugin depend on jQuery or other front-end libraries? =

No. Blocks are built with modern, dependency-free JavaScript where scripting is needed at all.

= Can I disable blocks I don't use? =

Yes. Go to Settings > GameStuff Blocks > Blocks and switch off any block you don't need. A disabled block is not just hidden from the inserter — it isn't registered at all, so its CSS and JavaScript are never loaded on the front end either.

Blocks made up of a parent and a child (e.g. Accordion and Accordion Item) share a single toggle: disabling the parent disables the child with it, since the child can only ever be used inside its parent.

= How does dark mode work? =

Every block automatically adapts to your theme's dark mode — no setup needed. If a site owner wants one fixed appearance regardless of the theme instead, the "Color Scheme" setting under Settings > GameStuff Blocks > Appearance can force every block to Light or Dark.

= What are the Table block's layout presets? =

Standard is a regular table. Style 1 (Field List) looks the same as Standard on desktop, but switches to a compact two-column label/value layout on mobile — no JavaScript required. Style 2 (Catalog Card) renders each table row as a card with an image, title, and subtitle instead of a table row, which suits catalog-style content (items, recipes, database entries) better than a plain table.

== Changelog ==

= 1.10.1 =
* Table: sortable column headers now announce their sort state to screen readers.
* Table: image cells now support alt text.

= 1.10.0 =
* Added the Table block, with built-in sorting, search, grouped rows, and three layout presets (Standard, Field List, Catalog Card).

= 1.9.0 =
* Added the Tabs block, with Underline and Sidebar style variants.

= 1.8.0 =
* Added the Info List block, with an optional Requirements checklist.

= 1.7.0 =
* Dark mode now works automatically for every block — no CSS selector setup needed.
* New "Color Scheme" setting to force Light or Dark for every block at once, if preferred.
* Removed the "Dark Mode Selector" setting, no longer needed.

= 1.6.0 =
* Added per-block enable/disable toggles under Settings > GameStuff Blocks > Blocks.
* Settings page is now organized into Appearance and Blocks tabs.

= 1.5.1 =
* Fixed a leftover default title on the TOC block not being translated to English.
* Fixed script translations not being registered for any block, so translated strings weren't showing up in the editor.
* Improved TOC performance by caching the heading scan on a per-post basis.
* Added lazy loading to Content Scroll Item images.
* Various internal code-quality and documentation fixes.

= 1.5.0 =
* Added the Character Infobox and Infobox Field blocks.

= 1.4.0 =
* Added the Timeline and Timeline Item blocks.

= 1.3.0 =
* Added the Content Scroll and Content Scroll Item blocks.

= 1.2.0 =
* Added the Accordion and Accordion Item blocks.

= 1.1.0 =
* Added the TOC block.
* Added the Dark Mode Selector setting.

= 1.0.0 =
* Initial plugin foundation: bootstrap, block registry, and global settings page.

== Upgrade Notice ==

= 1.10.1 =
Accessibility fixes for the Table block. No breaking changes.

= 1.10.0 =
Adds the Table block. No breaking changes.

= 1.9.0 =
Adds the Tabs block. No breaking changes.

= 1.8.0 =
Adds the Info List block. No breaking changes.

= 1.7.0 =
Dark mode is now automatic for every block. If you had configured a Dark Mode Selector, it's no longer needed and has been removed — no action required.

= 1.6.0 =
Adds per-block enable/disable toggles under Settings > GameStuff Blocks. No breaking changes.

= 1.5.1 =
Bug fixes and performance improvements; no new blocks. Safe to update.

= 1.5.0 =
Adds the Character Infobox and Infobox Field blocks.

= 1.4.0 =
Adds the Timeline and Timeline Item blocks.

= 1.3.0 =
Adds the Content Scroll and Content Scroll Item blocks.

= 1.2.0 =
Adds the Accordion and Accordion Item blocks.

= 1.1.0 =
Adds the TOC block and the Dark Mode Selector setting.

= 1.0.0 =
Initial release.