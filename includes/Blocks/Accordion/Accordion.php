<?php
/**
 * Accordion block bootstrap.
 *
 * @package GameStuff_Blocks
 */

namespace GameStuff\Blocks\Accordion;

use GameStuff\Services\DarkMode;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Single entry point for everything the Accordion block family
 * (Accordion + Accordion Item) needs beyond plain block.json
 * registration, handled generically by BlockRegistry: this block's
 * dark mode rules, the progressive-enhancement flag its mobile
 * collapse behavior depends on, and the Dashicons stylesheet its
 * optional icon field relies on.
 *
 * @since 1.0.0
 */
final class Accordion {

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

		DarkMode::register( self::dark_mode_rules() );

		add_action( 'wp_head', array( self::class, 'print_progressive_enhancement_flag' ), 1 );
		add_action( 'wp_enqueue_scripts', array( self::class, 'enqueue_dashicons' ) );
	}

	/**
	 * This block's dark-mode CSS, registered with the DarkMode
	 * service rather than baked into style.scss under a fixed theme
	 * selector — see Services/DarkMode.php for why.
	 *
	 * @since 1.0.0
	 *
	 * @return array<int, array{selector:string, css:string}>
	 */
	private static function dark_mode_rules(): array {

		return array(
			/*
			 * Transparent rather than a guessed dark hex: the item
			 * has no surface of its own, so it blends into whatever
			 * background the theme's own dark mode already applies
			 * to the article body — the same "no background" look
			 * this block has always had in light mode, just carried
			 * through to dark mode instead of assuming a fixed color
			 * that would only match one particular theme.
			 */
			array(
				'selector' => '.gs-accordion-item, .gs-accordion-item__content',
				'css'      => 'background:transparent;',
			),
			array(
				'selector' => '.gs-accordion-item__trigger, .gs-accordion-item__trigger:hover, .gs-accordion-item__trigger:active, .gs-accordion-item__trigger:focus',
				'css'      => 'border-bottom-color:#3c3c3c;',
			),
			array(
				'selector' => '.gs-accordion-item__chevron',
				'css'      => 'color:#a7aaad;',
			),
			array(
				'selector' => '.gs-accordion-item__content table, .gs-accordion-item__content th, .gs-accordion-item__content td',
				'css'      => 'border-color:#3c3c3c;',
			),
		);
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
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public static function print_progressive_enhancement_flag(): void {

		if ( ! is_singular() ) {
			return;
		}

		if ( ! has_block( 'gamestuff/accordion', get_the_ID() ) ) {
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
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public static function enqueue_dashicons(): void {

		if ( ! is_singular() ) {
			return;
		}

		if ( ! has_block( 'gamestuff/accordion', get_the_ID() ) ) {
			return;
		}

		wp_enqueue_style( 'dashicons' );
	}
}