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
 */
final class Toc {

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

		HeadingAnchorInjector::boot();

		add_action( 'save_post', array( HeadingCollector::class, 'clear_cache' ) );
	}
}
