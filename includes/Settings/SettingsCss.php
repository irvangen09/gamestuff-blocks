<?php
/**
 * Settings CSS output.
 *
 * @package GameStuff_Blocks
 */

namespace GameStuff\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Turns saved setting values into CSS custom property overrides, and
 * prints them on both the front end and inside the block editor, so
 * a change on the settings page is reflected identically in both
 * places — the same generated CSS, not two separate code paths that
 * could drift out of sync.
 *
 * Also adds a `<body>` class for the "Color Scheme" setting, when a
 * site owner has forced Light or Dark rather than leaving it on Auto
 * — see add_color_scheme_body_class() for why this is a body class
 * rather than a per-block wrapper attribute.
 */
final class SettingsCss {

	/**
	 * Style handle used for the generated inline CSS. No actual file
	 * is registered under this handle — see wp_register_style()'s
	 * `$src = false` usage below, the standard WordPress pattern for
	 * arbitrary generated inline CSS.
	 */
	private const HANDLE = 'gamestuff-blocks-settings-inline';

	/**
	 * Static-only class — not meant to be instantiated.
	 */
	private function __construct() {}

	/**
	 * Hook the generated CSS into both the front end and the editor,
	 * and the Color Scheme body class into the front end only (no
	 * body_class() equivalent exists inside the editor iframe).
	 *
	 * @return void
	 */
	public static function boot(): void {

		add_action( 'wp_enqueue_scripts', array( self::class, 'enqueue' ) );
		add_action( 'enqueue_block_editor_assets', array( self::class, 'enqueue' ) );
		add_filter( 'body_class', array( self::class, 'add_color_scheme_body_class' ) );
	}

	/**
	 * Print the generated settings CSS as an inline style, if there's
	 * anything to print.
	 *
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
	 * Generate the CSS needed to apply every saved setting that maps
	 * to a CSS custom property.
	 *
	 * Deliberately NOT written to `:root` — a block's own compiled
	 * CSS declares its custom properties directly on its own
	 * component selector (e.g. `.gs-character { --gs-accent: ... }`),
	 * which has higher specificity than `:root`. Writing the override
	 * to `:root` would silently lose the cascade to that more
	 * specific declaration and have no visible effect at all. Each
	 * setting's registered `targets` is used instead, matching (or
	 * exceeding) the specificity of the original declaration.
	 *
	 *
	 * @return string CSS, or an empty string if there's nothing to
	 *                override (e.g. no setting has both a registered
	 *                target and a saved value).
	 */
	public static function generate(): string {

		$rules = array();

		foreach ( SettingsRegistry::all() as $id => $setting ) {

			if ( empty( $setting['targets'] ) ) {
				continue;
			}

			$value = SettingsRegistry::get_value( $id );

			if ( '' === $value ) {
				continue;
			}

			foreach ( (array) $setting['targets'] as $target ) {

				if ( empty( $target['selector'] ) || empty( $target['property'] ) ) {
					continue;
				}

				/*
				 * Defense-in-depth: $value is expected to already be
				 * sanitized before it's saved (see SettingsPage). This
				 * second strip doesn't change behavior for any
				 * correctly sanitized value — it only matters if a
				 * future setting type is ever registered with
				 * `targets` but its sanitizer forgets this specific
				 * CSS-output risk.
				 */
				$safe_value = str_replace( array( '{', '}', ';' ), '', $value );

				$rules[] = sprintf(
					'%s{%s:%s}',
					$target['selector'],
					$target['property'],
					$safe_value
				);
			}
		}

		return implode( '', $rules );
	}

	/**
	 * Add a `gs-color-scheme-light`/`gs-color-scheme-dark` class to
	 * `<body>` when Color Scheme is forced away from Auto.
	 *
	 * A body class rather than a per-block wrapper attribute: most
	 * blocks in this plugin are static (markup saved into
	 * post_content, no render step to re-check this setting), and
	 * `body_class()` is regenerated every request regardless.
	 *
	 *
	 * @param array<int, string> $classes Existing body classes.
	 * @return array<int, string> Body classes, with the color scheme
	 *                            class appended if applicable.
	 */
	public static function add_color_scheme_body_class( array $classes ): array {

		$color_scheme = SettingsRegistry::get_value( 'color_scheme' );

		if ( in_array( $color_scheme, array( 'light', 'dark' ), true ) ) {
			$classes[] = 'gs-color-scheme-' . $color_scheme;
		}

		return $classes;
	}
}