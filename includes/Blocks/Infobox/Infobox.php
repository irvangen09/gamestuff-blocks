<?php
/**
 * Character Infobox block bootstrap.
 *
 * @package GameStuff_Blocks
 */

namespace GameStuff\Blocks\Infobox;

use GameStuff\Blocks\BlockRegistry;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Single entry point for everything the Character Infobox block
 * family (Character Infobox + Infobox Field) needs beyond plain
 * block.json registration, handled generically by BlockRegistry: the
 * custom portrait image size its upload control depends on, and the
 * Dashicons stylesheet its portrait empty-state and optional field
 * icons rely on.
 *
 * This block does not register anything with the DarkMode service.
 * Its dark-mode appearance is handled entirely in style.scss, via
 * `currentColor`/`color-mix()` rather than a literal light/dark color
 * pair scoped by a theme selector — see that file's docblock for the
 * reasoning, and TOC (includes/Blocks/Toc/Toc.php) for the first
 * block migrated to this approach.
 *
 * @since 1.5.0
 * @since 1.7.0 No longer registers dark-mode rules with the DarkMode
 *              service — see the class docblock.
 */
final class Infobox {

	/**
	 * Static-only class — not meant to be instantiated.
	 *
	 * @since 1.5.0
	 */
	private function __construct() {}

	/**
	 * Boot everything this block needs.
	 *
	 * @since 1.5.0
	 * @since 1.7.0 No longer registers dark-mode rules — see the
	 *              class docblock.
	 *
	 * @return void
	 */
	public static function boot(): void {

		add_action( 'after_setup_theme', array( self::class, 'register_portrait_image_size' ) );
		add_action( 'wp_enqueue_scripts', array( self::class, 'enqueue_dashicons' ) );
	}

	/**
	 * Register the custom portrait image size.
	 *
	 * Scale (never crop) to fit inside 270×360. Portraits vary in
	 * aspect ratio, so a hard crop permanently cuts off parts of the
	 * image at upload time — no amount of front-end CSS can restore
	 * pixels already discarded server-side. `false` keeps the full
	 * image intact and simply constrains it to fit within 270×360,
	 * which pairs with the `object-fit: contain` portrait frame in
	 * style.scss to keep every portrait fully visible.
	 *
	 * Must stay in sync with PORTRAIT_WIDTH / PORTRAIT_HEIGHT in
	 * src/infobox/constants.js and the portrait frame dimensions in
	 * style.scss / editor.scss.
	 *
	 * @since 1.5.0
	 *
	 * @return void
	 */
	public static function register_portrait_image_size(): void {

		add_image_size( 'gamestuff_character', 270, 360, false );
	}

	/**
	 * Load Dashicons on the front end, only on pages that need it.
	 *
	 * Dashicons is a WordPress core stylesheet not loaded on the
	 * front end by default. This block's portrait empty state and
	 * Infobox Field's optional icon can both render a dashicon class
	 * in their saved markup, so it's enqueued only when the page
	 * actually contains a Character Infobox (Infobox Field can only
	 * ever be inserted as its child, so checking for the parent block
	 * alone is enough).
	 *
	 * @since 1.5.0
	 *
	 * @return void
	 */
	public static function enqueue_dashicons(): void {

		if ( ! BlockRegistry::page_has_block( 'gamestuff/character-infobox' ) ) {
			return;
		}

		wp_enqueue_style( 'dashicons' );
	}
}