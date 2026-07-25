<?php
/**
 * Plugin deactivation handler.
 *
 * @package GameStuff_Blocks
 */

namespace GameStuff\Core;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Runs once, when the plugin is deactivated.
 *
 * Deactivation is expected to be non-destructive: saved settings and
 * any other stored data must survive a deactivate/reactivate cycle.
 * Only uninstall.php (triggered by actual removal, and only when the
 * user opts in) is allowed to delete data. This class exists as the
 * fixed extension point for anything that genuinely is
 * deactivation-scoped (e.g. clearing a scheduled cron event), even
 * though nothing needs that yet.
 *
 * @since 1.0.0
 */
final class Deactivator {

	/**
	 * Handle plugin deactivation.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public static function deactivate(): void {

		/**
		 * Fires after the plugin has been deactivated.
		 *
		 * @since 1.0.0
		 */
		do_action( 'gamestuff_blocks_deactivated' );
	}
}