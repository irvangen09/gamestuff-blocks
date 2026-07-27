<?php
/**
 * Plugin Name:       GameStuff Blocks
 * Plugin URI:        https://gamestuff.id
 * Description:       Custom Gutenberg Blocks for GameStuff.id
 * Version:           1.5.0
 * Requires at least: 6.9
 * Requires PHP:      8.0
 * Author:            Irvan Noerfazri
 * Author URI:        https://gamestuff.id
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       gamestuff-blocks
 *
 * @package GameStuff_Blocks
 */

namespace GameStuff;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Core plugin constants.
 *
 * @since 1.0.0
 */
define( 'GAMESTUFF_BLOCKS_VERSION', '1.5.0' );
define( 'GAMESTUFF_BLOCKS_FILE', __FILE__ );
define( 'GAMESTUFF_BLOCKS_PATH', plugin_dir_path( __FILE__ ) );
define( 'GAMESTUFF_BLOCKS_URL', plugin_dir_url( __FILE__ ) );
define( 'GAMESTUFF_BLOCKS_BASENAME', plugin_basename( __FILE__ ) );

/**
 * Autoload plugin classes under the GameStuff\ namespace.
 *
 * Maps namespace segments directly onto the includes/ directory
 * structure, e.g. GameStuff\Core\Plugin resolves to
 * includes/Core/Plugin.php. Registered here instead of relying on a
 * Composer-generated vendor/autoload.php so the plugin has no
 * runtime dependency on a build step for class loading.
 *
 * @since 1.0.0
 *
 * @param string $class Fully qualified class name being requested.
 * @return void
 */
spl_autoload_register(
	static function ( string $class ): void {

		$prefix = __NAMESPACE__ . '\\';

		if ( ! str_starts_with( $class, $prefix ) ) {
			return;
		}

		$relative_class = substr( $class, strlen( $prefix ) );
		$relative_path  = str_replace( '\\', DIRECTORY_SEPARATOR, $relative_class );

		$file = GAMESTUFF_BLOCKS_PATH . 'includes' . DIRECTORY_SEPARATOR . $relative_path . '.php';

		if ( file_exists( $file ) ) {
			require $file;
		}
	}
);

register_activation_hook( __FILE__, array( Core\Activator::class, 'activate' ) );
register_deactivation_hook( __FILE__, array( Core\Deactivator::class, 'deactivate' ) );

/**
 * Boot the plugin once all active plugins have loaded.
 *
 * Deferred to `plugins_loaded` (rather than running inline at the
 * top of this file) so every other active plugin has already
 * registered itself first, in case the plugin ever needs to check
 * for or interact with another plugin during initialization.
 *
 * @since 1.0.0
 *
 * @return void
 */
function boot(): void {
	Core\Plugin::instance()->boot();
}
add_action( 'plugins_loaded', __NAMESPACE__ . '\\boot' );