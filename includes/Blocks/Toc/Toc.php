<?php
/**
 * TOC block bootstrap.
 *
 * @package GameStuff_Blocks
 */

namespace GameStuff\Blocks\Toc;

use GameStuff\Services\DarkMode;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Single entry point for everything the TOC block needs beyond its
 * own block.json / render.php registration (handled generically by
 * BlockRegistry): the heading anchor injector, and this block's dark
 * mode rules.
 *
 * As blocks grow more complex than "just render.php", each one gets a
 * bootstrap class following this same shape, called once from
 * Plugin::register_services() — see includes/Core/Plugin.php.
 *
 * @since 1.0.0
 */
final class Toc {

	/**
	 * Static-only class — not meant to be instantiated.
	 *
	 * @since 1.0.0
	 */
	private function __construct() {}

	/**
	 * Boot everything this block needs.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public static function boot(): void {

		HeadingAnchorInjector::boot();

		DarkMode::register( self::dark_mode_rules() );
	}

	/**
	 * This block's dark-mode CSS, registered with the DarkMode
	 * service rather than baked into style.scss as a
	 * `prefers-color-scheme` media query — see Services/DarkMode.php
	 * for why: whether these rules apply under the site's own theme
	 * toggle or under `prefers-color-scheme` is a site-wide decision,
	 * not something this block decides for itself.
	 *
	 * Values match this block's previous production styling exactly.
	 *
	 * @since 1.0.0
	 *
	 * @return array<int, array{selector:string, css:string}>
	 */
	private static function dark_mode_rules(): array {

		return array(
			array(
				'selector' => '.gs-toc',
				'css'      => 'background:#1e1e1e;border-color:#3c3c3c;',
			),
			array(
				'selector' => '.gs-toc__summary',
				'css'      => 'color:#f0f0f1;',
			),
			array(
				'selector' => '.gs-toc__nav',
				'css'      => 'border-top-color:#3c3c3c;',
			),
			array(
				'selector' => '.gs-toc__item a',
				'css'      => 'color:#f0f0f1;',
			),
		);
	}
}
