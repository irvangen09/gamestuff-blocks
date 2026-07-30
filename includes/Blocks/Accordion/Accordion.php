<?php
/**
 * Accordion block bootstrap.
 *
 * @package GameStuff_Blocks
 */

namespace GameStuff\Blocks\Accordion;

use GameStuff\Blocks\BlockRegistry;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Single entry point for everything the Accordion block family
 * (Accordion + Accordion Item) needs beyond plain block.json
 * registration, handled generically by BlockRegistry: the
 * progressive-enhancement flag its mobile collapse behavior depends
 * on, and the Dashicons stylesheet its optional icon field relies on.
 *
 * This block does not register anything with the DarkMode service.
 * Its dark-mode appearance is handled entirely in
 * accordion-item/style.scss, via `currentColor` and `color-mix()`
 * rather than a literal light/dark color pair scoped by a theme
 * selector — see that file's docblock for the reasoning, and TOC
 * (includes/Blocks/Toc/Toc.php) for the first block migrated to this
 * approach.
 *
 * @since 1.2.0
 * @since 1.7.0 No longer registers dark-mode rules with the DarkMode
 *              service — see the class docblock.
 */
final class Accordion {

	/**
	 * Static-only class — not meant to be instantiated.
	 *
	 * @since 1.2.0
	 */
	private function __construct() {}

	/**
	 * Boot everything this block needs.
	 *
	 * @since 1.2.0
	 * @since 1.7.0 No longer registers dark-mode rules — see the
	 *              class docblock.
	 *
	 * @return void
	 */
	public static function boot(): void {

		add_action( 'wp_head', array( self::class, 'print_progressive_enhancement_flag' ), 1 );
		add_action( 'wp_enqueue_scripts', array( self::class, 'enqueue_dashicons' ) );
	}

	/**
	 * Print a tiny, synchronous inline script as early as possible in
	 * <head> that adds a `js` class to <html>.
	 *
	 * The mobile collapse rules in accordion-item/style.scss are
	 * gated behind this class: when JavaScript runs normally the
	 * class is present before first paint, so nothing visually
	 * changes; if JavaScript fails to load or is disabled, the class
	 * is never added, those rules never activate, and Accordion
	 * content simply stays visible on mobile — the same baseline as
	 * desktop — instead of being stuck behind a non-functional
	 * toggle button.
	 *
	 * @since 1.2.0
	 *
	 * @return void
	 */
	public static function print_progressive_enhancement_flag(): void {

		if ( ! BlockRegistry::page_has_block( 'gamestuff/accordion' ) ) {
			return;
		}

		wp_print_inline_script_tag( 'document.documentElement.classList.add("js");' );
	}

	/**
	 * Load Dashicons on the front end, only on pages that need it.
	 *
	 * Dashicons is a WordPress core stylesheet not loaded on the
	 * front end by default. Accordion Item's optional icon field can
	 * render a dashicon class in its saved markup, so it's enqueued
	 * only when the page actually contains an Accordion.
	 *
	 * @since 1.2.0
	 *
	 * @return void
	 */
	public static function enqueue_dashicons(): void {

		if ( ! BlockRegistry::page_has_block( 'gamestuff/accordion' ) ) {
			return;
		}

		wp_enqueue_style( 'dashicons' );
	}
}