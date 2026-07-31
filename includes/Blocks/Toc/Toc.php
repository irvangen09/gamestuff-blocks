<?php
/**
 * TOC block bootstrap.
 *
 * @package GameStuff_Blocks
 */

namespace GameStuff\Blocks\Toc;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Single entry point for everything the TOC block needs beyond plain
 * block.json/render.php registration: the heading anchor injector,
 * and invalidating HeadingCollector's cached heading scan on save.
 *
 * Dark mode needs no rules registered here — style.scss handles it
 * via `currentColor`/`color-mix()`, not a per-block service.
 *
 * @since 1.1.0
 */
final class Toc {

	/**
	 * Static-only class — not meant to be instantiated.
	 *
	 * @since 1.1.0
	 */
	private function __construct() {}

	/**
	 * Boot everything this block needs.
	 *
	 * @since 1.1.0
	 * @since 1.7.0 No longer registers dark-mode rules with the
	 *              DarkMode service — see the class docblock.
	 *
	 * @return void
	 */
	public static function boot(): void {

		HeadingAnchorInjector::boot();

		add_action( 'save_post', array( HeadingCollector::class, 'clear_cache' ) );
	}
}
