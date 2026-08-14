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
 * registration: the progressive-enhancement flag its mobile collapse
 * behavior depends on, and Dashicons for its optional icon field.
 *
 * Dark mode needs no rules registered here — accordion/item/style.scss
 * handles it via `currentColor`/`color-mix()`, not a per-block service.
 */
final class Accordion {

	/**
	 * Static-only class — not meant to be instantiated.
	 */
	private function __construct() {}

	/**
	 * Boot everything this block needs.
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
	 * The mobile collapse rules in accordion/item/style.scss are
	 * gated behind this class: when JavaScript runs normally the
	 * class is present before first paint, so nothing visually
	 * changes; if JavaScript fails to load or is disabled, the class
	 * is never added, those rules never activate, and Accordion
	 * content simply stays visible on mobile — the same baseline as
	 * desktop — instead of being stuck behind a non-functional
	 * toggle button.
	 *
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
