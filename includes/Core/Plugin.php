<?php
/**
 * Core plugin orchestrator.
 *
 * @package GameStuff_Blocks
 */

namespace GameStuff\Core;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Coordinates plugin startup: verifies the runtime environment, then
 * initializes shared services and registers blocks in order.
 *
 * Holds no business logic of its own — each concern (settings, block
 * registration, etc.) lives in its own class under includes/, and
 * this class is only responsible for calling them in the right
 * sequence at the right time.
 *
 * @since 1.0.0
 */
final class Plugin {

	/**
	 * Singleton instance.
	 *
	 * @since 1.0.0
	 * @var self|null
	 */
	private static ?self $instance = null;

	/**
	 * Whether boot() has already run.
	 *
	 * Guards against double initialization if boot() is ever called
	 * more than once (e.g. by a plugin/theme mistakenly hooking it
	 * twice), which would otherwise register every hook, setting,
	 * and block a second time.
	 *
	 * @since 1.0.0
	 * @var bool
	 */
	private bool $booted = false;

	/**
	 * Private constructor — use instance() instead.
	 *
	 * @since 1.0.0
	 */
	private function __construct() {}

	/**
	 * Prevent cloning of the singleton instance.
	 *
	 * @since 1.0.0
	 */
	private function __clone() {}

	/**
	 * Get the shared Plugin instance.
	 *
	 * @since 1.0.0
	 *
	 * @return self
	 */
	public static function instance(): self {

		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Start the plugin.
	 *
	 * Runs the environment check first; if it fails, no service or
	 * block is registered and an admin notice is shown instead, so a
	 * misconfigured environment fails visibly rather than causing a
	 * fatal error deeper in the code.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function boot(): void {

		if ( $this->booted ) {
			return;
		}

		$this->booted = true;

		if ( ! $this->environment_is_supported() ) {
			add_action( 'admin_notices', array( $this, 'render_environment_notice' ) );
			return;
		}

		$this->register_services();
		$this->register_blocks();

		/**
		 * Fires once the plugin has finished initializing: every
		 * service is registered and every active block has been
		 * registered with WordPress.
		 *
		 * @since 1.0.0
		 */
		do_action( 'gamestuff_blocks_ready' );
	}

	/**
	 * Check whether the current environment meets the plugin's
	 * minimum requirements.
	 *
	 * WordPress itself already enforces the "Requires PHP" header
	 * declared in the plugin file on supported WordPress versions,
	 * but this check runs regardless of WordPress version and fails
	 * gracefully instead of allowing a fatal error further down the
	 * boot sequence.
	 *
	 * @since 1.0.0
	 *
	 * @return bool
	 */
	private function environment_is_supported(): bool {

		return version_compare( PHP_VERSION, '8.0', '>=' );
	}

	/**
	 * Render the admin notice shown when the environment check fails.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function render_environment_notice(): void {

		printf(
			'<div class="notice notice-error"><p>%s</p></div>',
			esc_html__( 'GameStuff Blocks requires PHP 8.0 or higher and has been disabled.', 'gamestuff-blocks' )
		);
	}

	/**
	 * Initialize shared services: the settings registry and CSS
	 * output, the dark mode CSS service, the settings page (wp-admin
	 * only), and each block's own bootstrap (beyond plain block.json
	 * registration, handled separately by BlockRegistry).
	 *
	 * Runs before register_blocks() so that any setting a block
	 * relies on (e.g. Primary Color) is already registered by the
	 * time blocks are registered.
	 *
	 * Per-block bootstraps like Toc::boot() are called here rather
	 * than from register_blocks(), because what they set up (hooks
	 * that run on every front-end request, dark-mode rules, etc.)
	 * isn't tied to whether that block's own block.json registration
	 * succeeds or to render order — it needs to run regardless of
	 * whether the block itself is present on the current page.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	private function register_services(): void {

		\GameStuff\Settings\SettingsRegistry::boot();
		\GameStuff\Settings\SettingsCss::boot();

		\GameStuff\Blocks\Toc\Toc::boot();
		\GameStuff\Blocks\Accordion\Accordion::boot();
		\GameStuff\Blocks\Infobox\Infobox::boot();

		if ( is_admin() ) {
			\GameStuff\Settings\SettingsPage::boot();
		}
	}

	/**
	 * Register every active block with WordPress.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	private function register_blocks(): void {

		\GameStuff\Blocks\BlockRegistry::boot();
	}
}