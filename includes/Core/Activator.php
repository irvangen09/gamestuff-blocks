<?php
/**
 * Plugin activation handler.
 *
 * @package GameStuff_Blocks
 */

namespace GameStuff\Core;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Runs once, when the plugin is activated.
 *
 * Kept separate from Plugin::boot() because activation is a
 * one-time event triggered by WordPress itself (register_activation_hook),
 * with its own timing and failure handling (wp_die() is acceptable
 * here, unlike during a normal request boot).
 */
final class Activator {

	/**
	 * Option name used to track the version that was last activated,
	 * for future upgrade routines to compare against.
	 */
	private const VERSION_OPTION = 'gamestuff_blocks_version';

	/**
	 * Handle plugin activation.
	 *
	 *
	 * @return void
	 */
	public static function activate(): void {

		if ( ! self::environment_is_supported() ) {
			self::deactivate_with_notice();
			return;
		}

		update_option( self::VERSION_OPTION, GAMESTUFF_BLOCKS_VERSION );
	}

	/**
	 * Check whether the current environment meets the plugin's
	 * minimum requirements.
	 *
	 * Duplicated (deliberately, not shared) from Plugin's own check:
	 * activation runs once, before boot() ever executes, and needs
	 * to stop the plugin from activating at all rather than merely
	 * showing a notice on an already-active plugin.
	 *
	 *
	 * @return bool
	 */
	private static function environment_is_supported(): bool {

		return version_compare( PHP_VERSION, '8.0', '>=' );
	}

	/**
	 * Deactivate the plugin and stop the current request with an
	 * explanatory message, since the environment requirements were
	 * not met at activation time.
	 *
	 *
	 * @return void
	 */
	private static function deactivate_with_notice(): void {

		deactivate_plugins( GAMESTUFF_BLOCKS_BASENAME );

		wp_die(
			esc_html__( 'GameStuff Blocks requires PHP 8.0 or higher. The plugin has been deactivated.', 'gamestuff-blocks' ),
			esc_html__( 'Plugin activation error', 'gamestuff-blocks' ),
			array( 'back_link' => true )
		);
	}
}
