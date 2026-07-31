<?php
/**
 * Info List block bootstrap.
 *
 * @package GameStuff_Blocks
 */

namespace GameStuff\Blocks\InfoList;

use GameStuff\Blocks\BlockRegistry;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Single entry point for everything the Info List block family (Info
 * List + Info List Field + Info List Requirements + Info List
 * Requirement) needs beyond plain block.json registration: Dashicons
 * for its optional per-row/per-item icons.
 *
 * No dark mode rules to register here — style.scss handles it via
 * currentColor/color-mix(), not a per-block service (same as Toc and
 * Infobox since the 1.7.0 Dark Mode Refactor).
 *
 * @since 1.8.0
 */
final class InfoList {

	/**
	 * Static-only class — not meant to be instantiated.
	 *
	 * @since 1.8.0
	 */
	private function __construct() {}

	/**
	 * Boot everything this block needs.
	 *
	 * @since 1.8.0
	 *
	 * @return void
	 */
	public static function boot(): void {

		add_action( 'wp_enqueue_scripts', array( self::class, 'enqueue_dashicons' ) );
	}

	/**
	 * Load Dashicons on the front end, only on pages that need it.
	 *
	 * Dashicons is a WordPress core stylesheet not loaded on the
	 * front end by default. Info List Field's and Info List
	 * Requirement's optional icons can both render a dashicon class
	 * in their saved markup, so it's enqueued only when the page
	 * actually contains an Info List (both child blocks can only
	 * ever be inserted inside it, directly or via Info List
	 * Requirements, so checking for the top-level block alone is
	 * enough).
	 *
	 * @since 1.8.0
	 *
	 * @return void
	 */
	public static function enqueue_dashicons(): void {

		if ( ! BlockRegistry::page_has_block( 'gamestuff/info-list' ) ) {
			return;
		}

		wp_enqueue_style( 'dashicons' );
	}
}