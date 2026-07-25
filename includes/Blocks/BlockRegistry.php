<?php
/**
 * Block registry.
 *
 * @package GameStuff_Blocks
 */

namespace GameStuff\Blocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Discovers built blocks and registers only the ones that are active.
 *
 * Blocks are discovered directly from build/ (one subfolder per
 * block, each with its own block.json) rather than through a single
 * bulk manifest call, because a disabled block must not be
 * registered at all — not registering it is what keeps it out of the
 * inserter and stops WordPress from auto-loading its declared style
 * and script assets. A bulk-then-unregister approach would leave
 * that guarantee weaker for statically saved content.
 *
 * @since 1.0.0
 */
final class BlockRegistry {

	/**
	 * Option name used to store the list of disabled block slugs.
	 *
	 * A slug's absence from this list means the block is active —
	 * new blocks are active by default the moment they're built,
	 * with no extra step required to "turn them on".
	 *
	 * @since 1.0.0
	 */
	private const OPTION = 'gamestuff_blocks_active_blocks';

	/**
	 * Cache of discovered blocks for the current request.
	 *
	 * @since 1.0.0
	 * @var array<string, array<string, mixed>>|null
	 */
	private static ?array $blocks = null;

	/**
	 * Static-only class — not meant to be instantiated.
	 *
	 * @since 1.0.0
	 */
	private function __construct() {}

	/**
	 * Register every active block on `init`, and register the
	 * "gamestuff" block category every block in this plugin groups
	 * under via its own block.json.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public static function boot(): void {

		add_action( 'init', array( self::class, 'register' ) );
		add_filter( 'block_categories_all', array( self::class, 'register_category' ) );
	}

	/**
	 * Add the "gamestuff" block category, so blocks declaring
	 * `"category": "gamestuff"` in block.json get their own grouping
	 * in the inserter instead of falling back to an unrecognized
	 * category.
	 *
	 * Deliberately generic (not naming individual blocks), so this
	 * doesn't need updating every time a new block is added — any
	 * block declaring `category: gamestuff` is covered.
	 *
	 * @since 1.0.0
	 *
	 * @param array $categories Existing block categories.
	 * @return array Block categories with "gamestuff" prepended.
	 */
	public static function register_category( array $categories ): array {

		return array_merge(
			array(
				array(
					'slug'  => 'gamestuff',
					'title' => __( 'GameStuff', 'gamestuff-blocks' ),
					'icon'  => 'games',
				),
			),
			$categories
		);
	}

	/**
	 * Register each discovered block that is currently active.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public static function register(): void {

		foreach ( self::all() as $slug => $block ) {

			if ( ! self::is_active( $slug ) ) {
				continue;
			}

			register_block_type( $block['path'] );
		}
	}

	/**
	 * Discover every block available in build/, active or not.
	 *
	 * Used both by register() and by the future block-management
	 * admin UI, which needs to list every available block along with
	 * its current active/disabled state.
	 *
	 * @since 1.0.0
	 *
	 * @return array<string, array<string, mixed>> Discovered blocks,
	 *         keyed by slug, each with 'name', 'title', and 'path'.
	 */
	public static function all(): array {

		if ( null !== self::$blocks ) {
			return self::$blocks;
		}

		self::$blocks = array();

		$build_dir = GAMESTUFF_BLOCKS_PATH . 'build';

		if ( ! is_dir( $build_dir ) ) {
			return self::$blocks;
		}

		foreach ( (array) glob( $build_dir . '/*', GLOB_ONLYDIR ) as $dir ) {

			$manifest_file = $dir . '/block.json';

			if ( ! file_exists( $manifest_file ) ) {
				continue;
			}

			$metadata = json_decode( (string) file_get_contents( $manifest_file ), true );

			if ( ! is_array( $metadata ) || empty( $metadata['name'] ) ) {
				continue;
			}

			$slug = basename( $dir );

			self::$blocks[ $slug ] = array(
				'name'  => $metadata['name'],
				'title' => $metadata['title'] ?? $slug,
				'path'  => $dir,
			);
		}

		return self::$blocks;
	}

	/**
	 * Check whether a given block slug is currently active.
	 *
	 * @since 1.0.0
	 *
	 * @param string $slug Block folder slug, e.g. 'accordion'.
	 * @return bool
	 */
	public static function is_active( string $slug ): bool {

		return ! in_array( $slug, self::get_disabled_blocks(), true );
	}

	/**
	 * Get the option name the disabled-block list is stored under.
	 *
	 * @since 1.0.0
	 *
	 * @return string
	 */
	public static function option_name(): string {

		return self::OPTION;
	}

	/**
	 * Get the list of currently disabled block slugs.
	 *
	 * @since 1.0.0
	 *
	 * @return string[]
	 */
	private static function get_disabled_blocks(): array {

		$disabled = get_option( self::OPTION, array() );

		return is_array( $disabled ) ? $disabled : array();
	}
}