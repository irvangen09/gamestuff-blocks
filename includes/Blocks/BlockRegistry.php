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
 * Blocks are discovered by recursively scanning build/ for every
 * block.json found, at any depth, rather than through a single bulk
 * manifest call, because a disabled block must not be registered at
 * all — not registering it is what keeps it out of the inserter and
 * stops WordPress from auto-loading its declared style and script
 * assets. A bulk-then-unregister approach would leave that guarantee
 * weaker for statically saved content.
 *
 * Discovery is recursive (not a single-level scan) because parent
 * and child blocks live under one shared folder since the
 * parent-child directory refactor — e.g. build/accordion/block.json
 * (parent) and build/accordion/item/block.json (child) both need to
 * be found, at whatever depth a block's own block.json happens to
 * sit relative to build/. Some block families nest three levels deep
 * (e.g. info-list → info-list/requirements → info-list/requirements/
 * requirement), so the scan has no fixed depth limit.
 */
final class BlockRegistry {

	/**
	 * Option name used to store the list of disabled block slugs.
	 *
	 * A slug's absence from this list means the block is active —
	 * new blocks are active by default the moment they're built,
	 * with no extra step required to "turn them on".
	 */
	private const OPTION = 'gamestuff_blocks_active_blocks';

	/**
	 * Cache of discovered blocks for the current request.
	 *
	 * @var array<string, array<string, mixed>>|null
	 */
	private static ?array $blocks = null;

	/**
	 * Static-only class — not meant to be instantiated.
	 */
	private function __construct() {}

	/**
	 * Register every active block on `init`, and register the
	 * "gamestuff" block category every block in this plugin groups
	 * under via its own block.json.
	 *
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
	 *
	 * @return void
	 */
	public static function register(): void {

		foreach ( self::all() as $slug => $block ) {

			if ( ! self::is_active( $slug ) ) {
				continue;
			}

			$registered = register_block_type( $block['path'] );

			self::set_script_translations( $registered );
		}
	}

	/**
	 * Register translations for a block's editor script handle(s), so
	 * strings wrapped in __() in edit.js actually get translated in
	 * the block editor once a translation file for the visitor's
	 * locale exists in languages/. Without this, __() wrapping alone
	 * is not enough — WordPress has no way to know which script
	 * handle a given translation file belongs to.
	 *
	 * Called once per block from register(), rather than requiring
	 * each block's own bootstrap class to do it — new blocks are
	 * covered automatically the moment they're discovered by all(),
	 * with no extra step required.
	 *
	 *
	 * @param \WP_Block_Type|false $block_type Return value of
	 *        register_block_type(), or false if registration failed.
	 * @return void
	 */
	private static function set_script_translations( $block_type ): void {

		if ( ! $block_type instanceof \WP_Block_Type ) {
			return;
		}

		foreach ( $block_type->editor_script_handles as $handle ) {
			wp_set_script_translations( $handle, 'gamestuff-blocks', GAMESTUFF_BLOCKS_PATH . 'languages' );
		}
	}

	/**
	 * Discover every block available in build/, active or not.
	 *
	 * Used both by register() and by the block-management admin UI
	 * (Settings/SettingsPage.php), which needs to list every available
	 * block along with its current active/disabled state.
	 *
	 * The slug is derived from block.json's "name" (prefix stripped),
	 * not the folder name, because folder names are not guaranteed
	 * unique — several child blocks share the folder name "item"
	 * under different parents. The 'parent' key is read directly from
	 * block.json's own "parent" declaration (the full block name of
	 * the parent, e.g. 'gamestuff/accordion' for accordion-item, or
	 * null for a standalone block), so nothing needs to be kept in
	 * sync by hand as blocks are added.
	 *
	 * @return array<string, array<string, mixed>> Discovered blocks,
	 *         keyed by slug, each with 'name', 'title', 'path', and
	 *         'parent'.
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

		$iterator = new \RecursiveIteratorIterator(
			new \RecursiveDirectoryIterator( $build_dir, \FilesystemIterator::SKIP_DOTS )
		);

		foreach ( $iterator as $file ) {

			if ( 'block.json' !== $file->getFilename() ) {
				continue;
			}

			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- reading a local block.json from disk, not a remote URL.
			$metadata = json_decode( (string) file_get_contents( $file->getPathname() ), true );

			if ( ! is_array( $metadata ) || empty( $metadata['name'] ) ) {
				continue;
			}

			$slug = self::slug_from_name( $metadata['name'] );

			self::$blocks[ $slug ] = array(
				'name'   => $metadata['name'],
				'title'  => $metadata['title'] ?? $slug,
				'path'   => $file->getPath(),
				'parent' => $metadata['parent'][0] ?? null,
			);
		}

		return self::$blocks;
	}

	/**
	 * Derive a block's internal registry slug from its block.json
	 * "name", by stripping the "gamestuff/" namespace prefix.
	 *
	 * Kept as its own method (rather than an inline str_replace() at
	 * the call site) because it is the single place that defines what
	 * a "slug" means in this registry — every other method that reads
	 * or writes a slug (is_active(), toggleable_slugs(), the disabled-
	 * blocks option) relies on this definition staying consistent.
	 *
	 *
	 * @param string $block_name Full block name, e.g. 'gamestuff/accordion-item'.
	 * @return string Slug, e.g. 'accordion-item'.
	 */
	private static function slug_from_name( string $block_name ): string {

		$prefix = 'gamestuff/';

		if ( str_starts_with( $block_name, $prefix ) ) {
			return substr( $block_name, strlen( $prefix ) );
		}

		return $block_name;
	}

	/**
	 * Check whether a given block slug is currently active.
	 *
	 * A child block (one with a non-null 'parent', e.g. accordion-item)
	 * has no independent on/off state of its own — it always follows
	 * its parent's state. A child block can only ever be inserted
	 * inside its parent (enforced by block.json's own "parent"
	 * declaration), so a separate toggle for it would be either
	 * redundant (parent active) or dead (parent inactive, child
	 * unreachable in the inserter either way). The Blocks Settings tab
	 * only renders a checkbox for non-child blocks for this reason —
	 * see Settings/SettingsPage.php.
	 *
	 * @param string $slug Block slug, e.g. 'accordion'.
	 * @return bool
	 */
	public static function is_active( string $slug ): bool {

		$parent_slug = self::parent_slug( $slug );

		if ( null !== $parent_slug ) {
			return self::is_active( $parent_slug );
		}

		return ! in_array( $slug, self::get_disabled_blocks(), true );
	}

	/**
	 * Resolve a block's parent slug, if it has one.
	 *
	 *
	 * @param string $slug Block folder slug.
	 * @return string|null Parent's own folder slug, or null if this
	 *         block has no parent or its parent isn't found among the
	 *         blocks discovered by all() (e.g. a parent slug that was
	 *         renamed or removed — treated as standalone rather than
	 *         silently failing).
	 */
	private static function parent_slug( string $slug ): ?string {

		$blocks = self::all();

		$parent_name = $blocks[ $slug ]['parent'] ?? null;

		if ( null === $parent_name ) {
			return null;
		}

		foreach ( $blocks as $candidate_slug => $candidate ) {
			if ( $candidate['name'] === $parent_name ) {
				return $candidate_slug;
			}
		}

		return null;
	}

	/**
	 * Get every top-level (non-child) block slug — the set of blocks
	 * that get their own independent toggle in the Blocks Settings
	 * tab. Child blocks (accordion-item and similar) are excluded;
	 * their state always follows their parent (see is_active()).
	 *
	 *
	 * @return string[]
	 */
	public static function toggleable_slugs(): array {

		return array_keys(
			array_filter(
				self::all(),
				static fn( array $block ): bool => null === $block['parent']
			)
		);
	}

	/**
	 * Get the option name the disabled-block list is stored under.
	 *
	 *
	 * @return string
	 */
	public static function option_name(): string {

		return self::OPTION;
	}

	/**
	 * Get the list of currently disabled block slugs.
	 *
	 * Public since 1.6.0 so the Global Settings "Blocks" tab (see
	 * Settings/SettingsPage.php) can read the current toggle state
	 * to pre-check/uncheck each block's checkbox.
	 *
	 *
	 * @return string[]
	 */
	public static function get_disabled_blocks(): array {

		$disabled = get_option( self::OPTION, array() );

		return is_array( $disabled ) ? $disabled : array();
	}

	/**
	 * Check whether the page currently being viewed contains a given
	 * block, for blocks that load extra assets (a stylesheet, an
	 * inline script) only when actually needed on the front end.
	 *
	 * Centralized here rather than duplicated in each block's own
	 * bootstrap class — this guard is identical regardless of which
	 * block is being checked for, so any block adding its own
	 * conditional asset in the future can reuse it directly instead
	 * of repeating the same `is_singular()` + `has_block()` pair.
	 *
	 *
	 * @param string $block_name Full block name, e.g. 'gamestuff/accordion'.
	 * @return bool
	 */
	public static function page_has_block( string $block_name ): bool {

		if ( ! is_singular() ) {
			return false;
		}

		return has_block( $block_name, get_the_ID() );
	}
}
