<?php
/**
 * Content Scroll block bootstrap.
 *
 * @package GameStuff_Blocks
 */

namespace GameStuff\Blocks\ContentScroll;

use GameStuff\Services\DarkMode;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Single entry point for everything the Content Scroll block family
 * (Content Scroll + Content Scroll Item) needs beyond plain
 * block.json registration, handled generically by BlockRegistry: this
 * block family's dark mode rules.
 *
 * @since 1.3.0
 */
final class ContentScroll {

	/**
	 * Static-only class — not meant to be instantiated.
	 *
	 * @since 1.3.0
	 */
	private function __construct() {}

	/**
	 * Boot everything this block family needs.
	 *
	 * @since 1.3.0
	 *
	 * @return void
	 */
	public static function boot(): void {

		DarkMode::register( self::dark_mode_rules() );
	}

	/**
	 * This block family's dark-mode CSS, registered with the DarkMode
	 * service rather than baked into style.scss under a fixed theme
	 * selector — see Services/DarkMode.php for why.
	 *
	 * @since 1.3.0
	 *
	 * @return array<int, array{selector:string, css:string}>
	 */
	private static function dark_mode_rules(): array {

		return array(
			/*
			 * The thumbnail placeholder background is a light,
			 * theme-agnostic overlay (not a color tied to any one
			 * theme's tokens) already in light mode, so the dark
			 * variant only needs to be the same kind of overlay in
			 * white instead of black — it stays visible against a
			 * dark background without assuming what that background
			 * actually is.
			 */
			array(
				'selector' => '.gs-cs-thumb',
				'css'      => 'background:rgba(255,255,255,0.06);',
			),
		);
	}
}
