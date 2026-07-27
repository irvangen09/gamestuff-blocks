<?php
/**
 * Character Infobox block bootstrap.
 *
 * @package GameStuff_Blocks
 */

namespace GameStuff\Blocks\Infobox;

use GameStuff\Services\DarkMode;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Single entry point for everything the Character Infobox block
 * family (Character Infobox + Infobox Field) needs beyond plain
 * block.json registration, handled generically by BlockRegistry:
 * this block's dark mode rules, the custom portrait image size its
 * upload control depends on, and the Dashicons stylesheet its portrait
 * empty-state and optional field icons rely on.
 *
 * @since 1.5.0
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
	 *
	 * @return void
	 */
	public static function boot(): void {

		DarkMode::register( self::dark_mode_rules() );

		add_action( 'after_setup_theme', array( self::class, 'register_portrait_image_size' ) );
		add_action( 'wp_enqueue_scripts', array( self::class, 'enqueue_dashicons' ) );
	}

	/**
	 * This block's dark-mode CSS, registered with the DarkMode
	 * service rather than baked into style.scss under a fixed theme
	 * selector — see Services/DarkMode.php for why.
	 *
	 * Values match this block's previous production styling exactly:
	 * already generic hex/rgba values, not tied to any one theme's
	 * own custom properties, so no adjustment was needed here (unlike
	 * the Accordion case documented in PROJECT_DECISIONS.md).
	 *
	 * @since 1.5.0
	 *
	 * @return array<int, array{selector:string, css:string}>
	 */
	private static function dark_mode_rules(): array {

		return array(
			array(
				'selector' => '.gs-character',
				'css'      => '--gs-card-bg:#1c1c1d;--gs-card-border:rgba(254, 111, 34, 0.22);--gs-accent-soft:rgba(254, 111, 34, 0.14);--gs-accent-softer:rgba(254, 111, 34, 0.08);--gs-row-border:rgba(255, 255, 255, 0.08);--gs-text:#f2f2f3;--gs-text-muted:#b7b9bc;--gs-shadow:0 1px 3px rgba(0, 0, 0, 0.4);',
			),
		);
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

		if ( ! is_singular() ) {
			return;
		}

		if ( ! has_block( 'gamestuff/character-infobox', get_the_ID() ) ) {
			return;
		}

		wp_enqueue_style( 'dashicons' );
	}
}