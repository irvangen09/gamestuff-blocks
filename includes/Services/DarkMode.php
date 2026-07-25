<?php
/**
 * Dark mode CSS output service.
 *
 * @package GameStuff_Blocks
 */

namespace GameStuff\Services;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Collects dark-mode CSS rules registered by individual blocks, and
 * outputs them scoped one of two ways, decided once, site-wide, by
 * the "Dark Mode Selector" setting (see
 * includes/Settings/SettingsRegistry.php):
 *
 * - Selector configured (e.g. `.site-s-dark`, matching whatever class
 *   or attribute the active theme's own dark-mode toggle applies):
 *   rules are scoped under that selector, so this plugin's blocks
 *   switch in lockstep with the theme's own dark mode, exactly like
 *   the rest of the page does.
 * - Left empty (the default): rules fall back to
 *   `@media (prefers-color-scheme: dark)`, following the visitor's
 *   own OS/browser preference instead. Better than nothing for themes
 *   with no dark mode concept of their own, but — deliberately — not
 *   the plugin's assumption by default, since a great many themes
 *   this plugin will be used with (this is a public plugin, not tied
 *   to any one theme) do have their own toggle that this fallback
 *   would otherwise ignore.
 *
 * A block registers its rules once, via register(), typically from
 * its own boot() (see Blocks/Toc/Toc.php for an example) — it never
 * needs to know or care which of the two output modes above is
 * active; that decision is made centrally, here, from the one
 * site-wide setting.
 *
 * @since 1.0.0
 */
final class DarkMode {

	/**
	 * Handle used for the generated inline stylesheet.
	 *
	 * @since 1.0.0
	 * @var string
	 */
	private const HANDLE = 'gamestuff-blocks-dark-mode';

	/**
	 * Rules registered so far, each a `['selector' => ..., 'css' => ...]` pair.
	 *
	 * @since 1.0.0
	 * @var array<int, array{selector:string, css:string}>
	 */
	private static array $rules = array();

	/**
	 * Static-only class — not meant to be instantiated.
	 *
	 * @since 1.0.0
	 */
	private function __construct() {}

	/**
	 * Register hooks that output the collected CSS.
	 *
	 * Runs on both the front end and in the block editor — the
	 * editor canvas has no theme dark-mode toggle to react to, but
	 * `prefers-color-scheme` still applies there too when no selector
	 * is configured, and this keeps editor and frontend consistent.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public static function boot(): void {

		add_action( 'wp_enqueue_scripts', array( self::class, 'enqueue' ) );
		add_action( 'enqueue_block_editor_assets', array( self::class, 'enqueue' ) );
	}

	/**
	 * Register a block's dark-mode rules.
	 *
	 * Call this once per block, from that block's own boot() — not
	 * from render.php, which may run many times per request.
	 *
	 * @since 1.0.0
	 *
	 * @param array<int, array{selector:string, css:string}> $rules {
	 *     @type string $selector CSS selector, e.g. '.gs-toc__summary'.
	 *     @type string $css      Raw CSS declarations for that selector,
	 *                            e.g. 'color:#f0f0f1;'.
	 * }
	 * @return void
	 */
	public static function register( array $rules ): void {

		foreach ( $rules as $rule ) {

			$selector = trim( (string) ( $rule['selector'] ?? '' ) );
			$css      = trim( (string) ( $rule['css'] ?? '' ) );

			if ( '' === $selector || '' === $css ) {
				continue;
			}

			self::$rules[] = array(
				'selector' => $selector,
				'css'      => $css,
			);
		}
	}

	/**
	 * Output the generated CSS as an inline stylesheet.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public static function enqueue(): void {

		$css = self::generate();

		if ( '' === $css ) {
			return;
		}

		wp_register_style( self::HANDLE, false, array(), GAMESTUFF_BLOCKS_VERSION );
		wp_enqueue_style( self::HANDLE );
		wp_add_inline_style( self::HANDLE, $css );
	}

	/**
	 * Build the final CSS from every rule registered so far, scoped
	 * according to the current "Dark Mode Selector" setting.
	 *
	 * @since 1.0.0
	 *
	 * @return string CSS, or '' if nothing has been registered.
	 */
	public static function generate(): string {

		if ( empty( self::$rules ) ) {
			return '';
		}

		$theme_selector = \GameStuff\Settings\SettingsRegistry::get_value( 'dark_mode_selector' );

		if ( '' !== $theme_selector ) {
			$declarations = array_map(
				static fn( array $rule ): string => sprintf( '%s %s{%s}', $theme_selector, $rule['selector'], $rule['css'] ),
				self::$rules
			);

			return implode( '', $declarations );
		}

		$declarations = array_map(
			static fn( array $rule ): string => sprintf( '%s{%s}', $rule['selector'], $rule['css'] ),
			self::$rules
		);

		return sprintf( '@media (prefers-color-scheme: dark){%s}', implode( '', $declarations ) );
	}
}
