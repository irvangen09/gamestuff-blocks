=== GameStuff Blocks ===
Contributors: irvannoerfazri
Tags: gutenberg, blocks, documentation, wiki, knowledge-base
Requires at least: 6.9
Tested up to: 6.9
Requires PHP: 8.0
Stable tag: 1.4.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A lightweight, WordPress-native collection of Gutenberg blocks for documentation, wiki, and knowledge base websites.

== Description ==

GameStuff Blocks provides a focused set of Gutenberg blocks built specifically for documentation, wiki, knowledge base, and article-driven websites — designed to feel like a natural part of the Block Editor rather than a bolted-on addition.

Every block is built with a clear purpose, clean semantic HTML, accessibility in mind, and no unnecessary CSS or JavaScript. The plugin favors a small number of well-made blocks over a large number of overlapping ones.

Each block can be individually enabled or disabled from the plugin's settings page. A disabled block is not registered, and loads no styles or scripts on the front end.

Blocks currently available:

* TOC — an automatic table of contents built from the article's headings.
* Accordion — displays content as a set of collapsible panels.
* Content Scroll — a navigation grid on desktop that becomes a horizontal scroll on mobile.
* Timeline — a vertical timeline for sequential content, with a numbered variant.

More content blocks are introduced in subsequent releases.

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/gamestuff-blocks` directory, or install the plugin directly through the WordPress plugins screen.
2. Activate the plugin through the "Plugins" screen in WordPress.
3. Configure global settings under Settings > GameStuff Blocks.

== Frequently Asked Questions ==

= Can I disable individual blocks? =

Yes. Every block can be turned on or off independently. A disabled block is removed from the block inserter and does not load any of its assets on the front end.

= Does this plugin depend on jQuery or other front-end libraries? =

No. Blocks are built with modern, dependency-free JavaScript where scripting is needed at all.

= How does dark mode work? =

By default, blocks follow the visitor's own OS/browser dark mode preference. If your theme has its own dark mode toggle, enter the CSS selector it uses under Settings > GameStuff Blocks > Dark Mode Selector (e.g. `.dark-mode`), and blocks will switch together with the rest of your theme instead.

== Changelog ==

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