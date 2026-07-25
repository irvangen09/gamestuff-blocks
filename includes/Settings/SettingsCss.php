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
 * @since 1.0.0
 */
final class SettingsCss {

	/**
	 * Style handle used for the generated inline CSS. No actual file
	 * is registered under this handle — see wp_register_style()'s
	 * `$src = false` usage below, the standard WordPress pattern for
	 * arbitrary generated inline CSS.
	 *
	 * @since 1.0.0
	 */
	private const HANDLE = 'gamestuff-blocks-settings-inline';

	/**
	 * Static-only class — not meant to be instantiated.
	 *
	 * @since 1.0.0
	 */
	private function __construct() {}

	/**
	 * Hook the generated CSS into both the front end and the editor.
	 *
	 * Same callback for both contexts, since the CSS to print is
	 * identical either way — only where it needs to end up differs,
	 * and both hooks route through the regular styles queue.
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
	 * Print the generated settings CSS as an inline style, if there's
	 * anything to print.
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
	 * @since 1.0.0
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
}