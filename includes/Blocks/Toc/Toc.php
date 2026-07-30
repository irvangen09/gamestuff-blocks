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
 * Single entry point for everything the TOC block needs beyond its
 * own block.json / render.php registration (handled generically by
 * BlockRegistry): the heading anchor injector, and invalidating
 * HeadingCollector's cached heading scan whenever a post is saved.
 *
 * As blocks grow more complex than "just render.php", each one gets a
 * bootstrap class following this same shape, called once from
 * Plugin::register_services() — see includes/Core/Plugin.php.
 *
 * This block does not register anything with the DarkMode service.
 * Its dark-mode appearance is handled entirely in style.scss, via
 * CSS system colors (Canvas/CanvasText) and color-mix() rather than a
 * literal light/dark color pair scoped by a theme selector — see that
 * file's docblock for the reasoning. Timeline was the first block to
 * need no bootstrap-registered dark-mode rules at all (it needs no
 * dark-mode styling whatsoever); TOC is the first to need dark-mode
 * styling but resolve it without this service.
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